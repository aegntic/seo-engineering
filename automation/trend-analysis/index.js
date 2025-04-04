/**
 * Trend Analysis Reporting Module
 * 
 * This module provides historical performance tracking and competitive benchmarking
 * capabilities. It enables tracking SEO and performance metrics over time, visualizing
 * trends, comparing against competitors, and predicting future performance.
 */

const HistoricalDataStore = require('./storage/historicalDataStore');
const MetricsTrendAnalyzer = require('./analyzers/metricsTrendAnalyzer');
const CompetitorBenchmarkSystem = require('./benchmarking/competitorBenchmarkSystem');
const PerformancePredictionEngine = require('./prediction/performancePredictionEngine');
const TrendReport = require('./reporting/trendReport');
const logger = require('../common/logger');

class TrendAnalysisReporting {
  constructor(options = {}) {
    this.historicalDataStore = new HistoricalDataStore(options);
    this.metricsTrendAnalyzer = new MetricsTrendAnalyzer(options);
    this.competitorBenchmarkSystem = new CompetitorBenchmarkSystem(options);
    this.performancePredictionEngine = new PerformancePredictionEngine(options);
    
    this.config = {
      // Default tracking period in days
      trackingPeriod: options.trackingPeriod || 90, 
      // Default interval for data points (daily, weekly, monthly)
      dataInterval: options.dataInterval || 'daily',
      // Maximum number of competitors to track
      maxCompetitors: options.maxCompetitors || 5,
      // Metrics to analyze in trends
      trackedMetrics: options.trackedMetrics || [
        'score', 
        'largestContentfulPaint', 
        'cumulativeLayoutShift',
        'totalBlockingTime',
        'resourceSize',
        'errorCount',
        'brokenLinks'
      ],
      // Whether to enable performance prediction
      enablePrediction: options.enablePrediction !== false,
      // Prediction horizon in days
      predictionHorizon: options.predictionHorizon || 30,
      ...options
    };
    
    logger.info('Trend Analysis Reporting Module initialized');
  }
  
