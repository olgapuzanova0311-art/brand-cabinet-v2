from sqlalchemy.orm import Session

from app import yandex_sync
from app.config import LOYALTY_CASHBACK, loyalty_tier_for_amount
from app.models import BonusEvent, Client, Order, Product, Referral
from app.config import REFERRAL_BONUS_REFERRED, REFERRAL_BONUS_REFERRER


def cashback_percent(tier: str) -> float:
    return LOYALTY_CASHBACK.get(tier, LOYALTY_CASHBACK["bronze"])


def done_orders_total(db: Session, client_id: int) -> float:
    rows = (
        db.query(Order, Product)
        .join(Product, Order.product_id == Product.id)
        .filter(Order.client_id == client_id, Order.status == "done")
        .all()
    )
    return sum(order.quantity * product.price for order, product in rows)


def recompute_tier(db: Session, client: Client) -> None:
    total = done_orders_total(db, client.id)
    new_tier = loyalty_tier_for_amount(total)
    if new_tier != client.loyalty_tier:
        client.loyalty_tier = new_tier
        db.add(client)
        db.flush()


def award_bonus(db: Session, client: Client, amount: int, reason: str) -> BonusEvent:
    client.bonus_balance += amount
    db.add(client)
    event = BonusEvent(client_id=client.id, amount=amount, reason=reason)
    db.add(event)
    db.flush()
    try:
        yandex_sync.sync_bonus_event(event)
    except Exception as exc:  # noqa: BLE001
        print(f"[yandex_sync] failed to sync bonus event: {exc}")
    return event


def apply_order_done_effects(db: Session, order: Order) -> None:
    """Run cashback + referral reward logic when an order transitions to done."""
    client = db.query(Client).filter(Client.id == order.client_id).first()
    product = db.query(Product).filter(Product.id == order.product_id).first()
    if client is None or product is None:
        return

    # Tier must be recalculated BEFORE cashback is granted for this order.
    recompute_tier(db, client)

    order_total = order.quantity * product.price
    cashback_amount = round(order_total * cashback_percent(client.loyalty_tier))
    if cashback_amount > 0:
        award_bonus(db, client, cashback_amount, f"Кэшбэк за заказ #{order.id}")

    _apply_referral_reward_if_eligible(db, client)


def _apply_referral_reward_if_eligible(db: Session, client: Client) -> None:
    if client.referred_by_client_id is None:
        return

    done_count = (
        db.query(Order)
        .filter(Order.client_id == client.id, Order.status == "done")
        .count()
    )
    if done_count != 1:
        return  # reward only fires on the client's first completed order

    referral = (
        db.query(Referral)
        .filter(Referral.referred_client_id == client.id, Referral.status == "pending")
        .first()
    )
    if referral is None:
        return

    referrer = db.query(Client).filter(Client.id == referral.referrer_client_id).first()
    if referrer is None:
        return

    award_bonus(db, referrer, REFERRAL_BONUS_REFERRER, "Реферальный бонус за приглашённого друга")
    award_bonus(db, client, REFERRAL_BONUS_REFERRED, "Бонус за регистрацию по приглашению")

    referral.status = "rewarded"
    db.add(referral)
    db.flush()
    try:
        yandex_sync.sync_referral(referral)
    except Exception as exc:  # noqa: BLE001
        print(f"[yandex_sync] failed to sync referral: {exc}")
