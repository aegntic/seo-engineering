/**
 * Advanced SEO Score Calculator
 * 
 * Provides sophisticated SEO scoring with weighted factors, industry benchmarks,
 * and competitor comparison metrics for actionable SEO health assessment.
 */

const { v4: uuidv4 } = require('uuid');
const { getIndustryBenchmarks } = require('../utils/industry-benchmarks');
const { calculateWeightedScore } = require('../utils/scoring-algorithms');
const { normalizeMetrics } = require('../utils/metric-normalization');

class AdvancedSeoScoreCalculator {
  /**
   * Calculate advanced SEO score for a given URL and dataset
   * @param {string} url - The URL being analyzed
   * @param {Object} seoData - Comprehensive SEO data from previous analyzers
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - Advanced SEO score analysis results
   */
  static async calculate(url, seoData, options = {}) {
    try {
      console.log(`Calculating advanced SEO score for: ${url}`);
      
      // Initialize results structure
      const results = {
        url,
        timestamp: new Date().toISOString(),
        score: {
          overall: 0,
          categories: {},
          factors: {},
          weightedFactors: {},
          benchmarkComparison: {},
          competitorComparison: {},
          historicalTrend: null
        },
        metrics: {
          raw: {},
          normalized: {},
          benchmarked: {}
        },
        recommendations: [],
        issues: [],
        summary: {}
      };
      
      // Extract industry and vertical if provided
      const industry = options.industry || detectIndustry(url, seoData);
      const vertical = options.vertical || detectVertical(url, seoData);
      
      // Get industry benchmarks
      const benchmarks = await getIndustryBenchmarks(industry, vertical);
      
      // Extract all metrics from previous SEO data
      const extractedMetrics = extractMetricsFromSeoData(seoData);
      results.metrics.raw = extractedMetrics;
      
      // Normalize metrics for consistent scoring
      results.metrics.normalized = normalizeMetrics(extractedMetrics);
      
      // Compare metrics against benchmarks
      results.metrics.benchmarked = compareToBenchmarks(results.metrics.normalized, benchmarks);
      
      // Calculate category scores
      results.score.categories = calculateCategoryScores(results.metrics.benchmarked);
      
      // Calculate factor scores (more granular than categories)
      results.score.factors = calculateFactorScores(results.metrics.benchmarked);
      
      // Apply weighting to factors
      results.score.weightedFactors = applyFactorWeighting(
        results.score.factors, 
        determineFactorWeights(industry, vertical)
      );
      
      // Compare to benchmarks
      results.score.benchmarkComparison = calculateBenchmarkComparison(
        results.metrics.normalized,
        benchmarks
      );
      
      // Compare to competitors if data is available
      if (options.competitorData) {
        results.score.competitorComparison = calculateCompetitorComparison(
          results.metrics.normalized,
          options.competitorData
        );
      }
      
      // Calculate historical trend if historical data is available
      if (options.historicalData) {
        results.score.historicalTrend = calculateHistoricalTrend(
          results.metrics.normalized,
          options.historicalData
        );
      }
      
      // Calculate overall score using weighted scoring algorithm
      results.score.overall = calculateWeightedScore(
        results.score.weightedFactors,
        benchmarks.overallScoreWeights
      );
      
      // Generate recommendations based on scores
      results.recommendations = generateRecommendations(
        results.score,
        results.metrics.benchmarked,
        benchmarks
      );
      
      // Generate issues for low-scoring factors
      results.issues = generateIssuesFromScores(
        results.score,
        results.metrics.benchmarked,
        benchmarks
      );
      
      // Create summary
      results.summary = {
        score: Math.round(results.score.overall),
        industry,
        vertical,
        topPerformingFactors: getTopFactors(results.score.weightedFactors, 3, true),
        underperformingFactors: getTopFactors(results.score.weightedFactors, 3, false),
        benchmarkPosition: getBenchmarkPosition(results.score.benchmarkComparison),
        issuesCount: results.issues.length,
        recommendationsCount: results.recommendations.length,
        recommendation: getOverallRecommendation(results.score, industry)
      };
      
      return results;
      
    } catch (error) {
      console.error(`Error calculating advanced SEO score for ${url}:`, error);
      
      // Return a graceful fallback result with error information
      return {
        url,
        timestamp: new Date().toISOString(),
        score: {
          overall: 0,
          categories: {},
          factors: {},
          weightedFactors: {},
          benchmarkComparison: {},
          competitorComparison: {},
          historicalTrend: null
        },
        metrics: {
          raw: {},
          normalized: {},
          benchmarked: {}
        },
        recommendations: [],
        issues: [{
          id: uuidv4(),
          title: 'SEO Score Calculation Failed',
          description: `Could not calculate advanced SEO score due to error: ${error.message}`,
          severity: 'high',
          category: 'technical-seo',
          location: url,
          recommendation: 'Check the input data and ensure all required metrics are available.'
        }],
        summary: {
          score: 0,
          error: error.message,
          recommendation: 'Ensure all required SEO data is available and try again.'
        }
      };
    }
  }
}

