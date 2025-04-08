# Crawler Module

## Component Overview

The Crawler Module is a core component of the SEO.engineering system responsible for scanning client websites to collect comprehensive data for technical SEO analysis. It uses browser automation to simulate real user visits, ensuring accurate measurement of website behavior and performance.

The Crawler Module is designed to be:
- **Efficient**: Minimizing resource usage while maximizing data collection
- **Respectful**: Following robots.txt rules and using appropriate rate limiting
- **Comprehensive**: Gathering all data needed for thorough SEO analysis
- **Accurate**: Simulating real user experiences for performance measurement
- **Adaptable**: Working with various CMS platforms and website architectures

## Architecture

The Crawler Module consists of the following subcomponents:

1. **Crawler Controller**: Orchestrates the crawling process, manages resources, and handles task distribution
2. **Page Processor**: Processes individual pages, extracts data, and captures performance metrics
3. **Link Extractor**: Identifies and extracts links from pages to build the crawl queue
4. **Robots.txt Parser**: Processes robots.txt files to ensure compliance with crawling directives
5. **Sitemap Processor**: Parses XML sitemaps to discover pages
6. **Resource Monitor**: Tracks resource usage to optimize performance
7. **CMS Detector**: Identifies the CMS platform being used
8. **Data Storage Adapter**: Interfaces with the database to store crawl results

### Internal Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                       Crawler Module                               │
│                                                                   │
│  ┌─────────────────┐           ┌───────────────────────────────┐  │
│  │                 │           │                               │  │
│  │  Crawler        │◀────────▶│  Page Processor               │  │
│  │  Controller     │           │                               │  │
│  │                 │           └───────────────────────────────┘  │
│  └─────────────────┘                        ▲                     │
│         ▲                                   │                     │
│         │                                   ▼                     │
│         │                      ┌───────────────────────────────┐  │
│         │                      │                               │  │
│         │                      │  Link Extractor               │  │
│         │                      │                               │  │
│         │                      └───────────────────────────────┘  │
│         │                                   ▲                     │
│         ▼                                   │                     │
│  ┌─────────────────┐           ┌───────────────────────────────┐  │
│  │                 │           │                               │  │
│  │  Robots.txt     │◀────────▶│  Sitemap Processor            │  │
│  │  Parser         │           │                               │  │
│  │                 │           └───────────────────────────────┘  │
│  └─────────────────┘                                              │
│         ▲                                   ▲                     │
│         │                                   │                     │
│         ▼                                   ▼                     │
│  ┌─────────────────┐           ┌───────────────────────────────┐  │
│  │                 │           │                               │  │
│  │  Resource       │◀────────▶│  CMS Detector                 │  │
│  │  Monitor        │           │                               │  │
│  │                 │           └───────────────────────────────┘  │
│  └─────────────────┘                        ▲                     │
│         ▲                                   │                     │
│         │                                   ▼                     │
│         │                      ┌───────────────────────────────┐  │
│         └────────────────────▶│                               │  │
│                               │  Data Storage Adapter         │  │
│                               │                               │  │
│                               └───────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Input
- Client website URL(s)
- Crawl configuration parameters (depth, breadth, concurrency, etc.)
- Exclusion patterns
- Authentication credentials (if needed)

### Processing
1. The Crawler Controller initiates the crawl process
2. The Robots.txt Parser checks for crawling restrictions
3. The Sitemap Processor identifies important pages
4. The Page Processor visits each page and extracts data
5. The Link Extractor identifies new URLs to crawl
6. The CMS Detector identifies the platform being used
7. The Resource Monitor ensures optimal resource utilization
8. The Data Storage Adapter persists the crawl results

### Output
- Comprehensive website structure
- Page content and metadata
- Performance metrics
- Technical SEO data
- Link structure
- Resource inventory
- CMS identification
- Crawl statistics

## Interfaces

### API Endpoints

