/**
 * Performance Impact Strategy
 * 
 * Measures the performance impact of SEO fixes by comparing
 * before and after metrics like page speed, resource size,
 * and Core Web Vitals.
 */

const ComparisonMetric = require('../models/comparisonMetric');
const { getBeforePerformance } = require('../../implementation/performanceTracker');
const { measurePerformance } = require('../utils/metrics');
const logger = require('../../common/logger');

class PerformanceImpact {
  constructor(options = {}) {
    this.options = {
      // Minimum performance improvement threshold percentage
      threshold: options.performanceThreshold || 5,
      // Maximum number of measurement retries
      maxRetries: options.maxRetries || 3,
      // Whether to measure mobile performance
      measureMobile: options.measureMobile !== undefined ? options.measureMobile : true,
      // Whether to measure desktop performance
      measureDesktop: options.measureDesktop !== undefined ? options.measureDesktop : true,
      ...options
    };
  }
  
  /**
   * Verify a fix by measuring its performance impact
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix implementation details
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Verification result
   */
  async verify(siteId, fix, options = {}) {
    logger.info(`Measuring performance impact for fix: ${fix.id} on site: ${siteId}`);
    
    try {
      // Get the "before" performance metrics captured during fix implementation
      const beforePerformance = await getBeforePerformance(siteId, fix.id);
      
      if (!beforePerformance) {
        logger.warn(`No before performance data found for fix: ${fix.id}`);
        return {
          success: false,
          message: 'No before performance data available for comparison',
          metrics: []
        };
      }
      
      // Measure current performance
      const afterPerformance = await this.measureCurrentPerformance(siteId, fix, options);
      
      // Compare performance metrics
      const performanceMetrics = this.comparePerformance(beforePerformance, afterPerformance);
      
      // Calculate overall improvement percentage
      const improvementPercentage = this.calculateOverallImprovement(performanceMetrics);
      
      // Determine if the improvement meets the threshold
      const meetsThreshold = improvementPercentage >= this.options.threshold;
      
      return {
        success: meetsThreshold,
        message: meetsThreshold
          ? `Performance improved by ${improvementPercentage.toFixed(2)}%, meeting the ${this.options.threshold}% threshold`
          : `Performance improved by ${improvementPercentage.toFixed(2)}%, below the ${this.options.threshold}% threshold`,
        metrics: performanceMetrics,
        improvementPercentage
      };
      
    } catch (error) {
      logger.error(`Performance measurement failed: ${error.message}`);
      return {
        success: false,
        message: `Performance measurement failed: ${error.message}`,
        metrics: []
      };
    }
  }
  
  /**
   * Measure current performance metrics
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix details
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Current performance metrics
   */
  async measureCurrentPerformance(siteId, fix, options = {}) {
    logger.debug(`Measuring current performance for site: ${siteId}`);
    
    const combinedOptions = {
      ...this.options,
      ...options,
      // Use the same URLs that were measured in the "before" state
      urls: fix.targetUrls
    };
    
    // This would use Playwright to measure performance metrics
    // We'll do multiple measurements and take the average for reliability
    const performanceResults = {
      desktop: {},
      mobile: {}
    };
    
    // Measure desktop performance if enabled
    if (combinedOptions.measureDesktop) {
      performanceResults.desktop = await this.measureWithRetries(
        siteId, 
        combinedOptions.urls,
        { ...combinedOptions, device: 'desktop' }
      );
    }
    
    // Measure mobile performance if enabled
    if (combinedOptions.measureMobile) {
      performanceResults.mobile = await this.measureWithRetries(
        siteId, 
        combinedOptions.urls,
        { ...combinedOptions, device: 'mobile' }
      );
    }
    
    return performanceResults;
  }
  
  /**
   * Measure performance with retries for reliability
   * 
   * @param {string} siteId - The site identifier
   * @param {Array<string>} urls - URLs to measure
   * @param {Object} options - Measurement options
   * @returns {Promise<Object>} - Performance metrics
   */
  async measureWithRetries(siteId, urls, options) {
    const maxRetries = options.maxRetries || this.options.maxRetries;
    let attempts = 0;
    let results = [];
    
    while (attempts < maxRetries) {
      try {
        attempts++;
        logger.debug(`Performance measurement attempt ${attempts}/${maxRetries}`);
        
        // Measure performance for all URLs
        const measurements = await Promise.all(
          urls.map(url => measurePerformance(url, options))
        );
        
        results.push(...measurements);
        
      } catch (error) {
        logger.warn(`Measurement attempt ${attempts} failed: ${error.message}`);
        // Continue to next attempt
      }
    }
    
    if (results.length === 0) {
      throw new Error(`Failed to measure performance after ${maxRetries} attempts`);
    }
    
    // Average the results for a more stable measurement
    return this.averagePerformanceResults(results);
  }
  
  /**
   * Average multiple performance measurement results
   * 
   * @param {Array<Object>} results - Performance measurement results
   * @returns {Object} - Averaged performance metrics
   */
  averagePerformanceResults(results) {
    // Initialize with the metrics from the first result
    const metrics = Object.keys(results[0]);
    
    // Calculate the sum of each metric across all results
    const sums = metrics.reduce((acc, metric) => {
      acc[metric] = results.reduce((sum, result) => sum + result[metric], 0);
      return acc;
    }, {});
    
    // Calculate the average for each metric
    return metrics.reduce((avg, metric) => {
      avg[metric] = sums[metric] / results.length;
      return avg;
    }, {});
  }
  