  /**
   * Store current performance data for historical tracking
   * 
   * @param {string} siteId - Site identifier
   * @param {Object} performanceData - Current performance metrics
   * @param {Object} options - Storage options
   * @returns {Promise<Object>} - Storage result
   */
  async storePerformanceSnapshot(siteId, performanceData, options = {}) {
    logger.info(`Storing performance snapshot for site: ${siteId}`);
    
    try {
      // Prepare timestamp
      const timestamp = options.timestamp || new Date();
      
      // Extract and normalize metrics for storage
      const normalizedMetrics = this.normalizeMetrics(performanceData);
      
      // Store the data
      const result = await this.historicalDataStore.storeMetrics(
        siteId, 
        normalizedMetrics,
        timestamp,
        options
      );
      
      logger.info(`Performance snapshot stored successfully for site: ${siteId}`);
      return result;
      
    } catch (error) {
      logger.error(`Failed to store performance snapshot: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Normalize performance metrics for consistent storage
   * 
   * @param {Object} performanceData - Performance data to normalize
   * @returns {Object} - Normalized metrics
   */
  normalizeMetrics(performanceData) {
    const normalized = {
      timestamp: new Date(),
      metrics: {}
    };
    
    // Extract core metrics if available
    if (performanceData.scores) {
      normalized.metrics.score = performanceData.scores.overall || 0;
      normalized.metrics.coreWebVitalsScore = performanceData.scores.coreWebVitals || 0;
      normalized.metrics.resourceEfficiencyScore = performanceData.scores.resourceEfficiency || 0;
    }
    
    // Extract mobile performance metrics if available
    if (performanceData.performanceMetrics && performanceData.performanceMetrics.mobile) {
      const mobileMetrics = performanceData.performanceMetrics.mobile;
      
      normalized.metrics.mobileLCP = mobileMetrics.largestContentfulPaint;
      normalized.metrics.mobileCLS = mobileMetrics.cumulativeLayoutShift;
      normalized.metrics.mobileTBT = mobileMetrics.totalBlockingTime;
      normalized.metrics.mobileLoadTime = mobileMetrics.loadTime;
    }
    
    // Extract desktop performance metrics if available
    if (performanceData.performanceMetrics && performanceData.performanceMetrics.desktop) {
      const desktopMetrics = performanceData.performanceMetrics.desktop;
      
      normalized.metrics.desktopLCP = desktopMetrics.largestContentfulPaint;
      normalized.metrics.desktopCLS = desktopMetrics.cumulativeLayoutShift;
      normalized.metrics.desktopTBT = desktopMetrics.totalBlockingTime;
      normalized.metrics.desktopLoadTime = desktopMetrics.loadTime;
    }
    
    // Extract resource metrics if available
    if (performanceData.resourceBreakdown) {
      normalized.metrics.totalRequests = performanceData.resourceBreakdown.totalRequests;
      normalized.metrics.totalSize = performanceData.resourceBreakdown.totalSize;
    }
    
    // Extract bottleneck counts if available
    if (performanceData.bottlenecks && performanceData.bottlenecks.bySeverity) {
      normalized.metrics.highSeverityIssues = 
        performanceData.bottlenecks.bySeverity.high?.length || 0;
      normalized.metrics.mediumSeverityIssues = 
        performanceData.bottlenecks.bySeverity.medium?.length || 0;
    }
    
    return normalized;
  }
  
  /**
   * Register a competitor site for benchmarking
   * 
   * @param {string} siteId - Your site identifier
   * @param {string} competitorUrl - Competitor's URL
   * @param {Object} options - Registration options
   * @returns {Promise<Object>} - Registration result
   */
  async registerCompetitor(siteId, competitorUrl, options = {}) {
    logger.info(`Registering competitor ${competitorUrl} for site: ${siteId}`);
    
    try {
      const result = await this.competitorBenchmarkSystem.registerCompetitor(
        siteId,
        competitorUrl,
        options
      );
      
      logger.info(`Competitor ${competitorUrl} registered successfully`);
      return result;
      
    } catch (error) {
      logger.error(`Failed to register competitor: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate a trend analysis report for a specific site
   * 
   * @param {string} siteId - Site identifier
   * @param {Object} options - Report options
   * @returns {Promise<Object>} - Trend analysis report
   */
  async generateTrendReport(siteId, options = {}) {
    logger.info(`Generating trend report for site: ${siteId}`);
    
    try {
      const combinedOptions = {
        ...this.config,
        ...options
      };
      
      // 1. Retrieve historical data
      const historicalData = await this.historicalDataStore.getHistoricalData(
        siteId, 
        combinedOptions.trackingPeriod,
        combinedOptions
      );
      
      // 2. Analyze trends
      const trendAnalysis = await this.metricsTrendAnalyzer.analyzeTrends(
        historicalData, 
        combinedOptions.trackedMetrics,
        combinedOptions
      );
      
      // 3. Get competitor benchmarks
      const competitorBenchmarks = await this.competitorBenchmarkSystem.getCompetitorBenchmarks(
        siteId,
        combinedOptions
      );
      
      // 4. Generate performance predictions if enabled
      let predictions = null;
      if (combinedOptions.enablePrediction) {
        predictions = await this.performancePredictionEngine.predictMetrics(
          historicalData,
          combinedOptions.trackedMetrics,
          combinedOptions.predictionHorizon,
          combinedOptions
        );
      }
      
      // 5. Generate the complete report
      const report = new TrendReport({
        siteId,
        historicalData,
        trendAnalysis,
        competitorBenchmarks,
        predictions,
        config: combinedOptions
      });
      
      const generatedReport = report.generate();
      
      logger.info(`Trend report generated successfully for site: ${siteId}`);
      return generatedReport;
      
    } catch (error) {
      logger.error(`Failed to generate trend report: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get raw historical data for a metric
   * 
   * @param {string} siteId - Site identifier
   * @param {string} metricKey - Metric key to retrieve
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Historical data points
   */
  async getMetricHistory(siteId, metricKey, options = {}) {
    logger.debug(`Retrieving history for metric ${metricKey} for site: ${siteId}`);
    
    try {
      const combinedOptions = {
        ...this.config,
        ...options
      };
      
      const history = await this.historicalDataStore.getMetricHistory(
        siteId,
        metricKey,
        combinedOptions.trackingPeriod,
        combinedOptions
      );
      
      return history;
      
    } catch (error) {
      logger.error(`Failed to retrieve metric history: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Compare a site against its competitors for a specific metric
   * 
   * @param {string} siteId - Site identifier
   * @param {string} metricKey - Metric to compare
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} - Competitive comparison
   */
  async compareWithCompetitors(siteId, metricKey, options = {}) {
    logger.info(`Comparing site ${siteId} with competitors for metric: ${metricKey}`);
    
    try {
      const combinedOptions = {
        ...this.config,
        ...options
      };
      
      const comparison = await this.competitorBenchmarkSystem.compareMetric(
        siteId,
        metricKey,
        combinedOptions
      );
      
      return comparison;
      
    } catch (error) {
      logger.error(`Failed to compare with competitors: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Predict future metric values
   * 
   * @param {string} siteId - Site identifier
   * @param {string} metricKey - Metric to predict
   * @param {number} horizon - Prediction horizon in days
   * @param {Object} options - Prediction options
   * @returns {Promise<Object>} - Prediction results
   */
  async predictMetric(siteId, metricKey, horizon = 30, options = {}) {
    logger.info(`Predicting metric ${metricKey} for site ${siteId} with ${horizon} day horizon`);
    
    try {
      const combinedOptions = {
        ...this.config,
        ...options
      };
      
      // Get historical data
      const historicalData = await this.historicalDataStore.getMetricHistory(
        siteId,
        metricKey,
        combinedOptions.trackingPeriod,
        combinedOptions
      );
      
      // Generate prediction
      const prediction = await this.performancePredictionEngine.predictSingleMetric(
        historicalData,
        metricKey,
        horizon,
        combinedOptions
      );
      
      return prediction;
      
    } catch (error) {
      logger.error(`Failed to predict metric: ${error.message}`);
      throw error;
    }
  }
}

module.exports = TrendAnalysisReporting;
