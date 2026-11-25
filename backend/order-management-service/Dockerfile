
# Stage 1: Build
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci --workspace=backend/shared --workspace=backend/order-management-service --include-workspace-root=false
RUN npm run build --workspace=backend/shared
RUN npm run build --workspace=backend/order-management-service


# Stage 2: Production Dependencies
FROM node:20-bookworm-slim AS production-deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci --omit=dev \
    --workspace=backend/order-management-service \
    --include-workspace-root=false


# Stage 3: Runtime
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=3002

WORKDIR /app

COPY --from=production-deps /app/node_modules ./node_modules

COPY --from=builder /app/backend/order-management-service/dist ./backend/order-management-service/dist
COPY --from=builder /app/backend/order-management-service/package.json ./backend/order-management-service/package.json

COPY --from=builder /app/backend/shared/dist ./backend/shared/dist
COPY --from=builder /app/backend/shared/package.json ./backend/shared/package.json

RUN mkdir -p /app/backend/order-management-service/logs \
    && chown -R node:node /app/backend/order-management-service/logs

WORKDIR /app/backend/order-management-service

USER node

EXPOSE 3002

CMD ["node", "dist/index.js"]
