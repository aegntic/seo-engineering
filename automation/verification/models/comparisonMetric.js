/**
 * ComparisonMetric Model
 * 
 * Represents a metric that compares before and after states
 * to quantify the impact of an SEO fix.
 */

class ComparisonMetric {
  /**
   * Create a new comparison metric
   * 
   * @param {Object} data - The metric data
   * @param {string} data.name - Name of the metric
   * @param {*} data.beforeValue - Value before fix implementation
   * @param {*} data.afterValue - Value after fix implementation
   * @param {string} data.unit - Unit of measurement (optional)
   * @param {boolean} data.higherIsBetter - Whether higher values are better (default: true)
   * @param {number} data.threshold - Improvement threshold for success (percentage, default: 0)
   */
  constructor(data) {
    this.name = data.name;
    this.beforeValue = data.beforeValue;
    this.afterValue = data.afterValue;
    this.unit = data.unit || '';
    this.higherIsBetter = data.higherIsBetter !== undefined ? data.higherIsBetter : true;
    this.threshold = data.threshold || 0;
    
    // Calculate derived values
    this.absoluteChange = this.calculateAbsoluteChange();
    this.percentageChange = this.calculatePercentageChange();
    this.improved = this.determineImprovement();
    this.meetsThreshold = this.checkThreshold();
  }
  
  /**
   * Calculate the absolute change between before and after values
   * 
   * @returns {number} - Absolute change
   */
  calculateAbsoluteChange() {
    return this.afterValue - this.beforeValue;
  }
  
  /**
   * Calculate the percentage change between before and after values
   * 
   * @returns {number} - Percentage change
   */
  calculatePercentageChange() {
    if (this.beforeValue === 0) {
      // Handle division by zero - if before was 0 and after is positive,
      // that's an infinite improvement
      return this.afterValue > 0 ? 100 : 0;
    }
    
    return (this.absoluteChange / Math.abs(this.beforeValue)) * 100;
  }
  
  /**
   * Determine if the metric shows improvement
   * 
   * @returns {boolean} - Whether the metric improved
   */
  determineImprovement() {
    if (this.higherIsBetter) {
      return this.afterValue > this.beforeValue;
    } else {
      return this.afterValue < this.beforeValue;
    }
  }
  
  /**
   * Check if the improvement meets the threshold
   * 
   * @returns {boolean} - Whether the threshold is met
   */
  checkThreshold() {
    if (!this.improved) {
      return false;
    }
    
    // For metrics where lower is better, percentage change will be negative
    // but we want to compare the absolute value against threshold
    const absPercentageChange = Math.abs(this.percentageChange);
    
    return absPercentageChange >= this.threshold;
  }
  
  /**
   * Format the metric for display
   * 
   * @returns {string} - Formatted display string
   */
  formatDisplay() {
    const formatValue = (value) => {
      if (typeof value === 'number') {
        return value.toFixed(2);
      }
      return value.toString();
    };
    
    const changeSymbol = this.improved ? '✅' : '❌';
    const direction = this.improved ? 'improved' : 'worsened';
    const thresholdMet = this.meetsThreshold ? 'meets threshold' : 'below threshold';
    
    return `${this.name}: ${formatValue(this.beforeValue)}${this.unit} → ${formatValue(this.afterValue)}${this.unit} ` +
           `(${this.percentageChange.toFixed(2)}% ${direction}) ${changeSymbol} ${thresholdMet}`;
  }
  
  /**
   * Convert to JSON representation
   * 
   * @returns {Object} - JSON representation
   */
  toJSON() {
    return {
      name: this.name,
      beforeValue: this.beforeValue,
      afterValue: this.afterValue,
      unit: this.unit,
      absoluteChange: this.absoluteChange,
      percentageChange: this.percentageChange,
      improved: this.improved,
      meetsThreshold: this.meetsThreshold,
      higherIsBetter: this.higherIsBetter,
      threshold: this.threshold
    };
  }
}

module.exports = ComparisonMetric;
