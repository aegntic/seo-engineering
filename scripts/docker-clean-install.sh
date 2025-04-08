#!/bin/bash

# Docker Ecosystem Restoration Script
# Version 1.0.0 - April 8, 2025

LOG_FILE="/home/tabs/seo-engineering/logs/docker-restoration.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Removal Phase
remove_docker_desktop() {
    log_message "🗑️ Removing Docker Desktop Remnants"
    sudo apt-get purge -y docker-desktop
    rm -rf $HOME/.docker/desktop
    sudo rm -f /usr/local/bin/com.docker.cli
    sudo apt-get remove -y docker-desktop
}

# Installation Phase
install_system_docker() {
    log_message "🔧 Installing Clean System Docker"
    
    # Update package index
    sudo apt-get update

    # Install dependencies
    sudo apt-get install -y ca-certificates curl

    # Create keyrings directory
    sudo install -m 0755 -d /etc/apt/keyrings

    # Import Docker's GPG key
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker components
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

# Permissions Configuration
configure_docker_permissions() {
    log_message "🔐 Configuring Docker User Permissions"
    sudo usermod -aG docker $USER
    newgrp docker
}

# Docker Network Setup
setup_docker_network() {
    log_message "🌐 Creating SEO Engineering Network"
    docker network create seo_network || log_message "Network creation might have failed (possibly already exists)"
}

# Verification Phase
verify_docker_installation() {
    log_message "✅ Verifying Docker Installation"
    docker version
    docker info
    docker network ls
}

# Main Execution Flow
main() {
    log_message "🚀 Starting Docker Ecosystem Restoration"
    
    remove_docker_desktop
    install_system_docker
    configure_docker_permissions
    
    # Restart Docker service
    sudo systemctl restart docker
    sudo systemctl enable docker
    
    setup_docker_network
    verify_docker_installation
    
    log_message "🎉 Docker Ecosystem Restoration Complete!"
}

main
