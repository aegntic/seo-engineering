#!/bin/bash

# External Connectivity Check Script
# SEO.engineering Platform
# Created: April 8, 2025

echo "================================================================="
echo "SEO.engineering External Connectivity Test"
echo "================================================================="
echo

# Define VM's IP address
VM_IP="104.197.197.191"

# Test external IP connectivity
echo "Testing external IP connectivity (HTTP)..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$VM_IP/health || echo "Failed")
if [ "$HTTP_RESPONSE" == "200" ] || [ "$HTTP_RESPONSE" == "301" ]; then
    echo "✅ HTTP Connectivity: SUCCESS (HTTP $HTTP_RESPONSE)"
else
    echo "❌ HTTP Connectivity: FAILED (HTTP $HTTP_RESPONSE)"
fi

# Test external IP connectivity via HTTPS
echo -e "\nTesting external IP connectivity (HTTPS)..."
HTTPS_RESPONSE=$(curl -s -k -o /dev/null -w "%{http_code}" https://$VM_IP/health || echo "Failed")
if [ "$HTTPS_RESPONSE" == "200" ]; then
    echo "✅ HTTPS Connectivity: SUCCESS (HTTP $HTTPS_RESPONSE)"
else
    echo "❌ HTTPS Connectivity: FAILED (HTTP $HTTPS_RESPONSE)"
fi

# Test domain connectivity
echo -e "\nTesting domain connectivity (HTTPS)..."
DOMAIN_RESPONSE=$(curl -s -k -o /dev/null -w "%{http_code}" https://seo.engineering/health || echo "Failed")
if [ "$DOMAIN_RESPONSE" == "200" ]; then
    echo "✅ Domain Connectivity: SUCCESS (HTTP $DOMAIN_RESPONSE)"
else
    echo "❌ Domain Connectivity: FAILED (HTTP $DOMAIN_RESPONSE)"
fi

echo -e "\n================================================================="
echo "Detailed Connectivity Report"
echo "================================================================="

# Show more detailed information from health endpoint
echo -e "\nExternal IP Health Check Content:"
curl -s -k https://$VM_IP/health || echo "Failed to retrieve content"

echo -e "\nDomain Health Check Content:"
curl -s -k https://seo.engineering/health || echo "Failed to retrieve content"

echo -e "\n================================================================="
echo "System Information"
echo "================================================================="
echo "VM External IP: $VM_IP"
echo "DNS Configuration: seo.engineering → $VM_IP"
echo -e "\nNetwork Information:"
ifconfig | grep -A 1 eth0 || echo "Network interface information not available"

echo -e "\n================================================================="
