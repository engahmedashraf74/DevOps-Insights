
# Stage 1: Build production dependencies
FROM node:20-bookworm-slim AS dependencies

WORKDIR /app

# Copy workspace manifests and lockfile
COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/package.json ./frontend/package.json

# Install production dependencies for the API Gateway workspace
RUN npm ci --omit=dev \
    --workspace=backend/api-gateway \
    --include-workspace-root=false


# Stage 2: Production runtime
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

# Copy installed dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy API Gateway application
COPY backend/api-gateway/package.json ./backend/api-gateway/package.json
COPY backend/api-gateway/src ./backend/api-gateway/src

WORKDIR /app/backend/api-gateway

# Run as non-root user
USER node

EXPOSE 4000

CMD ["node", "src/app.js"]