  /**
   * Compare before and after performance metrics
   * 
   * @param {Object} beforePerformance - Performance before fix
   * @param {Object} afterPerformance - Performance after fix
   * @returns {Array<ComparisonMetric>} - Comparison metrics
   */
  comparePerformance(beforePerformance, afterPerformance) {
    const metrics = [];
    
    // Compare desktop metrics if available
    if (beforePerformance.desktop && afterPerformance.desktop) {
      metrics.push(...this.createMetricsForDevice('desktop', beforePerformance.desktop, afterPerformance.desktop));
    }
    
    // Compare mobile metrics if available
    if (beforePerformance.mobile && afterPerformance.mobile) {
      metrics.push(...this.createMetricsForDevice('mobile', beforePerformance.mobile, afterPerformance.mobile));
    }
    
    return metrics;
  }
  
  /**
   * Create comparison metrics for a specific device type
   * 
   * @param {string} device - Device type (desktop or mobile)
   * @param {Object} beforeMetrics - Before metrics
   * @param {Object} afterMetrics - After metrics
   * @returns {Array<ComparisonMetric>} - Comparison metrics
   */
  createMetricsForDevice(device, beforeMetrics, afterMetrics) {
    const metrics = [];
    
    // Create a comparison metric for each performance metric
    // Load time (lower is better)
    metrics.push(new ComparisonMetric({
      name: `Load Time (${device})`,
      beforeValue: beforeMetrics.loadTime,
      afterValue: afterMetrics.loadTime,
      unit: 'ms',
      higherIsBetter: false,
      threshold: this.options.threshold
    }));
    
    // First Contentful Paint (lower is better)
    metrics.push(new ComparisonMetric({
      name: `First Contentful Paint (${device})`,
      beforeValue: beforeMetrics.firstContentfulPaint,
      afterValue: afterMetrics.firstContentfulPaint,
      unit: 'ms',
      higherIsBetter: false,
      threshold: this.options.threshold
    }));
    
    // Largest Contentful Paint (lower is better)
    metrics.push(new ComparisonMetric({
      name: `Largest Contentful Paint (${device})`,
      beforeValue: beforeMetrics.largestContentfulPaint,
      afterValue: afterMetrics.largestContentfulPaint,
      unit: 'ms',
      higherIsBetter: false,
      threshold: this.options.threshold
    }));
    
    // Cumulative Layout Shift (lower is better)
    metrics.push(new ComparisonMetric({
      name: `Cumulative Layout Shift (${device})`,
      beforeValue: beforeMetrics.cumulativeLayoutShift,
      afterValue: afterMetrics.cumulativeLayoutShift,
      unit: '',
      higherIsBetter: false,
      threshold: this.options.threshold
    }));
    
    // Total Blocking Time (lower is better)
    metrics.push(new ComparisonMetric({
      name: `Total Blocking Time (${device})`,
      beforeValue: beforeMetrics.totalBlockingTime,
      afterValue: afterMetrics.totalBlockingTime,
      unit: 'ms',
      higherIsBetter: false,
      threshold: this.options.threshold
    }));
    
    // Resource size (lower is better)
    metrics.push(new ComparisonMetric({
      name: `Resource Size (${device})`,
      beforeValue: beforeMetrics.resourceSize,
      afterValue: afterMetrics.resourceSize,
      unit: ' bytes',
      higherIsBetter: false,
      threshold: this.options.threshold
    }));
    
    // Request count (lower is better)
    metrics.push(new ComparisonMetric({
      name: `Request Count (${device})`,
      beforeValue: beforeMetrics.requestCount,
      afterValue: afterMetrics.requestCount,
      unit: ' requests',
      higherIsBetter: false,
      threshold: this.options.threshold
    }));
    
    return metrics;
  }
  
  /**
   * Calculate the overall performance improvement percentage
   * 
   * @param {Array<ComparisonMetric>} metrics - Comparison metrics
   * @returns {number} - Overall improvement percentage
   */
  calculateOverallImprovement(metrics) {
    // We weight the metrics by importance
    const weights = {
      'Largest Contentful Paint': 0.25,
      'First Contentful Paint': 0.15,
      'Cumulative Layout Shift': 0.15,
      'Total Blocking Time': 0.15,
      'Load Time': 0.1,
      'Resource Size': 0.1,
      'Request Count': 0.1
    };
    
    let weightedImprovement = 0;
    let totalWeight = 0;
    
    metrics.forEach(metric => {
      // Extract the base metric name without the device suffix
      const baseName = metric.name.split(' (')[0];
      
      // Get the weight for this metric
      const weight = weights[baseName] || 0.1;
      
      // For metrics where lower is better, a positive percentage change 
      // actually means performance got worse, so we negate it
      const improvementValue = metric.higherIsBetter 
        ? metric.percentageChange 
        : -metric.percentageChange;
      
      weightedImprovement += improvementValue * weight;
      totalWeight += weight;
    });
    
    // Calculate the weighted average improvement
    return totalWeight > 0 ? weightedImprovement / totalWeight : 0;
  }
}

module.exports = PerformanceImpact;
