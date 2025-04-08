# SEO.engineering API Interfaces

This document provides detailed specifications for all API interfaces between SEO.engineering modules, including endpoints, request/response formats, and authentication requirements.

## Authentication

All internal API endpoints use JWT-based authentication with the following header:

```
Authorization: Bearer <token>
```

### Token Structure

```json
{
  "sub": "user_id or system_id",
  "role": "user|admin|system",
  "permissions": ["permission1", "permission2"],
  "siteIds": ["site_id1", "site_id2"],
  "exp": 1672531200,
  "iat": 1672444800
}
```

### System Tokens

For module-to-module communication, system tokens with specific capabilities are used:
- `crawler_token`: Limited to crawler API access
- `analysis_token`: Limited to analysis API access
- `implementation_token`: Limited to implementation API access
- `verification_token`: Limited to verification API access

## API Versioning

All endpoints are versioned with the format:

```
/api/v{version_number}/{endpoint}
```

Current version: `v1`

## Crawler Module API

### Initiate Crawl

```
POST /api/v1/crawler/sites/{siteId}/crawl
```

#### Request

```json
{
  "depth": 3,
  "maxPages": 1000,
  "includeMobile": true,
  "includeScreenshots": true,
  "userAgent": "Mozilla/5.0...",
  "followRobotsTxt": true,
  "crawlJavaScript": true,
  "ignorePatterns": [
    "/admin/*",
    "*/thank-you"
  ]
}
```

#### Response

```json
{
  "success": true,
  "crawlId": "crl_12345",
  "siteId": "site_12345",
  "status": "initiated",
  "estimatedTime": 120,
  "timestamp": "2023-01-01T12:00:00Z"
}
```

### Get Crawl Status

```
GET /api/v1/crawler/crawls/{crawlId}/status
```

#### Response

```json
{
  "crawlId": "crl_12345",
  "siteId": "site_12345",
  "status": "in_progress",
  "startTime": "2023-01-01T12:00:00Z",
  "currentTime": "2023-01-01T12:05:00Z",
  "progress": {
    "pagesScanned": 250,
    "totalPages": 1000,
    "percentComplete": 25,
    "currentUrl": "https://example.com/products/category-1"
  }
}
```

### Get Crawl Results

```
GET /api/v1/crawler/crawls/{crawlId}/results
```

#### Response

```json
{
  "crawlId": "crl_12345",
  "siteId": "site_12345",
  "status": "completed",
  "startTime": "2023-01-01T12:00:00Z",
  "endTime": "2023-01-01T12:30:00Z",
  "summary": {
    "totalPages": 1000,
    "totalAssets": 5432,
    "totalErrors": 27,
    "averagePageLoadTime": 1.25,
    "averagePageSize": 1560240
  },
  "pages": [
    {
      "url": "https://example.com/",
      "title": "Example Site",
      "statusCode": 200,
      "loadTime": 0.87,
      "hasIssues": true
    }
  ],
  "nextPageToken": "token123"
}
```

### Cancel Crawl

```
POST /api/v1/crawler/crawls/{crawlId}/cancel
```

#### Response

```json
{
  "success": true,
  "crawlId": "crl_12345",
  "siteId": "site_12345",
  "status": "cancelled",
  "timestamp": "2023-01-01T12:15:00Z"
}
```

## Analysis Engine API

### Initiate Analysis

```
POST /api/v1/analysis/sites/{siteId}/analyze
```

#### Request

```json
{
  "crawlId": "crl_12345",
  "prioritize": ["performance", "meta_tags", "schema_markup"],
  "includeDomainAuthority": true,
  "includeCompetitorAnalysis": false,
  "competitors": ["competitor1.com", "competitor2.com"]
}
```

#### Response

```json
{
  "success": true,
  "analysisId": "anl_12345",
  "siteId": "site_12345",
  "crawlId": "crl_12345",
  "status": "initiated",
  "estimatedTime": 60,
  "timestamp": "2023-01-01T12:35:00Z"
}
```

### Get Analysis Status

```
GET /api/v1/analysis/analyses/{analysisId}/status
```

#### Response

