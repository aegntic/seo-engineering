#!/bin/bash
# SEOAutomate Launch Script for seo.engineering (Enhanced Edition)
# A ceremonial incantation to awaken your digital realm

# Embrace color - the visual language of status and emotion
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}  SEOAutomate Deployment for seo.engineering          ${NC}"
echo -e "${GREEN}  The Fusion of SEO Science and Engineering Artistry  ${NC}"
echo -e "${GREEN}=======================================================${NC}"

# Verify that our digital blueprint is ready
echo -e "\n${BLUE}► Verifying deployment components...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}⚠ .env.production not found. The soul of your configuration is missing.${NC}"
    exit 1
fi

if [ ! -d "nginx/ssl" ]; then
    echo -e "${YELLOW}⚠ SSL directory not found. Creating it now...${NC}"
    mkdir -p nginx/ssl
fi

if [ ! -f "nginx/ssl/seo.engineering.crt" ]; then
    echo -e "${YELLOW}⚠ SSL certificate not found. Your digital identity lacks its secure sigil.${NC}"
    
    # Check if we can copy from SEOAutomate
    if [ -f "/home/tabs/SEOAutomate/deployment/nginx/ssl/seo.engineering.crt" ]; then
        echo -e "${BLUE}► Found SSL certificates in SEOAutomate directory. Copying them...${NC}"
        cp /home/tabs/SEOAutomate/deployment/nginx/ssl/seo.engineering.* nginx/ssl/
    else
        exit 1
    fi
fi

# Create required directories
echo -e "\n${BLUE}► Ensuring all required directories exist...${NC}"
mkdir -p nginx/conf.d
mkdir -p nginx/logs
mkdir -p backups/pre-launch
mkdir -p scripts
mkdir -p monitoring/prometheus
mkdir -p monitoring/grafana/provisioning
mkdir -p api/uploads