/**
 * Extract metrics from comprehensive SEO data
 * @param {Object} seoData - Comprehensive SEO data from previous analyzers
 * @returns {Object} - Extracted metrics
 */
function extractMetricsFromSeoData(seoData) {
  const metrics = {
    // Technical metrics
    pageSpeed: extractMetric(seoData, 'pageSpeed.score', 0),
    mobileResponsiveness: extractMetric(seoData, 'mobileResponsiveness.score', 0),
    crawlability: extractMetric(seoData, 'crawlability.score', 0),
    ssl: extractMetric(seoData, 'ssl.score', 0),
    brokenLinks: extractMetric(seoData, 'brokenLinks.score', 100),
    javascriptErrors: extractMetric(seoData, 'javascriptErrors.score', 100),
    
    // Content metrics
    contentQuality: extractMetric(seoData, 'contentQuality.score', 0),
    wordCount: extractMetric(seoData, 'contentQuality.metrics.wordCount', 0),
    readabilityScore: extractMetric(seoData, 'contentQuality.metrics.readability', 0),
    keywordDensity: extractMetric(seoData, 'contentQuality.metrics.keywordDensity', 0),
    
    // On-page metrics
    metaTags: extractMetric(seoData, 'metaTags.score', 0),
    headingStructure: extractMetric(seoData, 'contentQuality.metrics.headingStructure', 0),
    urlStructure: extractMetric(seoData, 'urlStructure.score', 0),
    internalLinking: extractMetric(seoData, 'siteArchitecture.metrics.internalLinking', 0),
    
    // Schema & structured data
    schemaMarkup: extractMetric(seoData, 'schemaMarkup.score', 0),
    structuredDataCount: extractMetric(seoData, 'schemaMarkup.metrics.structuredDataCount', 0),
    
    // Performance metrics
    ttfb: extractMetric(seoData, 'pageSpeed.metrics.ttfb', 0),
    lcp: extractMetric(seoData, 'pageSpeed.metrics.lcp', 0),
    cls: extractMetric(seoData, 'pageSpeed.metrics.cls', 0),
    fid: extractMetric(seoData, 'pageSpeed.metrics.fid', 0)
  };
  
  // Additional performance metrics if available
  if (seoData.pageSpeed && seoData.pageSpeed.metrics) {
    Object.assign(metrics, {
      // Extract additional performance metrics if available
      ttfb: seoData.pageSpeed.metrics.ttfb || 0,
      domLoad: seoData.pageSpeed.metrics.domLoad || 0,
      fullLoad: seoData.pageSpeed.metrics.fullLoad || 0
    });
  }
  
  return metrics;
}

/**
 * Safely extract a metric from nested objects
 * @param {Object} data - Source data object
 * @param {string} path - Dot notation path to the metric
 * @param {any} defaultValue - Default value if not found
 * @returns {any} - Extracted metric value
 */
function extractMetric(data, path, defaultValue) {
  const keys = path.split('.');
  let result = data;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }
  
  return result !== undefined ? result : defaultValue;
}

/**
 * Detect industry based on URL and SEO data
 * @param {string} url - The URL being analyzed
 * @param {Object} seoData - Comprehensive SEO data
 * @returns {string} - Detected industry
 */
function detectIndustry(url, seoData) {
  // This is a placeholder for industry detection logic
  // In a real implementation, this would analyze content, keywords, etc.
  
  let detectedIndustry = 'general';
  
  // Check for industry indicators in URL
  const urlLower = url.toLowerCase();
  if (urlLower.includes('health') || urlLower.includes('medical') || urlLower.includes('doctor')) {
    detectedIndustry = 'healthcare';
  } else if (urlLower.includes('finance') || urlLower.includes('bank') || urlLower.includes('loan')) {
    detectedIndustry = 'finance';
  } else if (urlLower.includes('shop') || urlLower.includes('store') || urlLower.includes('product')) {
    detectedIndustry = 'ecommerce';
  } else if (urlLower.includes('travel') || urlLower.includes('tour') || urlLower.includes('hotel')) {
    detectedIndustry = 'travel';
  } else if (urlLower.includes('tech') || urlLower.includes('software') || urlLower.includes('app')) {
    detectedIndustry = 'technology';
  }
  
  // Check content keywords if available
  if (seoData.contentQuality && seoData.contentQuality.metrics && seoData.contentQuality.metrics.topKeywords) {
    const keywords = seoData.contentQuality.metrics.topKeywords;
    
    // Simple keyword-based industry detection
    const industryKeywords = {
      healthcare: ['health', 'medical', 'doctor', 'patient', 'hospital', 'clinic'],
      finance: ['finance', 'bank', 'loan', 'mortgage', 'credit', 'invest'],
      ecommerce: ['shop', 'product', 'buy', 'cart', 'shipping', 'order'],
      travel: ['travel', 'tour', 'hotel', 'flight', 'vacation', 'destination'],
      technology: ['tech', 'software', 'app', 'digital', 'device', 'code']
    };
    
    // Count keyword matches for each industry
    const matches = {};
    Object.entries(industryKeywords).forEach(([industry, keywordList]) => {
      matches[industry] = keywords.filter(kw => 
        keywordList.some(industryKw => kw.toLowerCase().includes(industryKw))
      ).length;
    });
    
    // Find industry with most keyword matches
    const topIndustry = Object.entries(matches)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, count]) => count > 0)[0];
    
    if (topIndustry) {
      detectedIndustry = topIndustry[0];
    }
  }
  
  return detectedIndustry;
}

