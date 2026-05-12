# Портал «Корочки.есть»

Информационная система записи на курсы дополнительного профессионального образования: регистрация, авторизация, заявки, отзывы, панель администратора.

## Стек

- **Бэкенд:** Bun, Elysia, Prisma (PostgreSQL), bcrypt (хэш пароля), JWT (jose).
- **Фронтенд:** Astro (архитектура **FSD**: `app/`, `widgets/`, `features/` при необходимости, `pages/`, `shared/`).

## Локальный запуск

### 1. PostgreSQL

Поднимите БД (отдельно или через Docker из каталога `infastructure`).

### 2. Бэкенд (`normal/backend`)

Скопируйте `.env` и задайте переменные:

- `PORT=4000`
- `NODE_ENV=development` (или другой из допустимых в `src/env.d.ts`)
- `DATABASE_URL` — **полная** строка `postgresql://user:pass@host:port/имя_бд?schema=public` (в `.env` подстановки вида `${POSTGRES_USER}` **не** разворачиваются)
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` — те же значения, что в `normal/infastructure/.env` (их подхватывает docker-compose). Локальный `DATABASE_URL` в backend должен указывать на тот же хост/порт/имя БД, что и проброс Postgres (`POSTGRES_PORT` → `:5432` в контейнере)
- `JWT_SECRET` — **не короче 16 символов**

Установка и миграции:

```bash
cd normal/backend
bun install
bunx prisma migrate deploy --schema=./src/database/prisma/schema.prisma
bun dev
```

API слушает **порт 4000**.

### 3. Фронтенд (`normal/frontend`)

```bash
cd normal/frontend
npm install
# опционально: PUBLIC_API_URL=http://localhost:4000 в .env
npm run dev
```

Интерфейс — **порт 3000**.

### Учётная запись администратора (по заданию)

- Логин: `Admin`
- Пароль: `KorokNET`

## Docker Compose (production)

Из каталога `normal/infastructure` при наличии `.env` (шаблон `infastructure/env.example`) и `normal/backend/.env` (`JWT_SECRET`, …):

```bash
docker compose up --build
```

Поднимаются **production**-образы: API на Bun с автоматическим `prisma migrate deploy` при старте, фронт — статический `astro build` и раздача через `serve`. Порты задаются в `infastructure/.env`:

- PostgreSQL: хост-порт `POSTGRES_PORT` → контейнер `:5432`
- API: `SERVER_PORT` → внутри контейнера слушается `4000`
- Сайт: `WEB_PORT` → внутри контейнера `3000`

Переменная **`PUBLIC_API_URL`** нужна при **сборке** образа фронта: полный URL API так, как его запрашивает браузер (на удалённом сервере укажите IP или домен и тот же порт, что в `SERVER_PORT`). Задайте её в `infastructure/.env` до `docker compose up --build`.

## ER-диаграмма (требование 1.2)

Сущности в БД:

- **users** — пользователь (`id`, уникальный `login`, хэш пароля, ФИО, телефон, email).
- **applications** — заявка (`id`, FK на пользователя, курс, дата начала, способ оплаты, статус, дата подачи, опционально отзыв).

Связь: **один пользователь — много заявок** (`applications.user_id` → `users.id`, `ON DELETE CASCADE`).

Диаграмму можно построить средствами СУБД или клиента (например, **pgAdmin** → ERD, **DBeaver**, или импорт схемы из Prisma). Для просмотра данных: `bun run prisma:studio` в каталоге бэкенда.

## API (все запросы через Fetch / AJAX)

Префикс `/api`:

| Метод | Путь | Описание |
|--------|------|-----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход пользователя |
| POST | `/api/admin/login` | Вход администратора |
| GET | `/api/applications` | Заявки текущего пользователя (Bearer user JWT) |
| POST | `/api/applications` | Новая заявка (статус «Новая») |
| POST | `/api/applications/:id/feedback` | Отзыв по заявке |
| GET | `/api/admin/applications` | Все заявки (Bearer admin JWT) |
| PATCH | `/api/admin/applications/:id` | Смена статуса (`IN_PROGRESS` / `COMPLETED`) |

Ответы об ошибках возвращают поле `error` с понятным текстом.
# kval4
