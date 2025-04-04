/**
 * Metrics Snapshot Model
 * 
 * Represents a point-in-time capture of performance metrics for a site.
 * Used for historical data storage and trend analysis.
 */

class MetricsSnapshot {
  /**
   * Create a new metrics snapshot
   * 
   * @param {Object} data - Snapshot data
   * @param {string} data.siteId - Site identifier
   * @param {Date} data.timestamp - Snapshot timestamp
   * @param {Object} data.metrics - Performance metrics
   */
  constructor(data = {}) {
    this.siteId = data.siteId || '';
    this.timestamp = data.timestamp instanceof Date 
      ? data.timestamp 
      : new Date(data.timestamp || Date.now());
    this.metrics = data.metrics || {};
    this.source = data.source || 'manual';
    this.tags = data.tags || [];
  }
  
  /**
   * Add or update a metric
   * 
   * @param {string} key - Metric key
   * @param {number} value - Metric value
   */
  setMetric(key, value) {
    this.metrics[key] = value;
  }
  
  /**
   * Get a metric value
   * 
   * @param {string} key - Metric key
   * @returns {number|null} - Metric value or null if not found
   */
  getMetric(key) {
    return this.metrics[key] !== undefined ? this.metrics[key] : null;
  }
  
  /**
   * Get all metrics
   * 
   * @returns {Object} - All metrics
   */
  getAllMetrics() {
    return { ...this.metrics };
  }
  
  /**
   * Add a tag to the snapshot
   * 
   * @param {string} tag - Tag to add
   */
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }
  
  /**
   * Remove a tag from the snapshot
   * 
   * @param {string} tag - Tag to remove
   */
  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
  }
  
  /**
   * Check if snapshot has a tag
   * 
   * @param {string} tag - Tag to check
   * @returns {boolean} - Whether snapshot has the tag
   */
  hasTag(tag) {
    return this.tags.includes(tag);
  }
  
  /**
   * Convert snapshot to a plain object
   * 
   * @returns {Object} - Plain object representation
   */
  toObject() {
    return {
      siteId: this.siteId,
      timestamp: this.timestamp.toISOString(),
      metrics: { ...this.metrics },
      source: this.source,
      tags: [...this.tags]
    };
  }
  
  /**
   * Create a snapshot from a plain object
   * 
   * @param {Object} obj - Plain object
   * @returns {MetricsSnapshot} - Metrics snapshot
   */
  static fromObject(obj) {
    return new MetricsSnapshot({
      siteId: obj.siteId,
      timestamp: new Date(obj.timestamp),
      metrics: obj.metrics || {},
      source: obj.source,
      tags: obj.tags || []
    });
  }
  
  /**
   * Check if a snapshot is valid
   * 
   * @returns {boolean} - Whether snapshot is valid
   */
  isValid() {
    // Must have a site ID and at least one metric
    return !!this.siteId && Object.keys(this.metrics).length > 0;
  }
}

module.exports = MetricsSnapshot;
