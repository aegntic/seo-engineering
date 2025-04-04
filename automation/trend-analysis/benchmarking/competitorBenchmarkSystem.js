/**
 * Competitor Benchmark System
 * 
 * Manages tracking and comparing performance metrics against competitor websites.
 * Provides competitive insights and relative performance positioning.
 */

const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');
const logger = require('../../common/logger');
const CompetitorData = require('../models/competitorData');
const DetailedPerformanceTracking = require('../../performance');

class CompetitorBenchmarkSystem {
  constructor(options = {}) {
    this.config = {
      // Maximum number of competitors to track per site
      maxCompetitors: options.maxCompetitors || 5,
      
      // Storage type: 'file' (default) or 'database'
      storageType: options.storageType || 'file',
      
      // Base directory for file storage
      storageDir: options.storageDir || path.join(process.cwd(), 'data', 'competitors'),
      
      // Database connection (if storageType is 'database')
      dbConnection: options.dbConnection || null,
      
      // Table/collection name (if storageType is 'database')
      tableName: options.tableName || 'competitor_benchmarks',
      
      // Maximum age of competitor data before refresh (in days)
      maxDataAge: options.maxDataAge || 7,
      
      // Default metrics to compare
      defaultMetrics: options.defaultMetrics || [
        'score', 
        'largestContentfulPaint', 
        'cumulativeLayoutShift',
        'totalBlockingTime',
        'resourceSize',
        'requestCount'
      ],
      
      // Performance tracking configuration
      performanceTracking: options.performanceTracking || {
        browsers: ['chromium'],
        deviceEmulation: ['desktop', 'mobile']
      },
      
      ...options
    };
    
    // Initialize performance tracker
    this.performanceTracker = new DetailedPerformanceTracking(
      this.config.performanceTracking
    );
    
    // Initialize storage
    this.init();
    
    logger.info('Competitor Benchmark System initialized');
  }
  
