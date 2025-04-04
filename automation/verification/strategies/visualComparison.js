/**
 * Visual Comparison Strategy
 * 
 * Verifies SEO fixes by comparing screenshots before and after implementation
 * to ensure visual consistency and detect unintended changes.
 */

const ComparisonMetric = require('../models/comparisonMetric');
const { getScreenshots } = require('../../implementation/screenshotStorage');
const { compareImages } = require('../utils/screenshotComparison');
const logger = require('../../common/logger');

class VisualComparison {
  constructor(options = {}) {
    this.options = {
      // Maximum allowed visual difference percentage
      maxDifference: options.maxDifference || 5,
      // Whether to compare mobile views
      compareMobile: options.compareMobile !== undefined ? options.compareMobile : true,
      // Whether to compare desktop views
      compareDesktop: options.compareDesktop !== undefined ? options.compareDesktop : true,
      // Regions to ignore in comparisons (e.g., dynamic content)
      ignoreRegions: options.ignoreRegions || [],
      // Threshold for pixel color difference (0-255)
      colorThreshold: options.colorThreshold || 20,
      ...options
    };
  }
  
  /**
   * Verify a fix by comparing before and after screenshots
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix implementation details
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Verification result
   */
  async verify(siteId, fix, options = {}) {
    logger.info(`Running visual comparison for fix: ${fix.id} on site: ${siteId}`);
    
    try {
      // Get "before" screenshots taken during fix implementation
      const beforeScreenshots = await getScreenshots(siteId, fix.id, 'before');
      
      if (!beforeScreenshots || beforeScreenshots.length === 0) {
        logger.warn(`No before screenshots found for fix: ${fix.id}`);
        return {
          success: true, // No screenshots to compare means no visual regression
          message: 'No screenshots available for comparison',
          comparisons: []
        };
      }
      
      // Get "after" screenshots taken during fix implementation
      // Note: In a real implementation, we might take new screenshots here if needed
      const afterScreenshots = await getScreenshots(siteId, fix.id, 'after');
      
      if (!afterScreenshots || afterScreenshots.length === 0) {
        logger.warn(`No after screenshots found for fix: ${fix.id}`);
        return {
          success: false,
          message: 'After screenshots not available for comparison',
          comparisons: []
        };
      }
      
      logger.info(`Found ${beforeScreenshots.length} before screenshots and ${afterScreenshots.length} after screenshots`);
      
      // Match pairs of screenshots by URL and device
      const screenshotPairs = this.matchScreenshots(beforeScreenshots, afterScreenshots);
      
      if (screenshotPairs.length === 0) {
        logger.warn('No matching screenshot pairs found for comparison');
        return {
          success: false,
          message: 'No matching screenshot pairs found for comparison',
          comparisons: []
        };
      }
      
      // Compare each pair of screenshots
      const comparisons = await this.compareScreenshotPairs(screenshotPairs, options);
      
      // Check if all comparisons passed the threshold
      const allPassed = comparisons.every(comp => comp.differencePercentage <= this.options.maxDifference);
      
      // Calculate average difference percentage
      const avgDifference = comparisons.reduce((sum, comp) => sum + comp.differencePercentage, 0) / comparisons.length;
      
      return {
        success: allPassed,
        message: allPassed
          ? `Visual comparison passed with ${avgDifference.toFixed(2)}% average difference (threshold: ${this.options.maxDifference}%)`
          : `Visual comparison failed with ${avgDifference.toFixed(2)}% average difference (threshold: ${this.options.maxDifference}%)`,
        comparisons,
        metrics: this.createMetricsFromComparisons(comparisons)
      };
      
    } catch (error) {
      logger.error(`Visual comparison failed: ${error.message}`);
      return {
        success: false,
        message: `Visual comparison failed: ${error.message}`,
        comparisons: []
      };
    }
  }
  
