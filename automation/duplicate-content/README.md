# Duplicate Content Analysis Module

## Overview
The Duplicate Content Analysis module is responsible for detecting duplicate and near-duplicate content across websites. This helps identify potential SEO penalties from content duplication and provides automatic canonical tag suggestions.

## Key Components

### 1. Content Fingerprinting Algorithm
Located in `/src/fingerprinter`, this component:
- Extracts meaningful content from HTML pages
- Removes non-essential elements (navigation, footers, etc.)
- Creates content signatures using SimHash algorithm
- Handles content in multiple languages

### 2. Similarity Detection Engine
Located in `/src/similarity`, this component:
- Compares content fingerprints efficiently
- Calculates similarity scores between pages
- Optimizes processing for large websites
- Provides configurable similarity thresholds

### 3. Cross-Page Content Comparison
Located in `/src/comparator`, this component:
- Compares content across multiple pages
- Identifies clusters of similar content
- Processes comparisons in parallel for performance
- Creates detailed reports of duplicate content

### 4. Automatic Canonical Suggestion
Located in `/src/canonical`, this component:
- Analyzes duplicate content clusters
- Determines the most appropriate canonical URL
- Generates implementation recommendations
- Creates fixes that can be applied via the Fix Implementation System

## Integration Points

- **Input**: Crawled pages from the Crawler Module
- **Output**: 
  - Duplicate content reports to the Analysis Engine
  - Suggested fixes to the Fix Implementation System
  - Canonical recommendations to the Client Dashboard

## Configuration

This module supports the following configuration options:
- `SIMILARITY_THRESHOLD`: Minimum similarity score to consider pages as duplicates (default: 0.85)
- `MIN_CONTENT_LENGTH`: Minimum content length to analyze (default: 500 characters)
- `PARALLEL_COMPARISONS`: Maximum number of parallel comparisons (default: 10)
- `EXCLUDE_PATTERNS`: URL patterns to exclude from analysis

## Usage

```javascript
const { DuplicateContentAnalyzer } = require('./index');

// Initialize the analyzer
const analyzer = new DuplicateContentAnalyzer({
  similarityThreshold: 0.85,
  minContentLength: 500
});

// Analyze a website
const results = await analyzer.analyzeSite('https://example.com');

// Get duplicate content groups
const duplicateGroups = results.getDuplicateGroups();

// Get canonical suggestions
const canonicalSuggestions = results.getCanonicalSuggestions();
```

## Performance Considerations

- For large websites (10,000+ pages), the module implements:
  - Incremental processing
  - Memory-efficient comparison algorithms
  - Intelligent grouping to reduce comparison count
  - Caching of fingerprints for subsequent analyses

## Testing

Run the test suite:

```bash
cd automation/duplicate-content
npm test
```