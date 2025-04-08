#!/bin/bash

# Network Configuration Diagnostic and Repair
# Version: 1.0.0
# Created: April 8, 2025

LOG_FILE="/home/tabs/seo-engineering/logs/network-repair.log"

# Logging function
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Docker Network Reset
reset_docker_network() {
    log_message "Resetting Docker Network Configuration..."
    docker network prune -f
    docker network create seo_network
    log_message "Docker Network Reset Complete"
}

# Nginx Network Binding Fix
fix_nginx_network_binding() {
    log_message "Configuring Nginx Network Binding..."
    
    # Create custom nginx.conf with proper binding
    cat > /home/tabs/seo-engineering/nginx/nginx.conf << EOL
user  nginx;
worker_processes  auto;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        listen [::]:80;
        listen 443 ssl;
        listen [::]:443 ssl;
        
        server_name seo.engineering www.seo.engineering;
        
        # SSL Configuration (placeholder)
        ssl_certificate /etc/nginx/ssl/seo.engineering.crt;
        ssl_certificate_key /etc/nginx/ssl/seo.engineering.key;
    }
}
EOL

    docker cp /home/tabs/seo-engineering/nginx/nginx.conf seo-nginx:/etc/nginx/nginx.conf
    docker restart seo-nginx
    
    log_message "Nginx Network Configuration Updated"
}

# Connectivity Test
test_network_connectivity() {
    log_message "Testing Network Connectivity..."
    
    # Test Docker network
    docker network inspect seo_network
    
    # Test Nginx binding
    docker exec seo-nginx nginx -t
    
    # External connectivity test
    curl -v https://seo.engineering || log_message "External Connectivity Issue Detected"
}

# Main Repair Workflow
main() {
    log_message "Starting Network Repair Procedure..."
    
    reset_docker_network
    fix_nginx_network_binding
    test_network_connectivity
    
    log_message "Network Repair Procedure Completed"
}

main
