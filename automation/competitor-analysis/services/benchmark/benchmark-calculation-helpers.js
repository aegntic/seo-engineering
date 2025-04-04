/**
 * Benchmark Calculation Helpers
 * 
 * These helper functions support the benchmark calculation process
 * with common utility functions for calculating scores and metrics.
 */

/**
 * Calculate a technical SEO score
 * @param {Object} seoHealth SEO health metrics
 * @returns {number} Technical SEO score (0-100)
 */
function calculateTechnicalScore(seoHealth) {
  if (!seoHealth) {
    return 0;
  }
  
  // Calculate technical score based on key metrics
  const metricWeights = {
    missingTitlesPercent: 0.2,
    missingDescriptionsPercent: 0.2,
    hasSchemaMarkupPercent: 0.2,
    hasCanonicalPercent: 0.2,
    hasMobileViewportPercent: 0.2
  };
  
  let total = 0;
  let weightSum = 0;
  
  Object.entries(metricWeights).forEach(([metric, weight]) => {
    if (seoHealth[metric] !== undefined) {
      let value = seoHealth[metric];
      
      // For "missing" metrics, invert the percentage
      if (metric.startsWith('missing')) {
        value = 100 - value;
      }
      
      total += value * weight;
      weightSum += weight;
    }
  });
  
  return weightSum > 0 ? total / weightSum : 0;
}

/**
 * Calculate a content score
 * @param {Object} contentStats Content statistics
 * @returns {number} Content score (0-100)
 */
function calculateContentScore(contentStats) {
  if (!contentStats) {
    return 0;
  }
  
  // Define optimal ranges for content metrics
  const optimalRanges = {
    averageTitleLength: { min: 50, max: 60 },
    averageDescriptionLength: { min: 140, max: 160 },
    averageContentLength: { min: 800, max: 2000 }
  };
  
  // Calculate content score based on key metrics
  const metricWeights = {
    averageTitleLength: 0.25,
    averageDescriptionLength: 0.25,
    averageContentLength: 0.5
  };
  
  let total = 0;
  let weightSum = 0;
  
  Object.entries(metricWeights).forEach(([metric, weight]) => {
    if (contentStats[metric] !== undefined) {
      const value = contentStats[metric];
      const range = optimalRanges[metric];
      
      // Calculate score based on optimal range
      let score = 0;
      
      if (value >= range.min && value <= range.max) {
        // Value is in optimal range - 100% score
        score = 100;
      } else if (value < range.min) {
        // Value is below minimum - prorated score
        score = (value / range.min) * 100;
      } else {
        // Value is above maximum - prorated score (inverse)
        score = (range.max / value) * 100;
      }
      
      total += score * weight;
      weightSum += weight;
    }
  });
  
  return weightSum > 0 ? total / weightSum : 0;
}

/**
 * Calculate a keyword score
 * @param {Object} keywordAnalysis Keyword analysis data
 * @returns {number} Keyword score (0-100)
 */
function calculateKeywordScore(keywordAnalysis) {
  if (!keywordAnalysis || Object.keys(keywordAnalysis).length === 0) {
    return 0;
  }
  
  // Calculate keyword score based on key metrics
  let keywordImportanceTotal = 0;
  let keywordCount = 0;
  
  Object.values(keywordAnalysis).forEach(keyword => {
    keywordImportanceTotal += keyword.importanceScore || 0;
    keywordCount++;
  });
  
  // Return average importance score
  return keywordCount > 0 ? keywordImportanceTotal / keywordCount : 0;
}

/**
 * Calculate a performance score
 * @param {Object} performance Performance metrics
 * @returns {number} Performance score (0-100)
 */
