# SEO.engineering: Technical SEO Module

This module provides comprehensive technical SEO audit capabilities for the SEO.engineering platform. It performs in-depth analysis of websites to identify technical issues that may affect search engine rankings and provides actionable recommendations for improvement.

## Features

- **Page Speed Analysis**: Evaluates loading performance using Core Web Vitals and other metrics
- **Mobile Responsiveness Checking**: Tests compatibility with mobile devices
- **Meta Tag Validation**: Analyzes SEO-critical meta tags for best practices
- **Schema Markup Checking**: Validates structured data implementation
- **SSL Verification**: Checks security configuration and certificate status
- **Crawlability Analysis**: Evaluates how search engines can access your content
- **Content Quality Assessment**: Analyzes content for technical quality issues
- **URL Structure Validation**: Assesses URL formatting and best practices
- **Site Architecture Analysis**: Evaluates website structure for SEO optimization
- **International SEO Checking**: Tests multi-language and multi-region configuration

## Installation

```bash
cd SEO.engineering/automation/technical-seo
npm install
```

## Usage

```javascript
const { runTechnicalSeoAudit, generateReport } = require('./automation/technical-seo');

// Run a technical SEO audit
async function auditWebsite() {
  try {
    // Run the audit
    const auditResults = await runTechnicalSeoAudit('https://example.com', {
      maxPages: 100,
      checks: {
        pageSpeed: true,
        mobileResponsiveness: true,
        metaTags: true,
        schemaMarkup: true,
        ssl: true,
        crawlability: true,
        contentQuality: true,
        urlStructure: true,
        siteArchitecture: true,
        internationalSeo: false
      }
    });
    
    // Generate a report
    const report = generateReport(auditResults, {
      format: 'json',
      includeRecommendations: true,
      detailLevel: 'detailed'
    });
    
    console.log(`Overall SEO score: ${report.scores.overall}/100`);
    console.log(`Found ${report.issues.length} issues`);
    
    return report;
  } catch (error) {
    console.error('Audit failed:', error);
  }
}
```

## Configuration Options

### Audit Options

- **maxPages**: Maximum number of pages to scan (default: 100)
- **userAgent**: Custom user agent for the crawler (default: 'SEO.engineering/1.0')
- **includeSubdomains**: Whether to include subdomains in the crawl (default: false)
- **checkExternal**: Whether to check external links (default: false)
- **depth**: Maximum crawl depth (default: 3)
- **timeout**: Timeout for each page in milliseconds (default: 30000)
- **checks**: Object specifying which checks to run

### Report Options

- **format**: Report format ('json', 'html') (default: 'json')
- **includeRecommendations**: Whether to include recommendations (default: true)
- **detailLevel**: Level of detail ('summary', 'detailed', 'comprehensive') (default: 'detailed')
- **groupBy**: How to group issues ('category', 'page', 'severity') (default: 'category')
- **maxIssues**: Maximum number of issues to include (default: 1000)

## Technical Requirements

- Node.js 14 or higher
- Playwright for browser automation
- Internet access for external checks

## Testing

```bash
npm test
```

## Architecture

The module follows a modular structure with specialized analyzers for each aspect of technical SEO. The main components are:

- **Analyzers**: Specialized tools for each type of SEO check
- **Utils**: Shared utility functions for scoring, prioritization, etc.
- **Reporting**: Report generation tools

## Integration

This module integrates with the core SEO.engineering platform through a simple API. It can be used standalone or as part of the larger automation workflow.
