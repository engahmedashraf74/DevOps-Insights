
# Stage 1: Build the application
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci

RUN npm run build --workspace=backend/shared
RUN npm run build --workspace=backend/catalog-service


# Stage 2: Install production dependencies
FROM node:20-bookworm-slim AS production-deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

RUN npm ci --omit=dev \
    --workspace=backend/catalog-service \
    --include-workspace-root=false


# Stage 3: Production runtime
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=4001

WORKDIR /app

COPY --from=production-deps /app/node_modules ./node_modules

COPY --from=builder /app/backend/catalog-service/dist ./backend/catalog-service/dist
COPY --from=builder /app/backend/catalog-service/package.json ./backend/catalog-service/package.json

COPY --from=builder /app/backend/shared/dist ./backend/shared/dist
COPY --from=builder /app/backend/shared/package.json ./backend/shared/package.json


RUN mkdir -p /app/backend/catalog-service/logs \
    && chown -R node:node /app/backend/catalog-service/logs

WORKDIR /app/backend/catalog-service

USER node

EXPOSE 4001

CMD ["node", "dist/index.js"]
