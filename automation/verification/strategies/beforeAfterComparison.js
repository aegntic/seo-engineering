/**
 * Before/After Comparison Strategy
 * 
 * Verifies SEO fixes by comparing the before and after state of specific elements
 * or metrics to confirm that the intended changes were successfully applied.
 */

const ComparisonMetric = require('../models/comparisonMetric');
const { getBeforeState } = require('../../implementation/stateTracker');
const { getMetricsForElement } = require('../utils/metrics');
const logger = require('../../common/logger');

class BeforeAfterComparison {
  constructor(options = {}) {
    this.options = {
      // Default comparison threshold (percentage improvement required for success)
      threshold: options.threshold || 0,
      ...options
    };
  }
  
  /**
   * Verify a fix by comparing before and after states
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix implementation details
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Verification result
   */
  async verify(siteId, fix, options = {}) {
    logger.info(`Running before/after comparison for fix: ${fix.id} on site: ${siteId}`);
    
    try {
      // Get the "before" state that was captured during fix implementation
      const beforeState = await getBeforeState(siteId, fix.id);
      
      if (!beforeState) {
        logger.warn(`No before state found for fix: ${fix.id}`);
        return {
          success: false,
          message: 'No before state available for comparison',
          metrics: []
        };
      }
      
      // Get current state of the same elements
      const afterState = await this.getCurrentState(siteId, fix);
      
      // Compare states based on the type of fix
      const comparisonResults = await this.compareStates(beforeState, afterState, fix);
      
      // Determine if the comparison was successful
      const success = comparisonResults.every(metric => metric.improved);
      
      return {
        success,
        message: success 
          ? 'Before/after comparison shows successful implementation' 
          : 'Before/after comparison indicates issues with implementation',
        metrics: comparisonResults
      };
      
    } catch (error) {
      logger.error(`Before/after comparison failed: ${error.message}`);
      return {
        success: false,
        message: `Comparison failed: ${error.message}`,
        metrics: []
      };
    }
  }
  
  /**
   * Get the current state of elements affected by a fix
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix implementation details
   * @returns {Promise<Object>} - Current state
   */
  async getCurrentState(siteId, fix) {
    // This will vary based on fix type, but typically involves:
    // 1. Fetching the current webpage
    // 2. Extracting the relevant elements
    // 3. Measuring their properties
    
    // For demonstration, we'll implement a generic approach
    // In a real implementation, this would be customized per fix type
    
    logger.debug(`Getting current state for fix type: ${fix.type}`);
    
    // Different extraction strategies based on fix type
    switch (fix.type) {
      case 'meta-tags':
        return this.extractMetaTagState(siteId, fix);
        
      case 'image-optimization':
        return this.extractImageState(siteId, fix);
        
      case 'speed':
        return this.extractPerformanceState(siteId, fix);
        
      case 'schema-markup':
        return this.extractSchemaState(siteId, fix);
        
      default:
        // Generic extraction for other fix types
        return this.extractGenericState(siteId, fix);
    }
  }
  
  /**
   * Extract meta tag state from the current site
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix details
   * @returns {Promise<Object>} - Current meta tag state
   */
  async extractMetaTagState(siteId, fix) {
    // This would use a browser automation tool like Playwright
    // to fetch the page and extract meta tags
    
    // Placeholder implementation
    return {
      type: 'meta-tags',
      elements: [
        {
          selector: 'meta[name="description"]',
          content: 'Example meta description',
          length: 23
        },
        {
          selector: 'title',
          content: 'Example Page Title',
          length: 18
        }
      ]
    };
  }
  
  /**
   * Extract image optimization state from the current site
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix details
   * @returns {Promise<Object>} - Current image state
   */
  async extractImageState(siteId, fix) {
    // This would measure image sizes, formats, alt texts, etc.
    
    // Placeholder implementation
    return {
      type: 'image-optimization',
      elements: [
        {
          selector: fix.targetElements[0],
          size: 42500, // bytes
          width: 800,
          height: 600,
          hasAlt: true,
          format: 'webp'
        }
      ]
    };
  }
  
