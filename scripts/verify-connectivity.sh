#!/bin/bash

# Connectivity Verification Script
# SEO.engineering Platform
# Created: April 8, 2025

echo "================================================="
echo "SEO.engineering Connectivity Verification Utility"
echo "================================================="

# Verify local access
echo "Checking local connectivity..."
LOCAL_HEALTH=$(curl -s -k https://localhost/health)
if [[ $LOCAL_HEALTH == *"SEO.engineering Platform - Online"* ]]; then
    echo "✅ Local connectivity: SUCCESS"
    echo "   $LOCAL_HEALTH"
else
    echo "❌ Local connectivity: FAILED"
fi

# Verify external IP access
echo -e "\nChecking external IP connectivity..."
EXTERNAL_IP="104.197.197.191"
EXTERNAL_HEALTH=$(curl -s -k --connect-timeout 10 https://$EXTERNAL_IP/health || echo "Failed to connect")
if [[ $EXTERNAL_HEALTH == *"SEO.engineering Platform - Online"* ]]; then
    echo "✅ External IP connectivity: SUCCESS"
    echo "   $EXTERNAL_HEALTH"
else
    echo "❌ External IP connectivity: FAILED"
    echo "   Response: $EXTERNAL_HEALTH"
    echo "   (If this failed, check Google Cloud firewall rules)"
fi

# Verify domain access
echo -e "\nChecking domain connectivity..."
DOMAIN_HEALTH=$(curl -s -k --connect-timeout 10 https://seo.engineering/health || echo "Failed to connect")
if [[ $DOMAIN_HEALTH == *"SEO.engineering Platform - Online"* ]]; then
    echo "✅ Domain connectivity: SUCCESS"
    echo "   $DOMAIN_HEALTH"
else
    echo "❌ Domain connectivity: FAILED"
    echo "   Response: $DOMAIN_HEALTH"
    echo "   (If external IP works but domain fails, DNS may still be propagating)"
fi

echo -e "\n================================================="
echo "Network Configuration Summary:"
echo "================================================="
echo "VM External IP: $EXTERNAL_IP"
echo "DNS Records: seo.engineering → $EXTERNAL_IP"
echo -e "\nFirewall Status (local):"
sudo ufw status | grep -E '(80|443)'

echo -e "\n================================================="
echo "Next Steps:"
echo "================================================="
echo "1. If external connectivity fails, configure Google Cloud firewall"
echo "2. Once external connectivity works, obtain Let's Encrypt SSL certificates"
echo "3. Configure automatic renewal for SSL certificates"
echo "4. Set up monitoring alerts for certificate expiration"
echo "================================================="
