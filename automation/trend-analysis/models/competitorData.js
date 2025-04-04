/**
 * Competitor Data Model
 * 
 * Represents performance data for a competitor website.
 * Used for competitive benchmarking and analysis.
 */

class CompetitorData {
  /**
   * Create a new competitor data object
   * 
   * @param {Object} data - Competitor data
   * @param {string} data.siteId - Your site identifier
   * @param {string} data.url - Competitor URL
   * @param {string} data.name - Competitor name
   * @param {Date} data.addedAt - When competitor was added
   * @param {Date} data.lastUpdated - When competitor was last updated
   * @param {Object} data.metrics - Competitor performance metrics
   */
  constructor(data = {}) {
    this.siteId = data.siteId || '';
    this.url = data.url || '';
    this.name = data.name || this.extractNameFromUrl(data.url);
    this.addedAt = data.addedAt instanceof Date 
      ? data.addedAt 
      : new Date(data.addedAt || Date.now());
    this.lastUpdated = data.lastUpdated instanceof Date 
      ? data.lastUpdated 
      : data.lastUpdated ? new Date(data.lastUpdated) : null;
    this.metrics = data.metrics || null;
    this.tags = data.tags || [];
    this.notes = data.notes || '';
  }
  
  /**
   * Extract a name from a URL
   * 
   * @param {string} url - URL
   * @returns {string} - Extracted name
   */
  extractNameFromUrl(url) {
    if (!url) {
      return 'Unknown';
    }
    
    try {
      // Remove protocol and www
      const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
      
      // Get domain without path
      return domain.split('/')[0];
    } catch (error) {
      return 'Unknown';
    }
  }
  
  /**
   * Update competitor metrics
   * 
   * @param {Object} metrics - New metrics
   * @param {Date} timestamp - Update timestamp
   */
  updateMetrics(metrics, timestamp = new Date()) {
    this.metrics = metrics;
    this.lastUpdated = timestamp;
  }
  
  /**
   * Get a specific metric
   * 
   * @param {string} key - Metric key
   * @returns {number|null} - Metric value or null if not found
   */
  getMetric(key) {
    return this.metrics && this.metrics[key] !== undefined 
      ? this.metrics[key] 
      : null;
  }
  
  /**
   * Check if metrics are outdated
   * 
   * @param {number} maxAgeDays - Maximum age in days
   * @returns {boolean} - Whether metrics are outdated
   */
  isOutdated(maxAgeDays = 7) {
    if (!this.lastUpdated) {
      return true;
    }
    
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    const ageDiff = Date.now() - this.lastUpdated.getTime();
    
    return ageDiff > maxAgeMs;
  }
  
  /**
   * Add a tag
   * 
   * @param {string} tag - Tag to add
   */
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }
  
  /**
   * Remove a tag
   * 
   * @param {string} tag - Tag to remove
   */
  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
  }
  
  /**
   * Check if competitor has a tag
   * 
   * @param {string} tag - Tag to check
   * @returns {boolean} - Whether competitor has the tag
   */
  hasTag(tag) {
    return this.tags.includes(tag);
  }
  
  /**
   * Set notes for this competitor
   * 
   * @param {string} notes - Notes text
   */
  setNotes(notes) {
    this.notes = notes;
  }
  
  /**
   * Convert to a plain object
   * 
   * @returns {Object} - Plain object representation
   */
  toObject() {
    return {
      siteId: this.siteId,
      url: this.url,
      name: this.name,
      addedAt: this.addedAt.toISOString(),
      lastUpdated: this.lastUpdated ? this.lastUpdated.toISOString() : null,
      metrics: this.metrics,
      tags: [...this.tags],
      notes: this.notes
    };
  }
  
  /**
   * Create from a plain object
   * 
   * @param {Object} obj - Plain object
   * @returns {CompetitorData} - Competitor data
   */
  static fromObject(obj) {
    return new CompetitorData({
      siteId: obj.siteId,
      url: obj.url,
      name: obj.name,
      addedAt: new Date(obj.addedAt),
      lastUpdated: obj.lastUpdated ? new Date(obj.lastUpdated) : null,
      metrics: obj.metrics,
      tags: obj.tags || [],
      notes: obj.notes || ''
    });
  }
  
  /**
   * Check if competitor data is valid
   * 
   * @returns {boolean} - Whether competitor data is valid
   */
  isValid() {
    return !!this.siteId && !!this.url;
  }
}

module.exports = CompetitorData;
