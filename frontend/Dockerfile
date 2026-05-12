# syntax=docker/dockerfile:1
# target: build — статика; target: production — serve dist
FROM oven/bun:alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG PUBLIC_API_URL=http://127.0.0.1:4444
ENV PUBLIC_API_URL=${PUBLIC_API_URL}
ENV NODE_ENV=production
ENV ASTRO_TELEMETRY_DISABLED=1
ENV CI=true
# второй проход Vite + острова React после строки «vite ✓ built» долго молчит на слабом CPU
# heap ~512 МБ: на VPS с 1 ГБ RAM не ставить 4096 — будет своп и «подвисание»
ENV NODE_OPTIONS="--max-old-space-size=512"

RUN echo ">>> astro: после «vite ✓ built» ещё долго собираются острова/страницы — не прерывать Ctrl+C <<<" \
	&& bun run build \
	&& echo ">>> astro build OK <<<"

FROM oven/bun:alpine AS production

WORKDIR /app

RUN bun install -g serve@14

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["serve", "dist", "-l", "3000", "--no-port-switching"]
