#!/bin/bash

# Firewall Check and Fix Script
# SEO.engineering Platform
# Created: April 8, 2025

# Set sudo password
SUDO_PASS="1123"

echo "================================================="
echo "SEO.engineering Firewall Check & Fix Utility"
echo "================================================="

# Check current UFW status
echo "Current UFW status:"
echo $SUDO_PASS | sudo -S ufw status verbose

# Check if ports 80 and 443 are allowed
HTTP_ALLOWED=$(echo $SUDO_PASS | sudo -S ufw status | grep "80/tcp" | grep "ALLOW" | wc -l)
HTTPS_ALLOWED=$(echo $SUDO_PASS | sudo -S ufw status | grep "443/tcp" | grep "ALLOW" | wc -l)

if [ $HTTP_ALLOWED -eq 0 ] || [ $HTTPS_ALLOWED -eq 0 ]; then
    echo "Missing required firewall rules. Fixing..."
    
    # Ensure UFW is enabled
    echo $SUDO_PASS | sudo -S ufw --force enable
    
    # Allow essential ports
    echo $SUDO_PASS | sudo -S ufw allow ssh
    echo $SUDO_PASS | sudo -S ufw allow http
    echo $SUDO_PASS | sudo -S ufw allow https
    echo $SUDO_PASS | sudo -S ufw allow 5901  # VNC
    
    echo "Firewall rules updated!"
else
    echo "Firewall rules for web traffic look correct."
fi

# Check if the services are actually listening
echo "Checking if services are listening on ports 80 and 443..."
HTTP_LISTENING=$(echo $SUDO_PASS | sudo -S netstat -tulpn | grep ":80 " | wc -l)
HTTPS_LISTENING=$(echo $SUDO_PASS | sudo -S netstat -tulpn | grep ":443 " | wc -l)

if [ $HTTP_LISTENING -eq 0 ] || [ $HTTPS_LISTENING -eq 0 ]; then
    echo "Warning: Services not properly listening on required ports!"
    
    # Restart Nginx
    echo "Restarting Nginx container..."
    cd /home/tabs/seo-engineering
    echo $SUDO_PASS | sudo -S docker-compose restart nginx
else
    echo "Services are properly listening on ports 80 and 443."
fi

# Check if ports are reachable from localhost
echo "Testing local connectivity..."
echo "HTTP response code: $(curl -s -o /dev/null -w "%{http_code}" http://localhost)"
echo "HTTPS response code: $(curl -s -k -o /dev/null -w "%{http_code}" https://localhost)"

# Check public IP
echo "Your VM's public IP address:"
curl -s ifconfig.me
echo ""

echo "================================================="
echo "Connectivity Troubleshooting Tips:"
echo "================================================="
echo "1. Verify Google Cloud Firewall allows traffic to ports 80 and 443"
echo "2. Check that your VM has an external IP address"
echo "3. Ensure DNS records point to the correct IP address"
echo "4. If using domains, check that DNS propagation is complete"
echo "================================================="
