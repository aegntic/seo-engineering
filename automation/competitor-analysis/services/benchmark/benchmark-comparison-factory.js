/**
 * Benchmark Comparison Factory
 * 
 * This factory creates benchmark comparison instances and provides
 * convenience methods for common benchmark operations.
 */

const BenchmarkService = require('./benchmark-service');
const logger = require('../../utils/logger');

class BenchmarkComparisonFactory {
  /**
   * Create a new benchmark comparison factory
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.options = {
      outputDir: null,
      ...options
    };
    
    this.benchmarkService = new BenchmarkService({
      ...this.options
    });
  }
  
  /**
   * Initialize the factory
   * @param {Object} industryData Industry benchmark data
   * @returns {Promise<void>}
   */
  async initialize(industryData = null) {
    await this.benchmarkService.initialize(industryData);
    logger.info('Benchmark comparison factory initialized');
  }
  
  /**
   * Create a benchmark comparison for a client site against competitors
   * @param {Object} clientData Client site data
   * @param {Object} competitorsData Competitors data
   * @param {Array} categories Categories to benchmark
   * @param {Object} historicalData Historical data for trend analysis
   * @returns {Promise<Object>} Benchmark comparison results with visualizations
   */
  async createBenchmarkComparison(clientData, competitorsData, categories = [], historicalData = null) {
    try {
      logger.info('Creating benchmark comparison');
      
      // Generate a unique job ID
      const jobId = this._generateJobId();
      
      // Analyze benchmarks
      const benchmarkComparison = await this.benchmarkService.analyzeBenchmarks(
        clientData,
        competitorsData,
        categories,
        historicalData
      );
      
      // Generate visualizations
      const visualizations = await this.benchmarkService.generateVisualizations(benchmarkComparison, jobId);
      
      // Generate markdown report
      const report = benchmarkComparison.generateMarkdownReport();
      
      logger.info('Benchmark comparison created successfully');
      
      return {
        comparison: benchmarkComparison,
        visualizations,
        report,
        jobId
      };
    } catch (error) {
      logger.error(`Failed to create benchmark comparison: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate a unique job ID
   * @returns {string} Unique job ID
   * @private
   */
  _generateJobId() {
    return `benchmark-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}

module.exports = BenchmarkComparisonFactory;
