# Detailed Performance Tracking Module

## Overview

The Detailed Performance Tracking module provides extended tracking of Core Web Vitals and other performance metrics with granular analysis. It's a comprehensive system for identifying performance bottlenecks, analyzing resource loading patterns, and providing actionable recommendations for performance optimization.

## Features

- **Extended Core Web Vitals Monitoring**
  - Precise measurement of LCP, CLS, FID/TBT across devices and browsers
  - Detailed breakdowns of contributing factors
  - Threshold-based scoring and rating

- **Resource Load Waterfall Visualization**
  - Comprehensive request timeline analysis
  - Critical path identification
  - Request blocking and dependency visualization

- **Performance Bottleneck Identification**
  - Automatic detection of performance bottlenecks
  - Categorization by severity and impact
  - Root cause analysis for each bottleneck

- **Browser-Specific Performance Insights**
  - Cross-browser performance comparison
  - Browser-specific issue detection
  - Compatibility recommendations

- **Comprehensive Performance Reports**
  - Overall performance scoring
  - Prioritized recommendations
  - Visualization data for dashboards

## Architecture

The module consists of several key components:

1. **Core Module** (`index.js`)
   - Main entry point for the module
   - Orchestrates the performance analysis process
   - Integrates results from various analyzers

2. **Performance Tracker** (`trackers/performanceTracker.js`)
   - Collects detailed performance metrics
   - Handles device emulation and browser profiling
   - Captures Core Web Vitals and other metrics

3. **Resource Analyzer** (`analyzers/resourceAnalyzer.js`)
   - Analyzes resource loading patterns
   - Creates waterfall visualizations
   - Identifies resource optimization opportunities

4. **Bottleneck Detector** (`analyzers/bottleneckDetector.js`)
   - Identifies performance bottlenecks
   - Analyzes causes and impacts
   - Prioritizes issues by severity

5. **Browser Comparison Tool** (`analyzers/browserComparisonTool.js`)
   - Compares performance across different browsers
   - Identifies browser-specific issues
   - Provides cross-browser compatibility insights

6. **Performance Report** (`reporting/performanceReport.js`)
   - Generates comprehensive performance reports
   - Calculates performance scores
   - Creates visualization-ready data structures

## Integration

The Detailed Performance Tracking module integrates with the following systems:

- **Verification System**: Provides detailed metrics for verifying SEO fixes
- **Client Dashboard**: Supplies visualization data for performance reporting
- **Implementation Module**: Offers insights on what to fix and optimize

## Usage

### Basic Usage

```javascript
const DetailedPerformanceTracking = require('./automation/performance');

// Initialize the tracker
const tracker = new DetailedPerformanceTracking({
  browsers: ['chromium', 'firefox'],
  deviceEmulation: ['desktop', 'mobile'],
  enableWaterfallVisualization: true
});

// Analyze a single URL
const results = await tracker.analyzeUrl('https://example.com');

// Analyze multiple URLs (site-wide analysis)
const siteResults = await tracker.analyzeSite([
  'https://example.com',
  'https://example.com/about',
  'https://example.com/contact'
]);
```

### Configuration Options

```javascript
const tracker = new DetailedPerformanceTracking({
  // Browsers to test with
  browsers: ['chromium', 'firefox', 'webkit'],
  
  // Devices to emulate
  deviceEmulation: ['desktop', 'mobile'],
  
  // Enable waterfall visualization generation
  enableWaterfallVisualization: true,
  
  // Capture detailed resource information
  captureResourceDetails: true,
  
  // Track JavaScript execution (coverage)
  trackJavaScriptExecution: true,
  
  // Maximum number of retries for reliability
  maxRetries: 3,
  
  // Connection throttling settings
  connectionThrottling: {
    enabled: false,
    downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
    uploadThroughput: 750 * 1024 / 8, // 750 Kbps
    latency: 40 // 40ms
  },
  
  // Variance threshold for browser comparison (%)
  varianceThreshold: 20,
  
  // Size thresholds for resource categorization (bytes)
  sizeThresholds: {
    small: 10 * 1024, // 10 KB
    medium: 100 * 1024, // 100 KB
    large: 1024 * 1024 // 1 MB
  }
});
```

### Analyzing a URL

```javascript
const results = await tracker.analyzeUrl('https://example.com', {
  // Override default options for this analysis
  browsers: ['chromium'],
  deviceEmulation: ['mobile'],
  
  // Additional options
  timeout: 60000, // 60 seconds timeout
  waitUntil: 'networkidle'
});

// Access analysis results
console.log(`Overall performance score: ${results.scores.overall}/100`);
console.log(`Core Web Vitals score: ${results.scores.coreWebVitals}/100`);

// Access bottlenecks
const criticalBottlenecks = results.bottlenecks.bySeverity.high;
console.log(`Found ${criticalBottlenecks.length} critical bottlenecks`);

// Access recommendations
const topRecommendations = results.recommendations.prioritized;
console.log(`Top recommendation: ${topRecommendations[0].title}`);
```

### Site-Wide Analysis

```javascript
const siteResults = await tracker.analyzeSite([
  'https://example.com',
  'https://example.com/about',
  'https://example.com/contact'
]);

// Access site-wide bottlenecks
console.log(`Found ${siteResults.siteWideBottlenecks.length} site-wide bottlenecks`);

// Access individual URL results
const urlResults = siteResults.urls;
console.log(`Analyzed ${urlResults.length} URLs`);

// Access aggregated data
const aggregatedData = siteResults.summary;
console.log(`Average LCP (mobile): ${aggregatedData.mobile.largestContentfulPaint.toFixed(0)}ms`);
```

## Report Structure

The performance report generated by the module includes:

- **Summary**: Overall performance summary and key metrics
- **Scores**: Performance scores by category (0-100)
- **Core Web Vitals**: Detailed Core Web Vitals metrics for mobile and desktop
- **Performance Metrics**: Additional performance metrics and timings
- **Resource Breakdown**: Analysis of resource loading by type, domain, and size
- **Bottlenecks**: Prioritized performance bottlenecks with severity and impact
- **Recommendations**: Actionable recommendations with implementation steps
- **Browser Insights**: Cross-browser performance comparison and issues
- **Visualizations**: Data structures ready for visualization in dashboards

## Testing

To run the tests:

```bash
node ./automation/performance/tests/test-detailed-performance.js
```

For verbose output:

```bash
node ./automation/performance/tests/test-detailed-performance.js --verbose
```

## Dependencies

- **Playwright**: Used for browser automation and performance measurement
- **Common Logger**: Used for consistent logging across the module

## Best Practices

1. **Use mobile and desktop emulation** for a complete picture of performance
2. **Compare across multiple browsers** to identify browser-specific issues
3. **Perform multiple measurements** for statistical reliability
4. **Use throttling** to simulate real-world network conditions
5. **Focus on high-severity bottlenecks** for the biggest performance improvements
