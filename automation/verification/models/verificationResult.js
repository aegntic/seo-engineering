/**
 * VerificationResult Model
 * 
 * Represents the structured result of a verification operation,
 * with detailed information about success/failure and metrics.
 */

class VerificationResult {
  /**
   * Create a new verification result
   * 
   * @param {Object} data - The verification result data
   * @param {string} data.siteId - The ID of the site being verified
   * @param {boolean} data.success - Whether the verification was successful
   * @param {string} data.message - A human-readable message describing the result
   * @param {Array} data.fixes - Results for individual fixes
   * @param {Date} data.timestamp - When the verification was performed
   * @param {Object} data.metrics - Overall performance metrics
   */
  constructor(data) {
    this.siteId = data.siteId;
    this.success = data.success || false;
    this.message = data.message || '';
    this.fixes = data.fixes || [];
    this.timestamp = data.timestamp || new Date();
    this.metrics = data.metrics || {};
    
    // Calculate summary statistics
    this.summary = this.generateSummary();
  }
  
  /**
   * Generate a summary of the verification results
   * 
   * @returns {Object} - Summary statistics
   */
  generateSummary() {
    if (!this.fixes || this.fixes.length === 0) {
      return {
        totalFixes: 0,
        successfulFixes: 0,
        failedFixes: 0,
        successRate: 0,
        averageImprovementPercentage: 0
      };
    }
    
    const totalFixes = this.fixes.length;
    const successfulFixes = this.fixes.filter(fix => fix.success).length;
    const failedFixes = totalFixes - successfulFixes;
    const successRate = (successfulFixes / totalFixes) * 100;
    
    // Calculate average improvement percentage across all fixes
    // that have performance metrics
    let totalImprovement = 0;
    let fixesWithMetrics = 0;
    
    this.fixes.forEach(fix => {
      if (fix.strategyResults?.performance?.improvementPercentage) {
        totalImprovement += fix.strategyResults.performance.improvementPercentage;
        fixesWithMetrics++;
      }
    });
    
    const averageImprovementPercentage = 
      fixesWithMetrics > 0 ? totalImprovement / fixesWithMetrics : 0;
    
    return {
      totalFixes,
      successfulFixes,
      failedFixes,
      successRate,
      averageImprovementPercentage
    };
  }
  
  /**
   * Get verification results filtered by fix type
   * 
   * @param {string} fixType - The type of fix to filter by
   * @returns {Array} - Filtered fix results
   */
  getResultsByFixType(fixType) {
    return this.fixes.filter(fix => fix.fixType === fixType);
  }
  
  /**
   * Get all fixes that failed verification
   * 
   * @returns {Array} - Failed fixes
   */
  getFailedFixes() {
    return this.fixes.filter(fix => !fix.success);
  }
  
  /**
   * Convert the verification result to a format suitable for client reporting
   * 
   * @returns {Object} - Client-friendly result format
   */
  toClientFormat() {
    return {
      success: this.success,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      summary: {
        total: this.summary.totalFixes,
        successful: this.summary.successfulFixes,
        failed: this.summary.failedFixes,
        successRate: `${this.summary.successRate.toFixed(1)}%`,
        averageImprovement: `${this.summary.averageImprovementPercentage.toFixed(1)}%`
      },
      fixes: this.fixes.map(fix => ({
        type: fix.fixType,
        success: fix.success,
        improvementPercentage: fix.strategyResults?.performance?.improvementPercentage || 0
      }))
    };
  }
  
  /**
   * Convert to JSON representation
   * 
   * @returns {Object} - JSON representation
   */
  toJSON() {
    return {
      siteId: this.siteId,
      success: this.success,
      message: this.message,
      timestamp: this.timestamp,
      summary: this.summary,
      fixes: this.fixes,
      metrics: this.metrics
    };
  }
}

module.exports = VerificationResult;
