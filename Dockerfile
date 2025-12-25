FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Add cache busting - this will force rebuild of subsequent layers
ARG CACHE_BUST=1
RUN echo "Cache bust: $CACHE_BUST"

# Copy all website files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/

# Create logs directory
RUN mkdir -p /var/log/nginx

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
