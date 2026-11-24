FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci \
    --workspace=backend/shared \
    --workspace=backend/user-service \
    --include-workspace-root=false

RUN npm run build --workspace=backend/shared
RUN npm run build --workspace=backend/user-service


FROM node:20-bookworm-slim AS production-deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci --omit=dev \
    --workspace=backend/user-service \
    --include-workspace-root=false


FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=4002

WORKDIR /app

COPY --from=production-deps /app/node_modules ./node_modules

COPY --from=builder /app/backend/user-service/package.json ./backend/user-service/package.json
COPY --from=builder /app/backend/user-service/dist ./backend/user-service/dist

COPY --from=builder /app/backend/shared/package.json ./backend/shared/package.json
COPY --from=builder /app/backend/shared/dist ./backend/shared/dist

RUN mkdir -p /app/backend/user-service/logs \
    && chown -R node:node /app/backend/user-service/logs

WORKDIR /app/backend/user-service

USER node

EXPOSE 4002

CMD ["node", "dist/index.js"]