  /**
   * Match before and after screenshots for comparison
   * 
   * @param {Array} beforeScreenshots - Screenshots before fix
   * @param {Array} afterScreenshots - Screenshots after fix
   * @returns {Array} - Matched pairs of screenshots
   */
  matchScreenshots(beforeScreenshots, afterScreenshots) {
    const pairs = [];
    
    // Match screenshots by URL and device
    beforeScreenshots.forEach(before => {
      // Skip devices we don't want to compare
      if (!this.shouldCompareDevice(before.device)) {
        return;
      }
      
      // Find matching after screenshot
      const after = afterScreenshots.find(a => 
        a.url === before.url && 
        a.device === before.device &&
        a.viewport.width === before.viewport.width &&
        a.viewport.height === before.viewport.height
      );
      
      if (after) {
        pairs.push({ before, after });
      }
    });
    
    return pairs;
  }
  
  /**
   * Determine if we should compare screenshots for a specific device
   * 
   * @param {string} device - Device type
   * @returns {boolean} - Whether to compare this device
   */
  shouldCompareDevice(device) {
    if (device === 'mobile' && !this.options.compareMobile) {
      return false;
    }
    
    if (device === 'desktop' && !this.options.compareDesktop) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Compare pairs of screenshots
   * 
   * @param {Array} pairs - Matched pairs of screenshots
   * @param {Object} options - Comparison options
   * @returns {Promise<Array>} - Comparison results
   */
  async compareScreenshotPairs(pairs, options = {}) {
    const combinedOptions = {
      ...this.options,
      ...options
    };
    
    // Compare each pair
    return Promise.all(
      pairs.map(async ({ before, after }) => {
        try {
          logger.debug(`Comparing screenshots for URL: ${before.url}, device: ${before.device}`);
          
          // Use the screenshot comparison utility
          const comparison = await compareImages(
            before.path,
            after.path,
            combinedOptions
          );
          
          return {
            url: before.url,
            device: before.device,
            viewport: before.viewport,
            beforePath: before.path,
            afterPath: after.path,
            diffPath: comparison.diffPath,
            differencePercentage: comparison.differencePercentage,
            matchPercentage: 100 - comparison.differencePercentage,
            diffPixels: comparison.diffPixels,
            totalPixels: comparison.totalPixels,
            passed: comparison.differencePercentage <= combinedOptions.maxDifference
          };
        } catch (error) {
          logger.error(`Screenshot comparison failed for ${before.url}: ${error.message}`);
          
          return {
            url: before.url,
            device: before.device,
            viewport: before.viewport,
            beforePath: before.path,
            afterPath: after.path,
            differencePercentage: 100, // Assume 100% difference on error
            matchPercentage: 0,
            diffPixels: 0,
            totalPixels: 0,
            passed: false,
            error: error.message
          };
        }
      })
    );
  }
  
  /**
   * Create comparison metrics from visual comparison results
   * 
   * @param {Array} comparisons - Visual comparison results
   * @returns {Array<ComparisonMetric>} - Comparison metrics
   */
  createMetricsFromComparisons(comparisons) {
    const metrics = [];
    
    // Group comparisons by device
    const deviceGroups = {};
    
    comparisons.forEach(comp => {
      if (!deviceGroups[comp.device]) {
        deviceGroups[comp.device] = [];
      }
      
      deviceGroups[comp.device].push(comp);
    });
    
    // Create a metric for each device
    Object.entries(deviceGroups).forEach(([device, comps]) => {
      const avgDifference = comps.reduce((sum, comp) => sum + comp.differencePercentage, 0) / comps.length;
      
      metrics.push(new ComparisonMetric({
        name: `Visual Difference (${device})`,
        beforeValue: 0, // Ideal: 0% difference
        afterValue: avgDifference,
        unit: '%',
        higherIsBetter: false,
        threshold: this.options.maxDifference
      }));
    });
    
    // Create overall visual match metric
    const overallMatchPercentage = comparisons.reduce((sum, comp) => sum + comp.matchPercentage, 0) / comparisons.length;
    
    metrics.push(new ComparisonMetric({
      name: 'Visual Match',
      beforeValue: 100, // Ideal: 100% match
      afterValue: overallMatchPercentage,
      unit: '%',
      higherIsBetter: true,
      threshold: 100 - this.options.maxDifference
    }));
    
    return metrics;
  }
}

module.exports = VisualComparison;
