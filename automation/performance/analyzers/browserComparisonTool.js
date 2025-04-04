/**
 * Browser Comparison Tool
 * 
 * Compares performance across different browsers to identify
 * browser-specific issues and optimization opportunities.
 */

const { chromium, firefox, webkit } = require('playwright');
const { URL } = require('url');
const logger = require('../../common/logger');

class BrowserComparisonTool {
  constructor(options = {}) {
    this.options = {
      // Default browsers to compare
      browsers: options.browsers || ['chromium', 'firefox', 'webkit'],
      // Metrics to compare across browsers
      metricsToCompare: options.metricsToCompare || [
        'firstContentfulPaint',
        'largestContentfulPaint',
        'cumulativeLayoutShift',
        'totalBlockingTime',
        'timeToInteractive',
        'speedIndex',
        'resourceSize',
        'requestCount'
      ],
      // Threshold for significant variance (percentage)
      varianceThreshold: options.varianceThreshold || 20,
      // Maximum retries for reliability
      maxRetries: options.maxRetries || 2,
      ...options
    };
    
    logger.info('Browser Comparison Tool initialized');
  }
  
  /**
   * Compare performance across different browsers
   * 
   * @param {string} url - The URL to analyze
   * @param {Array<string>} browsers - Browsers to compare
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} - Browser comparison data
   */
  async compareAcrossBrowsers(url, browsers = this.options.browsers, options = {}) {
    const combinedOptions = { ...this.options, ...options };
    const supportedBrowsers = browsers.filter(
      browser => ['chromium', 'firefox', 'webkit'].includes(browser)
    );
    
    // Skip comparison if only one browser is specified
    if (supportedBrowsers.length <= 1) {
      logger.info('Skipping browser comparison - only one browser specified');
      return {
        comparisonPerformed: false,
        message: 'Browser comparison requires at least two browsers'
      };
    }
    
    logger.info(`Comparing performance across browsers: ${supportedBrowsers.join(', ')} for URL: ${url}`);
    
    try {
      // Collect performance data for each browser
      const browserData = {};
      
      for (const browser of supportedBrowsers) {
        logger.debug(`Collecting performance data for ${browser}`);
        
        try {
          // Measure with retries for reliability
          const data = await this.measureWithRetries(browser, url, combinedOptions);
          browserData[browser] = data;
        } catch (error) {
          logger.error(`Failed to collect data for ${browser}: ${error.message}`);
          browserData[browser] = { error: error.message };
        }
      }
      
      // Compare metrics across browsers
      const comparison = this.compareMetrics(browserData, combinedOptions.metricsToCompare);
      
      // Analyze variance
      const variances = this.analyzeVariance(comparison, combinedOptions.varianceThreshold);
      
      // Generate insights and recommendations
      const insights = this.generateInsights(variances, browserData);
      
      return {
        comparisonPerformed: true,
        url,
        browsers: supportedBrowsers,
        rawData: browserData,
        comparisons: comparison,
        variances,
        insights,
        summary: this.generateSummary(variances, insights)
      };
      
    } catch (error) {
      logger.error(`Browser comparison failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Measure performance with retries for reliability
   * 
   * @param {string} browserType - Browser to use
   * @param {string} url - URL to analyze
   * @param {Object} options - Measurement options
   * @returns {Promise<Object>} - Performance data
   */
  async measureWithRetries(browserType, url, options) {
    const maxRetries = options.maxRetries || this.options.maxRetries;
    let attempts = 0;
    let results = [];
    
    while (attempts < maxRetries) {
      try {
        attempts++;
        logger.debug(`Browser measurement attempt ${attempts}/${maxRetries} for ${browserType}`);
        
        // Measure performance
        const measurement = await this.measurePerformance(browserType, url, options);
        results.push(measurement);
        
      } catch (error) {
        logger.warn(`Measurement attempt ${attempts} failed for ${browserType}: ${error.message}`);
        // Continue to next attempt
      }
    }
    
    if (results.length === 0) {
      throw new Error(`Failed to measure ${browserType} performance after ${maxRetries} attempts`);
    }
    
    // Average the results for a more stable measurement
    return this.averageResults(results);
  }
  
  /**
   * Measure performance with a specific browser
   * 
   * @param {string} browserType - Browser to use
   * @param {string} url - URL to analyze
   * @param {Object} options - Measurement options
   * @returns {Promise<Object>} - Performance data
   */
  async measurePerformance(browserType, url, options) {
    logger.debug(`Measuring with ${browserType} for URL: ${url}`);
    
    // Select the browser based on type
    let browser;
    switch (browserType) {
      case 'firefox':
        browser = await firefox.launch();
        break;
      case 'webkit':
        browser = await webkit.launch();
        break;
      case 'chromium':
      default:
        browser = await chromium.launch();
    }
    
    try {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: options.userAgent
      });
      
      const page = await context.newPage();
      
      // Initialize metrics collection
      let metrics = {};
      
      // Set up performance observer in the page
      await page.evaluate(() => {
        window.performanceMetrics = {
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          cumulativeLayoutShift: 0,
          totalBlockingTime: 0
        };
        
        // First Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              window.performanceMetrics.firstContentfulPaint = entry.startTime;
            }
          }
        }).observe({ type: 'paint', buffered: true });
        
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            window.performanceMetrics.largestContentfulPaint = lastEntry.startTime;
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Cumulative Layout Shift
        let cumulativeLayoutShift = 0;
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          for (const entry of entries) {
            if (!entry.hadRecentInput) {
              cumulativeLayoutShift += entry.value;
            }
          }
          window.performanceMetrics.cumulativeLayoutShift = cumulativeLayoutShift;
        }).observe({ type: 'layout-shift', buffered: true });
        
        // Total Blocking Time approximation
        let totalBlockingTime = 0;
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          for (const entry of entries) {
            if (entry.duration > 50) { // Long tasks are > 50ms
              totalBlockingTime += entry.duration - 50;
            }
          }
          window.performanceMetrics.totalBlockingTime = totalBlockingTime;
        }).observe({ type: 'longtask', buffered: true });
      });
      
      // Track requests
      let requestCount = 0;
      let resourceSize = 0;
      
      page.on('request', () => {
        requestCount++;
      });
      
      page.on('response', async response => {
        const headers = response.headers();
        const contentLength = headers['content-length'];
        
        if (contentLength) {
          resourceSize += parseInt(contentLength, 10);
        } else {
          try {
            const buffer = await response.body().catch(() => null);
            if (buffer) {
              resourceSize += buffer.length;
            }
          } catch (e) {
            // Ignore errors when trying to get response body
          }
        }
      });
      
      // Record navigation start time
      const startTime = Date.now();
      
      // Navigate to the URL
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: options.timeout || 30000
      });
      
      // Record page load time
      const loadTime = Date.now() - startTime;
      
      // Wait for metrics to be collected
      await page.waitForTimeout(1000);
      
      // Extract collected metrics
      const performanceMetrics = await page.evaluate(() => window.performanceMetrics);
      
      // Calculate Speed Index approximation
      const speedIndex = (performanceMetrics.firstContentfulPaint + performanceMetrics.largestContentfulPaint) / 2;
      
      // Calculate Time to Interactive approximation
      // In a real implementation, this would be more sophisticated
      const tti = loadTime * 0.8;
      
      return {
        browser: browserType,
        url,
        loadTime,
        firstContentfulPaint: performanceMetrics.firstContentfulPaint,
        largestContentfulPaint: performanceMetrics.largestContentfulPaint,
        cumulativeLayoutShift: performanceMetrics.cumulativeLayoutShift,
        totalBlockingTime: performanceMetrics.totalBlockingTime,
        speedIndex,
        timeToInteractive: tti,
        resourceSize,
        requestCount,
        statusCode: response.status()
      };
      
    } finally {
      await browser.close();
    }
  }
  
  /**
   * Average multiple performance measurement results
   * 
   * @param {Array<Object>} results - Performance measurement results
   * @returns {Object} - Averaged performance metrics
   */
  averageResults(results) {
    if (results.length === 0) {
      return {};
    }
    
    if (results.length === 1) {
      return { ...results[0] };
    }
    
    // Find all numeric properties to average
    const metrics = Object.keys(results[0]).filter(
      key => typeof results[0][key] === 'number'
    );
    
    // Create a new result object with the same non-numeric properties
    const averaged = { ...results[0] };
    
    // Calculate the average for each numeric metric
    metrics.forEach(metric => {
      const values = results.map(result => result[metric]);
      averaged[metric] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });
    
    return averaged;
  }
  
  /**
   * Compare metrics across different browsers
   * 
   * @param {Object} browserData - Performance data from different browsers
   * @param {Array<string>} metricsToCompare - Metrics to compare
   * @returns {Object} - Metric comparisons
   */
  compareMetrics(browserData, metricsToCompare) {
    const browsers = Object.keys(browserData).filter(
      browser => !browserData[browser].error
    );
    
    if (browsers.length < 2) {
      return {
        error: 'Not enough valid browser data for comparison'
      };
    }
    
    const comparisons = {};
    
    // For each metric to compare
    metricsToCompare.forEach(metric => {
      const metricValues = {};
      
      // Get values for each browser
      browsers.forEach(browser => {
        if (browserData[browser][metric] !== undefined) {
          metricValues[browser] = browserData[browser][metric];
        }
      });
      
      // If we have values for at least 2 browsers
      const browsersWithValues = Object.keys(metricValues);
      if (browsersWithValues.length >= 2) {
        // Calculate min, max, average
        const values = Object.values(metricValues);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const range = max - min;
        const percentageRange = min > 0 ? (range / min) * 100 : 0;
        
        // Find fastest and slowest browser for this metric
        let fastest = browsersWithValues[0];
        let slowest = browsersWithValues[0];
        
        browsersWithValues.forEach(browser => {
          if (metricValues[browser] < metricValues[fastest]) {
            fastest = browser;
          }
          if (metricValues[browser] > metricValues[slowest]) {
            slowest = browser;
          }
        });
        
        comparisons[metric] = {
          values: metricValues,
          min,
          max,
          avg,
          range,
          percentageRange,
          fastest,
          slowest
        };
      }
    });
    
    return comparisons;
  }
  
  /**
   * Analyze variance in metrics across browsers
   * 
   * @param {Object} comparisons - Metric comparisons
   * @param {number} threshold - Threshold for significant variance (%)
   * @returns {Array<Object>} - Significant variances
   */
  analyzeVariance(comparisons, threshold) {
    const variances = [];
    
    Object.entries(comparisons).forEach(([metric, data]) => {
      if (data.percentageRange > threshold) {
        // Significant variance detected
        variances.push({
          metric,
          percentageRange: data.percentageRange,
          fastest: data.fastest,
          slowest: data.slowest,
          values: data.values,
          severity: data.percentageRange > threshold * 2 ? 'high' : 'medium',
          description: `${metric} varies by ${data.percentageRange.toFixed(1)}% across browsers`,
          higherIsBetter: this.isHigherBetter(metric)
        });
      }
    });
    
    // Sort by variance severity and percentage
    variances.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return (severityOrder[a.severity] - severityOrder[b.severity]) || 
             (b.percentageRange - a.percentageRange);
    });
    
    return variances;
  }
  
  /**
   * Determine if higher values are better for a metric
   * 
   * @param {string} metric - Performance metric
   * @returns {boolean} - Whether higher values are better
   */
  isHigherBetter(metric) {
    const higherIsBetter = [
      // No performance metrics where higher is better
    ];
    
    return higherIsBetter.includes(metric);
  }
  
  /**
   * Generate insights from browser comparison
   * 
   * @param {Array<Object>} variances - Significant variances
   * @param {Object} browserData - Raw browser performance data
   * @returns {Array<Object>} - Insights and recommendations
   */
  generateInsights(variances, browserData) {
    const insights = [];
    
    // Generate general browser performance comparison
    const browsers = Object.keys(browserData).filter(
      browser => !browserData[browser].error
    );
    
    if (browsers.length >= 2) {
      // Find overall fastest browser
      const loadTimeByBrowser = {};
      browsers.forEach(browser => {
        loadTimeByBrowser[browser] = browserData[browser].loadTime;
      });
      
      const fastestBrowser = browsers.reduce((fastest, current) => 
        loadTimeByBrowser[current] < loadTimeByBrowser[fastest] ? current : fastest
      , browsers[0]);
      
      const slowestBrowser = browsers.reduce((slowest, current) => 
        loadTimeByBrowser[current] > loadTimeByBrowser[slowest] ? current : slowest
      , browsers[0]);
      
      insights.push({
        type: 'overall-performance',
        category: 'Browser Comparison',
        description: `${fastestBrowser} offers the best overall performance`,
        fastest: fastestBrowser,
        slowest: slowestBrowser,
        loadTimes: loadTimeByBrowser
      });
    }
    
    // Add insights for each significant variance
    variances.forEach(variance => {
      const metric = variance.metric;
      const fastest = variance.fastest;
      const slowest = variance.slowest;
      
      insights.push({
        type: `${metric}-variance`,
        category: 'Browser Comparison',
        severity: variance.severity,
        description: variance.description,
        fastest,
        slowest,
        values: variance.values,
        recommendation: this.getRecommendationForMetricVariance(metric, fastest, slowest)
      });
    });
    
    // Look for browser-specific issues
    browsers.forEach(browser => {
      const data = browserData[browser];
      
      // Check if this browser has significantly worse CLS than others
      const clsVariance = variances.find(v => v.metric === 'cumulativeLayoutShift');
      if (clsVariance && clsVariance.slowest === browser && clsVariance.percentageRange > 50) {
        insights.push({
          type: 'browser-specific-cls',
          category: 'Browser Compatibility',
          severity: 'high',
          description: `${browser} has significantly higher layout shift (${data.cumulativeLayoutShift.toFixed(3)})`,
          browser,
          value: data.cumulativeLayoutShift,
          recommendation: `Test layout stability in ${browser} and fix browser-specific CSS issues`
        });
      }
      
      // Check for browser-specific resource loading issues
      const resourceVariance = variances.find(v => v.metric === 'resourceSize');
      if (resourceVariance && resourceVariance.slowest === browser && resourceVariance.percentageRange > 40) {
        insights.push({
          type: 'browser-specific-resources',
          category: 'Browser Compatibility',
          severity: 'medium',
          description: `${browser} loads more resources (${data.resourceSize} bytes)`,
          browser,
          value: data.resourceSize,
          recommendation: `Check if different resources are loaded for ${browser} via user agent sniffing`
        });
      }
    });
    
    return insights;
  }
  
  /**
   * Generate recommendation for metric variance
   * 
   * @param {string} metric - Performance metric
   * @param {string} fastest - Fastest browser
   * @param {string} slowest - Slowest browser
   * @returns {string} - Recommendation
   */
  getRecommendationForMetricVariance(metric, fastest, slowest) {
    const recommendations = {
      firstContentfulPaint: `Investigate render-blocking resources specific to ${slowest} and optimize CSS delivery`,
      largestContentfulPaint: `Test LCP elements in ${slowest} and ensure optimal resource loading`,
      cumulativeLayoutShift: `Check for ${slowest}-specific layout stability issues and CSS differences`,
      totalBlockingTime: `Analyze JavaScript execution in ${slowest} and optimize long tasks`,
      timeToInteractive: `Reduce JavaScript execution time particularly for ${slowest}`,
      speedIndex: `Improve visual rendering speed in ${slowest} with progressive loading techniques`,
      resourceSize: `Check if different resources are loaded in ${slowest} via user agent detection`,
      requestCount: `Investigate if ${slowest} is making additional requests that can be eliminated`
    };
    
    return recommendations[metric] || 
      `Investigate ${metric} performance differences between ${fastest} and ${slowest}`;
  }
  
  /**
   * Generate overall summary of browser comparison
   * 
   * @param {Array<Object>} variances - Significant variances
   * @param {Array<Object>} insights - Generated insights
   * @returns {Object} - Summary
   */
  generateSummary(variances, insights) {
    // Count high and medium severity variances
    const highSeverityCount = variances.filter(v => v.severity === 'high').length;
    const mediumSeverityCount = variances.filter(v => v.severity === 'medium').length;
    
    // Find overall fastest browser
    const overallInsight = insights.find(i => i.type === 'overall-performance');
    const fastestBrowser = overallInsight ? overallInsight.fastest : null;
    
    // Find metrics with the largest variances
    const topVariances = variances.slice(0, 3).map(v => v.metric);
    
    // Determine browsers with specific issues
    const browserSpecificIssues = insights
      .filter(i => i.category === 'Browser Compatibility')
      .reduce((acc, insight) => {
        if (!acc[insight.browser]) {
          acc[insight.browser] = [];
        }
        acc[insight.browser].push(insight.type);
        return acc;
      }, {});
    
    return {
      significantVarianceCount: variances.length,
      highSeverityCount,
      mediumSeverityCount,
      fastestBrowser,
      topVariances,
      browserSpecificIssues,
      summary: this.generateSummaryText(
        variances.length,
        highSeverityCount,
        fastestBrowser,
        topVariances,
        browserSpecificIssues
      )
    };
  }
  
  /**
   * Generate summary text
   * 
   * @param {number} varianceCount - Number of significant variances
   * @param {number} highSeverityCount - Number of high severity variances
   * @param {string} fastestBrowser - Fastest browser overall
   * @param {Array<string>} topVariances - Top variance metrics
   * @param {Object} browserSpecificIssues - Issues by browser
   * @returns {string} - Summary text
   */
  generateSummaryText(
    varianceCount,
    highSeverityCount,
    fastestBrowser,
    topVariances,
    browserSpecificIssues
  ) {
    let summary = '';
    
    if (varianceCount === 0) {
      summary = 'Performance is consistent across all tested browsers.';
    } else {
      summary = `Found ${varianceCount} significant performance variations across browsers`;
      
      if (highSeverityCount > 0) {
        summary += `, with ${highSeverityCount} high-severity issues`;
      }
      
      summary += '. ';
      
      if (fastestBrowser) {
        summary += `${fastestBrowser} offers the best overall performance. `;
      }
      
      if (topVariances.length > 0) {
        summary += `Most significant variations in: ${topVariances.join(', ')}. `;
      }
      
      const browsersWithIssues = Object.keys(browserSpecificIssues);
      if (browsersWithIssues.length > 0) {
        summary += `Browser-specific issues detected in: ${browsersWithIssues.join(', ')}.`;
      }
    }
    
    return summary;
  }
}

module.exports = BrowserComparisonTool;
