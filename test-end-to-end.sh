#!/bin/bash

# SEO.engineering End-to-End Deployment Verification Script

set -e

echo "Starting end-to-end deployment verification..."

BASE_URL="${BASE_URL:-https://seo.engineering}"

# Wait for services to be up
echo "Waiting for services to become healthy..."
sleep 20

function check_url {
  URL=$1
  EXPECTED_STATUS=${2:-200}
  echo -n "Checking $URL ... "
  STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" "$URL")
  if [ "$STATUS" == "$EXPECTED_STATUS" ]; then
    echo "OK ($STATUS)"
  else
    echo "FAILED (Status: $STATUS, Expected: $EXPECTED_STATUS)"
    exit 1
  fi
}

# Check Frontend
check_url "$BASE_URL/"

# Check API health endpoint
check_url "$BASE_URL/api/health"

# Check n8n login page
check_url "$BASE_URL/n8n/"

# Check Grafana login page
check_url "$BASE_URL/monitoring/"

echo "Basic service checks passed."

# Optional: API integration test (login)
echo "Performing API login test..."
LOGIN_RESPONSE=$(curl -k -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
  echo "API login successful."
else
  echo "API login failed."
  exit 1
fi

echo "End-to-end deployment verification completed successfully!"