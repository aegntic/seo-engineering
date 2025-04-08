# SEO.engineering System Documentation

## System Overview

SEO.engineering is a comprehensive technical SEO automation platform that transforms technical SEO from a labor-intensive consulting service into a scalable product offering through end-to-end automation.

The platform consists of several interconnected components, each responsible for a specific aspect of the SEO automation process:

1. **Frontend Website**: React-based user interface for client interaction
2. **API Server**: Node.js backend handling all business logic and data processing
3. **MongoDB**: Primary database for storing SEO metrics, user data, and application state
4. **Redis**: In-memory cache for performance optimization and rate limiting
5. **n8n**: Workflow automation tool for SEO processes
6. **Nginx**: Reverse proxy handling SSL termination, routing, and security
7. **Monitoring**: Prometheus and Grafana for system monitoring and visualization

## Infrastructure

The system is deployed using Docker containers orchestrated with Docker Compose. Each component is isolated in its own container with appropriate networking, volumes, and environment variables.

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Frontend (React.js)                                        │
│  Container: seo-website                                     │
│                                                             │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Nginx Reverse Proxy                                        │
│  Container: seo-nginx                                       │
│                                                             │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Backend API (Node.js)                                      │
│  Container: seo-api                                         │
│                                                             │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────┬─────────────────┬─────────────────────────────┐
│             │                 │                             │
│  MongoDB    │  Redis Cache    │  n8n Workflow Engine        │
│  seo-mongodb│  seo-redis      │  seo-n8n                    │
│             │                 │                             │
└─────────────┴─────────────────┴─────────────────────────────┘
```

## Deployment

The system is deployed using a custom launch script (`launch-seo-engineering.sh`) that handles the following:

1. Environment verification
2. Directory creation and configuration
3. SSL certificate management
4. Nginx configuration
5. Container orchestration with Docker Compose

### Access Points

- **Main Website**: https://seo.engineering/
- **API Endpoint**: https://seo.engineering/api
- **Workflow Automation**: https://seo.engineering/n8n/
- **Monitoring Dashboard**: https://seo.engineering/monitoring/

Default credentials for protected areas:
- Username: `admin`
- Password: `admin123` (change immediately after first login)

## Configuration

### Environment Variables

The system is configured using environment variables stored in `.env.production`. These variables include:

- Database credentials
- API keys and secrets
- JWT authentication tokens
- Service configurations
- Domain settings

### Nginx Configuration

The Nginx reverse proxy is configured to:

1. Redirect HTTP to HTTPS
2. Terminate SSL connections
3. Route traffic to appropriate services
4. Serve static frontend assets
5. Provide health check endpoints

### Security

The system implements several security measures:

1. SSL encryption for all traffic
2. Authentication for sensitive areas
3. Environment variable isolation
4. Network segmentation
5. Regular security updates

## Monitoring

The system includes comprehensive monitoring capabilities:

1. **Prometheus**: Metrics collection and storage
2. **Grafana**: Visualization and alerting
3. **Node Exporter**: Host metrics collection
4. **Container Logs**: Application-specific logs

Access the monitoring dashboard at https://seo.engineering/monitoring/

## Maintenance Procedures

### Starting the System

```bash
cd /home/tabs/seo-engineering
./launch-seo-engineering.sh
```

### Stopping the System

```bash
cd /home/tabs/seo-engineering
docker compose -f deployment/docker-compose.prod.yml down
```

### Viewing Logs

```bash
# View all logs
docker compose -f /home/tabs/seo-engineering/deployment/docker-compose.prod.yml logs

# View logs for a specific service
docker logs seo-nginx
docker logs seo-api
docker logs seo-mongodb
```

### Restarting a Specific Service

```bash
docker restart seo-nginx
docker restart seo-api
docker restart seo-mongodb
```

## Backup and Recovery

The system includes an automated backup service that regularly backs up:

1. MongoDB data
2. Configuration files
3. SSL certificates

Backups are stored in `/home/tabs/seo-engineering/backups/`

### Manual Backup

```bash
# Backup MongoDB
docker exec seo-mongodb mongodump --out /data/backup

# Backup configuration
cp -r /home/tabs/seo-engineering/nginx /home/tabs/seo-engineering/backups/
cp /home/tabs/seo-engineering/.env.production /home/tabs/seo-engineering/backups/
```

### Recovery

1. Restore MongoDB data:
```bash
docker exec seo-mongodb mongorestore /data/backup
```

2. Restore configuration files:
```bash
cp -r /home/tabs/seo-engineering/backups/nginx /home/tabs/seo-engineering/
cp /home/tabs/seo-engineering/backups/.env.production /home/tabs/seo-engineering/
```

3. Restart the system:
```bash
cd /home/tabs/seo-engineering
./launch-seo-engineering.sh
```

## Troubleshooting

### Common Issues

1. **Nginx fails to start**: 
   - Check if another process is using ports 80/443
   - Verify SSL certificates exist and are valid
   - Check Nginx configuration

2. **MongoDB connection issues**:
   - Check environment variables for correct connection string
   - Verify MongoDB container is running
   - Check MongoDB logs for authentication errors

3. **Frontend not loading**:
   - Check if the website container built properly
   - Verify Nginx is serving the correct files
   - Check browser console for JavaScript errors

### Advanced Troubleshooting

For more advanced issues, look at the specific service logs:

```bash
docker logs seo-nginx
docker logs seo-api
docker logs seo-mongodb
```

## Future Enhancements

Planned enhancements for the system include:

1. Implementing authentication for protected areas
2. Adding Let's Encrypt SSL certificate automation
3. Enhancing monitoring with alerts
4. Implementing automated deployment from GitHub

## Contact Information

For assistance with the SEO.engineering platform, contact:

- **Technical Support**: support@seo.engineering
- **System Administrator**: admin@seo.engineering