```json
{
  "analysisId": "anl_12345",
  "siteId": "site_12345",
  "crawlId": "crl_12345",
  "status": "in_progress",
  "startTime": "2023-01-01T12:35:00Z",
  "currentTime": "2023-01-01T12:40:00Z",
  "progress": {
    "pagesAnalyzed": 250,
    "totalPages": 1000,
    "percentComplete": 25,
    "currentStage": "meta_tag_analysis"
  }
}
```

### Get Analysis Results

```
GET /api/v1/analysis/analyses/{analysisId}/results
```

#### Response

```json
{
  "analysisId": "anl_12345",
  "siteId": "site_12345",
  "crawlId": "crl_12345",
  "status": "completed",
  "startTime": "2023-01-01T12:35:00Z",
  "endTime": "2023-01-01T13:00:00Z",
  "summary": {
    "seoScore": 78,
    "totalIssues": 143,
    "criticalIssues": 12,
    "highPriorityIssues": 35,
    "mediumPriorityIssues": 56,
    "lowPriorityIssues": 40,
    "autoFixableIssues": 87
  },
  "issueCategories": [
    {
      "category": "meta_tags",
      "count": 45,
      "score": 65,
      "criticalCount": 5
    },
    {
      "category": "performance",
      "count": 28,
      "score": 72,
      "criticalCount": 3
    }
  ],
  "topIssues": [
    {
      "issueId": "iss_12345",
      "type": "missing_meta_description",
      "severity": 4,
      "priority": 9,
      "affectedPages": 87,
      "fixable": true
    }
  ],
  "nextPageToken": "token123"
}
```

### Get Issue Details

```
GET /api/v1/analysis/issues/{issueId}
```

#### Response

```json
{
  "issueId": "iss_12345",
  "analysisId": "anl_12345",
  "siteId": "site_12345",
  "type": "missing_meta_description",
  "category": "meta_tags",
  "severity": 4,
  "priority": 9,
  "description": "Missing meta description tags",
  "impact": "Reduces click-through rate from search results",
  "recommendation": "Add descriptive meta description tags",
  "urls": [
    "https://example.com/page1",
    "https://example.com/page2"
  ],
  "fixStrategy": {
    "type": "auto",
    "template": "add_meta_description",
    "parameters": {
      "generateFrom": "first_paragraph",
      "maxLength": 160
    }
  }
}
```

## Implementation Module API

### Initiate Fix Implementation

```
POST /api/v1/implementation/sites/{siteId}/fixes
```

#### Request

```json
{
  "analysisId": "anl_12345",
  "issueIds": ["iss_12345", "iss_12346"],
  "batchName": "Meta Tag Fixes",
  "description": "Fix missing meta descriptions and titles",
  "dryRun": false,
  "approvalRequired": true
}
```

#### Response

```json
{
  "success": true,
  "implementationId": "imp_12345",
  "siteId": "site_12345",
  "analysisId": "anl_12345",
  "batchId": "batch_12345",
  "status": "initiated",
  "estimatedTime": 45,
  "timestamp": "2023-01-01T14:00:00Z"
}
```

### Get Implementation Status

```
GET /api/v1/implementation/implementations/{implementationId}/status
```

#### Response

```json
{
  "implementationId": "imp_12345",
  "siteId": "site_12345",
  "analysisId": "anl_12345",
  "batchId": "batch_12345",
  "status": "in_progress",
  "startTime": "2023-01-01T14:00:00Z",
  "currentTime": "2023-01-01T14:10:00Z",
  "progress": {
    "fixesImplemented": 15,
    "totalFixes": 50,
    "percentComplete": 30,
    "currentIssue": "iss_12360"
  }
}
```

### Approve Fixes

```
POST /api/v1/implementation/implementations/{implementationId}/approve
```

#### Request

```json
{
  "fixIds": ["fix_12345", "fix_12346"],
  "comment": "Approved all meta tag fixes"
}
```

#### Response

```json
{
  "success": true,
  "implementationId": "imp_12345",
  "siteId": "site_12345",
  "status": "approved",
  "approvedFixesCount": 2,
  "timestamp": "2023-01-01T14:30:00Z"
}
```

### Reject Fixes

