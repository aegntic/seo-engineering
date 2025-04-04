/**
 * Statistical Analysis Module
 * 
 * Performs statistical analysis on A/B test data to determine
 * if there is a statistically significant difference between variants.
 * 
 * Last updated: April 4, 2025
 */

const logger = require('../../utils/logger');
const { jStat } = require('jstat');
const { trackPerformance } = require('./performance-tracker');
const { createTestDefinition } = require('./test-definition');

/**
 * Analyzes the results of an A/B test
 * 
 * @param {string} testId - ID of the test to analyze
 * @param {Object} options - Analysis options
 * @returns {Object} - Analysis results
 */
async function analyzeSplitTestData(testId, options = {}) {
  try {
    logger.info(`Analyzing A/B test data for test: ${testId}`);
    
    // Get test definition
    const test = await createTestDefinition.getById(testId);
    if (!test) {
      throw new Error(`Test not found: ${testId}`);
    }
    
    // Get performance data for all variants
    const performanceData = await trackPerformance.getByTestId(testId, options);
    if (!performanceData || performanceData.length === 0) {
      throw new Error(`No performance data available for test: ${testId}`);
    }
    
    // Get variants
    const variants = await require('./variant-creator').getByTestId(testId);
    if (!variants || variants.length === 0) {
      throw new Error(`No variants found for test: ${testId}`);
    }
    
    // Find control variant
    const controlVariant = variants.find(v => v.type === 'control');
    if (!controlVariant) {
      throw new Error(`No control variant found for test: ${testId}`);
    }
    
    // Determine primary metric
    const primaryMetric = test.metrics.primary;
    
    // Group performance data by variant
    const dataByVariant = groupDataByVariant(performanceData, primaryMetric);
    
    // Ensure we have data for each variant
    for (const variant of variants) {
      if (!dataByVariant[variant.id] || dataByVariant[variant.id].length === 0) {
        logger.warn(`No data for variant: ${variant.id}`);
        dataByVariant[variant.id] = [];
      }
    }
    
    // Calculate statistics for each variant
    const variantStats = calculateVariantStatistics(dataByVariant);
    
    // Perform statistical tests
    const testResults = performStatisticalTests(
      variantStats, 
      controlVariant.id, 
      test.confidenceThreshold
    );
    
    // Determine if there's a winner
    const { hasWinner, winner } = determineWinner(
      testResults, 
      variantStats, 
      primaryMetric
    );
    
    // Calculate improvement percentage if there's a winner
    let improvementPercentage = null;
    if (hasWinner && winner) {
      improvementPercentage = calculateImprovementPercentage(
        variantStats[winner.id],
        variantStats[controlVariant.id],
        primaryMetric
      );
    }
    
    // Prepare results
    const results = {
      testId,
      primaryMetric,
      confidenceThreshold: test.confidenceThreshold,
      variantStats,
      testResults,
      hasWinner,
      winner,
      improvementPercentage,
      sampleSizes: Object.keys(dataByVariant).reduce((obj, key) => {
        obj[key] = dataByVariant[key].length;
        return obj;
      }, {}),
      analysisTimestamp: new Date()
    };
    
    logger.info(`Completed analysis for test: ${testId}`);
    
    return results;
  } catch (error) {
    logger.error(`Error analyzing test data: ${error.message}`, { error });
    throw new Error(`Failed to analyze test data: ${error.message}`);
  }
}

/**
 * Groups performance data by variant
 * 
 * @param {Array} performanceData - Array of performance data
 * @param {string} primaryMetric - Primary metric to extract
 * @returns {Object} - Data grouped by variant
 */
function groupDataByVariant(performanceData, primaryMetric) {
  const dataByVariant = {};
  
  for (const data of performanceData) {
    const variantId = data.variantId;
    
    // Initialize array if not exists
    if (!dataByVariant[variantId]) {
      dataByVariant[variantId] = [];
    }
    
    // Get metric value based on primary metric path
    const metricValue = getMetricValue(data.metrics, primaryMetric);
    
    if (metricValue !== null && metricValue !== undefined) {
      dataByVariant[variantId].push({
        timestamp: data.timestamp,
        value: metricValue
      });
    }
  }
  
  return dataByVariant;
}

/**
 * Gets a metric value from the metrics object using dot notation
 * 
 * @param {Object} metrics - Metrics object
 * @param {string} path - Dot-notation path to the metric
 * @returns {*} - Metric value
 */
function getMetricValue(metrics, path) {
  const parts = path.split('.');
  let value = metrics;
  
  for (const part of parts) {
    if (value === null || value === undefined || typeof value !== 'object') {
      return null;
    }
    value = value[part];
  }
  
  return value;
}

