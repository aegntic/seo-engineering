#!/bin/bash
# SEOAutomate Deployment Manager
# ==============================
# Master control script for orchestrating the deployment of SEOAutomate

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo ""
    echo -e "${BLUE}=== $1 ===${NC}"
    echo ""
}

# Make sure all scripts are executable
ensure_executables() {
    print_status "Making deployment scripts executable..."
    chmod +x deployment/*.sh
    chmod +x deploy-manager.sh
}

# Display the menu
show_menu() {
    clear
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  SEOAutomate Deployment Manager v1.0   ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "Please select an operation:"
    echo ""
    echo "  1) Deploy Development Environment"
    echo "  2) Deploy Production Environment"
    echo "  3) Generate Credentials"
    echo "  4) Verify Credentials"
    echo "  5) Create SSL Certificates"
    echo "  6) Stop All Containers"
    echo "  7) View Container Status"
    echo "  8) View Container Logs"
    echo "  9) Perform Backup"
    echo " 10) Restore from Backup"
    echo " 11) Full Cleanup (Remove all containers and volumes)"
    echo ""
    echo "  0) Exit"
    echo ""
    echo -n "Enter your choice [0-11]: "
}

# Deploy development environment
deploy_dev() {
    print_section "Deploying Development Environment"
    ./deployment/deploy.sh
}

# Deploy production environment
deploy_prod() {
    print_section "Deploying Production Environment"
    ./deployment/deploy.sh --prod
}

# Generate credentials
generate_credentials() {
    print_section "Generating Credentials"
    ./deployment/generate-credentials.sh
}

# Verify credentials
verify_credentials() {
    print_section "Verifying Credentials"
    ./deployment/verify-credentials.sh
}

# Create SSL certificates
create_ssl() {
    print_section "Creating SSL Certificates"
    
    mkdir -p nginx/ssl
    
    echo -n "Do you want to create self-signed certificates (for development) or production certificates? [dev/prod]: "
    read cert_type
    
    if [ "$cert_type" == "dev" ]; then
        print_status "Creating self-signed certificates for development..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/seoautomate.com.key \
            -out nginx/ssl/seoautomate.com.crt \
            -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost"
            
        print_status "Self-signed certificates created successfully."
    elif [ "$cert_type" == "prod" ]; then
        print_status "For production certificates, you need a registered domain name."
        echo -n "Enter your domain name (e.g., seoautomate.com): "
        read domain
        
        if [ -z "$domain" ]; then
            print_error "Domain name cannot be empty."
            return 1
        fi
        
        print_status "You can obtain production certificates using Let's Encrypt:"
        print_status "1. Install certbot: sudo apt install certbot"
        print_status "2. Run: sudo certbot certonly --standalone -d $domain -d www.$domain"
        print_status "3. Copy certificates to the nginx/ssl directory:"
        print_status "   sudo cp /etc/letsencrypt/live/$domain/fullchain.pem nginx/ssl/seoautomate.com.crt"
        print_status "   sudo cp /etc/letsencrypt/live/$domain/privkey.pem nginx/ssl/seoautomate.com.key"
        
        echo -n "Do you want to try obtaining certificates now using certbot? [y/n]: "
        read use_certbot
        
        if [ "$use_certbot" == "y" ]; then
            if command -v certbot >/dev/null 2>&1; then
                print_status "Running certbot to obtain certificates..."
                sudo certbot certonly --standalone -d $domain -d www.$domain
                
                if [ $? -eq 0 ]; then
                    print_status "Copying certificates to nginx/ssl directory..."
                    sudo cp /etc/letsencrypt/live/$domain/fullchain.pem nginx/ssl/seoautomate.com.crt
                    sudo cp /etc/letsencrypt/live/$domain/privkey.pem nginx/ssl/seoautomate.com.key
                    
                    print_status "Production certificates installed successfully."
                else
                    print_error "Failed to obtain certificates. Please try manually."
                fi
            else
                print_error "certbot not found. Please install certbot and try again."
            fi
        fi
    else
        print_error "Invalid option. Please enter 'dev' or 'prod'."
        return 1
    fi
}

# Stop all containers
stop_containers() {
    print_section "Stopping All Containers"
    
    if [ -f "deployment/docker-compose.prod.yml" ]; then
        print_status "Stopping production containers..."
        docker-compose -f deployment/docker-compose.prod.yml down
    fi
    
    if [ -f "docker-compose.yml" ]; then
        print_status "Stopping development containers..."
        docker-compose down
    fi
    
    print_status "All containers stopped."
}

# View container status
view_status() {
    print_section "Container Status"
    
    if [ -f "deployment/docker-compose.prod.yml" ]; then
        print_status "Production containers:"
        docker-compose -f deployment/docker-compose.prod.yml ps
        echo ""
    fi
    
    if [ -f "docker-compose.yml" ]; then
        print_status "Development containers:"
        docker-compose ps
    fi
    
    echo ""
    print_status "Press Enter to continue..."
    read
}

# View container logs
view_logs() {
    print_section "Container Logs"
    
    echo "Available containers:"
    echo "1) api"
    echo "2) website"
    echo "3) mongodb"
    echo "4) n8n"
    echo "5) nginx"
    echo "6) postgres"
    echo "7) redis"
    echo "8) prometheus"
    echo "9) grafana"
    echo ""
    echo -n "Select a container to view logs [1-9]: "
    read container_choice
    
    case $container_choice in
        1) container="api" ;;
        2) container="website" ;;
        3) container="mongodb" ;;
        4) container="n8n" ;;
        5) container="nginx" ;;
        6) container="postgres" ;;
        7) container="redis" ;;
        8) container="prometheus" ;;
        9) container="grafana" ;;
        *) print_error "Invalid choice"; return 1 ;;
    esac
    
    echo -n "Use production deployment? [y/n]: "
    read use_prod
    
    if [ "$use_prod" == "y" ]; then
        docker-compose -f deployment/docker-compose.prod.yml logs --tail=100 -f seo-$container
    else
        docker-compose logs --tail=100 -f seo-$container
    fi
}

# Perform backup
perform_backup() {
    print_section "Performing Backup"
    
    if [ -z "$(docker ps -q -f name=seo-backup)" ]; then
        print_error "Backup container not running. Start deployment first."
        return 1
    fi
    
    print_status "Running backup script..."
    docker exec -it seo-backup /backup.sh
    
    print_status "Backup completed. Backup files are stored in the 'backups' directory."
    print_status "Press Enter to continue..."
    read
}

# Restore from backup
restore_backup() {
    print_section "Restore from Backup"
    
    if [ ! -d "backups" ]; then
        print_error "Backup directory not found."
        return 1
    fi
    
    # List available MongoDB backups
    print_status "Available MongoDB backups:"
    ls -la backups/mongodb-backup-*.gz 2>/dev/null
    
    echo ""
    echo -n "Enter MongoDB backup filename to restore (or press Enter to skip): "
    read mongo_backup
    
    if [ ! -z "$mongo_backup" ]; then
        if [ ! -f "backups/$mongo_backup" ]; then
            print_error "MongoDB backup file not found."
        else
            print_status "Restoring MongoDB from backup..."
            docker exec -i seo-mongodb mongorestore --gzip --archive=/backups/$mongo_backup --drop
            
            if [ $? -eq 0 ]; then
                print_status "MongoDB restored successfully."
            else
                print_error "Failed to restore MongoDB."
            fi
        fi
    fi
    
    # List available PostgreSQL backups
    print_status "Available PostgreSQL backups:"
    ls -la backups/postgres-backup-*.gz 2>/dev/null
    
    echo ""
    echo -n "Enter PostgreSQL backup filename to restore (or press Enter to skip): "
    read pg_backup
    
    if [ ! -z "$pg_backup" ]; then
        if [ ! -f "backups/$pg_backup" ]; then
            print_error "PostgreSQL backup file not found."
        else
            print_status "Restoring PostgreSQL from backup..."
            gunzip -c backups/$pg_backup | docker exec -i seo-postgres psql -U n8n -d n8n
            
            if [ $? -eq 0 ]; then
                print_status "PostgreSQL restored successfully."
            else
                print_error "Failed to restore PostgreSQL."
            fi
        fi
    fi
    
    print_status "Restore operation completed."
    print_status "Press Enter to continue..."
    read
}

# Full cleanup
full_cleanup() {
    print_section "Full Cleanup"
    
    echo -n "WARNING: This will remove all containers, volumes, and data. Are you sure? [y/N]: "
    read confirm
    
    if [ "$confirm" != "y" ]; then
        print_status "Cleanup cancelled."
        return 0
    fi
    
    print_status "Stopping and removing all containers..."
    
    if [ -f "deployment/docker-compose.prod.yml" ]; then
        docker-compose -f deployment/docker-compose.prod.yml down -v
    fi
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose down -v
    fi
    
    print_status "Removing data directories..."
    rm -rf mongodb_data postgres_data redis_data n8n_data grafana_data prometheus_data
    
    print_status "Removing SSL certificates..."
    rm -rf nginx/ssl
    
    print_status "Cleanup completed."
    print_status "Press Enter to continue..."
    read
}

# Main function
main() {
    ensure_executables
    
    while true; do
        show_menu
        read choice
        
        case $choice in
            1) deploy_dev ;;
            2) deploy_prod ;;
            3) generate_credentials ;;
            4) verify_credentials ;;
            5) create_ssl ;;
            6) stop_containers ;;
            7) view_status ;;
            8) view_logs ;;
            9) perform_backup ;;
            10) restore_backup ;;
            11) full_cleanup ;;
            0) echo "Exiting..."; exit 0 ;;
            *) print_error "Invalid option. Please try again." ;;
        esac
    done
}

# Run the main function
main