```
POST /api/v1/implementation/implementations/{implementationId}/reject
```

#### Request

```json
{
  "fixIds": ["fix_12347"],
  "reason": "Content doesn't match brand guidelines",
  "feedback": "Please use product descriptions from the catalog"
}
```

#### Response

```json
{
  "success": true,
  "implementationId": "imp_12345",
  "siteId": "site_12345",
  "status": "partially_rejected",
  "rejectedFixesCount": 1,
  "timestamp": "2023-01-01T14:35:00Z"
}
```

### Get Implementation Results

```
GET /api/v1/implementation/implementations/{implementationId}/results
```

#### Response

```json
{
  "implementationId": "imp_12345",
  "siteId": "site_12345",
  "analysisId": "anl_12345",
  "batchId": "batch_12345",
  "status": "completed",
  "startTime": "2023-01-01T14:00:00Z",
  "endTime": "2023-01-01T14:45:00Z",
  "summary": {
    "totalFixes": 50,
    "successfulFixes": 48,
    "failedFixes": 1,
    "pendingApproval": 0,
    "rejected": 1
  },
  "fixes": [
    {
      "fixId": "fix_12345",
      "issueId": "iss_12345",
      "url": "https://example.com/page1",
      "type": "meta_description",
      "before": null,
      "after": "Example Company offers premium products for all your needs. Browse our selection of high-quality items.",
      "status": "success",
      "commitHash": "a1b2c3d4"
    }
  ],
  "nextPageToken": "token123"
}
```

### Rollback Fixes

```
POST /api/v1/implementation/implementations/{implementationId}/rollback
```

#### Request

```json
{
  "reason": "Client requested rollback",
  "comment": "New content strategy being implemented"
}
```

#### Response

```json
{
  "success": true,
  "implementationId": "imp_12345",
  "siteId": "site_12345",
  "status": "rolled_back",
  "rollbackId": "rb_12345",
  "timestamp": "2023-01-02T10:00:00Z"
}
```

## Verification System API

### Initiate Verification

```
POST /api/v1/verification/sites/{siteId}/verify
```

#### Request

```json
{
  "implementationId": "imp_12345",
  "verifyAll": true,
  "includePerformance": true,
  "includeScreenshots": true,
  "waitTime": 3600
}
```

#### Response

```json
{
  "success": true,
  "verificationId": "ver_12345",
  "siteId": "site_12345",
  "implementationId": "imp_12345",
  "status": "initiated",
  "estimatedTime": 60,
  "timestamp": "2023-01-01T15:00:00Z"
}
```

### Get Verification Status

```
GET /api/v1/verification/verifications/{verificationId}/status
```

#### Response

```json
{
  "verificationId": "ver_12345",
  "siteId": "site_12345",
  "implementationId": "imp_12345",
  "status": "in_progress",
  "startTime": "2023-01-01T15:00:00Z",
  "currentTime": "2023-01-01T15:15:00Z",
  "progress": {
    "fixesVerified": 25,
    "totalFixes": 48,
    "percentComplete": 52,
    "currentFix": "fix_12360"
  }
}
```

### Get Verification Results

```
GET /api/v1/verification/verifications/{verificationId}/results
```

#### Response

```json
{
  "verificationId": "ver_12345",
  "siteId": "site_12345",
  "implementationId": "imp_12345",
  "status": "completed",
  "startTime": "2023-01-01T15:00:00Z",
  "endTime": "2023-01-01T16:00:00Z",
  "summary": {
    "totalVerifications": 48,
    "successful": 47,
    "failed": 1,
    "performance": {
      "beforeSeoScore": 78,
      "afterSeoScore": 86,
      "improvement": 8,
      "beforeLoadTime": 2.5,
      "afterLoadTime": 1.8,
      "timeImprovement": 0.7
    }
  },
  "verifications": [
    {
      "verificationId": "vrf_12345",
      "fixId": "fix_12345",
      "issueId": "iss_12345",
      "url": "https://example.com/page1",
      "type": "meta_description",
      "status": "verified",
      "beforeScreenshot": "https://storage.example.com/screenshots/before_12345.png",
      "afterScreenshot": "https://storage.example.com/screenshots/after_12345.png"
    }
  ],
  "nextPageToken": "token123"
}
```