The Crawler Module exposes the following REST API endpoints:

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/crawler/start` | POST | Start a new crawl | `url`, `config` |
| `/api/crawler/status/:id` | GET | Get crawl status | `id` |
| `/api/crawler/stop/:id` | POST | Stop a running crawl | `id` |
| `/api/crawler/results/:id` | GET | Get crawl results | `id` |
| `/api/crawler/export/:id` | GET | Export crawl data | `id`, `format` |
| `/api/crawler/jobs` | GET | List all crawl jobs | `status`, `limit`, `offset` |

### Events

The Crawler Module emits the following events:

| Event | Description | Payload |
|-------|-------------|---------|
| `crawl.started` | Crawl job started | `jobId`, `url`, `timestamp` |
| `crawl.completed` | Crawl job completed | `jobId`, `url`, `stats`, `timestamp` |
| `crawl.failed` | Crawl job failed | `jobId`, `url`, `error`, `timestamp` |
| `crawl.progress` | Crawl progress update | `jobId`, `url`, `progress`, `timestamp` |
| `crawl.pageProcessed` | Page processed | `jobId`, `url`, `pageUrl`, `timestamp` |

### Internal Interfaces

- **Database Interface**: Interacts with MongoDB for storage of crawl data
- **Message Queue Interface**: Publishes events to the message queue
- **File System Interface**: Stores temporary data during crawling

## Configuration

The Crawler Module is configured using the following parameters:

### Basic Configuration

```javascript
{
  // Maximum crawl depth (links from home page)
  "maxDepth": 5,
  
  // Maximum pages to crawl
  "maxPages": 1000,
  
  // Concurrency (number of parallel page loads)
  "concurrency": 5,
  
  // Delay between requests in milliseconds
  "requestDelay": 500,
  
  // Respect robots.txt rules
  "respectRobotsTxt": true,
  
  // Process sitemaps
  "processSitemaps": true,
  
  // Timeout for page loads in milliseconds
  "pageTimeout": 30000,
  
  // User agent string
  "userAgent": "SEO.engineering Crawler/1.0 (+https://seo.engineering.dev/bot)"
}
```

### Advanced Configuration

```javascript
{
  // Include/exclude patterns (regex)
  "includePatterns": ["^https://example\\.com/.*$"],
  "excludePatterns": ["^https://example\\.com/admin/.*$"],
  
  // Authentication options
  "authentication": {
    "type": "basic",  // or "form"
    "username": "user",
    "password": "pass",
    "loginUrl": "https://example.com/login",
    "loginSelectors": {
      "usernameField": "#username",
      "passwordField": "#password",
      "submitButton": "button[type=submit]"
    }
  },
  
  // Resource handling
  "resources": {
    "capture": ["document", "stylesheet", "image", "script"],
    "maxResourceSize": 5242880,  // 5MB
    "ignorePatterns": ["\\.pdf$", "\\.zip$"]
  },
  
  // Mobile emulation
  "mobileEmulation": {
    "enabled": true,
    "deviceName": "iPhone X"
  },
  
  // Performance metrics to capture
  "performanceMetrics": {
    "enabled": true,
    "captureTimings": true,
    "captureLighthouse": true
  },
  
  // Incremental crawling
  "incremental": {
    "enabled": true,
    "compareStrategy": "lastModified"  // or "etag", "contentHash"
  }
}
```

## Dependencies

### External Dependencies

- **Playwright**: For browser automation and page interaction
- **MongoDB**: For storage of crawl data
- **Redis**: For caching and distributed locking
- **n8n**: For workflow integration and orchestration

### Internal Dependencies

- **Database Layer**: For data persistence
- **Messaging System**: For event publishing
- **Configuration Service**: For crawler configuration

## Deployment

### Requirements

- Node.js 16.x or higher
- At least 2GB RAM per crawler instance
- At least 10GB storage for crawl data
- Network access to client websites
- Outbound internet access
- Access to MongoDB and Redis instances

### Docker Deployment

The Crawler Module can be deployed as a Docker container:

```bash
docker run -d \
  --name seo.engineering-crawler \
  -e MONGODB_URI=mongodb://mongodb:27017/seo.engineering \
  -e REDIS_URI=redis://redis:6379 \
  -e MAX_CONCURRENCY=5 \
  -v /data/crawler:/app/data \
  seo.engineering/crawler:latest
```

### Kubernetes Deployment

For production deployments, a Kubernetes configuration is recommended:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seo.engineering-crawler
spec:
  replicas: 3
  selector:
    matchLabels:
      app: seo.engineering-crawler
  template:
    metadata:
      labels:
        app: seo.engineering-crawler
    spec:
      containers:
      - name: crawler
        image: seo.engineering/crawler:latest
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: seo.engineering-secrets
              key: mongodb-uri
        - name: REDIS_URI
          valueFrom:
            secretKeyRef:
              name: seo.engineering-secrets
              key: redis-uri
        - name: MAX_CONCURRENCY
          value: "5"
        volumeMounts:
        - name: crawler-data
          mountPath: /app/data
      volumes:
      - name: crawler-data
        persistentVolumeClaim:
          claimName: crawler-data
```

## Monitoring

### Logging

The Crawler Module uses structured logging with the following log levels:

- **ERROR**: Critical errors that prevent crawling
- **WARN**: Issues that don't stop crawling but may affect quality
- **INFO**: Important operational events
- **DEBUG**: Detailed information for troubleshooting
- **TRACE**: Very detailed debugging information

Example log format:

```json
{
  "timestamp": "2025-04-03T10:00:00.000Z",
  "level": "INFO",
  "service": "crawler",
  "jobId": "c7a9e15b-4c1f-4b1d-9b3a-12c4e5d6f7g8",
  "message": "Crawl started for example.com",
  "url": "https://example.com",
  "config": {...}
}
```

### Metrics

The Crawler Module exposes the following metrics:

