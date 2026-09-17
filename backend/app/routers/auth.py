from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import yandex_sync
from app.auth import create_access_token, generate_referral_code, hash_password, verify_password
from app.config import WELCOME_BONUS
from app.database import get_db
from app.loyalty import award_bonus
from app.models import Client, Referral
from app.schemas import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(Client).filter(Client.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Клиент с таким email уже существует")

    referred_by = None
    if payload.referral_code:
        referrer = db.query(Client).filter(Client.referral_code == payload.referral_code).first()
        if referrer:
            referred_by = referrer.id

    referral_code = generate_referral_code()
    while db.query(Client).filter(Client.referral_code == referral_code).first():
        referral_code = generate_referral_code()

    client = Client(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        bonus_balance=0,
        loyalty_tier="bronze",
        referral_code=referral_code,
        referred_by_client_id=referred_by,
    )
    db.add(client)
    db.flush()

    award_bonus(db, client, WELCOME_BONUS, "Приветственный бонус")

    if referred_by is not None:
        referral = Referral(referrer_client_id=referred_by, referred_client_id=client.id, status="pending")
        db.add(referral)
        db.flush()
        try:
            yandex_sync.sync_referral(referral)
        except Exception as exc:  # noqa: BLE001
            print(f"[yandex_sync] failed to sync referral: {exc}")

    db.commit()
    db.refresh(client)

    token = create_access_token(client.id)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.email == payload.email).first()
    if client is None or not verify_password(payload.password, client.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")
    token = create_access_token(client.id)
    return TokenResponse(access_token=token)
