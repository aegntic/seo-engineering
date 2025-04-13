#!/bin/bash

# Adaptive, Self-Healing Deployment Orchestrator for SEO.engineering

set -e

MAX_RETRIES=3
RETRY_DELAY=10
RETRY_COUNT=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

collect_diagnostics() {
  print_status "Collecting diagnostics..."
  mkdir -p diagnostics
  TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
  docker ps -a > diagnostics/containers-$TIMESTAMP.txt || true
  docker-compose logs > diagnostics/compose-logs-$TIMESTAMP.txt || true
  docker stats --no-stream > diagnostics/stats-$TIMESTAMP.txt || true
  print_status "Diagnostics collected at diagnostics/*-$TIMESTAMP.txt"
}

rollback() {
  print_warning "Initiating rollback to previous stable state..."
  docker-compose down || true
  # Optionally, redeploy previous tagged images here
  print_status "Rollback completed."
}

predictive_anomaly_detected() {
  # Placeholder for predictive anomaly detection logic
  # For now, check unhealthy containers or known error patterns
  UNHEALTHY=$(docker ps --filter "health=unhealthy" --format "{{.Names}}")
  if [ -n "$UNHEALTHY" ]; then
    print_warning "Detected unhealthy containers: $UNHEALTHY"
    return 0
  fi

  # Check for crash loops or exited containers
  EXITED=$(docker ps -a --filter "status=exited" --format "{{.Names}}")
  if [ -n "$EXITED" ]; then
    print_warning "Detected exited containers: $EXITED"
    return 0
  fi

  # Check logs for known error patterns
  ERRORS=$(docker-compose logs | grep -Ei "error|fail|exception" || true)
  if [ -n "$ERRORS" ]; then
    print_warning "Detected error patterns in logs."
    return 0
  fi

  return 1
}

adaptive_deploy() {
  while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    print_status "Starting deployment attempt $((RETRY_COUNT+1)) of $MAX_RETRIES..."

    set +e
    bash deployment/deploy.sh --prod
    DEPLOY_EXIT_CODE=$?
    set -e

    if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
      print_status "Deployment script exited successfully."
    else
      print_warning "Deployment script exited with code $DEPLOY_EXIT_CODE."
    fi

    sleep 10  # Allow services to stabilize

    if predictive_anomaly_detected; then
      print_error "Anomalies detected post-deployment."
      collect_diagnostics
      rollback
      RETRY_COUNT=$((RETRY_COUNT+1))
      print_status "Waiting $RETRY_DELAY seconds before retry..."
      sleep $RETRY_DELAY
    else
      print_status "No anomalies detected. Deployment successful."
      return 0
    fi
  done

  print_error "Maximum retries reached. Deployment failed."
  exit 1
}

adaptive_deploy