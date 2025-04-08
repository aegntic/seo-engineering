#!/bin/bash

# Container Health Monitor
# Created by JARVIS, April 8, 2025

CHECK_INTERVAL=300  # Check every 5 minutes
LOG_FILE="/home/tabs/seo-engineering/logs/container-monitor.log"

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

log_message() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_message "Container Health Monitor started"
log_message "-------------------------------------------"

while true; do
  log_message "Checking container health..."
  
  # Check if nginx container is running
  NGINX_STATUS=$(docker inspect --format='{{.State.Status}}' seo-nginx 2>/dev/null || echo "not_found")
  
  if [ "$NGINX_STATUS" != "running" ]; then
    log_message "WARNING: Nginx container is not running (status: $NGINX_STATUS). Restarting..."
    docker start seo-nginx
    log_message "Nginx container restart initiated"
  else
    log_message "Nginx container status: running"
  fi
  
  # Check for other essential containers
  ESSENTIAL_CONTAINERS=("seo-api" "seo-mongodb" "seo-redis" "seo-website" "seo-n8n" "seo-prometheus" "seo-grafana")
  
  for container in "${ESSENTIAL_CONTAINERS[@]}"; do
    STATUS=$(docker inspect --format='{{.State.Status}}' $container 2>/dev/null || echo "not_found")
    
    if [ "$STATUS" != "running" ]; then
      log_message "WARNING: $container is not running (status: $STATUS). Restarting..."
      docker start $container
      log_message "$container restart initiated"
    else
      log_message "$container status: running"
    fi
  done
  
  log_message "Health check complete. Next check in $CHECK_INTERVAL seconds."
  log_message "-------------------------------------------"
  
  sleep $CHECK_INTERVAL
done
