#!/bin/bash
# SSL Certificate Expiry Checker
# For SEO.engineering domain
# Created: April 8, 2025

# Configuration
DOMAIN="seo.engineering"
CERT_FILE="/home/tabs/seo-engineering/nginx/ssl/seo.engineering.crt"
WARNING_DAYS=21  # Alert when less than this many days remain
EMAIL="admin@seo.engineering"  # Where to send alerts
LOG_FILE="/home/tabs/seo-engineering/logs/ssl-check.log"

# Make sure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Get current date in seconds since epoch
CURRENT_DATE=$(date +%s)

# Check if certificate file exists
if [ ! -f "$CERT_FILE" ]; then
  echo "Error: Certificate file not found at $CERT_FILE" | tee -a "$LOG_FILE"
  exit 1
fi

# Get certificate expiration date
echo "Checking SSL certificate for $DOMAIN..."
EXPIRY_DATE=$(openssl x509 -in "$CERT_FILE" -noout -enddate | cut -d= -f2)

if [ -z "$EXPIRY_DATE" ]; then
  echo "Error: Couldn't retrieve certificate information" | tee -a "$LOG_FILE"
  exit 1
fi

# Convert expiry date to seconds since epoch
EXPIRY_SECONDS=$(date -d "$EXPIRY_DATE" +%s)

# Calculate days remaining
DAYS_REMAINING=$(( ($EXPIRY_SECONDS - $CURRENT_DATE) / 86400 ))

# Log the result
echo "Certificate check: $(date)" >> "$LOG_FILE"
echo "Domain: $DOMAIN" >> "$LOG_FILE"
echo "Expiry date: $EXPIRY_DATE" >> "$LOG_FILE"
echo "Days remaining: $DAYS_REMAINING" >> "$LOG_FILE"

# Display status message
echo "Certificate check completed:"
echo "Domain: $DOMAIN"
echo "Expiry date: $EXPIRY_DATE"
echo "Days remaining: $DAYS_REMAINING"

# Check if we need to send an alert
if [ $DAYS_REMAINING -lt $WARNING_DAYS ]; then
  echo "WARNING: Certificate will expire in $DAYS_REMAINING days!" | tee -a "$LOG_FILE"
  
  # Send email alert
  SUBJECT="⚠️ SSL Certificate Expiring Soon: $DOMAIN"
  BODY="Your SSL certificate for $DOMAIN will expire in $DAYS_REMAINING days (on $EXPIRY_DATE).\n\nPlease renew your certificate to avoid security warnings for your users.\n\nThis is an automated message from your SSL monitoring system."
  
  echo -e "$BODY" | mail -s "$SUBJECT" "$EMAIL"
  
  echo "Alert email sent to $EMAIL" >> "$LOG_FILE"
else
  echo "Certificate is still valid for $DAYS_REMAINING days. No action needed." | tee -a "$LOG_FILE"
fi

echo "-------------------------------------------" >> "$LOG_FILE"