/**
 * Detect vertical based on URL and SEO data
 * @param {string} url - The URL being analyzed
 * @param {Object} seoData - Comprehensive SEO data
 * @returns {string} - Detected vertical
 */
function detectVertical(url, seoData) {
  // This is a placeholder for vertical detection logic
  // In a real implementation, this would use more sophisticated analysis
  
  // Default to "general" vertical
  return 'general';
}

/**
 * Compare normalized metrics to industry benchmarks
 * @param {Object} normalizedMetrics - Normalized SEO metrics
 * @param {Object} benchmarks - Industry benchmark data
 * @returns {Object} - Comparison results
 */
function compareToBenchmarks(normalizedMetrics, benchmarks) {
  const result = {};
  
  // For each metric, calculate how it compares to the benchmark
  for (const [metric, value] of Object.entries(normalizedMetrics)) {
    if (benchmarks.metrics && benchmarks.metrics[metric]) {
      const benchmark = benchmarks.metrics[metric];
      
      // Calculate percentage of benchmark (100% = meeting benchmark)
      let percentOfBenchmark;
      
      // For some metrics, lower is better (like load times)
      if (benchmark.lowerIsBetter) {
        percentOfBenchmark = benchmark.value > 0 ? (benchmark.value / value) * 100 : 100;
      } else {
        percentOfBenchmark = benchmark.value > 0 ? (value / benchmark.value) * 100 : 100;
      }
      
      result[metric] = {
        value,
        benchmark: benchmark.value,
        percentOfBenchmark,
        lowerIsBetter: benchmark.lowerIsBetter,
        importance: benchmark.importance || 'medium'
      };
    } else {
      // No benchmark available
      result[metric] = {
        value,
        benchmark: null,
        percentOfBenchmark: null,
        importance: 'low'
      };
    }
  }
  
  return result;
}

/**
 * Calculate scores for broad SEO categories
 * @param {Object} benchmarkedMetrics - Metrics compared to benchmarks
 * @returns {Object} - Category scores
 */
function calculateCategoryScores(benchmarkedMetrics) {
  // Define which metrics belong to which categories
  const categoryMetrics = {
    technical: ['pageSpeed', 'mobileResponsiveness', 'crawlability', 'ssl', 'brokenLinks', 'javascriptErrors'],
    content: ['contentQuality', 'wordCount', 'readabilityScore', 'keywordDensity'],
    onPage: ['metaTags', 'headingStructure', 'urlStructure', 'internalLinking'],
    schema: ['schemaMarkup', 'structuredDataCount'],
    performance: ['ttfb', 'lcp', 'cls', 'fid']
  };
  
  const categoryScores = {};
  
  // Calculate score for each category
  for (const [category, metrics] of Object.entries(categoryMetrics)) {
    // Get all available metrics for this category
    const availableMetrics = metrics.filter(metric => 
      benchmarkedMetrics[metric] && 
      benchmarkedMetrics[metric].percentOfBenchmark !== null
    );
    
    if (availableMetrics.length === 0) {
      categoryScores[category] = null;
      continue;
    }
    
    // Calculate weighted average based on importance
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const metric of availableMetrics) {
      const { percentOfBenchmark, importance } = benchmarkedMetrics[metric];
      const weight = getImportanceWeight(importance);
      
      weightedSum += percentOfBenchmark * weight;
      totalWeight += weight;
    }
    
    // Calculate final category score (0-100)
    const score = totalWeight > 0 ? 
      Math.min(100, Math.max(0, weightedSum / totalWeight)) : 
      null;
    
    categoryScores[category] = score ? Math.round(score) : null;
  }
  
  return categoryScores;
}

/**
 * Calculate scores for individual SEO factors
 * @param {Object} benchmarkedMetrics - Metrics compared to benchmarks
 * @returns {Object} - Factor scores
 */
function calculateFactorScores(benchmarkedMetrics) {
  const factorScores = {};
  
  // For each metric that has benchmark data, convert to a 0-100 score
  for (const [metric, data] of Object.entries(benchmarkedMetrics)) {
    if (data.percentOfBenchmark !== null) {
      // Cap at 100 for scores, prevent unreasonably high scores
      factorScores[metric] = Math.min(100, Math.round(data.percentOfBenchmark));
    }
  }
  
  return factorScores;
}

/**
 * Apply weighting to factor scores based on industry and vertical
 * @param {Object} factorScores - Unweighted factor scores
 * @param {Object} weights - Factor weights
 * @returns {Object} - Weighted factor scores
 */
