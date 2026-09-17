from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_client
from app.loyalty import cashback_percent
from app.models import BonusEvent, Client, Order, Referral
from app.schemas import (
    BonusEventOut,
    ClientOut,
    ClientUpdate,
    OrderOut,
    ReferralStats,
)

router = APIRouter(prefix="/me", tags=["me"])


def _to_client_out(client: Client) -> ClientOut:
    return ClientOut(
        id=client.id,
        name=client.name,
        email=client.email,
        phone=client.phone,
        bonus_balance=client.bonus_balance,
        loyalty_tier=client.loyalty_tier,
        cashback_percent=cashback_percent(client.loyalty_tier),
        referral_code=client.referral_code,
        created_at=client.created_at,
    )


@router.get("", response_model=ClientOut)
def get_me(client: Client = Depends(get_current_client)):
    return _to_client_out(client)


@router.patch("", response_model=ClientOut)
def update_me(
    payload: ClientUpdate,
    client: Client = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        client.name = payload.name
    if payload.phone is not None:
        client.phone = payload.phone
    db.add(client)
    db.commit()
    db.refresh(client)
    return _to_client_out(client)


@router.get("/bonuses", response_model=list[BonusEventOut])
def get_my_bonuses(client: Client = Depends(get_current_client), db: Session = Depends(get_db)):
    return (
        db.query(BonusEvent)
        .filter(BonusEvent.client_id == client.id)
        .order_by(BonusEvent.created_at.desc())
        .all()
    )


@router.get("/orders", response_model=list[OrderOut])
def get_my_orders(client: Client = Depends(get_current_client), db: Session = Depends(get_db)):
    return (
        db.query(Order)
        .filter(Order.client_id == client.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/referral", response_model=ReferralStats)
def get_my_referral(client: Client = Depends(get_current_client), db: Session = Depends(get_db)):
    referrals = db.query(Referral).filter(Referral.referrer_client_id == client.id).all()
    rewarded = [r for r in referrals if r.status == "rewarded"]
    total_earned = (
        db.query(BonusEvent)
        .filter(
            BonusEvent.client_id == client.id,
            BonusEvent.reason == "Реферальный бонус за приглашённого друга",
        )
        .count()
    )
    from app.config import REFERRAL_BONUS_REFERRER

    return ReferralStats(
        referral_code=client.referral_code,
        referral_link=f"/register?referral_code={client.referral_code}",
        invited_count=len(referrals),
        rewarded_count=len(rewarded),
        total_earned=total_earned * REFERRAL_BONUS_REFERRER,
    )
