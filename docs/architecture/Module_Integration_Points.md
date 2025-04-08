# SEO.engineering Module Integration Points

## System Architecture Overview

The SEO.engineering platform consists of multiple interconnected modules that work together to provide automated technical SEO services. This document defines the integration points, interfaces, data flows, and communication protocols between these modules.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Client Website                                             │
│                                                             │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Crawler Module                                             │
│  - Playwright-based website scanning                        │
│  - Asset & resource discovery                               │
│  - Performance metrics collection                           │
│                                                             │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Analysis Engine                                            │
│  - Issue identification                                     │
│  - Prioritization algorithm                                 │
│  - Fix strategy determination                               │
│                                                             │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Implementation Module                                      │
│  - Automated fixes via git                                  │
│  - Server configuration                                     │
│  - Content optimization                                     │
│                                                             │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Verification System                                        │
│  - Before/after comparison                                  │
│  - Impact measurement                                       │
│  - Regression testing                                       │
│                                                             │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Client Dashboard                                           │
│  - Performance reporting                                    │
│  - Improvement tracking                                     │
│  - Recommendation management                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Module Definitions and Responsibilities

### 1. Crawler Module
- **Responsibility**: Scanning client websites to collect data about their structure, content, and performance
- **Key Components**: 
  - Playwright-based browser automation
  - URL discovery and mapping
  - Asset collection
  - Performance metrics measurement
  - Screenshot capture

### 2. Analysis Engine
- **Responsibility**: Processing data from the Crawler to identify SEO issues and prioritize them
- **Key Components**:
  - Issue detection algorithms
  - Severity scoring system
  - Prioritization engine
  - Fix strategy selector

### 3. Implementation Module
- **Responsibility**: Applying automated fixes to client websites based on Analysis Engine recommendations
- **Key Components**:
  - Git integration for version control
  - Fix templates
  - Content optimization tools
  - Server configuration managers

### 4. Verification System
- **Responsibility**: Confirming that implemented changes have resolved issues and improved performance
- **Key Components**:
  - Before/after comparison tools
  - Performance impact measurement
  - Regression testing

### 5. Client Dashboard
- **Responsibility**: Providing a user interface for clients to view results and manage their SEO
- **Key Components**:
  - Performance visualization
  - Issue tracking
  - Recommendation management
  - Reporting system

## Integration Points and Interfaces

### 1. Crawler Module → Analysis Engine

#### Data Flow
The Crawler Module collects raw data about client websites and passes it to the Analysis Engine for processing.

#### Interface Specification
- **Integration Type**: REST API + Database
- **Endpoint**: `/api/crawl/results/:siteId`
- **Method**: POST
- **Data Structure**:
```json
{
  "siteId": "string",
  "crawlId": "string",
  "timestamp": "ISO-8601 date",
  "pages": [
    {
      "url": "string",
      "statusCode": "number",
      "title": "string",
      "metaTags": [{"name": "string", "content": "string"}],
      "headers": [{"tag": "string", "content": "string", "level": "number"}],
      "images": [{"src": "string", "alt": "string", "size": "number"}],
      "links": [{"href": "string", "text": "string", "isInternal": "boolean"}],
      "performance": {
        "loadTime": "number",
        "firstContentfulPaint": "number",
        "largestContentfulPaint": "number",
        "cumulativeLayoutShift": "number",
        "totalBlockingTime": "number"
      },
      "screenshot": "string (base64)",
      "html": "string"
    }
  ],
  "assets": [
    {
      "url": "string",
      "type": "string (js, css, image, etc.)",
      "size": "number",
      "transferSize": "number",
      "compression": "boolean"
    }
  ],
  "errors": [
    {
      "url": "string",
      "type": "string",
      "message": "string",
      "stack": "string"
    }
  ],
  "crawlStats": {
    "totalPages": "number",
    "totalAssets": "number",
    "totalErrors": "number",
    "duration": "number"
  }
}
```

#### Database Models
- **CrawlResult Model**: Stores metadata about each crawl
- **Page Model**: Stores data about individual pages
- **Asset Model**: Stores data about site assets
- **Error Model**: Stores errors encountered during crawl

#### Events
- **crawlStarted**: Emitted when a crawl begins
- **crawlCompleted**: Emitted when a crawl finishes
- **crawlFailed**: Emitted if a crawl encounters a critical error

### 2. Analysis Engine → Implementation Module

#### Data Flow
The Analysis Engine identifies issues and determines fix strategies, then passes this information to the Implementation Module.

#### Interface Specification
- **Integration Type**: REST API + Database + Message Queue
- **Endpoint**: `/api/analysis/results/:siteId`
- **Method**: POST
- **Data Structure**:
```json
{
  "siteId": "string",
  "analysisId": "string",
  "timestamp": "ISO-8601 date",
  "crawlId": "string",
  "issues": [
    {
      "issueId": "string",
      "type": "string (meta_tag, image_optimization, etc.)",
      "severity": "number (1-5)",
      "priority": "number (1-10)",
      "url": "string",
      "element": "string (CSS selector)",
      "description": "string",
      "recommendation": "string",
      "fixStrategy": {
        "type": "string (auto, manual, hybrid)",
        "template": "string (fix template ID)",
        "parameters": {
          "key1": "value1",
          "key2": "value2"
        }
      }
    }
  ],
  "summary": {
    "totalIssues": "number",
    "criticalIssues": "number",
    "highPriorityIssues": "number",
    "autoFixableIssues": "number",
    "estimatedImpact": "number (1-100)"
  }
}
```

