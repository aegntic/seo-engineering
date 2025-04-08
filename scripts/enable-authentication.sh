#!/bin/bash
# Script to enable authentication for protected areas in SEO.engineering

# Embrace color - the visual language of status and emotion
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}  SEO.engineering Authentication Setup                 ${NC}"
echo -e "${GREEN}  Securing Your Digital Kingdom                       ${NC}"
echo -e "${GREEN}=======================================================${NC}"

# Make sure the .htpasswd file exists
if [ ! -f "/home/tabs/seo-engineering/nginx/.htpasswd" ]; then
    echo -e "${YELLOW}⚠ Authentication file missing. Creating default credentials...${NC}"
    echo 'admin:$apr1$3cYCaLyh$uVis/0Y6iWZ.o289SdCjb/' > /home/tabs/seo-engineering/nginx/.htpasswd
    echo -e "${GREEN}✓ Default credentials created (admin/admin123)${NC}"
else
    echo -e "${BLUE}► Authentication file already exists${NC}"
fi

# Update the Nginx configuration
echo -e "\n${BLUE}► Updating Nginx configuration to enable authentication...${NC}"

# First create a backup of the current config
cp /home/tabs/seo-engineering/nginx/conf.d/default.conf /home/tabs/seo-engineering/nginx/conf.d/default.conf.bak

# Update the configuration
sed -i 's/location \/n8n\/ {/location \/n8n\/ {\n        auth_basic "Restricted Area";\n        auth_basic_user_file \/etc\/nginx\/conf.d\/.htpasswd;/g' /home/tabs/seo-engineering/nginx/conf.d/default.conf
sed -i 's/location \/monitoring\/ {/location \/monitoring\/ {\n        auth_basic "Restricted Area";\n        auth_basic_user_file \/etc\/nginx\/conf.d\/.htpasswd;/g' /home/tabs/seo-engineering/nginx/conf.d/default.conf

echo -e "${GREEN}✓ Nginx configuration updated${NC}"

# Restart the Nginx container
echo -e "\n${BLUE}► Restarting Nginx to apply changes...${NC}"
docker restart seo-nginx

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Authentication enabled successfully!${NC}"
    echo -e "\n${BLUE}► Protected areas now require authentication:${NC}"
    echo -e "  • Workflow Studio: ${GREEN}https://seo.engineering/n8n/${NC}"
    echo -e "  • Observatory: ${GREEN}https://seo.engineering/monitoring/${NC}"
    
    echo -e "\n${BLUE}► Access credentials:${NC}"
    echo -e "  • Username: ${GREEN}admin${NC}"
    echo -e "  • Password: ${GREEN}admin123${NC} (Change this immediately!)"
else
    echo -e "${YELLOW}⚠ Failed to restart Nginx. Please check the logs.${NC}"
    echo -e "  docker logs seo-nginx"
fi

echo -e "\n${BLUE}► To change the default password, use the following command:${NC}"
echo -e "  htpasswd -c /home/tabs/seo-engineering/nginx/.htpasswd admin"
echo -e "  docker restart seo-nginx"

echo -e "\n${GREEN}Your digital realm is now secure.${NC}"