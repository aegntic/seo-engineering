# Competitor Discovery Module

## Overview

The Competitor Discovery Module is responsible for identifying and analyzing competitors for a given website. It uses various strategies to discover relevant competitors, including keyword-based discovery, SERP analysis, backlink analysis, and industry classification.

## Features

- **Keyword-based Competitor Identification**: Discover competitors based on keyword overlap
- **SERP Analysis**: Identify competitors that rank for the same keywords
- **Backlink Competitor Discovery**: Find websites that share similar backlink profiles
- **Industry Classification**: Categorize competitors by industry
- **Competitor Ranking**: Rank competitors by relevance and competitiveness
- **Competitor Profile Generation**: Create detailed profiles of discovered competitors

## Architecture

The Competitor Discovery Module consists of the following components:

- **Discovery Controller**: Orchestrates the discovery process
- **Keyword Analyzer**: Analyzes keyword overlap between sites
- **SERP Analyzer**: Extracts competitors from search results
- **Backlink Analyzer**: Compares backlink profiles
- **Industry Classifier**: Classifies sites by industry
- **Competitor Ranker**: Ranks competitors by relevance
- **Profile Generator**: Creates competitor profiles
- **Data Access Layer**: Interfaces with the database

## Installation

```bash
cd SEOAutomate/automation/competitor-discovery
npm install
```

## Configuration

The module is configured through environment variables and configuration files:

### Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `SERP_API_KEY`: API key for SERP provider
- `BACKLINK_API_KEY`: API key for backlink data provider
- `MAX_COMPETITORS`: Maximum number of competitors to discover (default: 10)

### Configuration File

Create a `config.js` file with the following structure:

```javascript
module.exports = {
  // Discovery settings
  discovery: {
    maxCompetitors: 10,
    minRelevanceScore: 0.5,
    maxDiscoveryDepth: 2
  },
  
  // Keyword analysis settings
  keywords: {
    minOverlap: 0.3,
    maxKeywords: 100,
    prioritizeTopRanking: true
  },
  
  // SERP analysis settings
  serp: {
    maxResults: 20,
    includeAds: false,
    regions: ['us', 'uk', 'ca']
  },
  
  // Backlink analysis settings
  backlinks: {
    minSimilarity: 0.2,
    maxBacklinks: 1000,
    prioritizeAuthoritySites: true
  },
  
  // Industry classification settings
  industry: {
    useAI: true,
    confidenceThreshold: 0.7,
    fallbackToSimilarKeywords: true
  }
};
```

## Usage

### API

The module exposes a REST API with the following endpoints:

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/competitor-discovery/discover` | POST | Discover competitors | `siteId`, `options` |
| `/api/competitor-discovery/status/:id` | GET | Get discovery status | `id` |
| `/api/competitor-discovery/results/:id` | GET | Get discovery results | `id` |
| `/api/competitor-discovery/competitors/:siteId` | GET | Get competitors for a site | `siteId` |
| `/api/competitor-discovery/profile/:siteId/:competitorId` | GET | Get competitor profile | `siteId`, `competitorId` |

### Programmatic Usage

```javascript
const { CompetitorDiscovery } = require('./discovery-controller');

async function discoverCompetitors(siteId, options) {
  const discovery = new CompetitorDiscovery(options);
  const result = await discovery.discover(siteId);
  return result;
}
```

## Data Model

### Competitor Discovery Job

```javascript
{
  _id: ObjectId,
  siteId: ObjectId,
  status: String, // 'pending', 'in_progress', 'completed', 'failed'
  startTime: Date,
  endTime: Date,
  options: Object,
  progress: Number, // 0-100
  results: {
    competitors: [
      {
        _id: ObjectId,
        url: String,
        domain: String,
        relevanceScore: Number,
        discoveryMethod: String, // 'keyword', 'serp', 'backlink', 'industry'
        keywordOverlap: Number,
        backlinksInCommon: Number,
        serpOverlap: Number,
        industryMatch: Boolean,
        rank: Number
      }
    ],
    stats: {
      totalCompetitors: Number,
      keywordBased: Number,
      serpBased: Number,
      backlinkBased: Number,
      industryBased: Number,
      averageRelevance: Number
    }
  },
  error: String
}
```

### Competitor Profile

```javascript
{
  _id: ObjectId,
  siteId: ObjectId,
  competitorId: ObjectId,
  url: String,
  domain: String,
  createdAt: Date,
  updatedAt: Date,
  domainMetrics: {
    domainAuthority: Number,
    pageAuthority: Number,
    trustFlow: Number,
    citationFlow: Number,
    domainAge: Number,
    estimatedTraffic: Number
  },
  keywordData: {
    totalKeywords: Number,
    topKeywords: [String],
    keywordsInCommon: [String],
    keywordGaps: [String]
  },
  backlinks: {
    totalBacklinks: Number,
    backlinkDomains: Number,
    commonBacklinks: [String],
    uniqueBacklinks: [String]
  },
  content: {
    pageCount: Number,
    averageWordCount: Number,
    contentCategories: [String]
  },
  socialMedia: {
    profiles: [
      {
        platform: String,
        url: String,
        followers: Number
      }
    ]
  },
  technologies: [String]
}
```

## Development

### Project Structure

```
/competitor-discovery/
├── index.js                    # Entry point
├── controllers/                # API controllers
├── services/                   # Business logic
│   ├── discovery-controller.js # Main controller
│   ├── keyword-analyzer.js     # Keyword analysis
│   ├── serp-analyzer.js        # SERP analysis
│   ├── backlink-analyzer.js    # Backlink analysis
│   ├── industry-classifier.js  # Industry classification
│   ├── competitor-ranker.js    # Competitor ranking
│   └── profile-generator.js    # Profile generation
├── models/                     # Data models
├── utils/                      # Utility functions
├── config/                     # Configuration
└── tests/                      # Test suite
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testPathPattern=keyword-analyzer

# Run tests in watch mode
npm test -- --watch
```

## Integration with Other Modules

The Competitor Discovery Module integrates with the following SEOAutomate modules:

- **Crawler Module**: Uses crawled data to extract keywords and content information
- **Analysis Engine**: Provides competitive analysis data for SEO recommendations
- **Client Dashboard**: Displays competitor information and insights
- **Reporting Engine**: Includes competitor data in reports

## Troubleshooting

### Common Issues

1. **API Rate Limiting**:
   - Implement proper rate limiting for external APIs
   - Use caching to reduce API calls
   - Stagger requests to avoid hitting limits

2. **Data Quality**:
   - Validate all external data
   - Filter out irrelevant competitors
   - Handle missing or incomplete data gracefully

3. **Performance**:
   - Optimize database queries
   - Use parallel processing where possible
   - Implement proper indexing for competitor data

### Logging

The module uses structured logging with the following log levels:

- **ERROR**: Critical errors that prevent discovery
- **WARN**: Issues that don't stop discovery but may affect quality
- **INFO**: Important operational events
- **DEBUG**: Detailed information for troubleshooting

## Future Enhancements

1. **AI-Driven Discovery**: Use machine learning to identify competitors
2. **Content Similarity Analysis**: Compare content topics and style
3. **Market Share Estimation**: Estimate competitor market share
4. **Competitive Strategy Analysis**: Identify competitor strategies
5. **Trend Analysis**: Track changes in competitive landscape over time
6. **Opportunity Analysis**: Identify competitive gaps and opportunities
