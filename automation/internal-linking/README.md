# Internal Linking Optimization Module

## Overview

The Internal Linking Optimization module provides advanced analysis and optimization of website internal linking structures to improve SEO performance, user navigation, and content discovery.

## Core Components

The module uses a modular architecture with four key components:

1. **Link Graph Analysis**: Constructs and analyzes the site's internal linking structure using graph theory algorithms
2. **Orphaned Page Detection**: Identifies pages with inadequate incoming links and suggests connection strategies
3. **Link Distribution Optimization**: Generates recommendations for optimal link placement to balance link equity
4. **Anchor Text Optimization**: Suggests optimal anchor text for new internal links based on content and keyword analysis

## Key Features

- Comprehensive link graph analysis with PageRank and HITS algorithms
- Detection of orphaned and near-orphaned content
- Content silo identification and cross-linking optimization
- Click distance optimization from homepage
- Link equity balancing across the site
- Strategic anchor text generation with keyword optimization
- Content-aware link insertion suggestions

## Integration Points

This module integrates with other SEOAutomate components:

- **Crawler Module**: Receives site structure and page content data
- **Analysis Engine**: Provides link analysis metrics and optimization opportunities
- **Fix Implementation System**: Supplies actionable link suggestions for implementation
- **Verification System**: Enables before/after comparison of linking structure
- **Dashboard**: Visualizes link structure and optimization opportunities

## Usage

```javascript
const { InternalLinkingOptimizer } = require('./automation/internal-linking');

// Initialize with custom configuration
const optimizer = new InternalLinkingOptimizer({
  minInboundLinks: 3,
  maxSuggestedLinks: 10,
  distributionFactor: 0.8
});

// Analyze a site
const results = await optimizer.analyzeSite('https://example.com');

// Access analysis results
const graphMetrics = results.getLinkGraphMetrics();
const orphanedPages = results.getOrphanedPages();
const suggestions = results.getDistributionSuggestions();
const anchorText = results.getAnchorTextSuggestions();
```

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `minLinkableContent` | Minimum content length for a page to be considered | 200 |
| `maxOutboundLinks` | Maximum outbound links per page | 100 |
| `minInboundLinks` | Minimum recommended inbound links per page | 2 |
| `distributionFactor` | Factor for balancing link distribution | 0.7 |
| `maxDistanceFromHome` | Maximum recommended click distance from home | 3 |
| `orphanThreshold` | Max inbound links to consider a page orphaned | 1 |
| `siloBias` | Bias toward linking within same content silo | 0.6 |
| `pageRankDampingFactor` | PageRank damping factor | 0.85 |
| `maxSuggestedLinks` | Maximum suggested new links per page | 15 |
| `anchorTextMinLength` | Minimum words in anchor text | 3 |
| `anchorTextMaxLength` | Maximum words in anchor text | 8 |
| `keywordBias` | Bias toward using keywords in anchor text | 0.7 |
| `naturalLanguageBias` | Bias toward natural language in anchor text | 0.5 |

## Performance Considerations

- Handles sites with up to 100,000 pages through batch processing
- Memory-efficient data structures for large-scale analysis
- Parallel processing options for performance optimization
- Caching of intermediate results for faster subsequent analyses

## Example Output

```json
{
  "graphMetrics": {
    "pageCount": 143,
    "linkCount": 572,
    "orphanedCount": 12,
    "linkDensity": 4.0,
    "averageClickDistance": 2.7,
    "reciprocalRatio": 0.21
  },
  "orphanedPages": [
    {
      "url": "https://example.com/resources/guide-2",
      "inLinkCount": 0,
      "importance": 0.72,
      "potentialSources": [
        { "url": "https://example.com/blog/topic-3", "relevanceScore": 0.81 }
      ]
    }
  ],
  "linkSuggestions": [
    {
      "source": "https://example.com/blog/topic-3",
      "target": "https://example.com/resources/guide-2",
      "type": "orphan_rescue",
      "priority": "high",
      "relevanceScore": 0.81,
      "anchorText": "comprehensive resource guide"
    }
  ]
}
```

## Development

### Testing

```bash
# Run unit tests
npm test

# Run specific test suite
npm test -- --grep "LinkGraphAnalyzer"
```

### Project Structure

- `/src/graph` - Link graph analysis algorithms
- `/src/analyzer` - Orphaned page detection
- `/src/optimizer` - Link distribution optimization
- `/src/text` - Anchor text optimization
- `/test` - Unit and integration tests
- `/examples` - Usage examples and sample code
