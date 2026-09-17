from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import yandex_sync
from app.config import REVIEW_PHOTO_BONUS
from app.database import get_db
from app.deps import get_current_client
from app.loyalty import award_bonus
from app.models import Client, Order, Product, Review
from app.schemas import ProductOut, ReviewOut

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def list_products(collection: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if collection:
        query = query.filter(Product.collection == collection)
    return query.order_by(Product.id.desc()).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product


@router.get("/{product_id}/reviews", response_model=list[ReviewOut])
def list_reviews(product_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.product_id == product_id, Review.status == "published")
        .order_by(Review.created_at.desc())
        .all()
    )


def _recompute_product_rating(db: Session, product: Product) -> None:
    published = db.query(Review).filter(Review.product_id == product.id, Review.status == "published").all()
    product.reviews_count = len(published)
    product.avg_rating = round(sum(r.rating for r in published) / len(published), 2) if published else 0.0
    db.add(product)


@router.post("/{product_id}/reviews", response_model=ReviewOut)
def create_review(
    product_id: int,
    rating: int = Form(..., ge=1, le=5),
    text: str = Form(""),
    photo: Optional[UploadFile] = File(None),
    client: Client = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")

    done_order = (
        db.query(Order)
        .filter(Order.client_id == client.id, Order.product_id == product_id, Order.status == "done")
        .first()
    )
    if done_order is None:
        raise HTTPException(status_code=403, detail="Оставить отзыв можно только после получения заказа")

    existing_review = (
        db.query(Review)
        .filter(Review.client_id == client.id, Review.product_id == product_id)
        .first()
    )
    if existing_review is not None:
        raise HTTPException(status_code=400, detail="Вы уже оставили отзыв на этот товар")

    photo_url = None
    if photo is not None:
        content = photo.file.read()
        photo_url = yandex_sync.upload_review_photo(content, photo.filename or "review.jpg")

    review = Review(
        client_id=client.id,
        product_id=product_id,
        order_id=done_order.id,
        rating=rating,
        text=text,
        photo_url=photo_url,
        status="published",
    )
    db.add(review)
    db.flush()

    _recompute_product_rating(db, product)

    if photo_url:
        award_bonus(db, client, REVIEW_PHOTO_BONUS, "Бонус за отзыв с фото")

    db.commit()
    db.refresh(review)
    return review
