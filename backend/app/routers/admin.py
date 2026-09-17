from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import yandex_sync
from app.database import get_db
from app.deps import verify_admin_key
from app.loyalty import apply_order_done_effects
from app.models import BonusEvent, Order, Product, Referral, Review
from app.routers.products import _recompute_product_rating
from app.schemas import OrderOut, OrderStatusUpdate, ProductCreate, ProductOut

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(verify_admin_key)])

VALID_STATUSES = {"new", "processing", "confirmed", "shipped", "done", "cancelled"}


@router.get("/orders", response_model=list[OrderOut])
def list_all_orders(db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.created_at.desc()).all()


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Неизвестный статус заказа")

    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    previous_status = order.status
    order.status = payload.status
    db.add(order)
    db.flush()

    if payload.status == "done" and previous_status != "done":
        apply_order_done_effects(db, order)

    db.commit()
    db.refresh(order)

    try:
        yandex_sync.sync_order(order)
    except Exception as exc:  # noqa: BLE001
        print(f"[yandex_sync] failed to sync order: {exc}")

    return order


@router.post("/products", response_model=ProductOut)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    db.delete(product)
    db.commit()
    return {"ok": True}


@router.patch("/reviews/{review_id}/status")
def update_review_status(review_id: int, status: str, db: Session = Depends(get_db)):
    if status not in {"published", "hidden"}:
        raise HTTPException(status_code=400, detail="Неизвестный статус отзыва")

    review = db.query(Review).filter(Review.id == review_id).first()
    if review is None:
        raise HTTPException(status_code=404, detail="Отзыв не найден")

    review.status = status
    db.add(review)
    db.flush()

    product = db.query(Product).filter(Product.id == review.product_id).first()
    if product is not None:
        _recompute_product_rating(db, product)

    db.commit()
    return {"ok": True}


@router.post("/sync-all")
def sync_all(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    bonus_events = db.query(BonusEvent).all()
    referrals = db.query(Referral).all()
    yandex_sync.resync_all(orders, bonus_events, referrals)
    return {"ok": True, "orders": len(orders), "bonus_events": len(bonus_events), "referrals": len(referrals)}
