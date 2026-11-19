# -------------------------------------------------------------
# Stage 1: Build Production Frontend Assets
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Cache package dependencies
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy sources and build static distribution
COPY . .
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Serve via High-Performance Nginx
# -------------------------------------------------------------
FROM nginx:alpine AS runner

# Remove default boilerplate assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built distribution from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy optimized Nginx virtual host configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check to ensure web server is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
