# Analysis Engine

## Component Overview

The Analysis Engine is a core component of the SEOAutomate system responsible for processing crawled website data to identify technical SEO issues, prioritize them based on impact, and determine appropriate fix strategies. It serves as the brain of the system, applying SEO expertise and best practices to transform raw website data into actionable insights.

The Analysis Engine is designed to be:
- **Comprehensive**: Covering all aspects of technical SEO
- **Intelligent**: Prioritizing issues based on impact and implementation difficulty
- **Adaptive**: Applying different rules based on website type and CMS
- **Extensible**: Supporting new SEO rules and evolving best practices
- **Efficient**: Processing large websites with minimal resource usage

## Architecture

The Analysis Engine consists of the following subcomponents:

1. **Analysis Controller**: Orchestrates the analysis process and manages component interactions
2. **Rule Engine**: Applies SEO rules to detect issues and opportunities
3. **Prioritization Engine**: Ranks detected issues by impact and implementation complexity
4. **Fix Strategy Generator**: Determines appropriate strategies to resolve identified issues
5. **Content Analyzer**: Evaluates content quality and relevance
6. **Schema Validator**: Verifies structured data implementation
7. **Performance Evaluator**: Analyzes performance metrics
8. **CMS-Specific Analyzers**: Applies platform-specific rules for different CMS
9. **Data Access Layer**: Interfaces with the database for data retrieval and storage

### Internal Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                       Analysis Engine                              │
│                                                                   │
│  ┌─────────────────┐           ┌───────────────────────────────┐  │
│  │                 │           │                               │  │
│  │  Analysis       │◀────────▶│  Rule Engine                  │  │
│  │  Controller     │           │                               │  │
│  │                 │           └───────────────────────────────┘  │
│  └─────────────────┘                        ▲                     │
│         ▲                                   │                     │
│         │                                   ▼                     │
│         │                      ┌───────────────────────────────┐  │
│         │                      │                               │  │
│         │                      │  Prioritization Engine        │  │
│         │                      │                               │  │
│         │                      └───────────────────────────────┘  │
│         │                                   ▲                     │
│         ▼                                   │                     │
│  ┌─────────────────┐           ┌───────────────────────────────┐  │
│  │                 │           │                               │  │
│  │  Fix Strategy   │◀────────▶│  Content Analyzer             │  │
│  │  Generator      │           │                               │  │
│  │                 │           └───────────────────────────────┘  │
│  └─────────────────┘                                              │
│         ▲                                   ▲                     │
│         │                                   │                     │
│         ▼                                   ▼                     │
│  ┌─────────────────┐           ┌───────────────────────────────┐  │
│  │                 │           │                               │  │
│  │  Schema         │◀────────▶│  Performance Evaluator        │  │
│  │  Validator      │           │                               │  │
│  │                 │           └───────────────────────────────┘  │
│  └─────────────────┘                        ▲                     │
│         ▲                                   │                     │
│         │                                   ▼                     │
│         │                      ┌───────────────────────────────┐  │
│         └────────────────────▶│                               │  │
│                               │  CMS-Specific Analyzers        │  │
│                               │                               │  │
│                               └───────────────────────────────┘  │
│                                            ▲                     │
│                                            │                     │
│                                            ▼                     │
│                               ┌───────────────────────────────┐  │
│                               │                               │  │
│                               │  Data Access Layer            │  │
│                               │                               │  │
│                               └───────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Input
- Raw crawl data from the Crawler Module
- Website metadata (CMS type, industry, etc.)
- Historical analysis data (for trend analysis)
- Configuration parameters and rule sets
- Client-specific settings and priorities

### Processing
1. The Analysis Controller initiates the analysis process
2. The Rule Engine applies SEO rules to the crawled data
3. The Content Analyzer evaluates page content quality
4. The Schema Validator checks structured data implementation
5. The Performance Evaluator analyzes performance metrics
6. CMS-Specific Analyzers apply platform-specific rules
7. The Prioritization Engine ranks identified issues
8. The Fix Strategy Generator determines resolution approaches
9. The Data Access Layer persists analysis results