  /**
   * Extract performance state from the current site
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix details
   * @returns {Promise<Object>} - Current performance state
   */
  async extractPerformanceState(siteId, fix) {
    // This would measure loading times, resource sizes, etc.
    
    // Placeholder implementation
    return {
      type: 'speed',
      metrics: {
        loadTime: 1200, // ms
        firstContentfulPaint: 800, // ms
        largestContentfulPaint: 1500, // ms
        totalResourceSize: 1250000 // bytes
      }
    };
  }
  
  /**
   * Extract schema markup state from the current site
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix details
   * @returns {Promise<Object>} - Current schema state
   */
  async extractSchemaState(siteId, fix) {
    // This would extract and validate schema.org markup
    
    // Placeholder implementation
    return {
      type: 'schema-markup',
      elements: [
        {
          type: 'Organization',
          present: true,
          valid: true,
          properties: ['name', 'url', 'logo']
        }
      ]
    };
  }
  
  /**
   * Extract generic state for other fix types
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix details
   * @returns {Promise<Object>} - Current generic state
   */
  async extractGenericState(siteId, fix) {
    // Default extraction method for unspecialized fix types
    
    return {
      type: fix.type,
      elements: fix.targetElements.map(selector => ({
        selector,
        exists: true,
        // Additional metrics would be gathered here
        metrics: getMetricsForElement(selector, fix.type)
      }))
    };
  }
  
  /**
   * Compare before and after states to determine if fix was successful
   * 
   * @param {Object} beforeState - State before fix implementation
   * @param {Object} afterState - Current state after fix
   * @param {Object} fix - The fix implementation details
   * @returns {Promise<Array<ComparisonMetric>>} - Array of comparison metrics
   */
  async compareStates(beforeState, afterState, fix) {
    logger.debug(`Comparing states for fix type: ${fix.type}`);
    
    // Comparison strategy depends on fix type
    switch (fix.type) {
      case 'meta-tags':
        return this.compareMetaTags(beforeState, afterState, fix);
        
      case 'image-optimization':
        return this.compareImages(beforeState, afterState, fix);
        
      case 'speed':
        return this.comparePerformance(beforeState, afterState, fix);
        
      case 'schema-markup':
        return this.compareSchema(beforeState, afterState, fix);
        
      default:
        // Generic comparison for other fix types
        return this.compareGeneric(beforeState, afterState, fix);
    }
  }
  
  /**
   * Compare meta tag states
   * 
   * @param {Object} beforeState - Before state
   * @param {Object} afterState - After state
   * @param {Object} fix - Fix details
   * @returns {Array<ComparisonMetric>} - Comparison metrics
   */
  compareMetaTags(beforeState, afterState, fix) {
    const metrics = [];
    
    // Compare meta descriptions
    const beforeDesc = beforeState.elements.find(el => el.selector === 'meta[name="description"]');
    const afterDesc = afterState.elements.find(el => el.selector === 'meta[name="description"]');
    
    if (beforeDesc && afterDesc) {
      // Length is better when it's optimized (not too short, not too long)
      // For meta descriptions, optimal is usually 120-158 characters
      const optimalLength = 150;
      const beforeOptimality = Math.abs(beforeDesc.length - optimalLength);
      const afterOptimality = Math.abs(afterDesc.length - optimalLength);
      
      metrics.push(new ComparisonMetric({
        name: 'Meta Description Optimality',
        beforeValue: beforeOptimality,
        afterValue: afterOptimality,
        unit: ' chars from optimal',
        higherIsBetter: false,
        threshold: 10
      }));
    }
    
    // Similar comparisons for title and other meta tags
    // ...
    
    return metrics;
  }
  
  /**
   * Compare image optimization states
   * 
   * @param {Object} beforeState - Before state
   * @param {Object} afterState - After state
   * @param {Object} fix - Fix details
   * @returns {Array<ComparisonMetric>} - Comparison metrics
   */
  compareImages(beforeState, afterState, fix) {
    const metrics = [];
    
    // Match elements by selector
    for (const beforeImg of beforeState.elements) {
      const afterImg = afterState.elements.find(img => img.selector === beforeImg.selector);
      
      if (beforeImg && afterImg) {
        // Compare image size (smaller is better)
        metrics.push(new ComparisonMetric({
          name: `Image Size (${beforeImg.selector})`,
          beforeValue: beforeImg.size,
          afterValue: afterImg.size,
          unit: ' bytes',
          higherIsBetter: false,
          threshold: 10
        }));
        
        // Compare alt text presence
        if (!beforeImg.hasAlt && afterImg.hasAlt) {
          metrics.push(new ComparisonMetric({
            name: `Alt Text (${beforeImg.selector})`,
            beforeValue: 0,
            afterValue: 1,
            higherIsBetter: true,
            threshold: 0
          }));
        }
      }
    }
    
    return metrics;
  }
  
