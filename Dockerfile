# CV Generator - Dockerfile
# Multi-stage build for production

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
COPY package.json ./
RUN npm install --production

# Production stage
FROM node:20-alpine AS production

# Install chromium dependencies for puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Set environment for puppeteer to use system chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PORT=8083 \
    DB_PATH=/app/db/cvgenerator.db

WORKDIR /app

# Create app directory and db directory
RUN mkdir -p /app/db

# Copy package and dependencies from builder
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY src/ ./src/
COPY views/ ./views/
COPY public/ ./public/
COPY scripts/ ./scripts/
COPY .env.example ./

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8083/health', (r) => {process.exit(r && r.statusCode === 200 ? 0 : 1)})" 2>/dev/null || exit 1

EXPOSE 8083

# Start server
CMD ["node", "src/server.js"]
