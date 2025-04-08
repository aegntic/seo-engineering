#!/bin/bash

# SEO.engineering Infrastructure Deployment Script
# Version 1.0.1 - April 8, 2025

LOG_FILE="/home/tabs/seo-engineering/logs/infrastructure-deployment.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Cleanup Existing Containers
cleanup_containers() {
    log_message "🧹 Cleaning Up Existing Containers"
    docker rm -f seo-mongodb seo-redis seo-api seo-nginx || true
}

# Network Creation
create_network() {
    log_message "🌐 Creating SEO Engineering Network"
    docker network create seo_engineering || log_message "Network might already exist"
}

# MongoDB Deployment
deploy_mongodb() {
    log_message "📦 Launching MongoDB Container"
    docker run -d --name seo-mongodb \
      --network seo_engineering \
      -e MONGO_INITDB_ROOT_USERNAME=admin \
      -e MONGO_INITDB_ROOT_PASSWORD=F0ujdluYOVCCDX7N \
      -p 27017:27017 \
      mongo:latest
}

# Redis Deployment
deploy_redis() {
    log_message "🚀 Launching Redis Container"
    docker run -d --name seo-redis \
      --network seo_engineering \
      -p 6379:6379 \
      redis:alpine
}

# API Service Deployment
deploy_api() {
    log_message "🔧 Launching API Service Container"
    docker run -d --name seo-api \
      --network seo_engineering \
      -p 3001:3001 \
      -e MONGODB_URI=mongodb://admin:F0ujdluYOVCCDX7N@seo-mongodb:27017 \
      -e REDIS_URL=redis://seo-redis:6379 \
      seo-engineering-api:latest
}

# Nginx Deployment
deploy_nginx() {
    log_message "🌍 Launching Nginx Container"
    docker run -d --name seo-nginx \
      --network seo_engineering \
      -p 80:80 -p 443:443 \
      -v /home/tabs/seo-engineering/nginx/nginx.conf:/etc/nginx/nginx.conf \
      -v /home/tabs/seo-engineering/nginx/ssl:/etc/nginx/ssl \
      nginx:latest
}

# Connectivity and Health Check
verify_deployment() {
    log_message "🩺 Verifying Infrastructure Deployment"
    
    log_message "Containers:"
    docker ps
    
    log_message "Network Configuration:"
    docker network inspect seo_engineering
}

# Main Deployment Workflow
main() {
    log_message "🚀 Starting SEO.engineering Infrastructure Deployment"
    
    cleanup_containers
    create_network
    deploy_mongodb
    deploy_redis
    deploy_api
    deploy_nginx
    
    # Wait for containers to stabilize
    sleep 15
    
    verify_deployment
    
    log_message "🎉 Infrastructure Deployment Complete!"
}

main