function applyFactorWeighting(factorScores, weights) {
  const weightedFactors = {};
  
  // For each factor, apply its weight to determine its contribution
  for (const [factor, score] of Object.entries(factorScores)) {
    const weight = weights[factor] || 1;
    weightedFactors[factor] = {
      score,
      weight,
      weightedScore: score * weight
    };
  }
  
  return weightedFactors;
}

/**
 * Determine appropriate factor weights based on industry and vertical
 * @param {string} industry - The industry category
 * @param {string} vertical - The vertical within the industry
 * @returns {Object} - Factor weights
 */
function determineFactorWeights(industry, vertical) {
  // Base weights that apply to all industries
  const baseWeights = {
    pageSpeed: 1.0,
    mobileResponsiveness: 1.0,
    crawlability: 1.0,
    ssl: 1.0,
    brokenLinks: 1.0,
    javascriptErrors: 0.8,
    contentQuality: 1.0,
    wordCount: 0.7,
    readabilityScore: 0.8,
    keywordDensity: 0.6,
    metaTags: 0.9,
    headingStructure: 0.8,
    urlStructure: 0.7,
    internalLinking: 0.8,
    schemaMarkup: 0.7,
    structuredDataCount: 0.6,
    ttfb: 0.8,
    lcp: 0.9,
    cls: 0.8,
    fid: 0.8
  };
  
  // Industry-specific weight adjustments
  const industryAdjustments = {
    ecommerce: {
      pageSpeed: 1.2,
      mobileResponsiveness: 1.2,
      schemaMarkup: 1.3,
      structuredDataCount: 1.2,
      lcp: 1.2,
      cls: 1.1,
      fid: 1.1
    },
    healthcare: {
      contentQuality: 1.3,
      readabilityScore: 1.2,
      ssl: 1.2,
      metaTags: 1.1
    },
    finance: {
      ssl: 1.3,
      pageSpeed: 1.1,
      contentQuality: 1.2,
      readabilityScore: 1.1
    },
    travel: {
      mobileResponsiveness: 1.3,
      pageSpeed: 1.2,
      schemaMarkup: 1.2,
      metaTags: 1.1
    },
    technology: {
      javascriptErrors: 1.2,
      pageSpeed: 1.1,
      crawlability: 1.1,
      internalLinking: 1.1
    },
    general: {}
  };
  
  // Apply industry-specific adjustments
  const finalWeights = { ...baseWeights };
  const adjustments = industryAdjustments[industry] || industryAdjustments.general;
  
  for (const [factor, adjustment] of Object.entries(adjustments)) {
    if (finalWeights[factor]) {
      finalWeights[factor] *= adjustment;
    }
  }
  
  // Normalize weights so they sum to the original total
  const originalSum = Object.values(baseWeights).reduce((sum, weight) => sum + weight, 0);
  const newSum = Object.values(finalWeights).reduce((sum, weight) => sum + weight, 0);
  const normalizationFactor = originalSum / newSum;
  
  for (const factor in finalWeights) {
    finalWeights[factor] *= normalizationFactor;
  }
  
  return finalWeights;
}

/**
 * Calculate comparison against industry benchmarks
 * @param {Object} normalizedMetrics - Normalized SEO metrics
 * @param {Object} benchmarks - Industry benchmark data
 * @returns {Object} - Benchmark comparison
 */
function calculateBenchmarkComparison(normalizedMetrics, benchmarks) {
  // Calculate overall comparison
  const comparisons = {};
  const percentiles = {};
  let totalPercentOfBenchmark = 0;
  let metricCount = 0;
  
  // Calculate percentile for each metric
  for (const [metric, value] of Object.entries(normalizedMetrics)) {
    if (benchmarks.metrics && benchmarks.metrics[metric]) {
      const benchmark = benchmarks.metrics[metric];
      let percentOfBenchmark;
      
      // For some metrics, lower is better (like load times)
      if (benchmark.lowerIsBetter) {
        percentOfBenchmark = benchmark.value > 0 ? (benchmark.value / value) * 100 : 100;
      } else {
        percentOfBenchmark = benchmark.value > 0 ? (value / benchmark.value) * 100 : 100;
      }
      
      // Calculate percentile based on distribution if available
      let percentile = 50; // Default to median
      if (benchmark.distribution) {
        percentile = calculatePercentile(value, benchmark.distribution, benchmark.lowerIsBetter);
      }
      
      comparisons[metric] = percentOfBenchmark;
      percentiles[metric] = percentile;
      
      totalPercentOfBenchmark += percentOfBenchmark;
      metricCount++;
    }
  }
  
  const averagePercentOfBenchmark = metricCount > 0 ? totalPercentOfBenchmark / metricCount : 0;
  const overallPercentile = calculateOverallPercentile(percentiles, benchmarks);
  
  return {
    averagePercentOfBenchmark,
    overallPercentile,
    comparisons,
    percentiles
  };
}

/**
 * Calculate comparison against competitors
 * @param {Object} normalizedMetrics - Normalized SEO metrics
 * @param {Array} competitorData - Competitor SEO data
 * @returns {Object} - Competitor comparison
 */
