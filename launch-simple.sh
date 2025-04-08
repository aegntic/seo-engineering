#!/bin/bash
# Simplified Launch Script for seo.engineering

# Colorful output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}  SEO.engineering Deployment for seo.engineering          ${NC}"
echo -e "${GREEN}  The Fusion of SEO Science and Engineering Artistry  ${NC}"
echo -e "${GREEN}=======================================================${NC}"

export DOCKER_HOST=unix:///var/run/docker.sock
echo -e "\n${BLUE}► Setting Docker permissions...${NC}"
echo "1123" | sudo -S chmod 666 /var/run/docker.sock

echo -e "\n${BLUE}► Creating placeholder website...${NC}"
mkdir -p /home/tabs/seo-engineering/nginx/html
cat > /home/tabs/seo-engineering/nginx/html/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO.engineering - Coming Soon</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
            color: #ffffff;
        }
        .container {
            text-align: center;
            padding: 2rem;
            max-width: 800px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(90deg, #3182ce, #63b3ed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p {
            font-size: 1.25rem;
            line-height: 1.7;
            margin-bottom: 2rem;
            color: #e2e8f0;
        }
        .tagline {
            font-style: italic;
            color: #a0aec0;
        }
        .countdown {
            font-size: 2rem;
            margin: 2rem 0;
            color: #81e6d9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>SEO.engineering</h1>
        <p class="tagline">Where the science of search meets the artistry of engineering</p>
        <div class="countdown">Launch Imminent</div>
        <p>Our digital realm is being crafted with both form and function in mind. Soon you'll experience a new paradigm in technical SEO automation.</p>
        <p>This temporary page confirms our server configuration is operational. The full site deployment is in progress.</p>
    </div>
</body>
</html>
EOF

# Create static docker-compose file to just run nginx
cat > /home/tabs/seo-engineering/deployment/docker-compose.static.yml << 'EOF'
services:
  nginx:
    image: nginx:alpine
    container_name: seo-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
      - ./nginx/html:/usr/share/nginx/html
    networks:
      - seo_network
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  seo_network:
    driver: bridge
EOF

# Create Nginx config if needed
if [ ! -f "/home/tabs/seo-engineering/nginx/conf.d/default.conf" ]; then
    mkdir -p /home/tabs/seo-engineering/nginx/conf.d
    cat > /home/tabs/seo-engineering/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name seo.engineering www.seo.engineering;
    
    # Root path serves the placeholder
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
    
    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}
EOF
fi

# Ensure SSL directory exists
mkdir -p /home/tabs/seo-engineering/nginx/ssl
mkdir -p /home/tabs/seo-engineering/nginx/logs

# Launch nginx with the static placeholder
echo -e "\n${BLUE}► Launching placeholder website...${NC}"
docker-compose -f /home/tabs/seo-engineering/deployment/docker-compose.static.yml up -d

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ The placeholder website has been successfully deployed!${NC}"
    echo -e "\n${BLUE}► Your website is accessible at:${NC}"
    echo -e "  • http://localhost"
    echo -e "  • http://$(hostname -I | awk '{print $1}')"
    
    echo -e "\n${YELLOW}► Note: This is a temporary placeholder. The full deployment will be completed soon.${NC}"
else
    echo -e "\n${RED}⚠ The deployment was interrupted. Check Docker logs for more information.${NC}"
fi