## Git Integration API

### Initialize Repository

```
POST /api/v1/git/sites/{siteId}/initialize
```

#### Request

```json
{
  "repoUrl": "https://github.com/example/site.git",
  "branch": "main",
  "credentials": {
    "type": "ssh_key",
    "keyId": "key_12345"
  }
}
```

#### Response

```json
{
  "success": true,
  "siteId": "site_12345",
  "repoInitialized": true,
  "defaultBranch": "main",
  "timestamp": "2023-01-01T10:00:00Z"
}
```

### Create Change Batch

```
POST /api/v1/git/sites/{siteId}/batches
```

#### Request

```json
{
  "name": "SEO Meta Fixes",
  "description": "Fix missing meta descriptions and titles",
  "baseBranch": "main"
}
```

#### Response

```json
{
  "success": true,
  "siteId": "site_12345",
  "batchId": "batch_12345",
  "branchName": "seo-fix-batch_12345",
  "timestamp": "2023-01-01T14:05:00Z"
}
```

### Record Change

```
POST /api/v1/git/sites/{siteId}/batches/{batchId}/changes
```

#### Request

```json
{
  "filePath": "index.html",
  "changeType": "meta_tag",
  "metadata": {
    "tag": "description",
    "before": null,
    "after": "Example Company offers premium products for all your needs."
  }
}
```

#### Response

```json
{
  "success": true,
  "siteId": "site_12345",
  "batchId": "batch_12345",
  "changeId": "chg_12345",
  "filePath": "index.html",
  "commitHash": "a1b2c3d4",
  "timestamp": "2023-01-01T14:10:00Z"
}
```

### Finalize Batch

```
POST /api/v1/git/sites/{siteId}/batches/{batchId}/finalize
```

#### Request

```json
{
  "approved": true,
  "comment": "All meta tag changes implemented successfully"
}
```

#### Response

```json
{
  "success": true,
  "siteId": "site_12345",
  "batchId": "batch_12345",
  "status": "completed",
  "mergeCommit": "e5f6g7h8",
  "timestamp": "2023-01-01T14:45:00Z"
}
```

### Get Change History

```
GET /api/v1/git/sites/{siteId}/history
```

#### Response

```json
{
  "siteId": "site_12345",
  "batches": [
    {
      "batchId": "batch_12345",
      "branchName": "seo-fix-batch_12345",
      "description": "Fix missing meta descriptions and titles",
      "status": "completed",
      "startTime": "2023-01-01T14:05:00Z",
      "endTime": "2023-01-01T14:45:00Z",
      "changeCount": 48,
      "mergeCommit": "e5f6g7h8"
    }
  ],
  "changes": [
    {
      "changeId": "chg_12345",
      "batchId": "batch_12345",
      "filePath": "index.html",
      "changeType": "meta_tag",
      "commitHash": "a1b2c3d4",
      "timestamp": "2023-01-01T14:10:00Z",
      "metadata": {
        "tag": "description",
        "before": null,
        "after": "Example Company offers premium products for all your needs."
      }
    }
  ],
  "nextPageToken": "token123"
}
```

### Rollback Batch

```
POST /api/v1/git/sites/{siteId}/batches/{batchId}/rollback
```

#### Request

```json
{
  "reason": "Client requested rollback",
  "comment": "New content strategy being implemented"
}
```

#### Response

```json
{
  "success": true,
  "siteId": "site_12345",
  "batchId": "batch_12345",
  "status": "rolled_back",
  "rollbackCommit": "i9j0k1l2",
  "timestamp": "2023-01-02T10:00:00Z"
}
```

## Client Dashboard API

### Get Site Overview

```
GET /api/v1/dashboard/sites/{siteId}/overview
```

#### Response

