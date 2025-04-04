# SEOAutomate Competitor Analysis Module

## Overview

The Competitor Analysis Module is a powerful component of the SEOAutomate platform that analyzes competitor websites to identify gaps and opportunities for SEO improvements. By crawling and analyzing competitor sites, this module provides valuable insights into their performance, content strategy, and SEO practices.

## Features

- **Competitive Crawling**: Efficiently crawl competitor websites to gather comprehensive data
- **Performance Analysis**: Analyze page load times, DOM rendering, and other performance metrics
- **Content Analysis**: Evaluate content structure, headings, and keyword usage
- **SEO Health Assessment**: Identify strengths and weaknesses in competitors' SEO implementation
- **Keyword Analysis**: Discover important keywords used by competitors
- **Gap Analysis**: Compare client site to competitors to find opportunities for improvement
- **Comprehensive Reporting**: Generate detailed reports with actionable insights

## Installation

```bash
cd automation/competitor-analysis
npm install
```

## Usage

### Command Line Interface

The module includes a CLI for running competitor analysis directly:

```bash
# Basic usage
node cli.js --competitor https://example.com --client https://mysite.com

# Multiple competitors
node cli.js --competitor https://example1.com --competitor https://example2.com

# With keywords
node cli.js --competitor https://example.com --keyword "important term" --keyword "another keyword"

# Load from files
node cli.js --competitors competitors.txt --keywords keywords.txt

# Advanced options
node cli.js --competitor https://example.com --max-pages 100 --concurrency 4 --depth 3
```

### Programmatic Usage

```javascript
const { initialize } = require('./index');

// Initialize the module
const competitorAnalysis = initialize();

// Run an analysis
const job = await competitorAnalysis.analyzeCompetitors({
  competitors: ['https://example.com', 'https://anothersite.com'],
  clientSiteUrl: 'https://mysite.com',
  keywords: ['important keyword', 'another term']
});

// Check job status
const status = await competitorAnalysis.getAnalysisStatus(job.jobId);

// Get results when complete
if (status.status === 'completed') {
  const results = await competitorAnalysis.getAnalysisResults(job.jobId);
  console.log(results);
}

// Clean up
await competitorAnalysis.close();
```

### Integration with Express

```javascript
const express = require('express');
const { initialize } = require('./index');

const app = express();
app.use(express.json());

// Initialize and register routes
initialize(app);

// The module registers these endpoints:
// POST /api/competitor-analysis/analyze
// GET /api/competitor-analysis/status/:jobId
// GET /api/competitor-analysis/results/:jobId

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## API Endpoints

### POST /api/competitor-analysis/analyze

Start a competitor analysis job.

**Request:**
```json
{
  "competitors": ["https://example.com", "https://anothersite.com"],
  "clientSiteUrl": "https://mysite.com",
  "keywords": ["important keyword", "another term"],
  "crawlerOptions": {
    "maxPagesPerCompetitor": 50,
    "maxConcurrency": 2,
    "maxDepth": 2
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Analysis job started",
  "jobId": "1649868123456-1"
}
```

### GET /api/competitor-analysis/status/:jobId

Check the status of an analysis job.

**Response:**
```json
{
  "success": true,
  "status": {
    "id": "1649868123456-1",
    "status": "crawling",
    "progress": {
      "total": 2,
      "completed": 1,
      "failed": 0
    },
    "startTime": 1649868123456
  }
}
```

### GET /api/competitor-analysis/results/:jobId

Get the results of a completed analysis job.

**Response:**
```json
{
  "success": true,
  "results": {
    "summary": {
      "competitors": 2,
      "averagePerformance": {
        "domContentLoaded": 1245.67,
        "load": 2456.78
      },
      "contentStats": {
        "averageTitleLength": 52.3,
        "averageDescriptionLength": 142.8
      }
    },
    "competitorData": {
      "https://example.com": {
        "domain": "example.com",
        "summary": { /* ... */ },
        "keywordAnalysis": { /* ... */ },
        "strengthsWeaknesses": { /* ... */ }
      }
    },
    "reports": {
      "summary": "/path/to/summary-report.md",
      "detailed": "/path/to/detailed-report.md"
    }
  }
}
```

## Configuration Options

The module supports the following configuration options:

| Option | Description | Default |
|--------|-------------|---------|
| `outputDir` | Output directory for reports and data | `./competitor-analysis` |
| `maxPagesPerCompetitor` | Maximum pages to crawl per competitor | `50` |
| `maxConcurrency` | Maximum concurrent page crawls | `2` |
| `maxDepth` | Maximum crawl depth | `2` |
| `extractContentText` | Extract full text content | `true` |
| `extractMetadata` | Extract meta tags | `true` |
| `extractLinks` | Extract and follow links | `true` |
| `extractImages` | Extract image information | `true` |
| `analyzeContentStructure` | Analyze headings and content structure | `true` |
| `analyzeKeywordUsage` | Analyze keyword usage patterns | `true` |
| `collectPerformanceMetrics` | Collect page performance metrics | `true` |
| `saveScreenshots` | Save screenshots of pages | `false` |
| `respectRobotsTxt` | Respect robots.txt directives | `true` |

## Output

The module generates two types of reports:

1. **Summary Report**: A concise overview of the analysis with key findings
2. **Detailed Report**: A comprehensive report with in-depth analysis of each competitor

Both reports are generated in Markdown format and saved to the output directory.

## Development

### Running Tests

```bash
npm test
```

### Contributing

See the main project's [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

This module is part of the SEOAutomate platform and is subject to the same license terms.
