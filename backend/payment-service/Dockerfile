
# Stage 1: Build the application
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci

RUN npm run build --workspace=backend/shared
RUN npm run build --workspace=backend/payment-service


# Stage 2: Install production dependencies
FROM node:20-bookworm-slim AS production-deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci --omit=dev \
    --workspace=backend/payment-service \
    --include-workspace-root=false


# Stage 3: Production runtime
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=4004

WORKDIR /app

COPY --from=production-deps /app/node_modules ./node_modules

COPY --from=builder /app/backend/payment-service/dist ./backend/payment-service/dist
COPY --from=builder /app/backend/payment-service/package.json ./backend/payment-service/package.json

COPY --from=builder /app/backend/shared/dist ./backend/shared/dist
COPY --from=builder /app/backend/shared/package.json ./backend/shared/package.json

# Prepare logs directory with correct permissions
RUN mkdir -p /app/backend/payment-service/logs \
    && chown -R node:node /app/backend/payment-service/logs

WORKDIR /app/backend/payment-service

USER node

EXPOSE 4004

CMD ["node", "dist/index.js"]
