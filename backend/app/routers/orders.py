from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import yandex_sync
from app.database import get_db
from app.deps import get_current_client
from app.models import Client, Order, Product
from app.schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut)
def create_order(
    payload: OrderCreate,
    client: Client = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    if not product.in_stock:
        raise HTTPException(status_code=400, detail="Товара нет в наличии")

    order = Order(
        client_id=client.id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        comment=payload.comment,
        status="new",
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    try:
        yandex_sync.sync_order(order)
    except Exception as exc:  # noqa: BLE001
        print(f"[yandex_sync] failed to sync order: {exc}")

    return order
