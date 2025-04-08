# Advanced SEO Score Calculator

## Overview

The Advanced SEO Score Calculator provides sophisticated SEO scoring with weighted factors, industry benchmarks, competitor comparison metrics, and trend analysis. It transforms raw SEO data into actionable insights by applying industry-specific scoring algorithms and contextual benchmarking.

## Architectural Design

The module implements a multi-layered scoring architecture with:

1. **Metric Extraction Layer**: Extracts and normalizes metrics from SEO data
2. **Industry Context Layer**: Applies industry-specific benchmarks and weighting
3. **Multi-dimensional Analysis Layer**:
   - Category-based scoring
   - Factor-based scoring
   - Benchmark comparison
   - Competitor comparison
   - Trend analysis
4. **Synthesis Layer**: Generates weighted scores, recommendations, and issues

## Core Components

- **Metric Normalization**: Harmonizes disparate metrics into consistent scoring scales
- **Industry Detection**: Automatically identifies site industry based on content signals
- **Weighted Scoring Algorithm**: Applies sophisticated weighting based on industry relevance
- **Benchmark Comparison**: Positions scores within industry-specific distributions
- **Recommendation Engine**: Generates targeted, actionable recommendations
- **Trend Analysis Module**: Tracks performance evolution over time
- **Competitor Positioning**: Situates performance within competitive landscape

## Integration Interfaces

The Advanced SEO Score Calculator integrates seamlessly with the broader SEO analysis framework through:

1. **Input Interface**: Consumes comprehensive SEO data from previous analyzers
2. **Parameter Interface**: Accepts configuration options for industry, vertical, competitors, and historical data
3. **Output Interface**: Produces structured score data, recommendations, and issues
4. **Integration Hook**: Feeds scores, recommendations, and issues back into the main system

## Usage

```javascript
const AdvancedSeoScoreCalculator = require('./analyzers/advanced-seo-score');

// Calculate advanced SEO score
const results = await AdvancedSeoScoreCalculator.calculate(url, seoData, {
  industry: 'ecommerce',         // Optional: Specify industry
  vertical: 'fashion',           // Optional: Specify vertical within industry
  competitorData: competitors,   // Optional: Array of competitor SEO data
  historicalData: historical     // Optional: Array of historical SEO data
});

// Access results
console.log(`Overall Score: ${results.score.overall}/100`);
console.log(`Industry: ${results.summary.industry}`);
console.log(`Benchmark Position: ${results.summary.benchmarkPosition}`);
```

## Integration with SEO.engineering

The Advanced SEO Score Calculator is fully integrated with the Technical SEO module in SEO.engineering. When enabled, it:

1. Processes data from all active SEO analyzers
2. Calculates sophisticated scores using industry-specific algorithms
3. Contributes recommendations to the overall recommendation set
4. Adds issues to the overall issue list
5. Provides enhanced scoring for the technical SEO report

To enable/disable it in a technical SEO audit, use:

```javascript
const { runTechnicalSeoAudit } = require('../technical-seo');

const results = await runTechnicalSeoAudit('https://example.com', {
  checks: {
    advancedSeoScore: true  // Enable advanced SEO scoring
  },
  industry: 'finance',      // Optional: Specify industry
  vertical: 'banking'       // Optional: Specify vertical
});
```

## Testing

A dedicated test script is available in the tests directory:

```bash
node tests/test-advanced-seo-score.js <data-path> [industry] [vertical]
```

The test script loads SEO data from a JSON file, calculates the advanced score, and saves detailed results to the test-results directory.

## Data Structures

### Input Parameters

- **url**: Target URL being analyzed
- **seoData**: Comprehensive SEO data from previous analyzers
- **options**: Configuration options
  - **industry**: Industry category (e.g., ecommerce, healthcare, finance)
  - **vertical**: Vertical within industry (e.g., fashion, banking)
  - **competitorData**: Array of competitor SEO data
  - **historicalData**: Array of historical SEO data points

### Output Structure

- **url**: Analyzed URL
- **timestamp**: Analysis timestamp
- **score**:
  - **overall**: Overall SEO score (0-100)
  - **categories**: Scores for broad categories (technical, content, etc.)
  - **factors**: Scores for individual factors
  - **weightedFactors**: Factors with weights and weighted scores
  - **benchmarkComparison**: Comparison against industry benchmarks
  - **competitorComparison**: Comparison against competitors
  - **historicalTrend**: Trend analysis over time
- **metrics**:
  - **raw**: Raw extracted metrics
  - **normalized**: Normalized metrics
  - **benchmarked**: Metrics compared to benchmarks
- **recommendations**: Actionable recommendations
- **issues**: SEO issues derived from scores
- **summary**: Executive summary of results

## Supported Industries

The calculator provides specialized benchmarks and scoring algorithms for:

1. **E-commerce**: Optimized for product-centric websites
2. **Healthcare**: Specialized for medical and health information sites
3. **Finance**: Tailored for financial services and information
4. **Travel**: Designed for travel, hospitality, and tourism sites
5. **Technology**: Optimized for tech companies and products
6. **General**: Default benchmarks for other industries

## Algorithm Details

The scoring system implements multiple algorithmic approaches:

1. **Weighted Arithmetic Mean**: Basic weighted average scoring
2. **Category-Based Weighting**: Category-level scoring with industry-specific weights
3. **Sigmoid Weighting**: Non-linear weighting to emphasize mid-range scores
4. **Geometric Mean**: Penalizes low outliers more than arithmetic mean
5. **Harmonic Mean**: Heavily penalizes low outliers
6. **Competitive Scoring**: Scales scores based on benchmark distance

## Future Enhancements

- AI-driven recommendation prioritization
- Dynamic benchmark updates based on market evolution
- Expanded competitor analysis with market positioning
- Predictive SEO impact modeling
- Industry subsector specialization
- Regional benchmark variations
