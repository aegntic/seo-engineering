#!/bin/bash
# SEOAutomate Launch Script for seo.engineering
# A ceremonial incantation to awaken your digital realm

# Embrace color - the visual language of status and emotion
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}  SEOAutomate Deployment for seo.engineering          ${NC}"
echo -e "${GREEN}  The Fusion of SEO Science and Engineering Artistry  ${NC}"
echo -e "${GREEN}=======================================================${NC}"

# Verify that our digital blueprint is ready
echo -e "\n${BLUE}► Verifying deployment components...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠ .env.production not found. The soul of your configuration is missing.${NC}"
    exit 1
fi

if [ ! -f "nginx/ssl/seo.engineering.crt" ]; then
    echo -e "${YELLOW}⚠ SSL certificate not found. Your digital identity lacks its secure sigil.${NC}"
    exit 1
fi

# Create a pre-launch backup - preserving your digital blueprint
echo -e "\n${BLUE}► Creating pre-launch backup of configuration...${NC}"
mkdir -p ./backups/pre-launch
cp .env.production ./backups/pre-launch/
cp -r nginx/conf.d ./backups/pre-launch/
cp -r nginx/ssl ./backups/pre-launch/

# Bring forth your digital realm through the power of containerization
echo -e "\n${BLUE}► Awakening your digital ecosystem...${NC}"
echo -e "  This orchestration may take several minutes as each component materializes."

# Launch with Docker Compose - the alchemical process that transmutes code into service
docker-compose -f deployment/docker-compose.prod.yml up -d

if [ $? -eq 0 ]; then
    # The digital birth was successful - your realm now exists
    echo -e "\n${GREEN}✓ SEOAutomate has been successfully deployed!${NC}"
    
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
    echo -e "  docker-compose -f deployment/docker-compose.prod.yml logs -f"
    
    echo -e "\n${GREEN}Your digital realm awaits your command.${NC}"
else
    # The digital birth encountered complications
    echo -e "\n${YELLOW}⚠ The awakening was interrupted. Consulting the logs may reveal why.${NC}"
    echo -e "  docker-compose -f deployment/docker-compose.prod.yml logs"
fi