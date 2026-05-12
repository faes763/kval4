# syntax=docker/dockerfile:1
# target: build — статика; target: production — serve dist
FROM oven/bun:alpine AS build

WORKDIR /app

COPY package.json bun.lock ./

ARG NPM_REGISTRY=https://registry.npmmirror.com
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}

RUN --mount=type=cache,target=/root/.bun/install/cache \
	bun install --frozen-lockfile

COPY . .

ARG PUBLIC_API_URL=http://127.0.0.1:4000
ENV PUBLIC_API_URL=${PUBLIC_API_URL}
ENV NODE_ENV=production

RUN bun run build

FROM oven/bun:alpine AS production

WORKDIR /app

ARG NPM_REGISTRY=https://registry.npmmirror.com
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}

RUN --mount=type=cache,target=/root/.bun/install/cache \
	bun install -g serve@14

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["serve", "dist", "-l", "3000", "--no-port-switching"]