| Metric | Type | Description |
|--------|------|-------------|
| `crawler_jobs_total` | Counter | Total number of crawl jobs |
| `crawler_jobs_active` | Gauge | Currently active crawl jobs |
| `crawler_pages_processed` | Counter | Total pages processed |
| `crawler_pages_failed` | Counter | Failed page loads |
| `crawler_processing_time` | Histogram | Page processing time distribution |
| `crawler_memory_usage` | Gauge | Memory usage of crawler process |
| `crawler_cpu_usage` | Gauge | CPU usage of crawler process |

### Health Checks

The Crawler Module provides the following health check endpoints:

- `/health/liveness`: Indicates if the service is running
- `/health/readiness`: Indicates if the service is ready to accept requests
- `/health/dependencies`: Checks the status of dependencies

## Testing

### Unit Tests

Unit tests cover the following components:
- Robots.txt Parser
- Link Extractor
- CMS Detector
- Configuration Validation

### Integration Tests

Integration tests verify:
- Database interactions
- Event publishing
- Rate limiting behavior
- Concurrency handling

### End-to-End Tests

End-to-end tests validate:
- Complete crawling workflow
- Performance measurement
- Data collection accuracy
- Error handling

### CMS Compatibility Tests

Specific tests for various CMS platforms:
- WordPress
- Shopify
- Wix
- Squarespace
- Joomla

## Performance

### Optimization Techniques

1. **Parallel Crawling**: Multiple pages processed concurrently
2. **Resource Prioritization**: Critical resources processed first
3. **Incremental Crawling**: Only process changed pages
4. **Memory Management**: Browser instances recycled to limit memory usage
5. **Response Caching**: Frequently accessed data cached in Redis
6. **Smart Scheduling**: Intelligent distribution of crawl tasks

### Performance Benchmarks

| Metric | Value |
|--------|-------|
| Pages per minute (single instance) | ~300 |
| Memory usage per page | ~10MB |
| CPU usage per page | ~0.1 core |
| Maximum site size (standard config) | 10,000 pages |
| Crawl time for 1,000 page site | ~10 minutes |

## Security

### Protection Measures

1. **Input Validation**: All parameters and URLs validated
2. **Rate Limiting**: Prevents excessive requests to client sites
3. **Credential Security**: Secure storage of authentication credentials
4. **Data Encryption**: Sensitive data encrypted at rest and in transit
5. **Access Control**: API endpoints protected by authentication
6. **Audit Logging**: All actions logged for accountability

### Ethical Considerations

1. **Robots.txt Compliance**: Respect crawling directives by default
2. **Rate Control**: Avoid overwhelming client websites
3. **Identification**: Clear user agent identifying the crawler
4. **Privacy**: No collection of personal data
5. **Transparency**: Clear information about crawling activities

## Development

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/organization/SEO.engineering.git

# Navigate to the crawler directory
cd SEO.engineering/automation/crawler

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Code Structure

```
/automation/crawler/
├── index.js             # Entry point
├── controllers/         # API controllers
├── services/            # Business logic
│   ├── crawler.js       # Crawler controller
│   ├── page-processor.js # Page processing
│   ├── link-extractor.js # Link extraction
│   ├── robots-parser.js  # Robots.txt parsing
│   └── sitemap.js        # Sitemap processing
├── models/              # Data models
├── utils/               # Utility functions
├── config/              # Configuration
└── tests/               # Test suite
```

### Coding Standards

The Crawler Module follows these coding standards:
- **ESLint**: For code quality and style
- **Jest**: For testing
- **JSDoc**: For documentation
- **Prettier**: For code formatting

### Development Guidelines

1. Keep files under 500 lines (golden rule)
2. Write unit tests for all new functionality
3. Document all public interfaces with JSDoc
4. Follow the error handling patterns
5. Use async/await for asynchronous code
6. Add logging at appropriate levels
7. Consider performance implications

## Troubleshooting

### Common Issues

1. **High Memory Usage**: 
   - Check concurrency settings
   - Verify browser cleanup is functioning
   - Increase memory allocation or decrease concurrency

2. **Slow Crawling**:
   - Check network connectivity
   - Verify target site response times
   - Optimize concurrency settings
   - Enable incremental crawling

3. **Missing Pages**:
   - Check robots.txt restrictions
   - Verify JavaScript-based navigation handling
   - Check for login/authentication issues
   - Increase crawl depth

4. **Database Connection Issues**:
   - Verify MongoDB connection string
   - Check network connectivity to database
   - Verify database credentials

### Debugging

Enable debug logging:

```
export DEBUG=seo.engineering:crawler:*
npm run start
```

## Future Enhancements

The following enhancements are planned for future versions:

1. **Distributed Crawling**: Distribute crawling across multiple worker nodes
2. **AI-Powered Analysis**: Integrate machine learning for improved analysis
3. **Enhanced JavaScript Support**: Better handling of JavaScript-heavy sites
4. **API Crawling**: Support for crawling headless APIs and SPAs
5. **Custom Browser Extensions**: Extend browser capabilities for specialized testing
6. **Visual Regression**: Compare visual appearance between crawls
7. **Real User Monitoring Integration**: Correlate with real user data