### Output
- Comprehensive list of technical SEO issues
- Prioritized issues ranked by impact and effort
- Detailed fix strategies for each issue
- Performance scores and benchmarks
- Content quality assessment
- Structured data evaluation
- Technical SEO health score
- Trend analysis comparing to previous scans

## Interfaces

### API Endpoints

The Analysis Engine exposes the following REST API endpoints:

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/analysis/start` | POST | Start a new analysis | `siteId`, `config` |
| `/api/analysis/status/:id` | GET | Get analysis status | `id` |
| `/api/analysis/results/:id` | GET | Get analysis results | `id` |
| `/api/analysis/issues/:siteId` | GET | Get issues for a site | `siteId`, `priority`, `status` |
| `/api/analysis/score/:siteId` | GET | Get SEO score for a site | `siteId` |
| `/api/analysis/trends/:siteId` | GET | Get trend analysis | `siteId`, `period` |
| `/api/analysis/rules` | GET | List available rules | `category` |

### Events

The Analysis Engine emits the following events:

| Event | Description | Payload |
|-------|-------------|---------|
| `analysis.started` | Analysis started | `analysisId`, `siteId`, `timestamp` |
| `analysis.completed` | Analysis completed | `analysisId`, `siteId`, `stats`, `timestamp` |
| `analysis.failed` | Analysis failed | `analysisId`, `siteId`, `error`, `timestamp` |
| `analysis.issueDetected` | New issue detected | `analysisId`, `siteId`, `issue`, `timestamp` |
| `analysis.scoreUpdated` | SEO score updated | `analysisId`, `siteId`, `score`, `timestamp` |

### Internal Interfaces

- **Database Interface**: For storage and retrieval of analysis data
- **Rule Repository Interface**: For accessing and updating SEO rules
- **Messaging Interface**: For publishing events and notifications
- **Configuration Interface**: For accessing analysis settings

## Configuration

The Analysis Engine is configured using the following parameters:

### Basic Configuration

```javascript
{
  // Rule sets to apply
  "ruleSets": ["core", "mobile", "performance", "content", "schema"],
  
  // Minimum issue severity to report
  "minSeverity": "warning",
  
  // Maximum issues to report per category
  "maxIssuesPerCategory": 100,
  
  // Enable trend analysis
  "enableTrends": true,
  
  // Issue prioritization weights
  "prioritization": {
    "impactWeight": 0.7,
    "effortWeight": 0.3
  }
}
```

### Advanced Configuration

```javascript
{
  // Custom rule sets
  "customRuleSets": [
    {
      "name": "e-commerce",
      "rules": ["product-schema", "cart-optimization", "checkout-performance"]
    }
  ],
  
  // Rule overrides
  "ruleOverrides": {
    "missing-meta-description": {
      "severity": "critical",
      "impact": 0.8
    }
  },
  
  // Content analysis settings
  "contentAnalysis": {
    "enabled": true,
    "minWordCount": 300,
    "checkReadability": true,
    "checkKeywordDensity": true,
    "languageDetection": true
  },
  
  // Performance thresholds
  "performanceThresholds": {
    "lcp": 2500,  // Largest Contentful Paint (ms)
    "fid": 100,   // First Input Delay (ms)
    "cls": 0.1,   // Cumulative Layout Shift
    "ttfb": 600   // Time to First Byte (ms)
  },
  
  // Schema validation
  "schemaValidation": {
    "enabled": true,
    "validateAgainstSchemaOrg": true,
    "requiredTypes": ["Organization", "BreadcrumbList"]
  },
  
  // CMS-specific settings
  "cmsSettings": {
    "wordpress": {
      "checkPlugins": true,
      "checkThemes": true
    },
    "shopify": {
      "checkProductSchema": true,
      "checkCollectionPages": true
    }
  }
}
```

## Dependencies

### External Dependencies

- **MongoDB**: For storage of analysis data
- **Redis**: For caching frequently accessed data
- **Schema.org Vocabulary**: For structured data validation
- **Lighthouse**: For performance metric validation

### Internal Dependencies

- **Crawler Module**: Source of raw website data
- **Database Layer**: For data persistence
- **Configuration Service**: For analysis settings
- **Rule Repository**: For SEO rules and best practices

## Deployment

### Requirements

- Node.js 16.x or higher
- At least 4GB RAM
- At least 20GB storage
- MongoDB connection
- Redis connection

### Docker Deployment

The Analysis Engine can be deployed as a Docker container:

```bash
docker run -d \
  --name seoautomate-analysis \
  -e MONGODB_URI=mongodb://mongodb:27017/seoautomate \
  -e REDIS_URI=redis://redis:6379 \
  -e LOG_LEVEL=info \
  -v /data/rules:/app/rules \
  seoautomate/analysis-engine:latest
