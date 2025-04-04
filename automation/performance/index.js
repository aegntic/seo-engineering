/**
 * Detailed Performance Tracking Module
 * 
 * This module provides enhanced tracking of Core Web Vitals and other performance
 * metrics with granular analysis capabilities. It tracks resource loading,
 * identifies performance bottlenecks, and offers browser-specific insights.
 */

const PerformanceTracker = require('./trackers/performanceTracker');
const ResourceAnalyzer = require('./analyzers/resourceAnalyzer');
const BottleneckDetector = require('./analyzers/bottleneckDetector');
const BrowserComparisonTool = require('./analyzers/browserComparisonTool');
const PerformanceReport = require('./reporting/performanceReport');
const logger = require('../common/logger');

class DetailedPerformanceTracking {
  constructor(options = {}) {
    this.performanceTracker = new PerformanceTracker(options);
    this.resourceAnalyzer = new ResourceAnalyzer(options);
    this.bottleneckDetector = new BottleneckDetector(options);
    this.browserComparisonTool = new BrowserComparisonTool(options);
    
    this.config = {
      enableWaterfallVisualization: options.enableWaterfallVisualization !== false,
      captureResourceDetails: options.captureResourceDetails !== false,
      trackJavaScriptExecution: options.trackJavaScriptExecution !== false,
      deviceEmulation: options.deviceEmulation || ['desktop', 'mobile'],
      browsers: options.browsers || ['chromium'],
      maxRetries: options.maxRetries || 3,
      ...options
    };
    
    logger.info('Detailed Performance Tracking Module initialized');
  }
  