#### Database Models
- **AnalysisResult Model**: Stores metadata about each analysis
- **Issue Model**: Stores data about identified issues
- **FixStrategy Model**: Stores data about fix strategies

#### Events
- **analysisStarted**: Emitted when analysis begins
- **analysisCompleted**: Emitted when analysis finishes
- **issueDetected**: Emitted for each issue found
- **fixPlanned**: Emitted when a fix strategy is determined

### 3. Implementation Module → Verification System

#### Data Flow
The Implementation Module applies fixes to client websites and notifies the Verification System to check the results.

#### Interface Specification
- **Integration Type**: REST API + Git Integration + Message Queue
- **Endpoint**: `/api/implementation/results/:siteId`
- **Method**: POST
- **Data Structure**:
```json
{
  "siteId": "string",
  "implementationId": "string",
  "timestamp": "ISO-8601 date",
  "analysisId": "string",
  "batchId": "string",
  "fixes": [
    {
      "fixId": "string",
      "issueId": "string",
      "type": "string",
      "url": "string",
      "element": "string",
      "changeType": "string (meta_tag, image_optimization, etc.)",
      "gitCommit": "string (commit hash)",
      "before": "string",
      "after": "string",
      "status": "string (success, failed, partial)"
    }
  ],
  "summary": {
    "totalFixes": "number",
    "successfulFixes": "number",
    "failedFixes": "number",
    "partialFixes": "number"
  }
}
```

#### Git Integration
The Implementation Module uses the Git Integration system (documented separately) to:
1. Create change batches for each implementation run
2. Record changes made to fix issues
3. Create commits with detailed metadata
4. Finalize batches upon completion

#### Database Models
- **ImplementationResult Model**: Stores metadata about each implementation
- **Fix Model**: Stores data about applied fixes
- **Commit Model**: Stores information about Git commits

#### Events
- **implementationStarted**: Emitted when implementation begins
- **implementationCompleted**: Emitted when implementation finishes
- **fixApplied**: Emitted for each fix applied
- **verificationRequested**: Emitted to trigger verification

### 4. Verification System → Client Dashboard

#### Data Flow
The Verification System checks the results of implemented fixes and provides data to the Client Dashboard for display.

#### Interface Specification
- **Integration Type**: REST API + Database + WebSockets
- **Endpoint**: `/api/verification/results/:siteId`
- **Method**: POST
- **Data Structure**:
```json
{
  "siteId": "string",
  "verificationId": "string",
  "timestamp": "ISO-8601 date",
  "implementationId": "string",
  "verifications": [
    {
      "verificationId": "string",
      "fixId": "string",
      "issueId": "string",
      "url": "string",
      "status": "string (verified, failed, inconclusive)",
      "performanceImpact": {
        "before": {
          "metric1": "number",
          "metric2": "number"
        },
        "after": {
          "metric1": "number",
          "metric2": "number"
        },
        "improvement": {
          "metric1": "number",
          "metric2": "number"
        }
      },
      "regressions": [
        {
          "type": "string",
          "description": "string",
          "severity": "number"
        }
      ]
    }
  ],
  "summary": {
    "totalVerifications": "number",
    "verifiedFixes": "number",
    "failedVerifications": "number",
    "totalImpact": "number",
    "regressionsDetected": "number"
  }
}
```

#### Database Models
- **VerificationResult Model**: Stores metadata about each verification
- **Impact Model**: Stores data about performance impact
- **Regression Model**: Stores data about detected regressions

#### Events
- **verificationStarted**: Emitted when verification begins
- **verificationCompleted**: Emitted when verification finishes
- **impactMeasured**: Emitted when impact is measured
- **regressionDetected**: Emitted when a regression is detected

#### Real-time Updates
- WebSockets API provides real-time updates to the Client Dashboard
- Event channel: `verification:siteId`

### 5. Client Dashboard → All Modules

#### Data Flow
The Client Dashboard provides user input to control the system and displays results from all modules.

#### Interface Specification
- **Integration Type**: REST API + WebSockets + Database
- **Endpoints**:
  - GET `/api/dashboard/sites/:siteId/overview`
  - GET `/api/dashboard/sites/:siteId/issues`
  - GET `/api/dashboard/sites/:siteId/fixes`
  - GET `/api/dashboard/sites/:siteId/performance`
  - POST `/api/dashboard/sites/:siteId/scan/start`
  - POST `/api/dashboard/sites/:siteId/fixes/approve`
  - POST `/api/dashboard/sites/:siteId/fixes/reject`
  - POST `/api/dashboard/sites/:siteId/fixes/rollback`