```

### Kubernetes Deployment

For production deployments, a Kubernetes configuration is recommended:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seoautomate-analysis
spec:
  replicas: 2
  selector:
    matchLabels:
      app: seoautomate-analysis
  template:
    metadata:
      labels:
        app: seoautomate-analysis
    spec:
      containers:
      - name: analysis
        image: seoautomate/analysis-engine:latest
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
          limits:
            memory: "8Gi"
            cpu: "4"
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: seoautomate-secrets
              key: mongodb-uri
        - name: REDIS_URI
          valueFrom:
            secretKeyRef:
              name: seoautomate-secrets
              key: redis-uri
        - name: LOG_LEVEL
          value: "info"
        volumeMounts:
        - name: rules-volume
          mountPath: /app/rules
      volumes:
      - name: rules-volume
        configMap:
          name: seo-rules
```

## Monitoring

### Logging

The Analysis Engine uses structured logging with the following log levels:

- **ERROR**: Critical errors that prevent analysis
- **WARN**: Issues that don't stop analysis but may affect quality
- **INFO**: Important operational events
- **DEBUG**: Detailed information for troubleshooting
- **TRACE**: Very detailed debugging information

Example log format:

```json
{
  "timestamp": "2025-04-03T14:32:15.432Z",
  "level": "INFO",
  "service": "analysis-engine",
  "analysisId": "a8b7c6d5-e4f3-2g1h-0i9j-8k7l6m5n4o3p",
  "siteId": "example-site-123",
  "message": "Analysis started for example.com",
  "config": {...}
}
```

### Metrics

The Analysis Engine exposes the following metrics:

| Metric | Type | Description |
|--------|------|-------------|
| `analysis_jobs_total` | Counter | Total number of analysis jobs |
| `analysis_jobs_active` | Gauge | Currently active analysis jobs |
| `analysis_processing_time` | Histogram | Analysis processing time distribution |
| `analysis_issues_detected` | Counter | Total issues detected |
| `analysis_issues_by_severity` | Gauge | Issues grouped by severity |
| `analysis_score_distribution` | Histogram | Distribution of SEO scores |
| `analysis_rule_execution_time` | Histogram | Time to execute each rule |
| `analysis_memory_usage` | Gauge | Memory usage of analysis process |

### Health Checks

The Analysis Engine provides the following health check endpoints:

- `/health/liveness`: Indicates if the service is running
- `/health/readiness`: Indicates if the service is ready to accept requests
- `/health/dependencies`: Checks the status of dependencies (MongoDB, Redis)

## Testing

### Unit Tests

Unit tests cover the following components:
- Rule Engine
- Prioritization Algorithm
- Fix Strategy Generator
- Content Analysis Functions
- Schema Validation Logic

### Integration Tests

Integration tests verify:
- Database interactions
- Event publishing
- Rule application pipeline
- Scoring algorithms

### End-to-End Tests

End-to-end tests validate:
- Complete analysis workflow
- Multi-rule application
- Issue detection accuracy
- Fix strategy generation

### Rule Tests

Specific tests for rule categories:
- Meta tag rules
- Content rules
- Performance rules
- Mobile optimization rules
- Schema validation rules

## Performance

### Optimization Techniques

1. **Parallel Rule Processing**: Apply multiple rules concurrently
2. **Rule Categorization**: Group rules for more efficient processing
3. **Incremental Analysis**: Only analyze changed pages when possible
4. **Data Caching**: Cache frequently accessed reference data
5. **Result Streaming**: Process and store results in streams rather than memory
6. **Custom Indexes**: Optimized database indexes for query performance