function calculatePerformanceScore(performance) {
  if (!performance) {
    return 0;
  }
  
  // Define performance thresholds (lower is better)
  const performanceThresholds = {
    domContentLoaded: { good: 1000, medium: 2000, poor: 3000 },
    load: { good: 2000, medium: 4000, poor: 6000 },
    firstPaint: { good: 800, medium: 1500, poor: 2500 },
    firstContentfulPaint: { good: 1000, medium: 2000, poor: 3000 },
    largestContentfulPaint: { good: 2500, medium: 4000, poor: 6000 }
  };
  
  // Calculate performance score based on key metrics
  const metricWeights = {
    domContentLoaded: 0.25,
    load: 0.25,
    firstPaint: 0.2,
    firstContentfulPaint: 0.15,
    largestContentfulPaint: 0.15
  };
  
  let total = 0;
  let weightSum = 0;
  
  Object.entries(metricWeights).forEach(([metric, weight]) => {
    if (performance[metric] !== undefined) {
      const value = performance[metric];
      const thresholds = performanceThresholds[metric];
      
      // Calculate score based on thresholds (lower is better)
      let score = 0;
      
      if (value <= thresholds.good) {
        score = 100;
      } else if (value <= thresholds.medium) {
        score = 75 - ((value - thresholds.good) / (thresholds.medium - thresholds.good)) * 25;
      } else if (value <= thresholds.poor) {
        score = 50 - ((value - thresholds.medium) / (thresholds.poor - thresholds.medium)) * 25;
      } else {
        score = Math.max(0, 25 - ((value - thresholds.poor) / thresholds.poor) * 25);
      }
      
      total += score * weight;
      weightSum += weight;
    }
  });
  
  return weightSum > 0 ? total / weightSum : 0;
}

/**
 * Calculate a distribution for visualization
 * @param {number} clientScore Client score
 * @param {Array} competitorScores Array of competitor scores
 * @returns {Object} Distribution data
 */
function calculateDistribution(clientScore, competitorScores) {
  // Initialize distribution data
  const distribution = {
    ranges: [
      { min: 0, max: 20, label: '0-20' },
      { min: 20, max: 40, label: '20-40' },
      { min: 40, max: 60, label: '40-60' },
      { min: 60, max: 80, label: '60-80' },
      { min: 80, max: 100, label: '80-100' }
    ],
    counts: [0, 0, 0, 0, 0],
    clientPosition: null
  };
  
  // Add client score to distribution
  for (let i = 0; i < distribution.ranges.length; i++) {
    const range = distribution.ranges[i];
    
    if (clientScore >= range.min && clientScore < range.max) {
      distribution.clientPosition = i;
      break;
    }
  }
  
  // Add competitor scores to distribution
  competitorScores.forEach(score => {
    for (let i = 0; i < distribution.ranges.length; i++) {
      const range = distribution.ranges[i];
      
      if (score >= range.min && score < range.max) {
        distribution.counts[i]++;
        break;
      }
    }
  });
  
  // Calculate percentiles
  let scores = [...competitorScores];
  scores.sort((a, b) => a - b);
  
  const percentiles = {
    p25: calculatePercentile(scores, 25),
    p50: calculatePercentile(scores, 50),
    p75: calculatePercentile(scores, 75),
    client: clientScore
  };
  
  distribution.percentiles = percentiles;
  
  return distribution;
}

/**
 * Calculate a percentile from an array of scores
 * @param {Array} scores Sorted array of scores
 * @param {number} percentile Percentile to calculate (1-99)
 * @returns {number} Percentile value
 */
function calculatePercentile(scores, percentile) {
  if (scores.length === 0) return 0;
  
  const index = Math.ceil((percentile / 100) * scores.length) - 1;
  return scores[Math.max(0, Math.min(scores.length - 1, index))];
}

/**
 * Extract domain from URL
 * @param {string} url URL
 * @returns {string} Domain name
 */
function getDomainFromUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.startsWith('www.') ? domain.substring(4) : domain;
  } catch (error) {
    return url;
  }
}

module.exports = {
  calculateTechnicalScore,
  calculateContentScore,
  calculateKeywordScore,
  calculatePerformanceScore,
  calculateDistribution,
  calculatePercentile,
  getDomainFromUrl
};