function calculateCompetitorComparison(normalizedMetrics, competitorData) {
  if (!Array.isArray(competitorData) || competitorData.length === 0) {
    return null;
  }
  
  const comparison = {
    overall: {
      rank: 0,
      totalCompetitors: competitorData.length,
      percentile: 0
    },
    metrics: {}
  };
  
  // For each metric, calculate rank and percentile relative to competitors
  for (const [metric, value] of Object.entries(normalizedMetrics)) {
    // Collect all values for this metric across competitors
    const competitorValues = competitorData
      .map(competitor => competitor.metrics && competitor.metrics[metric])
      .filter(val => val !== undefined && val !== null);
    
    if (competitorValues.length === 0) {
      continue;
    }
    
    // Determine if lower is better for this metric
    const lowerIsBetter = ['ttfb', 'lcp', 'cls', 'fid'].includes(metric);
    
    // Sort values (including the current site's value)
    const allValues = [...competitorValues, value].sort((a, b) => 
      lowerIsBetter ? a - b : b - a
    );
    
    // Find rank (position in sorted array)
    const rank = allValues.indexOf(value) + 1;
    
    // Calculate percentile
    const percentile = ((allValues.length - rank) / (allValues.length - 1)) * 100;
    
    comparison.metrics[metric] = {
      value,
      rank,
      totalCompetitors: competitorValues.length,
      percentile: Math.round(percentile),
      lowerIsBetter
    };
  }
  
  // Calculate overall rank and percentile
  const metricPercentiles = Object.values(comparison.metrics).map(m => m.percentile);
  if (metricPercentiles.length > 0) {
    const avgPercentile = metricPercentiles.reduce((sum, p) => sum + p, 0) / metricPercentiles.length;
    comparison.overall.percentile = Math.round(avgPercentile);
    
    // Estimate overall rank based on percentile
    const estimatedRank = Math.round((100 - avgPercentile) / 100 * (competitorData.length + 1));
    comparison.overall.rank = Math.max(1, Math.min(competitorData.length + 1, estimatedRank));
  }
  
  return comparison;
}

/**
 * Calculate historical trend if historical data is available
 * @param {Object} normalizedMetrics - Current normalized SEO metrics
 * @param {Array} historicalData - Historical SEO data
 * @returns {Object} - Historical trend analysis
 */
function calculateHistoricalTrend(normalizedMetrics, historicalData) {
  if (!Array.isArray(historicalData) || historicalData.length === 0) {
    return null;
  }
  
  const trend = {
    overall: {
      direction: null,
      percentChange: null,
      periods: historicalData.length
    },
    metrics: {}
  };
  
  // Add current data point to historical data for trend calculation
  const currentDataPoint = {
    timestamp: new Date().toISOString(),
    metrics: normalizedMetrics
  };
  const allData = [...historicalData, currentDataPoint].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  // Calculate trends for each metric
  for (const [metric, currentValue] of Object.entries(normalizedMetrics)) {
    // Get historical values for this metric
    const history = allData
      .map(point => ({
        timestamp: point.timestamp,
        value: point.metrics && point.metrics[metric]
      }))
      .filter(point => point.value !== undefined && point.value !== null);
    
    if (history.length < 2) {
      continue;
    }
    
    // Get first and most recent value
    const firstPoint = history[0];
    const lastPoint = history[history.length - 2]; // Second to last is the most recent historical
    const currentPoint = history[history.length - 1]; // Last is current
    
    // Calculate short-term change (from most recent historical to current)
    const shortTermChange = currentPoint.value - lastPoint.value;
    const shortTermPercentChange = lastPoint.value !== 0 ? 
      (shortTermChange / lastPoint.value) * 100 : 0;
    
    // Calculate long-term change (from first to current)
    const longTermChange = currentPoint.value - firstPoint.value;
    const longTermPercentChange = firstPoint.value !== 0 ? 
      (longTermChange / firstPoint.value) * 100 : 0;
    
    // Determine if lower is better for this metric
    const lowerIsBetter = ['ttfb', 'lcp', 'cls', 'fid'].includes(metric);
    
    // Determine trend direction
    let shortTermDirection, longTermDirection;
    
    if (lowerIsBetter) {
      shortTermDirection = shortTermChange < 0 ? 'improving' : (shortTermChange > 0 ? 'declining' : 'stable');
      longTermDirection = longTermChange < 0 ? 'improving' : (longTermChange > 0 ? 'declining' : 'stable');
    } else {
      shortTermDirection = shortTermChange > 0 ? 'improving' : (shortTermChange < 0 ? 'declining' : 'stable');
      longTermDirection = longTermChange > 0 ? 'improving' : (longTermChange < 0 ? 'declining' : 'stable');
    }
    
    trend.metrics[metric] = {
      current: currentPoint.value,
      short: {
        direction: shortTermDirection,
        change: shortTermChange,
        percentChange: shortTermPercentChange
      },
      long: {
        direction: longTermDirection,
        change: longTermChange,
        percentChange: longTermPercentChange,
        periodCount: history.length - 1
      },
      history: history.map(point => ({
        timestamp: point.timestamp,
        value: point.value
      }))
    };
  }
  
  // Calculate overall trend
  const metricDirections = Object.values(trend.metrics).map(m => m.short.direction);
  const improvingCount = metricDirections.filter(d => d === 'improving').length;
  const decliningCount = metricDirections.filter(d => d === 'declining').length;
  const stableCount = metricDirections.filter(d => d === 'stable').length;
  
  if (improvingCount > decliningCount + stableCount) {
    trend.overall.direction = 'improving';
  } else if (decliningCount > improvingCount + stableCount) {
    trend.overall.direction = 'declining';
  } else if (stableCount > improvingCount + decliningCount) {
    trend.overall.direction = 'stable';
  } else if (improvingCount > decliningCount) {
    trend.overall.direction = 'slightly-improving';
  } else if (decliningCount > improvingCount) {
    trend.overall.direction = 'slightly-declining';
  } else {
    trend.overall.direction = 'mixed';
  }
  
  // Calculate average percent change
  const percentChanges = Object.values(trend.metrics)
    .map(m => m.short.percentChange)
    .filter(pc => !isNaN(pc));
  
  if (percentChanges.length > 0) {
    trend.overall.percentChange = percentChanges.reduce((sum, pc) => sum + pc, 0) / percentChanges.length;
  }
  
  return trend;
}

