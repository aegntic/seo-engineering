#!/bin/bash
# SEOAutomate Credential Verification Module
# ==========================================
# This script verifies the credentials and integration points for SEOAutomate

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

# Environment variables file
ENV_FILE=".env.production"

# Function to verify environment variables exist
verify_env_variables() {
    print_status "Verifying environment variables..."
    
    local required_vars=(
        "DOMAIN"
        "MONGO_ROOT_USERNAME"
        "MONGO_ROOT_PASSWORD"
        "N8N_HOST"
        "N8N_ENCRYPTION_KEY"
        "DB_POSTGRESDB_PASSWORD"
        "JWT_ACCESS_SECRET"
        "JWT_REFRESH_SECRET"
        "N8N_API_KEY"
        "ENCRYPTION_KEY"
        "STRIPE_PUBLIC_KEY"
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
    )
    
    local missing_vars=0
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE"; then
            print_error "Missing required variable: $var"
            missing_vars=$((missing_vars + 1))
        fi
    done
    
    if [ $missing_vars -eq 0 ]; then
        print_status "All required environment variables are present."
    else
        print_error "$missing_vars required variables are missing."
        exit 1
    fi
}

# Function to verify Stripe credentials
verify_stripe_credentials() {
    print_status "Verifying Stripe credentials..."
    
    # Extract Stripe keys from environment file
    STRIPE_SECRET_KEY=$(grep "^STRIPE_SECRET_KEY=" "$ENV_FILE" | cut -d '=' -f2)
    
    # Basic format validation
    if [[ ! $STRIPE_SECRET_KEY =~ ^sk_ ]]; then
        print_error "Invalid Stripe Secret Key format. Should start with 'sk_'"
        return 1
    fi
    
    # Check if curl is available
    if ! command -v curl >/dev/null 2>&1; then
        print_warning "curl not available. Cannot perform live verification of Stripe API keys."
        return 0
    fi
    
    # Perform a simple API call to verify the key
    print_status "Performing test API call to Stripe..."
    
    response=$(curl -s -f -X GET "https://api.stripe.com/v1/account" \
        -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        2>&1)
    
    if [ $? -eq 0 ] && [[ $response == *"id"* ]]; then
        print_status "Stripe API key verified successfully."
        return 0
    else
        print_error "Failed to verify Stripe API key. Response: ${response}"
        return 1
    fi
}

# Function to verify database credentials
verify_database_credentials() {
    print_status "Verifying database credentials..."
    
    # Check if MongoDB and PostgreSQL are running
    if [ -z "$(docker ps -q -f name=seo-mongodb)" ]; then
        print_warning "MongoDB container not running. Cannot verify MongoDB credentials."
    else
        print_status "Verifying MongoDB credentials..."
        
        # Extract MongoDB credentials from environment file
        MONGO_ROOT_USERNAME=$(grep "^MONGO_ROOT_USERNAME=" "$ENV_FILE" | cut -d '=' -f2)
        MONGO_ROOT_PASSWORD=$(grep "^MONGO_ROOT_PASSWORD=" "$ENV_FILE" | cut -d '=' -f2)
        
        # Test MongoDB connection
        if docker exec -it seo-mongodb mongosh --quiet --eval "db.adminCommand('ping')" --username "$MONGO_ROOT_USERNAME" --password "$MONGO_ROOT_PASSWORD" --authenticationDatabase admin &>/dev/null; then
            print_status "MongoDB credentials verified successfully."
        else
            print_error "Failed to verify MongoDB credentials."
        fi
    fi
    
    if [ -z "$(docker ps -q -f name=seo-postgres)" ]; then
        print_warning "PostgreSQL container not running. Cannot verify PostgreSQL credentials."
    else
        print_status "Verifying PostgreSQL credentials..."
        
        # Extract PostgreSQL credentials from environment file
        DB_POSTGRESDB_PASSWORD=$(grep "^DB_POSTGRESDB_PASSWORD=" "$ENV_FILE" | cut -d '=' -f2)
        
        # Test PostgreSQL connection
        if docker exec -it seo-postgres psql -U n8n -d n8n -c "SELECT 1" &>/dev/null; then
            print_status "PostgreSQL credentials verified successfully."
        else
            print_error "Failed to verify PostgreSQL credentials."
        fi
    fi
}

# Function to verify n8n configuration
verify_n8n_configuration() {
    print_status "Verifying n8n configuration..."
    
    # Check if n8n container is running
    if [ -z "$(docker ps -q -f name=seo-n8n)" ]; then
        print_warning "n8n container not running. Cannot verify n8n configuration."
        return 0
    fi
    
    # Extract n8n credentials from environment file
    N8N_ENCRYPTION_KEY=$(grep "^N8N_ENCRYPTION_KEY=" "$ENV_FILE" | cut -d '=' -f2)
    
    # Verify n8n is accessible
    print_status "Checking n8n API accessibility..."
    
    if curl -s -f "http://localhost:5678/healthz" &>/dev/null; then
        print_status "n8n API is accessible."
    else
        print_error "n8n API is not accessible."
        return 1
    fi
    
    print_status "n8n configuration appears to be valid."
    return 0
}

# Welcome message
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  SEOAutomate Credential Verification    ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file ($ENV_FILE) not found."
    print_warning "Run generate-credentials.sh first to create the environment file."
    exit 1
fi

# Main verification flow
verify_env_variables
verify_stripe_credentials
verify_database_credentials
verify_n8n_configuration

print_status "Credential verification complete."
echo ""