```json
{
  "siteId": "site_12345",
  "url": "https://example.com",
  "status": "active",
  "seoScore": 86,
  "lastScan": "2023-01-01T12:00:00Z",
  "summary": {
    "totalIssues": 95,
    "issuesFixed": 48,
    "issuesPending": 47,
    "performanceScore": 85,
    "mobileScore": 78,
    "bestPracticesScore": 92,
    "seoImprovements": 8
  },
  "recentActivity": [
    {
      "type": "scan_completed",
      "timestamp": "2023-01-01T12:30:00Z",
      "details": {
        "crawlId": "crl_12345",
        "pagesScanned": 1000
      }
    },
    {
      "type": "fixes_implemented",
      "timestamp": "2023-01-01T14:45:00Z",
      "details": {
        "implementationId": "imp_12345",
        "fixesCount": 48
      }
    }
  ]
}
```

### Get Issues List

```
GET /api/v1/dashboard/sites/{siteId}/issues
```

#### Query Parameters

- `status`: Filter issues by status (open, fixed, pending)
- `priority`: Filter issues by priority (critical, high, medium, low)
- `category`: Filter issues by category (meta_tags, performance, etc.)
- `page`: Page number for pagination
- `limit`: Number of issues per page

#### Response

```json
{
  "siteId": "site_12345",
  "totalIssues": 143,
  "filteredIssues": 35,
  "issues": [
    {
      "issueId": "iss_12345",
      "type": "missing_meta_description",
      "category": "meta_tags",
      "severity": 4,
      "priority": "high",
      "status": "fixed",
      "detectedDate": "2023-01-01T12:30:00Z",
      "fixedDate": "2023-01-01T14:45:00Z",
      "affectedPages": 87,
      "sampleUrl": "https://example.com/page1"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 35,
    "pages": 4
  }
}
```

### Get Performance Metrics

```
GET /api/v1/dashboard/sites/{siteId}/performance
```

#### Query Parameters

- `period`: Time period (day, week, month, year)
- `metrics`: Specific metrics to include

#### Response

```json
{
  "siteId": "site_12345",
  "period": "month",
  "startDate": "2022-12-01T00:00:00Z",
  "endDate": "2023-01-01T00:00:00Z",
  "metrics": {
    "seoScore": {
      "current": 86,
      "previous": 78,
      "change": 8,
      "history": [
        { "date": "2022-12-01", "value": 78 },
        { "date": "2022-12-08", "value": 80 },
        { "date": "2022-12-15", "value": 82 },
        { "date": "2022-12-22", "value": 84 },
        { "date": "2023-01-01", "value": 86 }
      ]
    },
    "pageSpeed": {
      "current": 85,
      "previous": 72,
      "change": 13,
      "history": [
        { "date": "2022-12-01", "value": 72 },
        { "date": "2022-12-08", "value": 75 },
        { "date": "2022-12-15", "value": 78 },
        { "date": "2022-12-22", "value": 82 },
        { "date": "2023-01-01", "value": 85 }
      ]
    },
    "organicTraffic": {
      "current": 15420,
      "previous": 12500,
      "change": 2920,
      "history": [
        { "date": "2022-12-01", "value": 12500 },
        { "date": "2022-12-08", "value": 13200 },
        { "date": "2022-12-15", "value": 14100 },
        { "date": "2022-12-22", "value": 14800 },
        { "date": "2023-01-01", "value": 15420 }
      ]
    }
  }
}
```

### Get Fix Details

```
GET /api/v1/dashboard/sites/{siteId}/fixes/{fixId}
```

#### Response

```json
{
  "fixId": "fix_12345",
  "siteId": "site_12345",
  "issueId": "iss_12345",
  "implementationId": "imp_12345",
  "batchId": "batch_12345",
  "url": "https://example.com/page1",
  "type": "meta_description",
  "status": "success",
  "appliedDate": "2023-01-01T14:30:00Z",
  "before": null,
  "after": "Example Company offers premium products for all your needs. Browse our selection of high-quality items.",
  "commitHash": "a1b2c3d4",
  "verificationStatus": "verified",
  "verification": {
    "verificationId": "vrf_12345",
    "status": "verified",
    "verifiedDate": "2023-01-01T15:30:00Z",
    "beforeScreenshot": "https://storage.example.com/screenshots/before_12345.png",
    "afterScreenshot": "https://storage.example.com/screenshots/after_12345.png",
    "performanceImpact": {
      "before": {
        "loadTime": 2.1
      },
      "after": {
        "loadTime": 2.0
      },
      "change": {
        "loadTime": -0.1
      }
    }
  }
}
```

