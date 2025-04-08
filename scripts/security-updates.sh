#!/bin/bash

# Security Updates Automation Script
# SEO.engineering Platform
# Created: April 8, 2025

echo "Starting security updates at $(date)"
echo "1123" | sudo -S apt update
echo "1123" | sudo -S apt upgrade -y
echo "1123" | sudo -S apt autoremove -y

# Docker images update
echo "Updating Docker containers..."
echo "1123" | sudo -S docker pull nginx:alpine
echo "1123" | sudo -S docker pull node:18-alpine
echo "1123" | sudo -S docker pull mongo:latest
echo "1123" | sudo -S docker pull redis:alpine
echo "1123" | sudo -S docker pull grafana/grafana:latest
echo "1123" | sudo -S docker pull prom/prometheus:latest
echo "1123" | sudo -S docker pull n8nio/n8n:latest

echo "Security updates completed at $(date)"
