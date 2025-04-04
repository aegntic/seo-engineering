/**
 * Performance Tracker Module
 * 
 * Tracks performance metrics for A/B test variants.
 * Integrates with the Verification System to measure SEO metrics.
 * 
 * Last updated: April 4, 2025
 */

const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const verificationSystem = require('../../verification');
const crawlerModule = require('../../crawler');
const db = require('../../utils/db-connection');

// Define performance data schema
const PerformanceDataSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4(), unique: true },
  testId: { type: String, required: true },
  variantId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metrics: {
    // Technical SEO metrics
    pageSpeed: { type: Number },
    mobileScore: { type: Number },
    coreWebVitals: {
      lcp: { type: Number },
      fid: { type: Number },
      cls: { type: Number },
      inp: { type: Number }
    },
    seoScore: { type: Number },
    // Search performance metrics
    impressions: { type: Number },
    clicks: { type: Number },
    ctr: { type: Number },
    averagePosition: { type: Number },
    // User behavior metrics
    bounceRate: { type: Number },
    avgSessionDuration: { type: Number },
    pageviews: { type: Number },
    uniqueVisitors: { type: Number },
    // Conversion metrics
    conversions: { type: Number },
    conversionRate: { type: Number },
    // Additional metrics
    customMetrics: { type: Map, of: mongoose.Schema.Types.Mixed }
  },
  createdAt: { type: Date, default: Date.now }
});

// Create index for efficient querying
PerformanceDataSchema.index({ testId: 1, variantId: 1, timestamp: 1 });

const PerformanceData = mongoose.model('PerformanceData', PerformanceDataSchema);

/**
 * Initializes performance tracking for a test
 * 
 * @param {string} testId - ID of the test
 * @param {Array} variants - Array of variants
 * @returns {Object} - Performance tracking configuration
 */
async function trackPerformance(testId, variants) {
  try {
    logger.info(`Initializing performance tracking for test: ${testId}`);
    
    // Get baseline measurements for each variant
    for (const variant of variants) {
      await collectPerformanceMetrics(testId, variant.id);
    }
    
    // Set up scheduled tracking
    const trackingInterval = setInterval(async () => {
      for (const variant of variants) {
        await collectPerformanceMetrics(testId, variant.id);
      }
    }, 86400000); // Daily tracking
    
    logger.info(`Performance tracking initialized for test: ${testId}`);
    
    return {
      testId,
      variants: variants.map(v => v.id),
      trackingInterval,
      status: 'active'
    };
  } catch (error) {
    logger.error(`Error initializing performance tracking: ${error.message}`, { error });
    throw new Error(`Failed to initialize performance tracking: ${error.message}`);
  }
}

/**
 * Collects performance metrics for a variant
 * 
 * @param {string} testId - ID of the test
 * @param {string} variantId - ID of the variant
 * @returns {Object} - Collected performance data
 */
async function collectPerformanceMetrics(testId, variantId) {
  try {
    logger.info(`Collecting performance metrics for variant: ${variantId}`);
    
    // Get variant details
    const variant = await require('./variant-creator').getById(variantId);
    if (!variant) {
      throw new Error(`Variant not found: ${variantId}`);
    }
    
    // Get test details
    const test = await require('./test-definition').getById(testId);
    if (!test) {
      throw new Error(`Test not found: ${testId}`);
    }
    
    // Perform verification scan
    const verificationResult = await verificationSystem.verifySite({
      siteId: test.siteId,
      variantId
    });
    
    // Collect search metrics (if available)
    const searchMetrics = await collectSearchMetrics(test.siteId, variantId);
    
    // Collect user behavior metrics (if available)
    const behaviorMetrics = await collectBehaviorMetrics(test.siteId, variantId);
    
    // Combine all metrics
    const performanceData = new PerformanceData({
      testId,
      variantId,
      metrics: {
        pageSpeed: verificationResult.pageSpeed,
        mobileScore: verificationResult.mobileScore,
        coreWebVitals: verificationResult.coreWebVitals,
        seoScore: verificationResult.seoScore,
        ...searchMetrics,
        ...behaviorMetrics
      }
    });
    
    // Add custom metrics if available
    if (test.metrics && test.metrics.custom) {
      const customMetrics = new Map();
      for (const metricKey of test.metrics.custom) {
        customMetrics.set(metricKey, verificationResult[metricKey] || null);
      }
      performanceData.metrics.customMetrics = customMetrics;
    }
    
    // Save performance data
    await performanceData.save();
    
    logger.info(`Collected performance metrics for variant: ${variantId}`);
    
    return performanceData;
  } catch (error) {
    logger.error(`Error collecting performance metrics: ${error.message}`, { error });
    // Continue despite errors, log but don't throw
    return null;
  }
}

