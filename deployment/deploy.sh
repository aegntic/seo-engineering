#!/bin/bash
# SEO.engineering Deployment Script
# =============================
# This script automates the deployment of the SEO.engineering platform.

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js
    if ! command_exists node; then
        print_warning "Node.js is not installed. It's recommended to have Node.js for local development."
    fi
    
    # Check Git
    if ! command_exists git; then
        print_warning "Git is not installed. It's recommended to have Git for version control."
    fi
    
    print_status "Prerequisites check completed."
}

# Set up environment configuration
setup_environment() {
    print_status "Setting up environment configuration..."
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production not found. Running generate-credentials.sh..."
        ./deployment/generate-credentials.sh
    else
        print_status ".env.production found. Using existing credentials."
    fi
    
    # Copy to .env
    cp .env.production .env
    
    print_status "Environment configuration set up."
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p nginx/conf.d
    mkdir -p nginx/ssl
    mkdir -p nginx/logs
    mkdir -p monitoring/prometheus
    mkdir -p monitoring/grafana/provisioning/datasources
    mkdir -p scripts
    mkdir -p backups
    
    print_status "Directories created."
}

# Configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    # Check if SSL certificates exist
    if [ ! -f "nginx/ssl/seo.engineering.com.crt" ] || [ ! -f "nginx/ssl/seo.engineering.com.key" ]; then
        print_warning "SSL certificates not found in nginx/ssl/"
        print_warning "Please install SSL certificates before proceeding to production."
        
        # Create self-signed certificates for development
        print_status "Creating self-signed certificates for development environment..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/seo.engineering.com.key \
            -out nginx/ssl/seo.engineering.com.crt \
            -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost"
            
        print_status "Self-signed certificates created for development."
    else
        print_status "SSL certificates found."
    fi
    
    # Copy Nginx configuration if it doesn't exist
    if [ ! -f "nginx/conf.d/default.conf" ]; then
        print_status "Creating Nginx configuration..."
        cp deployment/nginx.conf nginx/conf.d/default.conf
        print_status "Nginx configuration created."
    else
        print_status "Using existing Nginx configuration."
    fi
}

# Configure Prometheus
configure_prometheus() {
    print_status "Configuring Prometheus..."
    
    if [ ! -f "monitoring/prometheus/prometheus.yml" ]; then
        print_status "Creating Prometheus configuration..."
        
        cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node_exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'api'
    metrics_path: /metrics
    static_configs:
      - targets: ['api:3001']
EOF
        
        print_status "Prometheus configuration created."
    else
        print_status "Using existing Prometheus configuration."
    fi
}

# Configure Grafana
configure_grafana() {
    print_status "Configuring Grafana..."
    
    if [ ! -f "monitoring/grafana/provisioning/datasources/datasource.yml" ]; then
        print_status "Creating Grafana datasource configuration..."
        
        mkdir -p monitoring/grafana/provisioning/datasources
        
        cat > monitoring/grafana/provisioning/datasources/datasource.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
EOF
        
        print_status "Grafana datasource configuration created."
    else
        print_status "Using existing Grafana configuration."
    fi
}

# Setup backup script
setup_backup() {
    print_status "Setting up backup script..."
    
    if [ ! -f "scripts/backup.sh" ]; then
        print_status "Creating backup script..."
        
        cat > scripts/backup.sh << 'EOF'
#!/bin/bash
# SEO.engineering Backup Script
# =========================
# This script performs automated backups of MongoDB and PostgreSQL databases.
# It should be scheduled via cron to run daily.

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +"%Y-%m-%d-%H%M")
RETENTION_DAYS=7

# MongoDB backup
MONGO_BACKUP_FILE="mongodb-backup-${DATE}.gz"
MONGO_HOST="mongodb"
MONGO_USER=${MONGO_ROOT_USERNAME:-admin}
MONGO_PASS=${MONGO_ROOT_PASSWORD:-password}
MONGO_DB="seo.engineering"

# PostgreSQL backup
PG_BACKUP_FILE="postgres-backup-${DATE}.gz"
PG_HOST="postgres"
PG_USER="n8n"
PG_PASS=${DB_POSTGRESDB_PASSWORD:-n8n_password}
PG_DB="n8n"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# MongoDB backup
log "Starting MongoDB backup..."
mongodump --host=${MONGO_HOST} --username=${MONGO_USER} --password=${MONGO_PASS} --authenticationDatabase=admin --db=${MONGO_DB} --archive | gzip > "${BACKUP_DIR}/${MONGO_BACKUP_FILE}"

if [ $? -eq 0 ]; then
    log "MongoDB backup completed: ${MONGO_BACKUP_FILE}"
else
    log "MongoDB backup failed!"
fi

# PostgreSQL backup
log "Starting PostgreSQL backup..."
pg_dump -h ${PG_HOST} -U ${PG_USER} ${PG_DB} | gzip > "${BACKUP_DIR}/${PG_BACKUP_FILE}"

if [ $? -eq 0 ]; then
    log "PostgreSQL backup completed: ${PG_BACKUP_FILE}"
else
    log "PostgreSQL backup failed!"
fi

# Remove old backups
log "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find ${BACKUP_DIR} -name "mongodb-backup-*.gz" -mtime +${RETENTION_DAYS} -delete
find ${BACKUP_DIR} -name "postgres-backup-*.gz" -mtime +${RETENTION_DAYS} -delete