  /**
   * Analyze performance for a specific URL
   * 
   * @param {string} url - The URL to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Comprehensive performance data
   */
  async analyzeUrl(url, options = {}) {
    logger.info(`Starting detailed performance analysis for URL: ${url}`);
    
    try {
      // 1. Collect detailed performance metrics across devices
      const performanceData = await this.performanceTracker.trackPerformance(url, {
        ...this.config,
        ...options
      });
      
      // 2. Analyze resource loading and create waterfall visualization
      const resourceAnalysis = await this.resourceAnalyzer.analyzeResources(url, {
        ...this.config,
        ...options,
        performanceData
      });
      
      // 3. Detect performance bottlenecks
      const bottlenecks = this.bottleneckDetector.detectBottlenecks(
        performanceData, 
        resourceAnalysis
      );
      
      // 4. Compare performance across browsers if multiple browsers specified
      const browserComparison = await this.browserComparisonTool.compareAcrossBrowsers(
        url,
        this.config.browsers,
        options
      );
      
      // 5. Generate comprehensive performance report
      const report = new PerformanceReport({
        url,
        performanceData,
        resourceAnalysis,
        bottlenecks,
        browserComparison,
        config: this.config
      });
      
      logger.info(`Completed detailed performance analysis for URL: ${url}`);
      
      return report.generate();
      
    } catch (error) {
      logger.error(`Performance analysis failed for URL ${url}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Analyze performance for multiple URLs (e.g., for a complete site)
   * 
   * @param {Array<string>} urls - The URLs to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Aggregated performance data
   */
  async analyzeSite(urls, options = {}) {
    logger.info(`Starting site-wide performance analysis for ${urls.length} URLs`);
    
    try {
      // Analyze each URL
      const urlResults = await Promise.all(
        urls.map(url => this.analyzeUrl(url, options))
      );
      
      // Aggregate the results
      const aggregatedResults = {
        urls: urlResults,
        summary: this.aggregatePerformanceData(urlResults),
        siteWideBottlenecks: this.bottleneckDetector.detectSiteWideBottlenecks(urlResults),
        recommendations: this.generateSiteWideRecommendations(urlResults)
      };
      
      logger.info(`Completed site-wide performance analysis for ${urls.length} URLs`);
      
      return aggregatedResults;
      
    } catch (error) {
      logger.error(`Site-wide performance analysis failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Track performance over time for a specific URL
   * 
   * @param {string} url - The URL to track
   * @param {Object} options - Tracking options
   * @returns {Promise<Object>} - Performance trends
   */
  async trackPerformanceOverTime(url, options = {}) {
    // This would typically connect to a database to retrieve historical data
    // and combine it with new measurements to show trends
    
    // For now, we'll just do a fresh measurement and return it
    return this.analyzeUrl(url, options);
  }
  
  /**
   * Aggregate performance data from multiple URL results
   * 
   * @param {Array<Object>} urlResults - Results from multiple URLs
   * @returns {Object} - Aggregated data
   */
  aggregatePerformanceData(urlResults) {
    // Initialize aggregate data object
    const aggregate = {
      desktop: {
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        totalBlockingTime: 0,
        speedIndex: 0,
        timeToInteractive: 0
      },
      mobile: {
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        totalBlockingTime: 0,
        speedIndex: 0,
        timeToInteractive: 0
      },
      resourceStats: {
        totalSize: 0,
        totalRequests: 0,
        byType: {},
        byDomain: {}
      }
    };
    
    // Sum up the metrics
    urlResults.forEach(result => {
      // Desktop metrics
      if (result.performanceData.desktop) {
        Object.keys(aggregate.desktop).forEach(metric => {
          if (result.performanceData.desktop[metric]) {
            aggregate.desktop[metric] += result.performanceData.desktop[metric];
          }
        });
      }
      
      // Mobile metrics
      if (result.performanceData.mobile) {
        Object.keys(aggregate.mobile).forEach(metric => {
          if (result.performanceData.mobile[metric]) {
            aggregate.mobile[metric] += result.performanceData.mobile[metric];
          }
        });
      }
      
      // Resource stats
      if (result.resourceAnalysis) {
        aggregate.resourceStats.totalSize += result.resourceAnalysis.totalSize || 0;
        aggregate.resourceStats.totalRequests += result.resourceAnalysis.totalRequests || 0;
        
        // Aggregate by type
        if (result.resourceAnalysis.byType) {
          Object.entries(result.resourceAnalysis.byType).forEach(([type, data]) => {
            if (!aggregate.resourceStats.byType[type]) {
              aggregate.resourceStats.byType[type] = { size: 0, count: 0 };
            }
            aggregate.resourceStats.byType[type].size += data.size || 0;
            aggregate.resourceStats.byType[type].count += data.count || 0;
          });
        }
        
        // Aggregate by domain
        if (result.resourceAnalysis.byDomain) {
          Object.entries(result.resourceAnalysis.byDomain).forEach(([domain, data]) => {
            if (!aggregate.resourceStats.byDomain[domain]) {
              aggregate.resourceStats.byDomain[domain] = { size: 0, count: 0 };
            }
            aggregate.resourceStats.byDomain[domain].size += data.size || 0;
            aggregate.resourceStats.byDomain[domain].count += data.count || 0;
          });
        }
      }
    });
    
    // Calculate averages
    const urlCount = urlResults.length;
    
    if (urlCount > 0) {
      // Desktop averages
      Object.keys(aggregate.desktop).forEach(metric => {
        aggregate.desktop[metric] /= urlCount;
      });
      
      // Mobile averages
      Object.keys(aggregate.mobile).forEach(metric => {
        aggregate.mobile[metric] /= urlCount;
      });
      
      // Resource stats are kept as totals, not averages
    }
    
    return aggregate;
  }
  
  /**
   * Generate site-wide performance recommendations
   * 
   * @param {Array<Object>} urlResults - Results from multiple URLs
   * @returns {Array<Object>} - Recommendations
   */
  generateSiteWideRecommendations(urlResults) {
    // This would analyze the results and generate actionable recommendations
    // based on detected patterns and best practices
    
    const recommendations = [];
    
    // Example recommendation generation logic
    const siteWideBottlenecks = this.bottleneckDetector.detectSiteWideBottlenecks(urlResults);
    
    // Add recommendations based on bottlenecks
    siteWideBottlenecks.forEach(bottleneck => {
      recommendations.push({
        category: bottleneck.category,
        severity: bottleneck.severity,
        impact: bottleneck.impact,
        description: bottleneck.description,
        recommendation: this.getRecommendationForBottleneck(bottleneck),
        affectedUrls: bottleneck.affectedUrls || []
      });
    });
    
    return recommendations;
  }
  
  /**
   * Get a specific recommendation for a bottleneck
   * 
   * @param {Object} bottleneck - The detected bottleneck
   * @returns {string} - Recommendation text
   */
  getRecommendationForBottleneck(bottleneck) {
    // Map bottleneck types to recommendations
    const recommendationMap = {
      'large-images': 'Optimize images by compressing them and using modern formats like WebP or AVIF.',
      'render-blocking-resources': 'Defer non-critical JavaScript and CSS resources.',
      'excessive-dom-size': 'Simplify your DOM structure and reduce the number of elements.',
      'third-party-scripts': 'Audit third-party scripts and remove unnecessary ones. Consider loading them asynchronously.',
      'long-tasks': 'Break up long JavaScript tasks into smaller chunks or use Web Workers.',
      'layout-shifts': 'Set explicit width and height attributes on images and avoid dynamically injected content.',
      'font-loading': 'Use font-display: swap and preload critical fonts.',
      'server-response-time': 'Optimize server-side code and consider using a CDN.',
      'redirect-chains': 'Eliminate redirect chains by updating links to point directly to final URLs.'
    };
    
    return recommendationMap[bottleneck.type] || 
      'Review this issue and consider consulting with a performance optimization specialist.';
  }
}

module.exports = DetailedPerformanceTracking;