  /**
   * Initialize the benchmark system
   */
  async init() {
    try {
      if (this.config.storageType === 'file') {
        // Ensure storage directory exists
        await this.ensureStorageDirectory();
      } else if (this.config.storageType === 'database') {
        // Validate database connection
        if (!this.config.dbConnection) {
          throw new Error('Database connection required for database storage type');
        }
        
        // Additional database initialization can be added here
      }
    } catch (error) {
      logger.error(`Failed to initialize competitor benchmark system: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Ensure the file storage directory exists
   */
  async ensureStorageDirectory() {
    try {
      await fs.mkdir(this.config.storageDir, { recursive: true });
      logger.debug(`Competitor storage directory ensured: ${this.config.storageDir}`);
    } catch (error) {
      logger.error(`Failed to create competitor storage directory: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Register a competitor for benchmarking
   * 
   * @param {string} siteId - Your site identifier
   * @param {string} competitorUrl - Competitor's URL
   * @param {Object} options - Registration options
   * @returns {Promise<Object>} - Registration result
   */
  async registerCompetitor(siteId, competitorUrl, options = {}) {
    logger.info(`Registering competitor ${competitorUrl} for site ${siteId}`);
    
    try {
      // Validate URL
      const url = new URL(competitorUrl);
      const normalizedUrl = url.origin;
      
      // Check if already registered
      const competitors = await this.getCompetitors(siteId);
      
      if (competitors.some(c => c.url === normalizedUrl)) {
        logger.info(`Competitor ${normalizedUrl} already registered for site ${siteId}`);
        return {
          success: true,
          siteId,
          competitorUrl: normalizedUrl,
          message: 'Competitor already registered'
        };
      }
      
      // Check if maximum competitors reached
      if (competitors.length >= this.config.maxCompetitors) {
        throw new Error(`Maximum number of competitors (${this.config.maxCompetitors}) reached`);
      }
      
      // Create competitor data
      const competitor = new CompetitorData({
        siteId,
        url: normalizedUrl,
        name: options.name || this.getCompetitorName(normalizedUrl),
        addedAt: new Date(),
        lastUpdated: null,
        metrics: null
      });
      
      // Store competitor
      if (this.config.storageType === 'file') {
        await this.storeCompetitorToFile(siteId, competitor);
      } else if (this.config.storageType === 'database') {
        await this.storeCompetitorToDatabase(siteId, competitor);
      }
      
      logger.info(`Competitor ${normalizedUrl} registered successfully for site ${siteId}`);
      
      // Optionally analyze competitor immediately
      if (options.analyzeImmediately) {
        logger.info(`Analyzing competitor ${normalizedUrl} immediately`);
        await this.analyzeCompetitor(siteId, normalizedUrl);
      }
      
      return {
        success: true,
        siteId,
        competitorUrl: normalizedUrl,
        name: competitor.name,
        message: 'Competitor registered successfully'
      };
      
    } catch (error) {
      logger.error(`Failed to register competitor: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get list of registered competitors for a site
   * 
   * @param {string} siteId - Site identifier
   * @returns {Promise<Array<Object>>} - List of competitors
   */
  async getCompetitors(siteId) {
    logger.debug(`Getting competitors for site ${siteId}`);
    
    try {
      if (this.config.storageType === 'file') {
        return await this.getCompetitorsFromFile(siteId);
      } else if (this.config.storageType === 'database') {
        return await this.getCompetitorsFromDatabase(siteId);
      } else {
        throw new Error(`Unsupported storage type: ${this.config.storageType}`);
      }
    } catch (error) {
      logger.error(`Failed to get competitors: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get competitors from file storage
   * 
   * @param {string} siteId - Site identifier
   * @returns {Promise<Array<Object>>} - List of competitors
   */
  async getCompetitorsFromFile(siteId) {
    try {
      // Get site-specific directory
      const siteDir = path.join(this.config.storageDir, siteId);
      
      // Check if directory exists
      try {
        await fs.access(siteDir);
      } catch (error) {
        // Directory doesn't exist, return empty array
        return [];
      }
      
      // Get competitor files
      const files = await fs.readdir(siteDir);
      const competitorFiles = files.filter(file => file.endsWith('.json'));
      
      // Read and parse each file
      const competitors = await Promise.all(
        competitorFiles.map(async (file) => {
          const filePath = path.join(siteDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          return JSON.parse(content);
        })
      );
      
      return competitors;
    } catch (error) {
      logger.error(`Failed to get competitors from file: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get competitors from database
   * 
   * @param {string} siteId - Site identifier
   * @returns {Promise<Array<Object>>} - List of competitors
   */
  async getCompetitorsFromDatabase(siteId) {
    try {
      // Check database connection
      if (!this.config.dbConnection) {
        throw new Error('Database connection not available');
      }
      
      // Query database
      const competitors = await this.config.dbConnection.collection(this.config.tableName)
        .find({ siteId })
        .toArray();
      
      return competitors;
    } catch (error) {
      logger.error(`Failed to get competitors from database: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Store competitor data to file
   * 
   * @param {string} siteId - Site identifier
   * @param {CompetitorData} competitor - Competitor data
   * @returns {Promise<void>}
   */
  async storeCompetitorToFile(siteId, competitor) {
    try {
      // Create site-specific directory
      const siteDir = path.join(this.config.storageDir, siteId);
      await fs.mkdir(siteDir, { recursive: true });
      
      // Create filename from URL (replace characters that are invalid in filenames)
      const safeUrl = this.getSafeFilename(competitor.url);
      const filePath = path.join(siteDir, `${safeUrl}.json`);
      
      // Write competitor data to file
      await fs.writeFile(
        filePath,
        JSON.stringify(competitor, null, 2),
        'utf8'
      );
    } catch (error) {
      logger.error(`Failed to store competitor to file: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Store competitor data to database
   * 
   * @param {string} siteId - Site identifier
   * @param {CompetitorData} competitor - Competitor data
   * @returns {Promise<void>}
   */
  async storeCompetitorToDatabase(siteId, competitor) {
    try {
      // Check database connection
      if (!this.config.dbConnection) {
        throw new Error('Database connection not available');
      }
      
      // Insert into database (implementation depends on database type)
      await this.config.dbConnection.collection(this.config.tableName)
        .insertOne(competitor);
      
    } catch (error) {
      logger.error(`Failed to store competitor to database: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Analyze a competitor's performance
   * 
   * @param {string} siteId - Your site identifier
   * @param {string} competitorUrl - Competitor URL
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Analysis result
   */
  async analyzeCompetitor(siteId, competitorUrl, options = {}) {
    logger.info(`Analyzing competitor ${competitorUrl} for site ${siteId}`);
    
    try {
      // Find the competitor
      const competitors = await this.getCompetitors(siteId);
      const competitor = competitors.find(c => c.url === competitorUrl);
      
      if (!competitor) {
        throw new Error(`Competitor ${competitorUrl} not found for site ${siteId}`);
      }
      
      // Analyze competitor performance
      const performanceData = await this.performanceTracker.analyzeUrl(
        competitorUrl,
        options.performanceOptions || {}
      );
      
      // Extract relevant metrics
      const metrics = this.extractMetrics(performanceData);
      
      // Update competitor data
      competitor.metrics = metrics;
      competitor.lastUpdated = new Date();
      
      // Store updated competitor data
      if (this.config.storageType === 'file') {
        await this.storeCompetitorToFile(siteId, competitor);
      } else if (this.config.storageType === 'database') {
        await this.updateCompetitorInDatabase(siteId, competitor);
      }
      
      logger.info(`Competitor ${competitorUrl} analyzed successfully`);
      
      return {
        success: true,
        siteId,
        competitorUrl,
        metrics,
        timestamp: competitor.lastUpdated
      };
      
    } catch (error) {
      logger.error(`Failed to analyze competitor: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Update competitor data in database
   * 
   * @param {string} siteId - Site identifier
   * @param {CompetitorData} competitor - Updated competitor data
   * @returns {Promise<void>}
   */
  async updateCompetitorInDatabase(siteId, competitor) {
    try {
      // Check database connection
      if (!this.config.dbConnection) {
        throw new Error('Database connection not available');
      }
      
      // Update in database
      await this.config.dbConnection.collection(this.config.tableName)
        .updateOne(
          { siteId, url: competitor.url },
          { $set: { metrics: competitor.metrics, lastUpdated: competitor.lastUpdated } }
        );
      
    } catch (error) {
      logger.error(`Failed to update competitor in database: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get competitor benchmarks for a site
   * 
   * @param {string} siteId - Site identifier
   * @param {Object} options - Benchmark options
   * @returns {Promise<Object>} - Benchmark data
   */
  async getCompetitorBenchmarks(siteId, options = {}) {
    logger.info(`Getting competitor benchmarks for site ${siteId}`);
    
    try {
      // Get competitors
      const competitors = await this.getCompetitors(siteId);
      
      if (competitors.length === 0) {
        logger.info(`No competitors registered for site ${siteId}`);
        return {
          success: true,
          siteId,
          competitors: [],
          message: 'No competitors registered'
        };
      }
      
      // Check if competitors need analyzing
      const maxAgeMs = (options.maxDataAge || this.config.maxDataAge) * 24 * 60 * 60 * 1000;
      const now = new Date();
      
      const outdatedCompetitors = competitors.filter(competitor => {
        // If never analyzed or older than max age
        return !competitor.lastUpdated || (now - new Date(competitor.lastUpdated) > maxAgeMs);
      });
      
      // Analyze outdated competitors if auto-refresh enabled
      if (outdatedCompetitors.length > 0 && options.autoRefresh !== false) {
        logger.info(`Found ${outdatedCompetitors.length} outdated competitors to refresh`);
        
        // Analyze each outdated competitor
        for (const competitor of outdatedCompetitors) {
          try {
            await this.analyzeCompetitor(siteId, competitor.url, options);
          } catch (error) {
            logger.error(`Failed to refresh competitor ${competitor.url}: ${error.message}`);
            // Continue with other competitors
          }
        }
        
        // Get updated competitors
        const updatedCompetitors = await this.getCompetitors(siteId);
        
        return {
          success: true,
          siteId,
          competitors: updatedCompetitors,
          refreshed: outdatedCompetitors.length
        };
      }
      
      // Return current competitors
      return {
        success: true,
        siteId,
        competitors,
        outdated: outdatedCompetitors.length
      };
      
    } catch (error) {
      logger.error(`Failed to get competitor benchmarks: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Compare metrics between site and competitors
   * 
   * @param {string} siteId - Site identifier
   * @param {string} metricKey - Metric to compare
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} - Comparison result
   */
  async compareMetric(siteId, metricKey, options = {}) {
    logger.debug(`Comparing metric ${metricKey} for site ${siteId} with competitors`);
    
    try {
      // Get site metrics
      const siteMetrics = options.siteMetrics || await this.getSiteMetrics(siteId, options);
      
      if (!siteMetrics || !siteMetrics.metrics || siteMetrics.metrics[metricKey] === undefined) {
        throw new Error(`Metric ${metricKey} not available for site ${siteId}`);
      }
      
      // Get competitor benchmarks
      const benchmarkResult = await this.getCompetitorBenchmarks(siteId, options);
      const competitors = benchmarkResult.competitors || [];
      
      // Filter competitors with the metric
      const validCompetitors = competitors.filter(
        c => c.metrics && c.metrics[metricKey] !== undefined
      );
      
      if (validCompetitors.length === 0) {
        return {
          success: true,
          siteId,
          metricKey,
          siteValue: siteMetrics.metrics[metricKey],
          competitors: [],
          message: 'No competitors with this metric'
        };
      }
      
      // Calculate statistics
      const values = validCompetitors.map(c => c.metrics[metricKey]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      
      // Determine if higher is better for this metric
      const higherIsBetter = this.isHigherBetterForMetric(metricKey);
      
      // Calculate site's position relative to competitors
      const siteValue = siteMetrics.metrics[metricKey];
      let position = 1; // 1st place by default
      
      // Sort competitors by metric (best first)
      const sortedCompetitors = [...validCompetitors].sort((a, b) => {
        return higherIsBetter
          ? b.metrics[metricKey] - a.metrics[metricKey]  // Higher is better, descending
          : a.metrics[metricKey] - b.metrics[metricKey]; // Lower is better, ascending
      });
      
      // Find site position
      for (let i = 0; i < sortedCompetitors.length; i++) {
        const competitorValue = sortedCompetitors[i].metrics[metricKey];
        
        if (higherIsBetter) {
          if (competitorValue > siteValue) {
            position++;
          }
        } else {
          if (competitorValue < siteValue) {
            position++;
          }
        }
      }
      
      // Calculate percentile position (0-100)
      const percentile = ((sortedCompetitors.length + 1 - position) / (sortedCompetitors.length + 1)) * 100;
      
      // Determine performance status
      let status;
      if (percentile >= 80) {
        status = 'excellent'; // Top 20%
      } else if (percentile >= 60) {
        status = 'good';      // Top 40%
      } else if (percentile >= 40) {
        status = 'average';   // Middle 20%
      } else if (percentile >= 20) {
        status = 'below-average'; // Bottom 40%
      } else {
        status = 'poor';      // Bottom 20%
      }
      
      // Calculate difference from average
      const diffFromAvg = siteValue - avg;
      const percentDiffFromAvg = (diffFromAvg / avg) * 100;
      
      // Determine if difference is positive for performance
      const isPositiveDiff = (higherIsBetter && diffFromAvg > 0) || (!higherIsBetter && diffFromAvg < 0);
      
      return {
        success: true,
        siteId,
        metricKey,
        metricName: this.getMetricDisplayName(metricKey),
        siteValue,
        competitors: sortedCompetitors.map(c => ({
          name: c.name,
          url: c.url,
          value: c.metrics[metricKey],
          lastUpdated: c.lastUpdated
        })),
        stats: {
          competitorMin: min,
          competitorMax: max,
          competitorAvg: avg,
          competitorCount: validCompetitors.length
        },
        comparison: {
          position,
          percentile,
          status,
          diffFromAvg,
          percentDiffFromAvg,
          isPositiveDiff,
          higherIsBetter
        }
      };
      
    } catch (error) {
      logger.error(`Failed to compare metric: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get metrics for a site
   * 
   * @param {string} siteId - Site identifier
   * @param {Object} options - Options
   * @returns {Promise<Object>} - Site metrics
   */
  async getSiteMetrics(siteId, options = {}) {
    // If site metrics provided in options, use them
    if (options.siteMetrics) {
      return options.siteMetrics;
    }
    
    // If site URL provided, analyze it
    if (options.siteUrl) {
      logger.info(`Analyzing site ${options.siteUrl} for metrics`);
      
      try {
        const performanceData = await this.performanceTracker.analyzeUrl(
          options.siteUrl,
          options.performanceOptions || {}
        );
        
        const metrics = this.extractMetrics(performanceData);
        
        return {
          siteId,
          url: options.siteUrl,
          metrics,
          timestamp: new Date()
        };
      } catch (error) {
        logger.error(`Failed to analyze site: ${error.message}`);
        throw error;
      }
    }
    
    // Otherwise, try to get from recent historical data
    // This would typically involve integration with the HistoricalDataStore
    // For now, throw an error requiring site metrics or URL
    throw new Error('Site metrics or URL required for comparison');
  }
  
  /**
   * Extract relevant metrics from performance data
   * 
   * @param {Object} performanceData - Performance analysis data
   * @returns {Object} - Extracted metrics
   */
  extractMetrics(performanceData) {
    const metrics = {};
    
    // Extract scores
    if (performanceData.scores) {
      metrics.score = performanceData.scores.overall;
      metrics.coreWebVitalsScore = performanceData.scores.coreWebVitals;
      metrics.resourceEfficiencyScore = performanceData.scores.resourceEfficiency;
      metrics.javascriptExecutionScore = performanceData.scores.javascriptExecution;
      metrics.browserCompatibilityScore = performanceData.scores.browserCompatibility;
    }
    
    // Extract Core Web Vitals (mobile)
    if (performanceData.coreWebVitals && performanceData.coreWebVitals.mobile) {
      const mobileVitals = performanceData.coreWebVitals.mobile;
      
      Object.entries(mobileVitals).forEach(([key, data]) => {
        metrics[`mobile${key.charAt(0).toUpperCase() + key.slice(1)}`] = data.value;
      });
    }
    
    // Extract Core Web Vitals (desktop)
    if (performanceData.coreWebVitals && performanceData.coreWebVitals.desktop) {
      const desktopVitals = performanceData.coreWebVitals.desktop;
      
      Object.entries(desktopVitals).forEach(([key, data]) => {
        metrics[`desktop${key.charAt(0).toUpperCase() + key.slice(1)}`] = data.value;
      });
    }
    
    // Extract resource metrics
    if (performanceData.resourceBreakdown) {
      metrics.totalRequests = performanceData.resourceBreakdown.totalRequests;
      metrics.totalSize = performanceData.resourceBreakdown.totalSize;
      
      // Extract by resource type if available
      if (performanceData.resourceBreakdown.byType) {
        Object.entries(performanceData.resourceBreakdown.byType).forEach(([type, data]) => {
          metrics[`${type}Count`] = data.count;
          metrics[`${type}Size`] = data.size;
        });
      }
    }
    
    // Extract bottleneck counts
    if (performanceData.bottlenecks && performanceData.bottlenecks.bySeverity) {
      metrics.highSeverityIssues = performanceData.bottlenecks.bySeverity.high?.length || 0;
      metrics.mediumSeverityIssues = performanceData.bottlenecks.bySeverity.medium?.length || 0;
      metrics.lowSeverityIssues = performanceData.bottlenecks.bySeverity.low?.length || 0;
    }
    
    return metrics;
  }
  
  /**
   * Get a display name for a competitor based on URL
   * 
   * @param {string} url - Competitor URL
   * @returns {string} - Display name
   */
  getCompetitorName(url) {
    try {
      const parsedUrl = new URL(url);
      // Use hostname without www prefix
      return parsedUrl.hostname.replace(/^www\./, '');
    } catch (error) {
      // Fallback if URL parsing fails
      return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
  }
  
  /**
   * Convert URL to a safe filename
   * 
   * @param {string} url - URL
   * @returns {string} - Safe filename
   */
  getSafeFilename(url) {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
  }
  
  /**
   * Determine if higher values are better for a metric
   * 
   * @param {string} metricKey - Metric key
   * @returns {boolean} - Whether higher is better
   */
  isHigherBetterForMetric(metricKey) {
    // Metrics where higher is better
    const higherIsBetter = [
      'score',
      'coreWebVitalsScore',
      'resourceEfficiencyScore',
      'javascriptExecutionScore',
      'browserCompatibilityScore'
    ];
    
    // Metrics where lower is better
    const lowerIsBetter = [
      'largestContentfulPaint',
      'cumulativeLayoutShift',
      'totalBlockingTime',
      'firstContentfulPaint',
      'timeToInteractive',
      'loadTime',
      'resourceSize',
      'requestCount',
      'highSeverityIssues',
      'mediumSeverityIssues',
      'lowSeverityIssues',
      'mobileLargestContentfulPaint',
      'mobileCumulativeLayoutShift',
      'mobileTotalBlockingTime',
      'desktopLargestContentfulPaint',
      'desktopCumulativeLayoutShift',
      'desktopTotalBlockingTime',
      'totalRequests',
      'totalSize'
    ];
    
    if (higherIsBetter.includes(metricKey)) {
      return true;
    }
    
    if (lowerIsBetter.includes(metricKey)) {
      return false;
    }
    
    // Default to lower is better for unknown metrics
    return false;
  }
  
  /**
   * Get display name for a metric
   * 
   * @param {string} metricKey - Metric key
   * @returns {string} - Display name
   */
  getMetricDisplayName(metricKey) {
    const displayNames = {
      'score': 'Overall score',
      'coreWebVitalsScore': 'Core Web Vitals score',
      'resourceEfficiencyScore': 'Resource efficiency score',
      'javascriptExecutionScore': 'JavaScript performance score',
      'browserCompatibilityScore': 'Browser compatibility score',
      'largestContentfulPaint': 'Largest Contentful Paint',
      'cumulativeLayoutShift': 'Cumulative Layout Shift',
      'totalBlockingTime': 'Total Blocking Time',
      'firstContentfulPaint': 'First Contentful Paint',
      'timeToInteractive': 'Time to Interactive',
      'mobileLargestContentfulPaint': 'Mobile LCP',
      'mobileCumulativeLayoutShift': 'Mobile CLS',
      'mobileTotalBlockingTime': 'Mobile TBT',
      'desktopLargestContentfulPaint': 'Desktop LCP',
      'desktopCumulativeLayoutShift': 'Desktop CLS',
      'desktopTotalBlockingTime': 'Desktop TBT',
      'loadTime': 'Page load time',
      'resourceSize': 'Total resource size',
      'requestCount': 'Request count',
      'totalRequests': 'Total requests',
      'totalSize': 'Total page size',
      'highSeverityIssues': 'High severity issues',
      'mediumSeverityIssues': 'Medium severity issues',
      'lowSeverityIssues': 'Low severity issues'
    };
    
    return displayNames[metricKey] || metricKey;
  }
}

module.exports = CompetitorBenchmarkSystem;
