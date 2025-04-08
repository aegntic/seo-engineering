# SEO.engineering Deployment Plan (Production Mode)

---

## Overview

This plan details how to build and run the **SEO.engineering** platform in full production mode using the provided automation scripts and Docker Compose setup.

---

## Prerequisites

- `.env.production` file present in the project root.
- SSL certificates (`seo.engineering.crt` and `.key`) in `nginx/ssl/`.
- Docker and Docker Compose installed and running.
- You are in the project root `/home/tabs/seo-engineering`.

---

## Deployment Steps

### 1. Verify Environment

- The launch script will check for `.env.production` and SSL certs.
- It will create necessary directories and backups.
- It will generate a default Nginx config if missing.
- It will create or copy `.htpasswd` for basic authentication.

---

### 2. Run the Deployment Script

Make the script executable and run it:

```bash
chmod +x launch-seo-engineering.sh
./launch-seo-engineering.sh
```

This will:

- Use environment variables from `deployment/.env.production`.
- Use Docker Compose file `deployment/docker-compose.prod.yml`.
- Start all services in detached mode.

---

### 3. Expected Services and URLs

| Service             | URL                                    | Notes                        |
|---------------------|----------------------------------------|------------------------------|
| Main Website        | https://seo.engineering                | React frontend               |
| API                 | https://seo.engineering/api            | Node.js backend              |
| n8n Automation      | https://seo.engineering/n8n            | Protected with basic auth    |
| Monitoring Dashboard| https://seo.engineering/monitoring     | Grafana, protected with auth |

**Default Credentials:**

- Username: `admin`
- Password: `admin123` (change immediately after first login)

---

### 4. Monitoring and Logs

To follow logs:

```bash
docker-compose -f deployment/docker-compose.prod.yml logs -f
```

---

## Deployment Architecture

```mermaid
flowchart TD
    subgraph User
        U[Browser]
    end

    subgraph Nginx Reverse Proxy
        N[Nginx with SSL]
    end

    subgraph Docker_Network
        FE[React Frontend (static files)]
        API[Node.js API]
        DB[(MongoDB)]
        N8N[n8n Automation]
        G[Grafana Monitoring]
    end

    U -->|HTTPS| N
    N -->|/ (frontend)| FE
    N -->|/api| API
    N -->|/n8n| N8N
    N -->|/monitoring| G
    API --> DB
    N8N --> DB
```

---

## Summary

Running `launch-seo-engineering.sh` will:

- Prepare environment and SSL
- Set up Nginx reverse proxy
- Deploy all containers via Docker Compose in production mode
- Expose the full platform with HTTPS and basic authentication

---

## Security Reminder

Change all default passwords immediately after deployment.