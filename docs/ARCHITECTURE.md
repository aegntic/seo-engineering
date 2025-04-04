# SEOAutomate System Architecture

This document defines the detailed system architecture and data flow for the SEOAutomate platform.

## System Components

### 1. Crawler Module
- **Purpose**: Scans client websites to collect technical SEO data
- **Implementation**: Playwright-based automation scripts
- **Key Functions**:
  - Website scanning and crawling
  - Asset and resource discovery
  - Performance metrics collection (Core Web Vitals)
  - Mobile responsiveness testing
  - Collecting HTTP status codes

### 2. Analysis Engine
- **Purpose**: Processes raw data to identify issues and prioritize fixes
- **Implementation**: Node.js with rules-based logic
- **Key Functions**:
  - Technical issue identification via rule-based checks
  - Issue categorization and tagging
  - Priority scoring based on impact and effort
  - Fix strategy determination

### 3. Implementation Module
- **Purpose**: Automatically applies fixes to client websites
- **Implementation**: Git-based change management with templated fixes
- **Key Functions**:
  - Version-controlled changes
  - Templated fixes for common issues
  - Custom fix generation for unique issues
  - Change verification

### 4. Verification System
- **Purpose**: Confirms that implemented changes have the desired effect
- **Implementation**: Before/after testing via Playwright
- **Key Functions**:
  - Before/after metric comparison
  - Regression testing
  - Impact verification
  - Performance validation

### 5. Client Dashboard
- **Purpose**: Provides client-facing reporting and management
- **Implementation**: React-based web application
- **Key Functions**:
  - Authentication and user management
  - Results visualization
  - Performance tracking
  - Issue management
  - Approval workflows

## Data Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │     │             │
│   Client    │────▶│   Crawler   │────▶│  Analysis   │────▶│Implementation│────▶│Verification │
│   Website   │     │   Module    │     │   Engine    │     │   Module    │     │   System    │
│             │     │             │     │             │     │             │     │             │
└─────────────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │                   │                   │
                           │                    │                   │                   │
                           ▼                    ▼                   ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                    │  Raw Data   │     │   Issue     │     │   Change    │     │ Performance │
                    │  Storage    │     │  Database   │     │   Tracker   │     │   Metrics   │
                    │             │     │             │     │             │     │             │
                    └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                                       │
                                                                                       │
                                                                                       ▼
                                                                               ┌─────────────┐
                                                                               │   Client    │
                                                                               │  Dashboard  │
                                                                               │             │
                                                                               └─────────────┘
```

## Data Models

### Client Model
```json
{
  "id": "unique-identifier",
  "name": "Client Name",
  "website": "https://example.com",
  "contactEmail": "client@example.com",
  "plan": "basic|premium|enterprise",
  "createdAt": "timestamp",
  "settings": {
    "crawlFrequency": "daily|weekly|monthly",
    "maxPagesToScan": 1000,
    "autoFix": true|false,
    "notificationEmail": "alerts@example.com"
  }
}
```

### Issue Model
```json
{
  "id": "unique-identifier",
  "clientId": "client-reference",
  "url": "https://example.com/page",
  "type": "meta-tags|images|headers|performance|schema|links",
  "severity": "critical|major|minor|info",
  "impact": 1-10,
  "description": "Descriptive text of the issue",
  "recommendation": "How to fix the issue",
  "status": "identified|planned|implemented|verified|dismissed",
  "detectedAt": "timestamp",
  "fixedAt": "timestamp",
  "verifiedAt": "timestamp"
}
```

### Change Model
```json
{
  "id": "unique-identifier",
  "clientId": "client-reference",
  "issueId": "issue-reference",
  "type": "meta-tags|images|headers|performance|schema|links",
  "beforeState": "JSON representation of before state",
  "afterState": "JSON representation of after state",
  "gitCommitId": "git-reference",
  "implementedAt": "timestamp",
  "status": "pending|applied|reverted|failed",
  "approvedBy": "user-reference",
  "approvedAt": "timestamp"
}
```

## Authentication Flow

1. Client registers on the SEOAutomate website
2. Verification email is sent to client
3. Client confirms email and sets up password
4. Client logs in to dashboard
5. JWT token is issued for API authentication
6. Client provides website access credentials via secure form
7. Credentials are encrypted and stored in secure vault
8. API requests use JWT for authentication

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new client
- `POST /api/auth/login` - Login existing client
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout client

### Client Endpoints
- `GET /api/clients/{id}` - Get client info
- `PUT /api/clients/{id}` - Update client info
- `POST /api/clients/{id}/websites` - Add website to client
- `GET /api/clients/{id}/issues` - Get all issues for client
- `GET /api/clients/{id}/changes` - Get all changes for client

### Scanning Endpoints
- `POST /api/scan` - Initiate new scan
- `GET /api/scan/{id}` - Get scan status
- `GET /api/scan/{id}/results` - Get scan results

### Implementation Endpoints
- `POST /api/issues/{id}/fix` - Apply fix for issue
- `GET /api/issues/{id}/changes` - Get changes for issue
- `POST /api/changes/{id}/approve` - Approve change
- `POST /api/changes/{id}/revert` - Revert change

## Security Considerations

1. **Authentication**: JWT-based authentication with short token expiry
2. **Authorization**: Role-based access control for client data
3. **Encryption**: All client credentials encrypted at rest (AES-256)
4. **Secure Communication**: All API endpoints require HTTPS
5. **Change Management**: Git-based versioning of all changes with rollback capability
6. **Input Validation**: Strict validation of all inputs to prevent injection attacks
7. **Rate Limiting**: API rate limiting to prevent abuse

## Monitoring and Logging

1. Comprehensive logging of all system actions
2. Real-time monitoring of crawler operations
3. Alert system for failed operations
4. Performance metrics collection for system optimization
5. Audit trail of all changes to client websites

## Deployment Architecture

The system will be deployed as a set of containerized microservices using Docker:

1. Frontend container (React)
2. API container (Node.js/Express)
3. Database container (MongoDB)
4. Crawler container (Playwright/Node.js)
5. n8n workflow container
6. Redis cache container

These containers will be orchestrated for development using Docker Compose, and for production using Kubernetes.