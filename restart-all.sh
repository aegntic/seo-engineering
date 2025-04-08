#!/bin/bash

# SEO.engineering Platform Restart Script
# Created by JARVIS, April 8, 2025
# Description: Restarts all containers and ensures proper operation

LOG_FILE="/home/tabs/seo-engineering/logs/restart-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

log_message() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Capture current directory
CURRENT_DIR=$(pwd)
cd /home/tabs/seo-engineering

log_message "Starting full platform restart"
log_message "-------------------------------------------"

# Stop all containers
log_message "Stopping all containers..."
docker-compose down
log_message "All containers stopped successfully"

# Start containers with docker-compose
log_message "Starting all containers..."
docker-compose up -d
log_message "All containers started"

# Verify container status
log_message "Verifying container health..."
sleep 10  # Allow containers to initialize

CONTAINERS=$(docker-compose ps --services)
for container in $CONTAINERS; do
  STATUS=$(docker inspect --format='{{.State.Status}}' "seo-$container" 2>/dev/null || echo "not_found")
  
  if [ "$STATUS" != "running" ]; then
    log_message "WARNING: Container 'seo-$container' is not running properly (status: $STATUS)"
  else
    log_message "Container 'seo-$container' is running"
  fi
done

# Verify Nginx configuration
log_message "Verifying Nginx configuration..."
NGINX_TEST=$(docker exec seo-nginx nginx -t 2>&1)
if [[ $NGINX_TEST == *"successful"* ]]; then
  log_message "Nginx configuration test successful"
else
  log_message "WARNING: Nginx configuration test failed"
  log_message "$NGINX_TEST"
fi

# Check external connectivity
log_message "Checking external connectivity..."
CURRENT_IP=$(curl -s ifconfig.me)
HEALTH_CHECK=$(curl -s -k -m 5 "https://$CURRENT_IP/health" || echo "Failed")

if [[ $HEALTH_CHECK == *"Online"* ]]; then
  log_message "SUCCESS: Platform is accessible externally"
else
  log_message "WARNING: Platform is not accessible externally. Health check failed."
fi

log_message "-------------------------------------------"
log_message "Restart process completed"
log_message "For detailed logs, check individual container logs:"
log_message "docker logs seo-nginx"
log_message "docker logs seo-api"
log_message "docker logs seo-website"
log_message "-------------------------------------------"

# Return to original directory
cd "$CURRENT_DIR"

echo "Restart completed. See log at $LOG_FILE"