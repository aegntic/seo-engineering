# Broken Link Identifier

## Overview

The Broken Link Identifier module analyzes websites for broken internal and external links that negatively impact user experience and search engine optimization. It provides comprehensive detection, reporting, and actionable recommendations for fixing broken links.

## Key Features

- Detection of broken internal and external links
- HTTP status code tracking and categorization
- Comprehensive reporting on broken link distribution
- Automatic fix generation for internal links
- Detailed issue reporting with severity assessment
- Advanced scoring algorithm based on link importance

## How It Works

1. **Browser Initialization**: Launches a Playwright browser instance to analyze the target URL
2. **Link Extraction**: Extracts all links from the page and categorizes them as internal or external
3. **Link Checking**: Tests each link by sending HTTP requests and analyzing responses
4. **Status Code Analysis**: Categorizes links by HTTP status codes for detailed reporting
5. **Issue Generation**: Converts broken links into actionable SEO issues based on severity
6. **Fix Strategy Generation**: Creates specific fix strategies for internal broken links
7. **Scoring**: Calculates a score based on broken link severity and frequency

## Usage

```javascript
const BrokenLinkIdentifier = require('./analyzers/broken-link-identifier');

// Run the identifier on a specific URL
const results = await BrokenLinkIdentifier.identify('https://example.com', {
  concurrentChecks: 5,       // Optional: number of concurrent link checks
  linkCheckTimeout: 10000,   // Optional: timeout for each link check in ms
  timeout: 30000             // Optional: navigation timeout in ms
});

// Access results
console.log(`Score: ${results.score}/100`);
console.log(`Total Links: ${results.metrics.totalLinks}`);
console.log(`Broken Links: ${results.metrics.brokenLinks}`);
```

## Integration with SEO.engineering

The Broken Link Identifier is fully integrated with the Technical SEO module in SEO.engineering. When enabled, it will:

1. Run as part of the comprehensive technical SEO audit
2. Contribute issues to the overall issue list
3. Add its score to the overall technical SEO score
4. Provide summary information for the report

To enable/disable it in a technical SEO audit, use:

```javascript
const { runTechnicalSeoAudit } = require('../technical-seo');

const results = await runTechnicalSeoAudit('https://example.com', {
  checks: {
    brokenLinks: true  // Enable broken link identification
  }
});
```

## Testing

A dedicated test script is available in the tests directory:

```bash
node tests/test-broken-link-identifier.js https://example.com 5
```

The test script will run the identifier and save detailed results to the test-results directory. The second parameter (5) specifies the number of concurrent link checks.

## HTTP Status Code Categorization

The identifier categorizes links based on these common HTTP status codes:

- **400 Bad Request**: Client sent a malformed request
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Server refuses to authorize the request
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error
- **502 Bad Gateway**: Invalid response from an upstream server
- **503 Service Unavailable**: Server temporarily unavailable
- **504 Gateway Timeout**: Server timeout
- **0 Connection Failed**: Network connection failed

## Fix Strategies

For internal broken links, the module generates specific fix strategies:

### 404 Not Found
- Implement 301 redirects to relevant pages
- Create new pages at the requested URLs
- Update links to point to valid pages

### 500-level Server Errors
- Check server logs for specific errors
- Investigate application code issues
- Suggest temporary link alternatives

### Permission Errors (401/403)
- Update resource permissions
- Move content to publicly accessible locations
- Replace with alternative public resources

## Future Enhancements

- Recursive crawling for site-wide broken link detection
- Historical tracking of broken links over time
- Automatic implementation of redirects for common 404s
- AI-driven suggestions for alternative content
- Competitor broken link analysis for opportunity detection