## Cross-Module Event System

In addition to the REST APIs above, modules communicate through an event system using a message queue. The following events are defined:

### Event Structure

```json
{
  "eventId": "evt_12345",
  "type": "event_type",
  "source": "module_name",
  "timestamp": "2023-01-01T12:00:00Z",
  "data": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

### Crawler Events

- `crawl.started`: Emitted when a crawl begins
- `crawl.progress`: Emitted periodically during crawl
- `crawl.completed`: Emitted when a crawl finishes
- `crawl.failed`: Emitted if a crawl fails
- `crawl.cancelled`: Emitted if a crawl is cancelled

### Analysis Events

- `analysis.started`: Emitted when analysis begins
- `analysis.progress`: Emitted periodically during analysis
- `analysis.completed`: Emitted when analysis finishes
- `analysis.failed`: Emitted if analysis fails
- `issue.detected`: Emitted for each issue found

### Implementation Events

- `implementation.started`: Emitted when implementation begins
- `implementation.progress`: Emitted periodically during implementation
- `implementation.completed`: Emitted when implementation finishes
- `implementation.failed`: Emitted if implementation fails
- `fix.applied`: Emitted for each fix applied
- `fix.approval.needed`: Emitted when a fix needs approval
- `fix.approved`: Emitted when a fix is approved
- `fix.rejected`: Emitted when a fix is rejected

### Verification Events

- `verification.started`: Emitted when verification begins
- `verification.progress`: Emitted periodically during verification
- `verification.completed`: Emitted when verification finishes
- `verification.failed`: Emitted if verification fails
- `fix.verified`: Emitted when a fix is verified
- `fix.verification.failed`: Emitted when a fix verification fails
- `regression.detected`: Emitted when a regression is detected

### Dashboard Events

- `user.login`: Emitted when a user logs in
- `user.logout`: Emitted when a user logs out
- `user.action`: Emitted when a user performs an action
- `notification.created`: Emitted when a notification is created
- `report.generated`: Emitted when a report is generated

## Error Handling

All APIs follow a standard error response format:

```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      "key1": "value1",
      "key2": "value2"
    }
  },
  "requestId": "req_12345",
  "timestamp": "2023-01-01T12:00:00Z"
}
```

### Common Error Codes

- `authentication_error`: Authentication failed
- `authorization_error`: Insufficient permissions
- `validation_error`: Invalid request parameters
- `resource_not_found`: Requested resource doesn't exist
- `resource_conflict`: Resource already exists
- `internal_error`: Internal server error
- `service_unavailable`: Service temporarily unavailable
- `rate_limit_exceeded`: Too many requests

## Rate Limiting

API rate limits are applied as follows:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1672531200
```

When rate limits are exceeded, a `429 Too Many Requests` response is returned.

## API Versioning Strategy

1. **Minor Changes**: Backwards-compatible changes are made without a version change
2. **Major Changes**: Breaking changes are introduced with a new version number
3. **Deprecation**: Old versions are supported for at least 6 months after a new version is released
4. **Sunset**: Deprecated versions eventually become unavailable

## Webhook System

In addition to the event system, SEO.engineering provides webhooks for integration with external systems:

```
POST /api/v1/webhooks
```

```json
{
  "url": "https://client-system.example.com/webhook",
  "events": ["crawl.completed", "implementation.completed"],
  "secret": "webhook_secret",
  "siteIds": ["site_12345"]
}
```

Webhook payloads follow the same format as events, with an added HMAC signature header for verification.

## API Documentation Generation

This API documentation is maintained as code alongside the implementation, using OpenAPI 3.0 specifications. The full OpenAPI specification is available at:

```
/api/v1/swagger.json
```

Interactive documentation is available through Swagger UI at:

```
/api-docs
```

## Conclusion

This document provides a comprehensive overview of the API interfaces between SEO.engineering modules. Any changes to these interfaces should be carefully managed to maintain compatibility and should follow the versioning strategy outlined above.
