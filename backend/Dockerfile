# syntax=docker/dockerfile:1

FROM oven/bun AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY tsconfig.json prisma.config.ts ./

ARG NPM_REGISTRY=https://registry.npmmirror.com
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}
ENV HUSKY=0
ENV PRISMA_ENGINES_MIRROR=https://npmmirror.com/mirrors/prisma-engines

RUN --mount=type=cache,target=/root/.bun/install/cache \
	bun install

COPY src src

RUN --mount=type=cache,target=/root/.cache/prisma \
	DATABASE_URL="postgresql://migrate:migrate@localhost:5432/migrate" bunx prisma generate --schema=./src/database/prisma/schema.prisma

RUN bunx --bun tsc --noEmit

RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--outfile server \
	src/index.ts

FROM oven/bun AS dev
WORKDIR /app

COPY package.json bun.lock ./
COPY tsconfig.json prisma.config.ts ./

ARG NPM_REGISTRY=https://registry.npmmirror.com
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}
ENV HUSKY=0
ENV PRISMA_ENGINES_MIRROR=https://npmmirror.com/mirrors/prisma-engines

RUN --mount=type=cache,target=/root/.bun/install/cache \
	bun install

COPY src src

RUN --mount=type=cache,target=/root/.cache/prisma \
	DATABASE_URL="postgresql://migrate:migrate@localhost:5432/migrate" bunx prisma generate --schema=./src/database/prisma/schema.prisma

ENV NODE_ENV=development

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["bun", "run", "dev"]

# Production: Prisma migrate + исходники на Bun (стабильная работа клиента и миграций в контейнере)
FROM oven/bun:alpine AS production

WORKDIR /app

RUN apk add --no-cache bash openssl libc6-compat

COPY package.json bun.lock prisma.config.ts tsconfig.json ./
COPY src ./src

ARG NPM_REGISTRY=https://registry.npmmirror.com
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}
ENV HUSKY=0
ENV PRISMA_ENGINES_MIRROR=https://npmmirror.com/mirrors/prisma-engines

RUN --mount=type=cache,target=/root/.bun/install/cache \
	--mount=type=cache,target=/root/.cache/prisma \
	bun install --frozen-lockfile \
	&& DATABASE_URL="postgresql://migrate:migrate@localhost:5432/migrate" bunx prisma generate --schema=./src/database/prisma/schema.prisma

ENV NODE_ENV=production

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

EXPOSE 4000

CMD ["sh", "-c", "bunx prisma migrate deploy --schema=./src/database/prisma/schema.prisma && exec bun run src/index.ts"]
