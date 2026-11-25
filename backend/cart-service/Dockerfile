
# Stage 1: Build the application
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci

# Build shared library first
RUN npm run build --workspace=backend/shared

# Build Cart Service
RUN npm run build --workspace=backend/cart-service


# Stage 2: Install production dependencies
FROM node:20-bookworm-slim AS production-deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci --omit=dev \
    --workspace=backend/cart-service \
    --include-workspace-root=false


# Stage 3: Production runtime
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=4005

WORKDIR /app

COPY --from=production-deps /app/node_modules ./node_modules

COPY --from=builder /app/backend/cart-service/dist ./backend/cart-service/dist
COPY --from=builder /app/backend/cart-service/package.json ./backend/cart-service/package.json

COPY --from=builder /app/backend/shared/dist ./backend/shared/dist
COPY --from=builder /app/backend/shared/package.json ./backend/shared/package.json

WORKDIR /app/backend/cart-service

# Create logs directory and grant write permission to node user
RUN mkdir -p /app/backend/cart-service/logs \
    && chown -R node:node /app/backend/cart-service/logs

USER node

EXPOSE 4005

CMD ["node", "dist/index.js"]
