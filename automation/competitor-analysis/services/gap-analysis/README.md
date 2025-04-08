# Gap Analysis Module

## Overview

The Gap Analysis module is a critical component of the SEO.engineering platform that analyzes the differences between a client's website and its competitors. It identifies areas where the client site is underperforming or missing opportunities compared to competitors, and generates actionable recommendations for improvement.

## Features

- **Comprehensive Gap Detection**: Identifies gaps in technical SEO, content, keywords, performance, on-page SEO, and site structure
- **Impact Scoring**: Assigns impact scores to each identified gap to help prioritize improvements
- **Opportunity Generation**: Creates actionable opportunities based on identified gaps
- **Visualization Support**: Generates data for visual representation of gaps and opportunities
- **Detailed Reporting**: Produces comprehensive reports with actionable recommendations

## Usage

### Programmatic Usage

```javascript
const { createGapAnalysisService } = require('./services/gap-analysis');

// Create a gap analysis service
const gapAnalysisService = createGapAnalysisService({
  outputDir: './output'
});

// Analyze gaps between client and competitors
const gapAnalysis = await gapAnalysisService.analyzeGaps(
  clientData,
  competitorsData,
  ['keyword1', 'keyword2']
);

// Get scores
const scores = gapAnalysis.scores;
console.log(`Overall score: ${scores.overall}%`);

// Get all gaps
const gaps = gapAnalysis.getAllGaps();

// Get gaps sorted by impact
const sortedGaps = gapAnalysis.getGapsSortedByImpact();

// Get opportunities
const opportunities = gapAnalysis.getAllOpportunities();

// Generate a report
const report = gapAnalysis.generateMarkdownReport();

// Generate visualizations
const visualizations = await gapAnalysisService.generateVisualizations(
  gapAnalysis,
  'job-123'
);
```

### CLI Usage

The module includes a command-line interface for running gap analysis:

```bash
node cli/gap-analysis-cli.js --input data.json --output ./results --visualizations
```

Options:
- `--input <path>`: Input JSON file with crawl data
- `--output <dir>`: Output directory for results
- `--visualizations`: Generate visualizations
- `--job-id <id>`: Unique job ID (default: timestamp)
- `--detailed`: Generate detailed analysis

### API Endpoints

When integrated with Express, the module adds the following endpoint:

#### POST /api/competitor-analysis/gap-analysis

Perform gap analysis between client and competitors.

**Request:**
```json
{
  "clientData": {
    "summary": { ... },
    "seo": { ... }
  },
  "competitorsData": {
    "https://competitor1.com": {
      "summary": { ... },
      "seo": { ... }
    },
    "https://competitor2.com": {
      "summary": { ... },
      "seo": { ... }
    }
  },
  "keywords": ["keyword1", "keyword2"]
}
```

**Response:**
```json
{
  "success": true,
  "gapAnalysis": {
    "scores": {
      "technical": 75.5,
      "content": 80.2,
      "keywords": 65.8,
      "performance": 90.1,
      "onPage": 82.5,
      "structure": 70.0,
      "overall": 77.3
    },
    "gaps": { ... },
    "opportunities": [ ... ],
    "topGaps": [ ... ],
    "topOpportunities": [ ... ],
    "report": "# Gap Analysis Report\n\n..."
  }
}
```

## Data Format

### Input Data

The gap analysis module expects the following data structure:

```javascript
// Client data
const clientData = {
  // Summary statistics
  summary: {
    pagesAnalyzed: 50,
    averagePerformance: {
      domContentLoaded: 1245.67,
      load: 2456.78
    },
    contentStats: {
      averageTitleLength: 52.3,
      averageDescriptionLength: 142.8
    },
    seoHealth: {
      missingTitlesPercent: 5.2,
      missingDescriptionsPercent: 8.6,
      hasSchemaMarkupPercent: 45.3
    }
  },
  // SEO data
  seo: {
    images: {
      withAlt: 125,
      withoutAlt: 30
    },
    links: {
      internal: 480,
      external: 120
    }
  },
  // Keyword analysis
  keywordAnalysis: {
    "keyword1": {
      occurrences: 45,
      pages: 8,
      inTitle: 3,
      inDescription: 5,
      inHeadings: 10,
      density: 16.0,
      importanceScore: 72
    }
  }
};

// Competitor data (similar structure to client data)
const competitorsData = {
  "https://competitor1.com": { ... },
  "https://competitor2.com": { ... }
};
```

### Output Data

The gap analysis produces the following output structure:

```javascript
{
  // Scores for each category
  scores: {
    technical: 75.5,
    content: 80.2,
    keywords: 65.8,
    performance: 90.1,
    onPage: 82.5,
    structure: 70.0,
    overall: 77.3
  },

  // Identified gaps by category
  gaps: {
    technical: [
      {
        title: "Missing Schema Markup",
        description: "Only 45.3% of your pages use schema markup, compared to 73.2% for competitors.",
        impactScore: 4.2,
        data: { ... }
      }
    ],
    content: [ ... ],
    keywords: [ ... ],
    performance: [ ... ],
    onPage: [ ... ],
    structure: [ ... ]
  },

  // Identified opportunities
  opportunities: [
    {
      title: "Implement Schema Markup",
      description: "Add structured data markup to improve how search engines understand your content.",
      category: "Technical SEO",
      impactScore: 4.2,
      actions: [ ... ],
      relatedGaps: [ ... ]
    }
  ],

  // Data for visualizations
  visualizationData: {
    radar: { ... },
    comparison: { ... },
    opportunities: { ... }
  }
}
```

## Components

The module consists of the following components:

- **GapAnalysis**: Model representing a gap analysis between a client site and competitors
- **GapAnalyzer**: Service that analyzes gaps between client and competitor data
- **VisualizationService**: Service that generates visualization data for gap analysis results

## Future Enhancements

- Add support for historical trend analysis
- Implement machine learning for more accurate impact scoring
- Add customizable analysis rules based on industry benchmarks
- Integrate with recommendation engine for more personalized opportunities
