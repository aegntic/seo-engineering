# SEO.engineering Developer Quickstart Guide

This guide will help you get up and running with the SEO.engineering platform for development purposes.

## System Requirements

- Docker and Docker Compose
- Node.js 18+
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aegntic/seo-engineering.git
cd seo-engineering
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp deployment/.env.example .env.production
```

Open `.env.production` and update the required values:

```
DOMAIN=localhost
CANONICAL_URL=http://localhost
```

### 3. Local Development

#### Frontend Development

```bash
# Navigate to the website directory
cd website

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:3000

#### Backend Development

```bash
# Navigate to the API directory
cd api

# Install dependencies
npm install

# Start development server
npm run dev
```

The API will be available at http://localhost:3001

### 4. Running the Full Stack

To run the entire stack with Docker Compose:

```bash
# From the project root
./launch-seo-engineering.sh
```

### 5. Important Directories

- `/website` - Frontend React application
- `/api` - Backend Node.js API
- `/nginx` - Nginx configuration
- `/deployment` - Deployment configuration
- `/docs` - Documentation
- `/scripts` - Utility scripts

## Development Workflow

### Git Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. Push your changes:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request from your branch to main

### Docker Development

For Docker-based development:

```bash
# Build and start the containers
docker compose -f deployment/docker-compose.prod.yml up -d

# View logs
docker compose -f deployment/docker-compose.prod.yml logs -f

# Rebuild a specific service
docker compose -f deployment/docker-compose.prod.yml up -d --build website
```

## Testing

### Frontend Tests

```bash
cd website
npm test
```

### Backend Tests

```bash
cd api
npm test
```

## Deployment

The platform is deployed using the `launch-seo-engineering.sh` script:

```bash
./launch-seo-engineering.sh
```

This script:
1. Verifies the environment
2. Creates necessary directories
3. Configures Nginx
4. Launches all services with Docker Compose

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 80 and 443 are not in use by other services
2. **Environment variables**: Check that all required environment variables are set
3. **Docker issues**: Ensure Docker is running and you have the necessary permissions

### Debugging

For backend debugging:
```bash
docker logs seo-api
```

For frontend debugging:
```bash
docker logs seo-website
```

For database issues:
```bash
docker logs seo-mongodb
```

## Additional Resources

- [System Documentation](../SYSTEM_DOCUMENTATION.md)
- [Logo Integration Guide](./Logo_Integration_Guide.md)
- [API Documentation](./API_Documentation.md)

## Golden Rules

1. All files must be under 500 lines - Maintain modularity for easier maintenance
2. Use markdown for project management - Keep planning and tasks in version-controlled markdown
3. Focus on one task per message - Ensure clarity in communication and development
4. Start fresh conversations frequently - Prevents context overload
5. Be specific in requests - Reduces ambiguity and implementation errors
6. Test all code - Ensure reliability through automated testing
7. Write clear documentation and comments - Maintain knowledge transfer
8. Implement environment variables securely - Protect sensitive configuration