#!/bin/bash

# System Status Monitoring Script
# SEO.engineering Platform
# Created: April 8, 2025

# Configuration
LOG_FILE="/home/tabs/seo-engineering/logs/system-status.log"
EMAIL_RECIPIENT="admin@seo.engineering"
CHECK_INTERVAL=300 # 5 minutes

# Function to check if a container is running
check_container() {
    CONTAINER_NAME=$1
    STATUS=$(echo "1123" | sudo -S docker inspect --format="{{.State.Running}}" $CONTAINER_NAME 2>/dev/null)
    
    if [ "$STATUS" == "true" ]; then
        echo "[OK] Container $CONTAINER_NAME is running."
        return 0
    else
        echo "[ALERT] Container $CONTAINER_NAME is not running!"
        return 1
    fi
}

# Function to check HTTP endpoint
check_endpoint() {
    ENDPOINT=$1
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $ENDPOINT)
    
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "302" ]; then
        echo "[OK] Endpoint $ENDPOINT is responding with HTTP $HTTP_CODE."
        return 0
    else
        echo "[ALERT] Endpoint $ENDPOINT is responding with HTTP $HTTP_CODE!"
        return 1
    fi
}

# Main monitoring loop
while true; do
    echo "=== System Status Check: $(date) ===" | tee -a $LOG_FILE
    
    # Check all containers
    CONTAINERS=("seo-nginx" "seo-api" "seo-mongodb" "seo-redis" "seo-grafana" "seo-prometheus" "seo-n8n" "seo-website" "seo-node-exporter")
    
    ALERTS=0
    
    for CONTAINER in "${CONTAINERS[@]}"; do
        OUTPUT=$(check_container $CONTAINER)
        echo "$OUTPUT" | tee -a $LOG_FILE
        if [[ "$OUTPUT" == *"[ALERT]"* ]]; then
            ALERTS=$((ALERTS+1))
        fi
    done
    
    # Check endpoints
    check_endpoint "https://seo.engineering/health" | tee -a $LOG_FILE
    if [ $? -ne 0 ]; then ALERTS=$((ALERTS+1)); fi
    
    check_endpoint "https://seo.engineering/api/health" | tee -a $LOG_FILE
    if [ $? -ne 0 ]; then ALERTS=$((ALERTS+1)); fi
    
    echo "System status check completed with $ALERTS alerts." | tee -a $LOG_FILE
    echo "Next check in $CHECK_INTERVAL seconds." | tee -a $LOG_FILE
    echo "" | tee -a $LOG_FILE
    
    # If there are alerts, we could send an email here
    # if [ $ALERTS -gt 0 ]; then
    #     echo "System alerts detected. Please check the monitoring dashboard." | mail -s "SEO.engineering System Alert" $EMAIL_RECIPIENT
    # fi
    
    # Wait for next check
    sleep $CHECK_INTERVAL
done