/**
 * Collects search metrics from available sources
 * 
 * @param {string} siteId - ID of the site
 * @param {string} variantId - ID of the variant
 * @returns {Object} - Search metrics
 */
async function collectSearchMetrics(siteId, variantId) {
  try {
    // Try to get search console data if available
    // This is a placeholder - actual implementation would depend on
    // integration with Search Console API or similar
    
    return {
      impressions: null,
      clicks: null,
      ctr: null,
      averagePosition: null
    };
  } catch (error) {
    logger.warn(`Could not retrieve search metrics: ${error.message}`);
    return {};
  }
}

/**
 * Collects user behavior metrics from available sources
 * 
 * @param {string} siteId - ID of the site
 * @param {string} variantId - ID of the variant
 * @returns {Object} - User behavior metrics
 */
async function collectBehaviorMetrics(siteId, variantId) {
  try {
    // Try to get analytics data if available
    // This is a placeholder - actual implementation would depend on
    // integration with Analytics API or similar
    
    return {
      bounceRate: null,
      avgSessionDuration: null,
      pageviews: null,
      uniqueVisitors: null,
      conversions: null,
      conversionRate: null
    };
  } catch (error) {
    logger.warn(`Could not retrieve behavior metrics: ${error.message}`);
    return {};
  }
}

/**
 * Retrieves performance data for a test
 * 
 * @param {string} testId - ID of the test
 * @param {Object} options - Query options
 * @returns {Array} - Array of performance data
 */
async function getByTestId(testId, options = {}) {
  try {
    const query = { testId };
    
    // Add filters for time range if provided
    if (options.startDate) {
      query.timestamp = { $gte: new Date(options.startDate) };
    }
    if (options.endDate) {
      query.timestamp = query.timestamp || {};
      query.timestamp.$lte = new Date(options.endDate);
    }
    
    // Add filters for variant if provided
    if (options.variantId) {
      query.variantId = options.variantId;
    }
    
    const performanceData = await PerformanceData.find(query)
      .sort({ timestamp: options.sort || 'desc' })
      .limit(options.limit || 1000)
      .lean();
    
    return performanceData;
  } catch (error) {
    logger.error(`Error retrieving performance data: ${error.message}`, { error });
    throw new Error(`Failed to retrieve performance data: ${error.message}`);
  }
}

/**
 * Aggregates performance data for a test
 * 
 * @param {string} testId - ID of the test
 * @param {Object} options - Aggregation options
 * @returns {Object} - Aggregated performance data
 */
async function aggregatePerformance(testId, options = {}) {
  try {
    const aggregation = [
      { $match: { testId } },
      { $group: {
        _id: '$variantId',
        avgPageSpeed: { $avg: '$metrics.pageSpeed' },
        avgMobileScore: { $avg: '$metrics.mobileScore' },
        avgSeoScore: { $avg: '$metrics.seoScore' },
        avgLCP: { $avg: '$metrics.coreWebVitals.lcp' },
        avgCLS: { $avg: '$metrics.coreWebVitals.cls' },
        avgFID: { $avg: '$metrics.coreWebVitals.fid' },
        avgINP: { $avg: '$metrics.coreWebVitals.inp' },
        dataPoints: { $sum: 1 },
        lastUpdated: { $max: '$timestamp' }
      }}
    ];
    
    // Add custom aggregations if needed
    if (options.customAggregations) {
      aggregation[1].$group = {
        ...aggregation[1].$group,
        ...options.customAggregations
      };
    }
    
    const result = await PerformanceData.aggregate(aggregation);
    
    return result;
  } catch (error) {
    logger.error(`Error aggregating performance data: ${error.message}`, { error });
    throw new Error(`Failed to aggregate performance data: ${error.message}`);
  }
}

/**
 * Stops performance tracking for a test
 * 
 * @param {string} testId - ID of the test
 * @param {Object} trackingConfig - Tracking configuration with interval
 * @returns {boolean} - Success indicator
 */
async function stopTracking(testId, trackingConfig) {
  try {
    if (trackingConfig && trackingConfig.trackingInterval) {
      clearInterval(trackingConfig.trackingInterval);
      logger.info(`Stopped performance tracking for test: ${testId}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Error stopping performance tracking: ${error.message}`, { error });
    return false;
  }
}

// Attach functions to trackPerformance for convenience
trackPerformance.getByTestId = getByTestId;
trackPerformance.aggregatePerformance = aggregatePerformance;
trackPerformance.stopTracking = stopTracking;

module.exports = {
  trackPerformance,
  getByTestId,
  aggregatePerformance,
  stopTracking
};
