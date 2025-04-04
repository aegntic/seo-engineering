/**
 * Trend Result Model
 * 
 * Represents the result of a trend analysis for a specific metric.
 * Contains trend direction, statistics, and insights.
 */

class TrendResult {
  /**
   * Create a new trend result
   * 
   * @param {Object} data - Trend result data
   * @param {string} data.metricKey - Metric key
   * @param {number} data.dataPoints - Number of data points
   * @param {Object} data.statistics - Statistical measures
   * @param {Object} data.trend - Trend information
   * @param {Object} data.recentTrend - Recent trend information
   * @param {Array<Object>} data.significantChanges - Significant changes
   * @param {Object} data.seasonality - Seasonality information
   * @param {Array<Object>} data.anomalies - Detected anomalies
   * @param {Array<Object>} data.forecast - Forecasted values
   */
  constructor(data = {}) {
    this.metricKey = data.metricKey || '';
    this.dataPoints = data.dataPoints || 0;
    this.statistics = data.statistics || {};
    this.trend = data.trend || {};
    this.recentTrend = data.recentTrend || {};
    this.significantChanges = data.significantChanges || [];
    this.seasonality = data.seasonality || null;
    this.anomalies = data.anomalies || [];
    this.forecast = data.forecast || [];
  }
  
  /**
   * Check if trend has a specific direction
   * 
   * @param {string} direction - Direction to check
   * @returns {boolean} - Whether trend has the direction
   */
  hasDirection(direction) {
    return this.trend.direction === direction;
  }
  
  /**
   * Check if trend is improving
   * 
   * @returns {boolean} - Whether trend is improving
   */
  isImproving() {
    return this.hasDirection('improving');
  }
  
  /**
   * Check if trend is degrading
   * 
   * @returns {boolean} - Whether trend is degrading
   */
  isDegrading() {
    return this.hasDirection('degrading');
  }
  
  /**
   * Check if trend is stable
   * 
   * @returns {boolean} - Whether trend is stable
   */
  isStable() {
    return this.hasDirection('stable');
  }
  
  /**
   * Get trend intensity based on percent change
   * 
   * @returns {string} - Trend intensity (slight, moderate, significant)
   */
  getTrendIntensity() {
    const percentChange = Math.abs(this.trend.percentChange || 0);
    
    if (percentChange < 5) {
      return 'slight';
    } else if (percentChange < 15) {
      return 'moderate';
    } else {
      return 'significant';
    }
  }
  
  /**
   * Get trend summary text
   * 
   * @returns {string} - Summary text
   */
  getSummaryText() {
    if (!this.trend.direction) {
      return `No clear trend for ${this.metricKey}`;
    }
    
    const intensity = this.getTrendIntensity();
    const directionText = this.trend.direction === 'stable' 
      ? 'stable' 
      : `${this.trend.direction} (${intensity}, ${Math.abs(this.trend.percentChange).toFixed(1)}%)`;
    
    return `${this.metricKey} is ${directionText} over the analyzed period`;
  }
  
  /**
   * Check if there are significant changes
   * 
   * @returns {boolean} - Whether there are significant changes
   */
  hasSignificantChanges() {
    return this.significantChanges.length > 0;
  }
  
  /**
   * Check if there is seasonality
   * 
   * @returns {boolean} - Whether there is seasonality
   */
  hasSeasonality() {
    return this.seasonality !== null;
  }
  
  /**
   * Check if there are anomalies
   * 
   * @returns {boolean} - Whether there are anomalies
   */
  hasAnomalies() {
    return this.anomalies.length > 0;
  }
  
  /**
   * Get the most significant change
   * 
   * @returns {Object|null} - Most significant change or null if none
   */
  getMostSignificantChange() {
    if (this.significantChanges.length === 0) {
      return null;
    }
    
    return this.significantChanges.sort(
      (a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange)
    )[0];
  }
  
  /**
   * Get the most anomalous data point
   * 
   * @returns {Object|null} - Most anomalous data point or null if none
   */
  getMostAnomalousPoint() {
    if (this.anomalies.length === 0) {
      return null;
    }
    
    return this.anomalies.sort(
      (a, b) => b.zScore - a.zScore
    )[0];
  }
  
  /**
   * Convert to a plain object
   * 
   * @returns {Object} - Plain object representation
   */
  toObject() {
    return {
      metricKey: this.metricKey,
      dataPoints: this.dataPoints,
      statistics: this.statistics,
      trend: this.trend,
      recentTrend: this.recentTrend,
      significantChanges: this.significantChanges,
      seasonality: this.seasonality,
      anomalies: this.anomalies,
      forecast: this.forecast
    };
  }
  
  /**
   * Create from a plain object
   * 
   * @param {Object} obj - Plain object
   * @returns {TrendResult} - Trend result
   */
  static fromObject(obj) {
    return new TrendResult(obj);
  }
}

module.exports = TrendResult;
