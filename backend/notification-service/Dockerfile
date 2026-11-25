
# Stage 1: Build
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci
RUN npm run build --workspace=backend/shared
RUN npm run build --workspace=backend/notification-service


# Stage 2: Production Dependencies
FROM node:20-bookworm-slim AS production-deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci --omit=dev \
    --workspace=backend/notification-service \
    --include-workspace-root=false


# Stage 3: Runtime
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=4007

WORKDIR /app

COPY --from=production-deps /app/node_modules ./node_modules

COPY --from=builder /app/backend/notification-service/dist ./backend/notification-service/dist
COPY --from=builder /app/backend/notification-service/package.json ./backend/notification-service/package.json

COPY --from=builder /app/backend/shared/dist ./backend/shared/dist
COPY --from=builder /app/backend/shared/package.json ./backend/shared/package.json

RUN mkdir -p /app/backend/notification-service/logs \
    && chown -R node:node /app/backend/notification-service/logs

WORKDIR /app/backend/notification-service

USER node

EXPOSE 4007

CMD ["node", "dist/index.js"]