# Create a pre-launch backup - preserving your digital blueprint
echo -e "\n${BLUE}► Creating pre-launch backup of configuration...${NC}"
cp .env.production ./backups/pre-launch/
if [ -d "nginx/conf.d" ] && [ "$(ls -A nginx/conf.d)" ]; then
    cp -r nginx/conf.d/* ./backups/pre-launch/
fi
if [ -d "nginx/ssl" ] && [ "$(ls -A nginx/ssl)" ]; then
    cp -r nginx/ssl/* ./backups/pre-launch/
fi

# Create basic Nginx configuration if not exists
if [ ! -f "nginx/conf.d/default.conf" ]; then
    echo -e "\n${BLUE}► Creating basic Nginx configuration...${NC}"
    cat > nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name seo.engineering www.seo.engineering;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name seo.engineering www.seo.engineering;

    ssl_certificate /etc/nginx/ssl/seo.engineering.crt;
    ssl_certificate_key /etc/nginx/ssl/seo.engineering.key;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 10m;
    ssl_session_cache shared:SSL:10m;
    
    # Root path serves the React frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        
        # Cache control for static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 30d;
            add_header Cache-Control "public, no-transform";
        }
    }
    
    # API Endpoint
    location /api {
        proxy_pass http://api:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # n8n Workflow Automation
    location /n8n {
        auth_basic "Restricted Area";
        auth_basic_user_file /etc/nginx/conf.d/.htpasswd;
        
        proxy_pass http://n8n:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Monitoring dashboards
    location /monitoring {
        auth_basic "Restricted Area";
        auth_basic_user_file /etc/nginx/conf.d/.htpasswd;
        
        proxy_pass http://grafana:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
EOF
fi

# Create .htpasswd file if not exists
if [ ! -f "nginx/.htpasswd" ]; then
    echo -e "\n${BLUE}► Creating authentication file...${NC}"
    
    # Check if we can copy from SEOAutomate
    if [ -f "/home/tabs/SEOAutomate/deployment/nginx/.htpasswd" ]; then
        mkdir -p nginx
        cp /home/tabs/SEOAutomate/deployment/nginx/.htpasswd nginx/
    else
        mkdir -p nginx
        echo 'admin:$apr1$3cYCaLyh$uVis/0Y6iWZ.o289SdCjb/' > nginx/.htpasswd
    fi
fi

# Create a basic backup script if it doesn't exist
if [ ! -f "scripts/backup.sh" ]; then
    echo -e "\n${BLUE}► Creating backup script...${NC}"
    cat > scripts/backup.sh << 'EOF'
#!/bin/sh
# Daily backup script for SEOAutomate

# Set variables
TIMESTAMP=$(date +%Y-%m-%d-%H%M)
BACKUP_DIR="/backups"
MONGODB_BACKUP="${BACKUP_DIR}/mongodb-${TIMESTAMP}"
POSTGRES_BACKUP="${BACKUP_DIR}/postgres-${TIMESTAMP}"

# Create backup directories
mkdir -p "${MONGODB_BACKUP}"
mkdir -p "${POSTGRES_BACKUP}"

# Backup MongoDB data
echo "Backing up MongoDB data..."
cp -r /data/db/* "${MONGODB_BACKUP}/"

# Backup PostgreSQL data
echo "Backing up PostgreSQL data..."
cp -r /var/lib/postgresql/data/* "${POSTGRES_BACKUP}/"

# Compress the backups
echo "Compressing backups..."
cd "${BACKUP_DIR}" || exit
tar -czf "mongodb-${TIMESTAMP}.tar.gz" "mongodb-${TIMESTAMP}"
tar -czf "postgres-${TIMESTAMP}.tar.gz" "postgres-${TIMESTAMP}"

# Remove uncompressed directories
rm -rf "mongodb-${TIMESTAMP}"
rm -rf "postgres-${TIMESTAMP}"

# Keep only the last 7 days of backups
echo "Cleaning up old backups..."
find "${BACKUP_DIR}" -name "mongodb-*.tar.gz" -type f -mtime +7 -delete
find "${BACKUP_DIR}" -name "postgres-*.tar.gz" -type f -mtime +7 -delete

echo "Backup completed: $(date)"
EOF
    chmod +x scripts/backup.sh
fi

# Create a basic prometheus config if it doesn't exist
if [ ! -f "monitoring/prometheus/prometheus.yml" ]; then
    echo -e "\n${BLUE}► Creating Prometheus configuration...${NC}"
    mkdir -p monitoring/prometheus
    cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
EOF
fi

# Export environment variables needed for docker-compose
export COMPOSE_HTTP_TIMEOUT=300
export DOCKER_CLIENT_TIMEOUT=300

# Ensure we're using the system Docker socket
export DOCKER_HOST=unix:///var/run/docker.sock

# Load environment variables from .env.production
export $(grep -v '^#' .env.production | xargs)

# Bring forth your digital realm through the power of containerization
echo -e "\n${BLUE}► Awakening your digital ecosystem...${NC}"
echo -e "  This orchestration may take several minutes as each component materializes."

# First, ensure proper permissions for Docker socket
echo -e "\n${BLUE}► Ensuring proper Docker permissions...${NC}"
sudo chmod 666 /var/run/docker.sock

# Launch with Docker Compose - the alchemical process that transmutes code into service
echo -e "\n${BLUE}► Deploying API and Website containers...${NC}"
docker-compose -f deployment/docker-compose.fixed.yml up -d api website

if [ $? -eq 0 ]; then
    # The digital birth was successful - your realm now exists
    echo -e "\n${GREEN}✓ The API and Website containers have been successfully deployed!${NC}"
    
    # Revealing the map to your digital domains
    echo -e "\n${BLUE}► Your digital gateways:${NC}"
    echo -e "  • Main Website: ${GREEN}https://seo.engineering${NC}"
    echo -e "  • API Access: ${GREEN}https://seo.engineering/api${NC}"
    echo -e "  • Workflow Studio: ${GREEN}https://seo.engineering/n8n${NC}"
    echo -e "  • Observatory: ${GREEN}https://seo.engineering/monitoring${NC}"
    
    echo -e "\n${BLUE}► Access credentials for protected realms:${NC}"
    echo -e "  • Username: ${GREEN}admin${NC}"
    echo -e "  • Password: ${GREEN}admin123${NC} (Change this immediately after first login)"
    
    echo -e "\n${BLUE}► To observe the vital signs of your digital ecosystem:${NC}"
    echo -e "  docker-compose -f deployment/docker-compose.fixed.yml logs -f"
    
    echo -e "\n${GREEN}Your digital realm awaits your command.${NC}"
else
    # The digital birth encountered complications
    echo -e "\n${RED}⚠ The awakening was interrupted. Consulting the logs may reveal why.${NC}"
    echo -e "  docker-compose -f deployment/docker-compose.fixed.yml logs"
fi
