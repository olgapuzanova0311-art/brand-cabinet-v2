import os

# --- Core secrets / infra (from environment) ---
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
ADMIN_KEY = os.getenv("ADMIN_KEY", "dev-admin-key-change-me")
YANDEX_DISK_TOKEN = os.getenv("YANDEX_DISK_TOKEN")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# --- Loyalty / bonus program constants ---
# TODO: заменить на реальные значения бренда
WELCOME_BONUS = 100
REVIEW_PHOTO_BONUS = 30

# Минимальная сумма (руб) заказов в статусе done для достижения уровня
# TODO: подобрать реальные пороги под бренд
LOYALTY_THRESHOLDS = {
    "bronze": 0,
    "silver": 10_000,
    "gold": 30_000,
}

# Процент кэшбэка по уровню (доля от суммы заказа)
# TODO: подобрать реальные проценты под бренд
LOYALTY_CASHBACK = {
    "bronze": 0.05,
    "silver": 0.07,
    "gold": 0.10,
}

# TODO: подобрать реальные размеры реферальных бонусов
REFERRAL_BONUS_REFERRER = 150
REFERRAL_BONUS_REFERRED = 100

YANDEX_SYNC_DIR = "/brand-cabinet"
YANDEX_REVIEWS_DIR = f"{YANDEX_SYNC_DIR}/reviews"


def loyalty_tier_for_amount(amount: float) -> str:
    tier = "bronze"
    for name, threshold in sorted(LOYALTY_THRESHOLDS.items(), key=lambda kv: kv[1]):
        if amount >= threshold:
            tier = name
    return tier