/**
 * Calculate percentile for a value within a distribution
 * @param {number} value - The value to position
 * @param {Object} distribution - Distribution data
 * @param {boolean} lowerIsBetter - Whether lower values are better
 * @returns {number} - Percentile (0-100)
 */
function calculatePercentile(value, distribution, lowerIsBetter) {
  // Basic implementation - can be enhanced with more sophisticated statistics
  const { p10, p25, p50, p75, p90 } = distribution;
  
  let percentile = 50; // Default to median
  
  if (lowerIsBetter) {
    // For metrics where lower is better (like load times)
    if (value <= p10) percentile = 90;
    else if (value <= p25) percentile = 75;
    else if (value <= p50) percentile = 50;
    else if (value <= p75) percentile = 25;
    else if (value <= p90) percentile = 10;
    else percentile = 5;
  } else {
    // For metrics where higher is better (like scores)
    if (value >= p90) percentile = 90;
    else if (value >= p75) percentile = 75;
    else if (value >= p50) percentile = 50;
    else if (value >= p25) percentile = 25;
    else if (value >= p10) percentile = 10;
    else percentile = 5;
  }
  
  return percentile;
}

/**
 * Calculate overall percentile based on individual metric percentiles
 * @param {Object} percentiles - Percentiles for individual metrics
 * @param {Object} benchmarks - Benchmark data with importance weights
 * @returns {number} - Overall percentile
 */
function calculateOverallPercentile(percentiles, benchmarks) {
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const [metric, percentile] of Object.entries(percentiles)) {
    const importance = benchmarks.metrics?.[metric]?.importance || 'medium';
    const weight = getImportanceWeight(importance);
    
    weightedSum += percentile * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
}

/**
 * Get numeric weight for importance level
 * @param {string} importance - Importance level (low, medium, high, critical)
 * @returns {number} - Numeric weight
 */
function getImportanceWeight(importance) {
  switch (importance) {
    case 'critical': return 3.0;
    case 'high': return 2.0;
    case 'medium': return 1.0;
    case 'low': return 0.5;
    default: return 1.0;
  }
}

/**
 * Generate recommendations based on scores and benchmarked metrics
 * @param {Object} score - Score data
 * @param {Object} benchmarkedMetrics - Metrics compared to benchmarks
 * @param {Object} benchmarks - Benchmark data
 * @returns {Array} - Recommendations
 */
function generateRecommendations(score, benchmarkedMetrics, benchmarks) {
  const recommendations = [];
  
  // Generate recommendations for underperforming metrics
  for (const [metric, data] of Object.entries(benchmarkedMetrics)) {
    // Skip metrics without benchmark data
    if (!data.benchmark) continue;
    
    // Calculate how far from benchmark
    const percentOfBenchmark = data.percentOfBenchmark;
    
    // Only generate recommendations for metrics significantly below benchmark
    if (percentOfBenchmark < 70) {
      // Get recommendation text based on metric type
      const recommendationText = getRecommendationText(metric, data, benchmarks);
      
      if (recommendationText) {
        recommendations.push({
          id: uuidv4(),
          metric,
          title: `Improve ${formatMetricName(metric)}`,
          description: recommendationText,
          importance: data.importance || 'medium',
          currentValue: data.value,
          benchmarkValue: data.benchmark,
          percentOfBenchmark,
          potentialImpact: calculatePotentialImpact(metric, data, score, benchmarks)
        });
      }
    }
  }
  
  // Sort recommendations by importance and impact
  return recommendations.sort((a, b) => {
    const importanceA = getImportanceWeight(a.importance);
    const importanceB = getImportanceWeight(b.importance);
    
    if (importanceA !== importanceB) {
      return importanceB - importanceA; // Higher importance first
    }
    
    return b.potentialImpact - a.potentialImpact; // Higher impact first
  });
}

