
# Stage 1: Build the application
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci

RUN npm run build --workspace=backend/order-service


# Stage 2: Install production dependencies
FROM node:20-bookworm-slim AS production-deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci --omit=dev \
    --workspace=backend/order-service \
    --include-workspace-root=false


# Stage 3: Production runtime
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=4003

WORKDIR /app

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/backend/order-service/dist ./backend/order-service/dist
COPY --from=builder /app/backend/order-service/package.json ./backend/order-service/package.json

WORKDIR /app/backend/order-service

USER node

EXPOSE 4003

CMD ["node", "dist/index.js"]
