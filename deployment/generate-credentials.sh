#!/bin/bash
# SEOAutomate Secure Credential Generator
# =======================================
# This script generates secure credentials for SEOAutomate deployment
# and facilitates integration with external services like Stripe and n8n.

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

print_input() {
    echo -e "${BLUE}[INPUT]${NC} $1"
}

# Generate secure random strings for secrets
generate_secret() {
    local LENGTH=${1:-32}
    openssl rand -base64 $LENGTH | tr -d '\n' | tr '+/' '-_'
}

# Generate a secure password
generate_password() {
    local LENGTH=${1:-16}
    </dev/urandom tr -dc 'A-Za-z0-9!@#$%^&*()_+?><~' | head -c $LENGTH
}

# Create .env file with generated credentials
create_env_file() {
    print_status "Generating secure credentials..."
    
    # Generate secrets
    JWT_ACCESS_SECRET=$(generate_secret)
    JWT_REFRESH_SECRET=$(generate_secret)
    N8N_ENCRYPTION_KEY=$(generate_secret)
    DB_POSTGRESDB_PASSWORD=$(generate_password)
    MONGO_ROOT_PASSWORD=$(generate_password)
    ENCRYPTION_KEY=$(generate_secret)
    GRAFANA_ADMIN_PASSWORD=$(generate_password)
    
    print_status "Creating production .env file..."
    
    cat > .env.production << EOF
# Domain Configuration
DOMAIN=${DOMAIN}

# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}

# n8n Configuration
N8N_HOST=${DOMAIN}
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
DB_POSTGRESDB_PASSWORD=${DB_POSTGRESDB_PASSWORD}

# JWT Secrets
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}

# API Keys and Secrets
N8N_API_KEY=$(generate_secret 24)
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# Stripe Configuration
STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}

# Email Configuration
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_SENDER=${SMTP_SENDER}

# Monitoring
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
EOF
    
    print_status "Production .env file created successfully."
    print_status "Secure credential summary (partial keys shown for security):"
    echo "JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET:0:5}...${JWT_ACCESS_SECRET: -5}"
    echo "N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY:0:5}...${N8N_ENCRYPTION_KEY: -5}"
    echo "DB_POSTGRESDB_PASSWORD: ${DB_POSTGRESDB_PASSWORD:0:2}...${DB_POSTGRESDB_PASSWORD: -2}"
    echo "MONGO_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:0:2}...${MONGO_ROOT_PASSWORD: -2}"
}

# Interactive credential collection
collect_credentials() {
    print_status "Starting credential collection..."
    
    # Domain information
    print_input "Enter your domain name (e.g., seoautomate.com):"
    read DOMAIN
    
    # Stripe credentials
    print_input "Enter Stripe Public Key (starts with pk_):"
    read STRIPE_PUBLIC_KEY
    
    print_input "Enter Stripe Secret Key (starts with sk_):"
    read STRIPE_SECRET_KEY
    
    print_input "Enter Stripe Webhook Secret (starts with whsec_):"
    read STRIPE_WEBHOOK_SECRET
    
    # SMTP Configuration
    print_input "Enter SMTP Host (e.g., smtp.gmail.com):"
    read SMTP_HOST
    
    print_input "Enter SMTP Port (e.g., 587):"
    read SMTP_PORT
    
    print_input "Enter SMTP Username:"
    read SMTP_USER
    
    print_input "Enter SMTP Password:"
    read SMTP_PASS
    
    print_input "Enter SMTP Sender Email (e.g., noreply@seoautomate.com):"
    read SMTP_SENDER
    
    print_status "All required credentials collected."
}

# Validate credential format
validate_credentials() {
    local valid=true
    
    # Validate Stripe keys
    if [[ ! $STRIPE_PUBLIC_KEY =~ ^pk_ ]]; then
        print_error "Invalid Stripe Public Key format. Should start with 'pk_'"
        valid=false
    fi
    
    if [[ ! $STRIPE_SECRET_KEY =~ ^sk_ ]]; then
        print_error "Invalid Stripe Secret Key format. Should start with 'sk_'"
        valid=false
    fi
    
    if [[ ! $STRIPE_WEBHOOK_SECRET =~ ^whsec_ ]]; then
        print_error "Invalid Stripe Webhook Secret format. Should start with 'whsec_'"
        valid=false
    fi
    
    # Validate domain
    if [[ ! $DOMAIN =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
        print_error "Invalid domain format."
        valid=false
    fi
    
    # Validate SMTP settings
    if [[ -z $SMTP_HOST || -z $SMTP_PORT || -z $SMTP_USER || -z $SMTP_PASS ]]; then
        print_warning "SMTP configuration incomplete."
    fi
    
    if [[ ! $SMTP_PORT =~ ^[0-9]+$ ]]; then
        print_error "SMTP port must be a number."
        valid=false
    fi
    
    if [[ ! $SMTP_SENDER =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$ ]]; then
        print_error "Invalid sender email format."
        valid=false
    fi
    
    if [ "$valid" = false ]; then
        print_error "Credential validation failed. Please correct the errors and try again."
        exit 1
    else
        print_status "All credentials validated successfully."
    fi
}

# Encrypt the credentials file
encrypt_credentials() {
    if command -v gpg >/dev/null 2>&1; then
        print_status "Encrypting credentials file..."
        
        gpg --symmetric --cipher-algo AES256 .env.production
        if [ $? -eq 0 ]; then
            print_status "Credentials encrypted. Original file remains as .env.production"
            print_status "Encrypted file available as .env.production.gpg"
        else
            print_error "Encryption failed."
        fi
    else
        print_warning "GPG not available. Skipping encryption."
    fi
}

# Welcome message
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  SEOAutomate Secure Credential Generator${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
print_status "This utility will generate and collect secure credentials for your SEOAutomate deployment."
echo ""

# Main execution flow
collect_credentials
validate_credentials
create_env_file
encrypt_credentials

print_status "Credential generation complete."
echo ""
print_status "Next steps:"
echo "1. Use the generated .env.production file in your deployment"
echo "2. Store a backup of the credentials securely"
echo "3. Consider using a secrets manager for production"
echo ""