/**
 * Calculates statistics for each variant
 * 
 * @param {Object} dataByVariant - Data grouped by variant
 * @returns {Object} - Statistics for each variant
 */
function calculateVariantStatistics(dataByVariant) {
  const variantStats = {};
  
  for (const [variantId, data] of Object.entries(dataByVariant)) {
    // Extract values
    const values = data.map(d => d.value).filter(v => v !== null && v !== undefined);
    
    if (values.length === 0) {
      variantStats[variantId] = {
        mean: null,
        median: null,
        min: null,
        max: null,
        stdDev: null,
        variance: null,
        count: 0
      };
      continue;
    }
    
    // Calculate statistics
    variantStats[variantId] = {
      mean: jStat.mean(values),
      median: jStat.median(values),
      min: jStat.min(values),
      max: jStat.max(values),
      stdDev: jStat.stdev(values),
      variance: jStat.variance(values),
      count: values.length
    };
  }
  
  return variantStats;
}

/**
 * Performs statistical tests to compare variants against control
 * 
 * @param {Object} variantStats - Statistics for each variant
 * @param {string} controlId - ID of the control variant
 * @param {number} confidenceThreshold - Confidence threshold
 * @returns {Object} - Statistical test results
 */
function performStatisticalTests(variantStats, controlId, confidenceThreshold) {
  const testResults = {};
  const controlStats = variantStats[controlId];
  
  if (!controlStats || controlStats.count === 0) {
    return testResults;
  }
  
  for (const [variantId, stats] of Object.entries(variantStats)) {
    if (variantId === controlId || stats.count === 0) {
      continue;
    }
    
    // Calculate t-test
    const tValue = calculateTValue(controlStats, stats);
    
    // Calculate degrees of freedom
    const df = controlStats.count + stats.count - 2;
    
    // Calculate p-value from t-value
    const pValue = 1 - jStat.studentt.cdf(Math.abs(tValue), df);
    
    // Determine if result is significant
    const isSignificant = pValue < (1 - confidenceThreshold);
    
    // Store test results
    testResults[variantId] = {
      tValue,
      pValue,
      df,
      isSignificant,
      confidenceLevel: 1 - pValue
    };
  }
  
  return testResults;
}

/**
 * Calculates t-value for two-sample t-test
 * 
 * @param {Object} controlStats - Statistics for control variant
 * @param {Object} variantStats - Statistics for test variant
 * @returns {number} - t-value
 */
function calculateTValue(controlStats, variantStats) {
  const meanDiff = controlStats.mean - variantStats.mean;
  
  // Calculate pooled standard error
  const n1 = controlStats.count;
  const n2 = variantStats.count;
  const s1Squared = controlStats.variance;
  const s2Squared = variantStats.variance;
  
  const pooledStdError = Math.sqrt(
    ((n1 - 1) * s1Squared + (n2 - 1) * s2Squared) / (n1 + n2 - 2) * (1/n1 + 1/n2)
  );
  
  // Calculate t-value
  return meanDiff / pooledStdError;
}

/**
 * Determines if there's a winner and which variant won
 * 
 * @param {Object} testResults - Statistical test results
 * @param {Object} variantStats - Statistics for each variant
 * @param {string} primaryMetric - Primary metric
 * @returns {Object} - Winner determination
 */
function determineWinner(testResults, variantStats, primaryMetric) {
  const significantVariants = [];
  
  // Find significant variants
  for (const [variantId, result] of Object.entries(testResults)) {
    if (result.isSignificant) {
      significantVariants.push({
        id: variantId,
        stats: variantStats[variantId],
        confidence: result.confidenceLevel
      });
    }
  }
  
  if (significantVariants.length === 0) {
    return { hasWinner: false, winner: null };
  }
  
  // Sort by primary metric value (assuming higher is better)
  significantVariants.sort((a, b) => b.stats.mean - a.stats.mean);
  
  return {
    hasWinner: true,
    winner: significantVariants[0]
  };
}

/**
 * Calculates improvement percentage
 * 
 * @param {Object} winnerStats - Statistics for winner variant
 * @param {Object} controlStats - Statistics for control variant
 * @param {string} primaryMetric - Primary metric
 * @returns {number} - Improvement percentage
 */
function calculateImprovementPercentage(winnerStats, controlStats, primaryMetric) {
  if (!winnerStats || !controlStats || !winnerStats.mean || !controlStats.mean) {
    return null;
  }
  
  return ((winnerStats.mean - controlStats.mean) / controlStats.mean) * 100;
}

module.exports = {
  analyzeSplitTestData
};