# Create a backup report
TOTAL_SIZE=$(du -sh ${BACKUP_DIR} | cut -f1)
log "Backup complete. Total backup size: ${TOTAL_SIZE}"
EOF
        
        chmod +x scripts/backup.sh
        print_status "Backup script created."
    else
        print_status "Using existing backup script."
    fi
}

# Create production Dockerfiles
create_dockerfiles() {
    print_status "Creating production Dockerfiles..."
    
    # API Dockerfile
    if [ ! -f "api/Dockerfile.prod" ]; then
        print_status "Creating production API Dockerfile..."
        
        cat > api/Dockerfile.prod << 'EOF'
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Build the application if needed
RUN npm run build

# Production stage
FROM node:18-alpine

# Set environment variables
ENV NODE_ENV production

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy other necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/uploads ./uploads

# Create directory for uploads if it doesn't exist
RUN mkdir -p uploads && chmod 755 uploads

# Add a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose API port
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
EOF
        
        print_status "Production API Dockerfile created."
    else
        print_status "Using existing production API Dockerfile."
    fi
    
    # Website Dockerfile
    if [ ! -f "website/Dockerfile.prod" ]; then
        print_status "Creating production Website Dockerfile..."
        
        cat > website/Dockerfile.prod << 'EOF'
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application for production
RUN npm run build

# Production stage - using nginx to serve static files
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF
        
        print_status "Production Website Dockerfile created."
    else
        print_status "Using existing production Website Dockerfile."
    fi
}

# Create .htpasswd file for protected routes
create_htpasswd() {
    print_status "Creating .htpasswd file for protected routes..."
    
    if command_exists htpasswd; then
        echo -n "Enter username for protected routes (default: admin): "
        read username
        username=${username:-admin}
        
        echo -n "Enter password for $username: "
        read -s password
        echo
        
        if [ -z "$password" ]; then
            print_error "Password cannot be empty."
            exit 1
        fi
        
        htpasswd -bc nginx/.htpasswd "$username" "$password"
        print_status "htpasswd file created successfully."
    else
        print_warning "htpasswd command not found. Using Docker to create htpasswd file..."
        
        echo -n "Enter username for protected routes (default: admin): "
        read username
        username=${username:-admin}
        
        echo -n "Enter password for $username: "
        read -s password
        echo
        
        if [ -z "$password" ]; then
            print_error "Password cannot be empty."
            exit 1
        fi
        
        docker run --rm -it -v $(pwd)/nginx:/etc/nginx alpine sh -c "apk add --no-cache apache2-utils && htpasswd -bc /etc/nginx/.htpasswd $username $password"
        print_status "htpasswd file created using Docker."
    fi
}

# Start the containers
start_containers() {
    print_status "Starting containers..."
    
    if [ "$ENVIRONMENT" == "prod" ]; then
        print_status "Starting production environment..."
        docker-compose -f deployment/docker-compose.prod.yml up -d
    else
        print_status "Starting development environment..."
        docker-compose up -d
    fi
    
    if [ $? -eq 0 ]; then
        print_status "Containers started successfully."
    else
        print_error "Failed to start containers. Check the logs for details."
        exit 1
    fi
}

# Check container status
check_container_status() {
    print_status "Checking container status..."
    
    if [ "$ENVIRONMENT" == "prod" ]; then
        docker-compose -f deployment/docker-compose.prod.yml ps
    else
        docker-compose ps
    fi
}

# Display deployment information
display_info() {
    domain=$(grep "^DOMAIN=" .env | cut -d '=' -f2)
    domain=${domain:-localhost}
    
    echo ""
    echo -e "${GREEN}===================================${NC}"
    echo -e "${GREEN}  SEO.engineering Deployment Complete  ${NC}"
    echo -e "${GREEN}===================================${NC}"
    echo ""
    print_status "Access the following services:"
    echo "- Main Website: https://${domain}"
    echo "- API Endpoint: https://${domain}/api"
    echo "- n8n Automation: https://${domain}/n8n"
    echo "- Monitoring Dashboard: https://${domain}/monitoring"
    echo ""
    print_status "For monitoring and troubleshooting:"
    echo "- Container logs: docker-compose logs [service_name]"
    echo "- Shell access: docker exec -it [container_name] sh"
    echo ""
    print_status "For security reasons, the n8n and monitoring interfaces are password protected."
    echo "Use the credentials you provided during deployment to access them."
    echo ""
}

# Parse command line arguments
ENVIRONMENT="dev"  # Default to development

while [[ $# -gt 0 ]]; do
    case $1 in
        --prod|--production)
            ENVIRONMENT="prod"
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --prod, --production   Deploy in production mode"
            echo "  --help                 Display this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Try '$0 --help' for more information."
            exit 1
            ;;
    esac
done

# Main deployment flow
print_status "Starting SEO.engineering deployment in ${ENVIRONMENT} mode..."
check_prerequisites
create_directories
setup_environment
configure_nginx
configure_prometheus
configure_grafana
setup_backup
create_dockerfiles
create_htpasswd
start_containers
check_container_status
display_info

print_status "Deployment completed successfully. Enjoy using SEO.engineering!"