#### Authentication & Authorization
- JWT-based authentication for all API endpoints
- Role-based access control for different dashboard features
- Scoped access tokens for specific sites and operations

#### WebSockets Events
- Connected clients receive real-time updates about:
  - Crawl progress
  - Analysis results
  - Implementation status
  - Verification results

## Cross-Cutting Integration Points

### 1. Database Integration

All modules interact with a central MongoDB database through:
- Mongoose models for data manipulation
- Repository pattern for database access
- Service layer for business logic

### 2. Logging & Monitoring

All modules use the centralized logging system:
- Winston-based logger
- Log levels for different environments
- Structured logging format
- Log aggregation and storage

### 3. Configuration Management

All modules access environment-specific configuration via:
- Environment variables loaded through dotenv
- Central configuration module
- Feature flags for conditional functionality

### 4. Error Handling

All modules use a consistent error handling approach:
- Custom error classes
- Error middleware for API routes
- Error events for system-wide notification
- Retry mechanisms for transient failures

### 5. Authentication & Security

All modules use:
- JWT-based authentication
- Role-based authorization
- Input validation
- Output sanitization
- CSRF protection

## Message Queue System

For asynchronous communication between modules, a RabbitMQ message queue is used with the following channels:

### Queues
- `crawl_queue`: Tasks for the Crawler Module
- `analysis_queue`: Tasks for the Analysis Engine
- `implementation_queue`: Tasks for the Implementation Module
- `verification_queue`: Tasks for the Verification System
- `notification_queue`: User notifications

### Exchange Topics
- `site.events`: Events related to site operations
- `user.events`: Events related to user actions
- `system.events`: System-level events

## Scheduled Tasks

The system uses a distributed cron (n8n) for scheduled tasks:
- Daily site scans
- Weekly performance reports
- Monthly trend analysis
- Backup operations

## Deployment and Environment Integration

Each module is deployed as a separate Docker container, with:
- Inter-container networking
- Shared volume mounts where needed
- Environment-specific configuration
- Health check endpoints
- Readiness and liveness probes

## API Documentation

Complete OpenAPI/Swagger documentation is available at:
- Development: `http://localhost:3000/api-docs`
- Production: `https://api.seo.engineering.com/api-docs`

## Integration Examples

### Example 1: Complete SEO Scan Workflow

1. **Client Dashboard**
   - User initiates scan through dashboard
   - POST `/api/dashboard/sites/123/scan/start`

2. **Crawler Module**
   - Receives scan request from queue
   - Performs crawl of site
   - Stores results in database
   - POST `/api/crawl/results/123`
   - Emits `crawlCompleted` event

3. **Analysis Engine**
   - Triggered by `crawlCompleted` event
   - Processes crawl data to identify issues
   - Determines fix strategies
   - Stores analysis in database
   - POST `/api/analysis/results/123`
   - Emits `analysisCompleted` event

4. **Implementation Module**
   - Triggered by `analysisCompleted` event
   - Creates Git change batch
   - Applies fixes using appropriate templates
   - Records changes in Git
   - POST `/api/implementation/results/123`
   - Emits `implementationCompleted` event

5. **Verification System**
   - Triggered by `implementationCompleted` event
   - Performs verification scan
   - Measures impact of changes
   - Checks for regressions
   - POST `/api/verification/results/123`
   - Emits `verificationCompleted` event

6. **Client Dashboard**
   - Real-time updates via WebSockets
   - Complete results available in dashboard
   - Email notification sent to user

### Example 2: Manual Fix Approval Workflow

1. **Analysis Engine**
   - Identifies issues requiring manual approval
   - Flags issues in database
   - Emits `approvalNeeded` event

2. **Client Dashboard**
   - Notifies user of pending approvals
   - Displays proposed changes
   - User reviews and approves via dashboard
   - POST `/api/dashboard/sites/123/fixes/approve`

3. **Implementation Module**
   - Receives approval from dashboard
   - Applies approved fixes
   - Records changes in Git
   - Emits `implementationCompleted` event

4. **Verification System**
   - Verifies approved changes
   - Updates dashboard with results

## Integration Testing

Each integration point has dedicated tests:
- Unit tests for individual endpoints
- Integration tests for module-to-module communication
- End-to-end tests for complete workflows
- Performance tests for high-load scenarios

## Troubleshooting Integration Issues

Common integration issues and their solutions:
1. **Data format mismatches**: Check API documentation and use validators
2. **Authentication failures**: Verify token validity and permissions
3. **Timing issues**: Use proper event sequencing and retry mechanisms
4. **Database concurrency**: Use proper transactions and locking
5. **Message queue failures**: Check queue status and implement dead letter queues

## Version Compatibility

This integration specification is valid for:
- SEO.engineering v1.0.0 and above
- API v1.0.0
- Database schema v1.0.0

## Future Integration Enhancements

Planned improvements to module integration:
1. **GraphQL API**: For more flexible data querying
2. **Event sourcing**: For improved system reliability
3. **Microservices architecture**: For better scaling
4. **Kubernetes deployment**: For automated scaling and healing
5. **AI-enhanced communication**: For smarter inter-module coordination
