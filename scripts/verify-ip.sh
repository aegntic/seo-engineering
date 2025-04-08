#!/bin/bash

# IP Address Verification Script
# Created by JARVIS, April 8, 2025

LOG_FILE="/home/tabs/seo-engineering/logs/ip-verification.log"

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

log_message() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Get the current public IP address
CURRENT_IP=$(curl -s ifconfig.me)

# DNS configured IP address (should be updated if it changes)
EXPECTED_DOMAINS=("seo.engineering" "www.seo.engineering")

log_message "Starting IP verification check"
log_message "Current public IP address: $CURRENT_IP"

for domain in "${EXPECTED_DOMAINS[@]}"; do
  log_message "Checking DNS record for $domain..."
  
  # Get the IP address that the domain resolves to
  RESOLVED_IP=$(host -t A "$domain" | grep "has address" | awk '{print $4}')
  
  if [ -z "$RESOLVED_IP" ]; then
    log_message "WARNING: Could not resolve domain $domain"
  elif [ "$RESOLVED_IP" != "$CURRENT_IP" ]; then
    log_message "CRITICAL: DNS mismatch for $domain"
    log_message "  - Domain resolves to: $RESOLVED_IP"
    log_message "  - Current server IP:  $CURRENT_IP"
    log_message "  - Action required: Update DNS records at Porkbun"
    
    # Send an email alert if mail is configured (uncomment and customize)
    # echo "DNS mismatch detected for $domain. Domain resolves to $RESOLVED_IP but server IP is $CURRENT_IP. Please update DNS records." | \
    # mail -s "CRITICAL: SEO.engineering DNS mismatch" admin@seo.engineering
  else
    log_message "SUCCESS: DNS record for $domain correctly points to $CURRENT_IP"
  fi
done

log_message "IP verification check completed"
log_message "-------------------------------------------"