/**
 * Generate issues from scores for integration with the main SEO issues list
 * @param {Object} score - Score data
 * @param {Object} benchmarkedMetrics - Metrics compared to benchmarks
 * @param {Object} benchmarks - Benchmark data
 * @returns {Array} - Issues
 */
function generateIssuesFromScores(score, benchmarkedMetrics, benchmarks) {
  const issues = [];
  
  // Convert significant underperforming metrics into issues
  for (const [metric, data] of Object.entries(benchmarkedMetrics)) {
    // Skip metrics without benchmark data
    if (!data.benchmark) continue;
    
    // Calculate how far from benchmark
    const percentOfBenchmark = data.percentOfBenchmark;
    
    // Define severity based on importance and performance
    let severity;
    if (percentOfBenchmark < 50) {
      severity = data.importance === 'critical' ? 'critical' : 
                (data.importance === 'high' ? 'high' : 'medium');
    } else if (percentOfBenchmark < 70) {
      severity = data.importance === 'critical' ? 'high' : 
                (data.importance === 'high' ? 'medium' : 'low');
    } else {
      continue; // Don't create issues for metrics close to or above benchmark
    }
    
    // Get recommendation text
    const recommendationText = getRecommendationText(metric, data, benchmarks);
    
    if (recommendationText) {
      issues.push({
        id: uuidv4(),
        title: `Underperforming ${formatMetricName(metric)}`,
        description: `Your ${formatMetricName(metric)} is at ${Math.round(percentOfBenchmark)}% of industry benchmark.`,
        severity,
        category: 'seo-score',
        subCategory: getMetricCategory(metric),
        impact: `${data.importance.charAt(0).toUpperCase() + data.importance.slice(1)} - Affects overall SEO performance`,
        recommendation: recommendationText
      });
    }
  }
  
  return issues;
}

/**
 * Format metric name for display
 * @param {string} metric - Metric key
 * @returns {string} - Formatted metric name
 */
