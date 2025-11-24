# syntax=docker/dockerfile:1.6

FROM node:20-bookworm-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_PRODUCTION=false

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci && npm ls tailwindcss

COPY frontend ./
RUN NODE_ENV=production npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