### Performance Benchmarks

| Metric | Value |
|--------|-------|
| Time to analyze 1,000 page site | ~5 minutes |
| Memory usage per analysis job | ~500MB |
| CPU usage per analysis job | ~1.5 cores |
| Maximum site size (standard config) | 50,000 pages |
| Rule execution rate | ~100 rules/second |

## Security

### Protection Measures

1. **Input Validation**: All input parameters validated
2. **Rate Limiting**: Prevents excessive API requests
3. **Data Isolation**: Analysis data segregated by client
4. **Access Control**: API endpoints protected by authentication
5. **Secure Rule Execution**: Sandboxed rule execution environment
6. **Audit Logging**: All analysis operations logged

## Development

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/organization/SEOAutomate.git

# Navigate to the analysis engine directory
cd SEOAutomate/automation/analysis

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Code Structure

```
/automation/analysis/
├── index.js                 # Entry point
├── controllers/             # API controllers
├── services/                # Business logic
│   ├── analysis.js          # Analysis orchestration
│   ├── rule-engine.js       # Rule application
│   ├── prioritization.js    # Issue prioritization
│   ├── fix-strategies.js    # Fix strategy generation
│   ├── content-analyzer.js  # Content analysis
│   └── schema-validator.js  # Schema validation
├── models/                  # Data models
├── rules/                   # SEO rule definitions
│   ├── core/                # Core SEO rules
│   ├── mobile/              # Mobile optimization rules
│   ├── performance/         # Performance rules
│   ├── content/             # Content quality rules
│   └── schema/              # Structured data rules
├── utils/                   # Utility functions
├── config/                  # Configuration
└── tests/                   # Test suite
```

### Rule Development

Rules are defined using a declarative syntax:

```javascript
module.exports = {
  id: "missing-meta-description",
  name: "Missing Meta Description",
  description: "Identifies pages without a meta description",
  category: "core",
  severity: "high",
  impact: 0.7,
  effort: 0.2,
  
  // Function to detect the issue
  detect: function(page, site) {
    return !page.metaTags.some(tag => 
      tag.name === "description" && tag.content && tag.content.length > 0
    );
  },
  
  // Function to generate a fix
  fix: function(page, site) {
    return {
      type: "meta",
      action: "add",
      name: "description",
      content: `${page.title} - Learn more about ${site.name}'s offerings.`
    };
  }
};
```

### Adding New Rules

1. Create a new rule file in the appropriate category directory
2. Define the rule using the standard rule format
3. Add unit tests in the corresponding test directory
4. Register the rule in the rule registry
5. Update documentation if needed

## Troubleshooting

### Common Issues

1. **High Memory Usage**: 
   - Reduce batch size for large sites
   - Optimize rule execution order
   - Enable incremental analysis

2. **Slow Analysis**:
   - Check database performance
   - Optimize rule execution
   - Disable resource-intensive rules
   - Use rule categorization to focus analysis

3. **False Positives**:
   - Adjust rule sensitivity
   - Update rule logic to handle edge cases
   - Add exceptions for specific patterns

4. **Database Performance**:
   - Verify indexes are properly set up
   - Check for slow queries
   - Optimize data access patterns

### Debugging

Enable debug logging:

```
export DEBUG=seoautomate:analysis:*
npm run start
```

## Future Enhancements

The following enhancements are planned for future versions:

1. **Machine Learning-Based Analysis**: Incorporate ML models for more intelligent issue detection
2. **Natural Language Processing**: Enhance content analysis with NLP capabilities
3. **Competitor Analysis Integration**: Compare SEO metrics with competitors
4. **Predictive Impact Analysis**: Predict the impact of implementing fixes
5. **Custom Rule Builder**: UI-based rule creation for client-specific needs
6. **Industry-Specific Rule Sets**: Tailored rules for different verticals
7. **Historical Trend Analysis**: Enhanced trend visualization and prediction
8. **A/B Test Integration**: Integrate with A/B testing to measure SEO impact