function formatMetricName(metric) {
  const nameMap = {
    pageSpeed: 'Page Speed',
    mobileResponsiveness: 'Mobile Responsiveness',
    crawlability: 'Crawlability',
    ssl: 'SSL Security',
    brokenLinks: 'Broken Links',
    javascriptErrors: 'JavaScript Errors',
    contentQuality: 'Content Quality',
    wordCount: 'Content Length',
    readabilityScore: 'Readability',
    keywordDensity: 'Keyword Usage',
    metaTags: 'Meta Tags',
    headingStructure: 'Heading Structure',
    urlStructure: 'URL Structure',
    internalLinking: 'Internal Linking',
    schemaMarkup: 'Schema Markup',
    structuredDataCount: 'Structured Data',
    ttfb: 'Time to First Byte',
    lcp: 'Largest Contentful Paint',
    cls: 'Cumulative Layout Shift',
    fid: 'First Input Delay'
  };
  
  return nameMap[metric] || metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

/**
 * Get metric category
 * @param {string} metric - Metric key
 * @returns {string} - Category name
 */
function getMetricCategory(metric) {
  const categoryMap = {
    pageSpeed: 'performance',
    mobileResponsiveness: 'technical',
    crawlability: 'technical',
    ssl: 'technical',
    brokenLinks: 'technical',
    javascriptErrors: 'technical',
    contentQuality: 'content',
    wordCount: 'content',
    readabilityScore: 'content',
    keywordDensity: 'content',
    metaTags: 'on-page',
    headingStructure: 'on-page',
    urlStructure: 'on-page',
    internalLinking: 'on-page',
    schemaMarkup: 'structured-data',
    structuredDataCount: 'structured-data',
    ttfb: 'performance',
    lcp: 'performance',
    cls: 'performance',
    fid: 'performance'
  };
  
  return categoryMap[metric] || 'other';
}

/**
 * Get recommendation text for a specific metric
 * @param {string} metric - Metric key
 * @param {Object} data - Metric data
 * @param {Object} benchmarks - Benchmark data
 * @returns {string} - Recommendation text
 */
function getRecommendationText(metric, data, benchmarks) {
  // Generic recommendations for different metrics
  const recommendationTexts = {
    pageSpeed: 'Optimize images, minify CSS/JS, leverage browser caching, and reduce server response time to improve page speed.',
    mobileResponsiveness: 'Ensure your site is fully responsive, use viewport meta tags, and optimize touch targets for mobile users.',
    crawlability: 'Improve your robots.txt, XML sitemap, and fix crawl errors to enhance search engine crawlability.',
    ssl: 'Implement proper SSL certificate and ensure all resources are loaded securely.',
    brokenLinks: 'Fix broken internal links and update or remove broken external links to improve user experience.',
    javascriptErrors: 'Address JavaScript errors by debugging console errors and ensuring proper script loading order.',
    contentQuality: 'Enhance content quality with comprehensive, well-structured, and engaging content that addresses user intent.',
    wordCount: 'Increase content length to provide more comprehensive information on the topic.',
    readabilityScore: 'Improve readability by using shorter sentences, simpler language, and better content structure.',
    keywordDensity: 'Optimize keyword usage by incorporating target keywords naturally throughout your content.',
    metaTags: 'Improve meta titles and descriptions to be compelling, keyword-rich, and within character limits.',
    headingStructure: 'Create a clear heading hierarchy using H1-H6 tags to structure your content logically.',
    urlStructure: 'Optimize URLs to be short, descriptive, and keyword-rich with proper hierarchy.',
    internalLinking: 'Enhance internal linking by connecting related content and using descriptive anchor text.',
    schemaMarkup: 'Implement structured data markup to help search engines understand your content better.',
    structuredDataCount: 'Add more structured data types relevant to your content to enhance search visibility.',
    ttfb: 'Improve server response time by optimizing server configuration, using CDN, and caching.',
    lcp: 'Optimize Largest Contentful Paint by improving image loading, server response time, and render-blocking resources.',
    cls: 'Reduce Cumulative Layout Shift by specifying image dimensions and avoiding dynamically injected content.',
    fid: 'Improve First Input Delay by minimizing main thread work and breaking up long tasks.'
  };
  
  // Get specific recommendation from benchmark data if available
  const benchmarkRecommendation = benchmarks.metrics?.[metric]?.recommendation;
  
  return benchmarkRecommendation || recommendationTexts[metric] || 
    `Improve your ${formatMetricName(metric)} to match or exceed industry benchmarks.`;
}

/**
 * Calculate potential impact of improving a metric
 * @param {string} metric - Metric key
 * @param {Object} data - Metric data
 * @param {Object} score - Score data
 * @param {Object} benchmarks - Benchmark data
 * @returns {number} - Potential impact score (0-100)
 */
function calculatePotentialImpact(metric, data, score, benchmarks) {
  // Base impact on importance
  const importanceWeight = getImportanceWeight(data.importance || 'medium');
  
  // Additional impact based on how far from benchmark
  const percentFromBenchmark = Math.max(0, 100 - data.percentOfBenchmark);
  
  // Factor in how much this metric contributes to overall score
  const metricWeight = benchmarks.metrics?.[metric]?.weight || 1;
  
  // Calculate impact score (0-100)
  let impact = (importanceWeight * 20) + (percentFromBenchmark / 2) + (metricWeight * 10);
  
  // Cap at 100
  return Math.min(100, Math.round(impact));
}

/**
 * Get top performing or underperforming factors
 * @param {Object} weightedFactors - Weighted factor scores
 * @param {number} count - Number of factors to return
 * @param {boolean} topPerforming - True for top performing, false for underperforming
 * @returns {Array} - Top factors
 */
function getTopFactors(weightedFactors, count, topPerforming) {
  const factors = Object.entries(weightedFactors)
    .map(([factor, data]) => ({
      factor,
      score: data.score,
      weight: data.weight,
      weightedScore: data.weightedScore
    }))
    .sort((a, b) => topPerforming ? 
      b.score - a.score : // Higher score first for top performing
      a.score - b.score   // Lower score first for underperforming
    )
    .slice(0, count);
  
  return factors;
}

/**
 * Get benchmark positioning description
 * @param {Object} benchmarkComparison - Benchmark comparison data
 * @returns {string} - Benchmark position description
 */
function getBenchmarkPosition(benchmarkComparison) {
  const percentile = benchmarkComparison.overallPercentile;
  
  if (percentile >= 90) {
    return 'Industry leader (top 10%)';
  } else if (percentile >= 75) {
    return 'Above average (top 25%)';
  } else if (percentile >= 50) {
    return 'Average (top 50%)';
  } else if (percentile >= 25) {
    return 'Below average (bottom 50%)';
  } else {
    return 'Significant improvement needed (bottom 25%)';
  }
}

/**
 * Get overall recommendation based on score and industry
 * @param {Object} score - Score data
 * @param {string} industry - Industry category
 * @returns {string} - Overall recommendation
 */
function getOverallRecommendation(score, industry) {
  const overallScore = score.overall;
  
  if (overallScore >= 90) {
    return `Excellent SEO performance for the ${industry} industry. Focus on maintaining your competitive edge and exploring advanced SEO techniques.`;
  } else if (overallScore >= 75) {
    return `Good SEO performance for the ${industry} industry. Addressing the recommended improvements will help you reach the top tier.`;
  } else if (overallScore >= 60) {
    return `Average SEO performance for the ${industry} industry. Focus on the high-impact recommendations to gain a competitive advantage.`;
  } else if (overallScore >= 40) {
    return `Below average SEO performance for the ${industry} industry. Prioritize fixing critical issues to improve search visibility.`;
  } else {
    return `Significant SEO improvements needed for the ${industry} industry. Following the recommended actions will help establish a stronger foundation.`;
  }
}

module.exports = AdvancedSeoScoreCalculator;
