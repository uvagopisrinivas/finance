FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Build CSS from LESS
RUN npm run build:css

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Add cache busting - this will force rebuild of subsequent layers
ARG CACHE_BUST=1
RUN echo "Cache bust: $CACHE_BUST"

# Copy built files from builder stage
COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/src/ /usr/share/nginx/html/src/

# Create logs directory
RUN mkdir -p /var/log/nginx

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