  /**
   * Compare performance states
   * 
   * @param {Object} beforeState - Before state
   * @param {Object} afterState - After state
   * @param {Object} fix - Fix details
   * @returns {Array<ComparisonMetric>} - Comparison metrics
   */
  comparePerformance(beforeState, afterState, fix) {
    const metrics = [];
    
    // Compare load time (lower is better)
    metrics.push(new ComparisonMetric({
      name: 'Load Time',
      beforeValue: beforeState.metrics.loadTime,
      afterValue: afterState.metrics.loadTime,
      unit: 'ms',
      higherIsBetter: false,
      threshold: 10
    }));
    
    // Compare First Contentful Paint (lower is better)
    metrics.push(new ComparisonMetric({
      name: 'First Contentful Paint',
      beforeValue: beforeState.metrics.firstContentfulPaint,
      afterValue: afterState.metrics.firstContentfulPaint,
      unit: 'ms',
      higherIsBetter: false,
      threshold: 10
    }));
    
    // Compare resource size (lower is better)
    metrics.push(new ComparisonMetric({
      name: 'Total Resource Size',
      beforeValue: beforeState.metrics.totalResourceSize,
      afterValue: afterState.metrics.totalResourceSize,
      unit: ' bytes',
      higherIsBetter: false,
      threshold: 10
    }));
    
    return metrics;
  }
  
  /**
   * Compare schema markup states
   * 
   * @param {Object} beforeState - Before state
   * @param {Object} afterState - After state
   * @param {Object} fix - Fix details
   * @returns {Array<ComparisonMetric>} - Comparison metrics
   */
  compareSchema(beforeState, afterState, fix) {
    const metrics = [];
    
    // Match schema types
    for (const beforeSchema of beforeState.elements) {
      const afterSchema = afterState.elements.find(s => s.type === beforeSchema.type);
      
      if (beforeSchema && afterSchema) {
        // Compare presence (1 = present, 0 = not present)
        metrics.push(new ComparisonMetric({
          name: `Schema Present (${beforeSchema.type})`,
          beforeValue: beforeSchema.present ? 1 : 0,
          afterValue: afterSchema.present ? 1 : 0,
          higherIsBetter: true,
          threshold: 0
        }));
        
        // Compare validity (1 = valid, 0 = invalid)
        metrics.push(new ComparisonMetric({
          name: `Schema Valid (${beforeSchema.type})`,
          beforeValue: beforeSchema.valid ? 1 : 0,
          afterValue: afterSchema.valid ? 1 : 0,
          higherIsBetter: true,
          threshold: 0
        }));
        
        // Compare property count (higher is better)
        metrics.push(new ComparisonMetric({
          name: `Schema Properties (${beforeSchema.type})`,
          beforeValue: beforeSchema.properties.length,
          afterValue: afterSchema.properties.length,
          unit: ' properties',
          higherIsBetter: true,
          threshold: 0
        }));
      }
    }
    
    return metrics;
  }
  
  /**
   * Generic comparison for other fix types
   * 
   * @param {Object} beforeState - Before state
   * @param {Object} afterState - After state
   * @param {Object} fix - Fix details
   * @returns {Array<ComparisonMetric>} - Comparison metrics
   */
  compareGeneric(beforeState, afterState, fix) {
    const metrics = [];
    
    // For generic comparisons, we check if elements exist and compare any available metrics
    beforeState.elements.forEach(beforeEl => {
      const afterEl = afterState.elements.find(el => el.selector === beforeEl.selector);
      
      if (beforeEl && afterEl) {
        // Compare existence (should be true after fix)
        metrics.push(new ComparisonMetric({
          name: `Element Exists (${beforeEl.selector})`,
          beforeValue: beforeEl.exists ? 1 : 0,
          afterValue: afterEl.exists ? 1 : 0,
          higherIsBetter: true,
          threshold: 0
        }));
        
        // Compare any other available metrics
        // ...
      }
    });
    
    return metrics;
  }
}

module.exports = BeforeAfterComparison;
