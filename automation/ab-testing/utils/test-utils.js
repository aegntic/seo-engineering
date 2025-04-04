/**
 * Test Utilities
 * 
 * Provides utility functions for A/B test configuration, calculation, and management.
 * 
 * Last updated: April 4, 2025
 */

const logger = require('../../utils/logger');

/**
 * Calculates the recommended test duration based on configuration
 * 
 * @param {Object} config - Test configuration
 * @returns {number} - Recommended test duration in days
 */
function calculateTestDuration(config) {
  try {
    // Default values
    const defaultDuration = 14; // 2 weeks
    const minDuration = 7; // 1 week
    const maxDuration = 56; // 8 weeks
    
    // If no traffic data is available, return default
    if (!config.expectedTraffic) {
      return defaultDuration;
    }
    
    // Calculate based on expected traffic and desired statistical power
    const trafficPerDay = config.expectedTraffic;
    const variants = config.variants ? config.variants.length : 2;
    const mde = config.minimumDetectableEffect || 0.1; // 10% default
    const power = config.statisticalPower || 0.8; // 80% default
    
    // Simple heuristic formula for sample size calculation
    const sampleSizePerVariant = 16 * (1 / Math.pow(mde, 2)) * Math.pow(power, 2);
    const totalSampleSize = sampleSizePerVariant * variants;
    
    // Calculate days needed to reach sample size
    const daysNeeded = Math.ceil(totalSampleSize / trafficPerDay);
    
    // Clamp to min/max duration
    const duration = Math.max(minDuration, Math.min(daysNeeded, maxDuration));
    
    return duration;
  } catch (error) {
    logger.warn(`Error calculating test duration: ${error.message}. Using default.`);
    return 14; // Default to 2 weeks
  }
}

/**
 * Calculates the minimum detectable effect based on traffic and duration
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.dailyTraffic - Expected daily traffic
 * @param {number} params.duration - Test duration in days
 * @param {number} params.variants - Number of variants (including control)
 * @param {number} params.power - Statistical power (0-1, default 0.8)
 * @returns {number} - Minimum detectable effect as a decimal
 */
function calculateMinimumDetectableEffect(params) {
  try {
    const {
      dailyTraffic,
      duration,
      variants = 2,
      power = 0.8
    } = params;
    
    if (!dailyTraffic || !duration) {
      throw new Error('Daily traffic and duration are required');
    }
    
    // Total sample size
    const totalSampleSize = dailyTraffic * duration;
    
    // Sample size per variant
    const sampleSizePerVariant = totalSampleSize / variants;
    
    // MDE formula (simplified)
    const mde = Math.sqrt(16 * Math.pow(power, 2) / sampleSizePerVariant);
    
    // Clamp to reasonable range (5% to 50%)
    return Math.max(0.05, Math.min(mde, 0.5));
  } catch (error) {
    logger.warn(`Error calculating minimum detectable effect: ${error.message}`);
    return 0.1; // Default to 10%
  }
}

/**
 * Generates a default traffic allocation for variants
 * 
 * @param {number} variantCount - Number of variants
 * @param {boolean} equalSplit - Whether to split traffic equally
 * @returns {Array} - Array of traffic allocation values
 */
function generateDefaultTrafficAllocation(variantCount, equalSplit = true) {
  try {
    if (!variantCount || variantCount < 2) {
      throw new Error('At least 2 variants are required');
    }
    
    if (equalSplit) {
      // Equal split
      const allocation = Array(variantCount).fill(1 / variantCount);
      return allocation;
    } else {
      // Optimized split (more traffic to control)
      const controlAllocation = 0.5;
      const variantAllocation = (1 - controlAllocation) / (variantCount - 1);
      
      const allocation = [controlAllocation];
      for (let i = 1; i < variantCount; i++) {
        allocation.push(variantAllocation);
      }
      
      return allocation;
    }
  } catch (error) {
    logger.warn(`Error generating traffic allocation: ${error.message}`);
    return Array(variantCount).fill(1 / variantCount); // Default to equal split
  }
}

/**
 * Checks if a test has enough data for statistical significance
 * 
 * @param {Object} testData - Test data
 * @param {Object} options - Options for the check
 * @returns {Object} - Check result
 */
function hasEnoughData(testData, options = {}) {
  try {
    const {
      minSampleSize = 100,
      minDuration = 7,
      minVisitorsPerVariant = 50
    } = options;
    
    // Check if test has been running long enough
    const startDate = new Date(testData.startDate);
    const currentDate = new Date();
    const daysRunning = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (daysRunning < minDuration) {
      return {
        hasEnough: false,
        reason: `Test has been running for ${daysRunning} days, minimum is ${minDuration} days`,
        recommendations: ['Continue the test for the minimum duration']
      };
    }
    
    // Check if variants have enough visitors
    let hasEnoughVisitors = true;
    const variantsWithLowTraffic = [];
    
    for (const [variantId, data] of Object.entries(testData.sampleSizes)) {
      if (data < minVisitorsPerVariant) {
        hasEnoughVisitors = false;
        variantsWithLowTraffic.push(variantId);
      }
    }
    
    if (!hasEnoughVisitors) {
      return {
        hasEnough: false,
        reason: `Some variants have insufficient traffic: ${variantsWithLowTraffic.join(', ')}`,
        recommendations: [
          'Increase test duration',
          'Allocate more traffic to low-traffic variants',
          'Reduce the number of variants'
        ]
      };
    }
    
    // Check if total sample size is enough
    const totalSampleSize = Object.values(testData.sampleSizes).reduce((sum, size) => sum + size, 0);
    
    if (totalSampleSize < minSampleSize) {
      return {
        hasEnough: false,
        reason: `Total sample size (${totalSampleSize}) is less than minimum (${minSampleSize})`,
        recommendations: [
          'Increase test duration',
          'Increase traffic to the test pages'
        ]
      };
    }
    
    return {
      hasEnough: true,
      totalSampleSize,
      daysRunning
    };
  } catch (error) {
    logger.warn(`Error checking if test has enough data: ${error.message}`);
    return {
      hasEnough: false,
      reason: `Error in analysis: ${error.message}`,
      recommendations: ['Check test configuration and data']
    };
  }
}

/**
 * Sanitizes and formats a variant name for display
 * 
 * @param {string} name - Raw variant name
 * @returns {string} - Sanitized variant name
 */
function formatVariantName(name) {
  if (!name) return 'Unnamed Variant';
  
  // Replace underscores and hyphens with spaces
  let formatted = name.replace(/[_-]/g, ' ');
  
  // Capitalize first letter of each word
  formatted = formatted.replace(/\b\w/g, letter => letter.toUpperCase());
  
  return formatted;
}

/**
 * Creates a hash ID for a test component
 * 
 * @param {string} prefix - Prefix for the hash (e.g., 'test', 'variant')
 * @param {string} name - Name of the component
 * @param {string} suffix - Optional suffix for uniqueness
 * @returns {string} - Hashed ID
 */
function createHashId(prefix, name, suffix = '') {
  const hashInput = `${prefix}-${name}-${suffix}-${Date.now()}`;
  const hash = require('crypto').createHash('md5').update(hashInput).digest('hex').substring(0, 8);
  return `${prefix}-${hash}`;
}

module.exports = {
  calculateTestDuration,
  calculateMinimumDetectableEffect,
  generateDefaultTrafficAllocation,
  hasEnoughData,
  formatVariantName,
  createHashId
};
