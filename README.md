# Личный кабинет клиента бренда

Веб-приложение личного кабинета: заявки на товары, программа лояльности (уровни и кэшбэк), реферальная программа, отзывы с фото, контент бренда и соцсети.

## Структура репозитория

Монорепозиторий с двумя независимо деплоящимися частями:

```
brand-cabinet/
├── backend/          # FastAPI + SQLAlchemy + PostgreSQL/SQLite
│   ├── app/
│   │   ├── main.py         # точка входа FastAPI
│   │   ├── models.py       # ORM-модели (Client, Product, Order, BonusEvent, Review, Referral)
│   │   ├── config.py       # все константы программы лояльности/бонусов
│   │   ├── loyalty.py      # логика уровней, кэшбэка и реферальных начислений
│   │   ├── yandex_sync.py  # синхронизация с Яндекс.Диском (заявки/бонусы/рефералы + фото отзывов)
│   │   └── routers/        # auth, me, products, orders, admin
│   ├── requirements.txt
│   └── railway.json
├── frontend/         # React + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── api/             # HTTP-клиент и типы
│   │   ├── context/         # AuthContext (JWT, текущий клиент)
│   │   ├── components/      # BottomNav, TierBadge, Stars и т.д.
│   │   └── pages/           # все экраны приложения
│   └── railway.json
└── README.md
```

## Деплой на Railway

Приложение деплоится как два отдельных сервиса + база данных, из одного GitHub-репозитория.

### 1. Подготовка репозитория

Запушьте этот проект в GitHub (один репозиторий, backend и frontend внутри).

### 2. PostgreSQL

В Railway создайте новый проект → **Add Service → Database → PostgreSQL**.

### 3. Backend-сервис

**Add Service → GitHub Repo** → выберите репозиторий.

- **Root Directory**: `backend`
- Railway автоматически подхватит `backend/railway.json` (Nixpacks, `uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
- **Переменные окружения**:
  | Переменная | Откуда взять |
  |---|---|
  | `DATABASE_URL` | В Variables нажмите "Add Reference" → выберите Postgres-сервис → `DATABASE_URL` (Railway подставит связь автоматически) |
  | `SECRET_KEY` | Любая случайная строка, например сгенерированная `openssl rand -hex 32` |
  | `ADMIN_KEY` | Любая случайная строка — защищает `/admin/*` эндпоинты |
  | `YANDEX_DISK_TOKEN` | oauth.yandex.ru → создать приложение с правом **"Запись в любом месте на Диске"** (или использовать готовый токен). Необязательно: без него приложение работает, просто без синхронизации в таблицы и без фото в отзывах |

После деплоя откройте **Settings → Networking → Generate Domain**, чтобы получить публичный URL backend (например `https://brand-backend.up.railway.app`).

### 4. Frontend-сервис

**Add Service → GitHub Repo** → тот же репозиторий ещё раз.

- **Root Directory**: `frontend`
- Railway подхватит `frontend/railway.json` (сборка Vite, раздача через `vite preview --host --port $PORT`)
- **Переменные окружения**:
  | Переменная | Откуда взять |
  |---|---|
  | `VITE_API_URL` | Публичный домен backend-сервиса из шага 3, например `https://brand-backend.up.railway.app` |

Сгенерируйте домен и для frontend-сервиса — это и есть публичная ссылка на приложение.

### 5. Проверка

Откройте домен frontend, зарегистрируйтесь, добавьте товар через `POST /admin/products?admin_key=...` (например через Postman/curl к домену backend) и пройдите путь: заявка → перевод в `done` через `/admin/orders/{id}/status` → кэшбэк и отзыв.

⚠️ Перед продакшеном сузьте `allow_origins=["*"]` в `backend/app/main.py` до реального домена frontend.

## Логика программы лояльности и рефералки

Все параметры — константы в [`backend/app/config.py`](backend/app/config.py), их можно менять без миграций БД:

- **`LOYALTY_THRESHOLDS`** — минимальная сумма заказов в статусе `done`, начиная с которой клиенту присваивается уровень (`bronze`/`silver`/`gold`). Пересчитывается при каждом переводе заказа клиента в `done`.
- **`LOYALTY_CASHBACK`** — процент кэшбэка по каждому уровню; начисляется бонусами при завершении заказа, **после** пересчёта уровня.
- **`REFERRAL_BONUS_REFERRER`** / **`REFERRAL_BONUS_REFERRED`** — сколько получает пригласивший и приглашённый, когда приглашённый клиент завершает свой **первый** заказ (переводится в `done`).
- **`REVIEW_PHOTO_BONUS`** — бонус за отзыв с фото (начисляется, только если фото успешно загрузилось на Яндекс.Диск).
- **`WELCOME_BONUS`** — приветственный бонус при регистрации.

Текущие значения — заглушки для MVP, отмечены `# TODO` в коде. Их стоит донастроить под экономику бренда.

## Что дальше (после MVP)

- Подписочная модель "коробка месяца" — регулярные заказы по расписанию с автосписанием бонусов
- Геймификация: бейджи за количество заказов, стрики, челленджи
- Push-уведомления через телеграм-бота (напоминания о статусе заказа, сгорании бонусов, новых уровнях)
- Мультитенантность — поддержка нескольких брендов в одной инсталляции с изоляцией данных

## Локальная разработка

**Backend**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Без `DATABASE_URL` используется локальный SQLite-файл `app.db`.

**Frontend**
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```
