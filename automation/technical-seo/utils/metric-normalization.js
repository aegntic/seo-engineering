/**
 * Metric Normalization Utility
 * 
 * Provides utilities for normalizing SEO metrics to ensure consistent scoring.
 */

/**
 * Normalize raw metrics to ensure consistent scoring
 * @param {Object} metrics - Raw SEO metrics
 * @returns {Object} - Normalized metrics
 */
function normalizeMetrics(metrics) {
  const normalized = { ...metrics };
  
  // Normalize performance metrics
  if ('ttfb' in metrics) {
    // Time to First Byte (ms) - normalize to 0-100 score (lower is better)
    // 0-200ms: 100, 1000+ms: 0
    normalized.ttfb = normalizeInvertedRange(metrics.ttfb, 200, 1000);
  }
  
  if ('lcp' in metrics) {
    // Largest Contentful Paint (ms) - normalize to 0-100 score (lower is better)
    // 0-1500ms: 100, 4000+ms: 0
    normalized.lcp = normalizeInvertedRange(metrics.lcp, 1500, 4000);
  }
  
  if ('cls' in metrics) {
    // Cumulative Layout Shift - normalize to 0-100 score (lower is better)
    // 0-0.1: 100, 0.5+: 0
    normalized.cls = normalizeInvertedRange(metrics.cls, 0.1, 0.5);
  }
  
  if ('fid' in metrics) {
    // First Input Delay (ms) - normalize to 0-100 score (lower is better)
    // 0-100ms: 100, 500+ms: 0
    normalized.fid = normalizeInvertedRange(metrics.fid, 100, 500);
  }
  
  // Normalize content metrics
  if ('wordCount' in metrics) {
    // Word count - normalize to 0-100 score (higher is better, up to a point)
    // 300: 50, 1500: 100, 3000+: 80 (diminishing returns)
    if (metrics.wordCount < 300) {
      normalized.wordCount = normalizeRange(metrics.wordCount, 0, 300, 0, 50);
    } else if (metrics.wordCount < 1500) {
      normalized.wordCount = normalizeRange(metrics.wordCount, 300, 1500, 50, 100);
    } else {
      // Diminishing returns after 1500 words
      const excessWords = metrics.wordCount - 1500;
      const penaltyFactor = Math.min(20, excessWords / 150);
      normalized.wordCount = Math.max(80, 100 - penaltyFactor);
    }
  }
  
  if ('keywordDensity' in metrics) {
    // Keyword density - normalize to 0-100 score with a bell curve
    // 0%: 0, 1-2%: 100, 5%+: 0 (keyword stuffing penalty)
    if (metrics.keywordDensity < 1) {
      normalized.keywordDensity = normalizeRange(metrics.keywordDensity, 0, 1, 0, 100);
    } else if (metrics.keywordDensity <= 2) {
      normalized.keywordDensity = 100;
    } else if (metrics.keywordDensity < 5) {
      normalized.keywordDensity = normalizeInvertedRange(metrics.keywordDensity, 2, 5, 100, 0);
    } else {
      normalized.keywordDensity = 0; // Keyword stuffing penalty
    }
  }
  
  // Ensure all values are within 0-100 range
  for (const key in normalized) {
    if (typeof normalized[key] === 'number') {
      normalized[key] = Math.min(100, Math.max(0, normalized[key]));
    }
  }
  
  return normalized;
}

/**
 * Normalize a value within a range to a 0-100 scale
 * @param {number} value - The value to normalize
 * @param {number} min - Minimum value in the original range
 * @param {number} max - Maximum value in the original range
 * @param {number} targetMin - Minimum value in target range (default: 0)
 * @param {number} targetMax - Maximum value in target range (default: 100)
 * @returns {number} - Normalized value (higher is better)
 */
function normalizeRange(value, min, max, targetMin = 0, targetMax = 100) {
  // Clamp value to range
  const clampedValue = Math.min(max, Math.max(min, value));
  
  // Calculate normalized value
  const normalizedValue = ((clampedValue - min) / (max - min)) * (targetMax - targetMin) + targetMin;
  
  return normalizedValue;
}

/**
 * Normalize a value within a range to a 0-100 scale (inverted)
 * @param {number} value - The value to normalize
 * @param {number} min - Minimum value in the original range
 * @param {number} max - Maximum value in the original range
 * @param {number} targetMin - Minimum value in target range (default: 0)
 * @param {number} targetMax - Maximum value in target range (default: 100)
 * @returns {number} - Normalized value (lower is better)
 */
function normalizeInvertedRange(value, min, max, targetMin = 0, targetMax = 100) {
  // Clamp value to range
  const clampedValue = Math.min(max, Math.max(min, value));
  
  // Calculate normalized value (inverted)
  const normalizedValue = ((max - clampedValue) / (max - min)) * (targetMax - targetMin) + targetMin;
  
  return normalizedValue;
}

/**
 * Apply sigmoid normalization for non-linear scaling
 * @param {number} value - The value to normalize
 * @param {number} midpoint - The midpoint where output should be 50
 * @param {number} steepness - Controls the steepness of the sigmoid curve
 * @returns {number} - Sigmoid-normalized value (0-100)
 */
function normalizeSigmoid(value, midpoint, steepness = 1) {
  // Apply sigmoid function: 1 / (1 + e^(-k * (x - midpoint)))
  const sigmoid = 1 / (1 + Math.exp(-steepness * (value - midpoint)));
  
  // Convert to 0-100 scale
  return sigmoid * 100;
}

/**
 * Normalize metrics with outlier detection
 * @param {Object} metrics - Raw SEO metrics
 * @param {Object} typicalRanges - Typical ranges for metrics
 * @returns {Object} - Normalized metrics with outlier handling
 */
function normalizeWithOutlierDetection(metrics, typicalRanges) {
  const normalized = {};
  
  for (const [metric, value] of Object.entries(metrics)) {
    if (typicalRanges[metric]) {
      const range = typicalRanges[metric];
      
      // Check if value is an outlier
      if (value < range.min || value > range.max) {
        // Handle outliers by clamping to range
        const clampedValue = Math.min(range.max, Math.max(range.min, value));
        
        // Normalize within typical range
        if (range.lowerIsBetter) {
          normalized[metric] = normalizeInvertedRange(clampedValue, range.min, range.max);
        } else {
          normalized[metric] = normalizeRange(clampedValue, range.min, range.max);
        }
      } else {
        // Normal case, not an outlier
        if (range.lowerIsBetter) {
          normalized[metric] = normalizeInvertedRange(value, range.min, range.max);
        } else {
          normalized[metric] = normalizeRange(value, range.min, range.max);
        }
      }
    } else {
      // No typical range defined, pass through
      normalized[metric] = value;
    }
  }
  
  return normalized;
}

module.exports = {
  normalizeMetrics,
  normalizeRange,
  normalizeInvertedRange,
  normalizeSigmoid,
  normalizeWithOutlierDetection
};
