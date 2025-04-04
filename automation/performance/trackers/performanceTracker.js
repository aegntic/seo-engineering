/**
 * Performance Tracker
 * 
 * Enhanced tracking of Core Web Vitals and other performance metrics.
 * Collects detailed timing information and provides granular analysis.
 */

const { chromium, firefox, webkit } = require('playwright');
const logger = require('../../common/logger');

class PerformanceTracker {
  constructor(options = {}) {
    this.options = {
      // Default devices to test on
      deviceEmulation: options.deviceEmulation || ['desktop', 'mobile'],
      // Default browsers to test on
      browsers: options.browsers || ['chromium'],
      // Maximum retries for reliability
      maxRetries: options.maxRetries || 3,
      // Whether to track JavaScript execution
      trackJavaScriptExecution: options.trackJavaScriptExecution !== false,
      // Connection throttling settings
      connectionThrottling: options.connectionThrottling || {
        // Default is no throttling
        enabled: false,
        // 3G-Fast profile from DevTools when enabled
        downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
        uploadThroughput: 750 * 1024 / 8, // 750 Kbps
        latency: 40 // 40ms
      },
      ...options
    };
    
    logger.info('Performance Tracker initialized with options:', this.options);
  }
  
  /**
   * Track performance metrics for a URL across devices and browsers
   * 
   * @param {string} url - The URL to measure
   * @param {Object} options - Measurement options
   * @returns {Promise<Object>} - Detailed performance data
   */
  async trackPerformance(url, options = {}) {
    logger.info(`Tracking detailed performance for URL: ${url}`);
    
    const combinedOptions = { ...this.options, ...options };
    const results = {};
    
    // Test on multiple device profiles
    for (const device of combinedOptions.deviceEmulation) {
      logger.debug(`Running performance tests for device: ${device}`);
      
      results[device] = {};
      
      // Test on multiple browsers if specified
      for (const browserType of combinedOptions.browsers) {
        logger.debug(`Using browser: ${browserType}`);
        
        try {
          // Measure with retries for reliability
          const browserResult = await this.measureWithRetries(
            browserType,
            url,
            { ...combinedOptions, device }
          );
          
          results[device][browserType] = browserResult;
          
        } catch (error) {
          logger.error(`Failed to measure with ${browserType} on ${device}: ${error.message}`);
          results[device][browserType] = { error: error.message };
        }
      }
    }
    
    // Process the results to create a combined view
    return this.processResults(results);
  }
  
  /**
   * Process results from multiple measurements
   * 
   * @param {Object} results - Raw measurement results
   * @returns {Object} - Processed performance data
   */
  processResults(results) {
    const processed = {};
    
    // Process each device type
    for (const [device, browserResults] of Object.entries(results)) {
      processed[device] = this.calculateAverageMetrics(browserResults);
    }
    
    // Add additional analysis
    processed.analysis = this.analyzeResults(results);
    
    return processed;
  }
  
  /**
   * Analyze results to identify patterns and issues
   * 
   * @param {Object} results - Raw measurement results
   * @returns {Object} - Analysis insights
   */
  analyzeResults(results) {
    const analysis = {
      deviceComparison: {},
      browserVariance: {},
      criticalMetrics: {},
      insights: []
    };
    
    // Calculate mobile vs desktop performance ratio
    if (results.desktop && results.mobile) {
      const desktopMetrics = results.desktop;
      const mobileMetrics = results.mobile;
      
      // Core Web Vitals comparison
      analysis.deviceComparison.lcp = {
        ratio: this.calculateRatio(mobileMetrics.largestContentfulPaint, desktopMetrics.largestContentfulPaint),
        desktop: desktopMetrics.largestContentfulPaint,
        mobile: mobileMetrics.largestContentfulPaint
      };
      
      analysis.deviceComparison.cls = {
        ratio: this.calculateRatio(mobileMetrics.cumulativeLayoutShift, desktopMetrics.cumulativeLayoutShift),
        desktop: desktopMetrics.cumulativeLayoutShift,
        mobile: mobileMetrics.cumulativeLayoutShift
      };
      
      analysis.deviceComparison.tbt = {
        ratio: this.calculateRatio(mobileMetrics.totalBlockingTime, desktopMetrics.totalBlockingTime),
        desktop: desktopMetrics.totalBlockingTime,
        mobile: mobileMetrics.totalBlockingTime
      };
    }
    
    // Analyze browser variance if multiple browsers tested
    for (const device of Object.keys(results)) {
      const browserResults = results[device];
      const browserNames = Object.keys(browserResults);
      
      if (browserNames.length > 1) {
        analysis.browserVariance[device] = {};
        
        // Calculate variance for key metrics across browsers
        const metrics = ['firstContentfulPaint', 'largestContentfulPaint', 'cumulativeLayoutShift', 'totalBlockingTime'];
        
        for (const metric of metrics) {
          const values = browserNames
            .filter(browser => browserResults[browser][metric] !== undefined)
            .map(browser => browserResults[browser][metric]);
          
          if (values.length > 1) {
            analysis.browserVariance[device][metric] = {
              min: Math.min(...values),
              max: Math.max(...values),
              variance: this.calculateVariance(values),
              browsers: browserNames.reduce((acc, browser) => {
                acc[browser] = browserResults[browser][metric];
                return acc;
              }, {})
            };
          }
        }
      }
    }
    
    // Analyze critical metrics against thresholds
    const thresholds = {
      largestContentfulPaint: { good: 2500, needsImprovement: 4000 },
      cumulativeLayoutShift: { good: 0.1, needsImprovement: 0.25 },
      totalBlockingTime: { good: 200, needsImprovement: 600 },
      firstContentfulPaint: { good: 1800, needsImprovement: 3000 },
      timeToInteractive: { good: 3800, needsImprovement: 7300 }
    };
    
    for (const device of Object.keys(results)) {
      const metrics = this.calculateAverageMetrics(results[device]);
      analysis.criticalMetrics[device] = {};
      
      for (const [metric, values] of Object.entries(thresholds)) {
        if (metrics[metric] !== undefined) {
          let rating;
          
          if (metric === 'cumulativeLayoutShift') {
            // For CLS, lower is better
            rating = metrics[metric] <= values.good ? 'good' : 
                     metrics[metric] <= values.needsImprovement ? 'needs-improvement' : 'poor';
          } else {
            // For timing metrics, lower is better (in milliseconds)
            rating = metrics[metric] <= values.good ? 'good' : 
                     metrics[metric] <= values.needsImprovement ? 'needs-improvement' : 'poor';
          }
          
          analysis.criticalMetrics[device][metric] = {
            value: metrics[metric],
            rating,
            threshold: values
          };
        }
      }
    }
    
    // Generate insights based on the analysis
    this.generateInsights(analysis);
    
    return analysis;
  }
  
  /**
   * Generate insights based on performance analysis
   * 
   * @param {Object} analysis - Performance analysis data
   */
  generateInsights(analysis) {
    const insights = [];
    
    // Check mobile vs desktop performance
    if (analysis.deviceComparison.lcp && analysis.deviceComparison.lcp.ratio > 2) {
      insights.push({
        type: 'mobile-performance',
        severity: 'high',
        message: `Mobile LCP is ${analysis.deviceComparison.lcp.ratio.toFixed(1)}x slower than desktop`,
        recommendation: 'Optimize images and reduce render-blocking resources for mobile'
      });
    }
    
    // Check browser variances
    for (const [device, metrics] of Object.entries(analysis.browserVariance)) {
      for (const [metric, data] of Object.entries(metrics)) {
        // If max is more than 50% higher than min, flag it
        if (data.max > data.min * 1.5) {
          insights.push({
            type: 'browser-variance',
            severity: 'medium',
            message: `Large ${metric} variance across browsers on ${device}`,
            recommendation: 'Check for browser-specific code or styles',
            details: data
          });
        }
      }
    }
    
    // Check critical metrics against thresholds
    for (const [device, metrics] of Object.entries(analysis.criticalMetrics)) {
      for (const [metric, data] of Object.entries(metrics)) {
        if (data.rating === 'poor') {
          insights.push({
            type: 'poor-metric',
            severity: 'high',
            message: `Poor ${metric} (${data.value.toFixed(1)}) on ${device}`,
            recommendation: this.getMetricRecommendation(metric),
            details: data
          });
        }
      }
    }
    
    // Sort insights by severity
    insights.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    analysis.insights = insights;
  }
  
  /**
   * Get recommendation for improving a specific metric
   * 
   * @param {string} metric - The performance metric
   * @returns {string} - Recommendation
   */
  getMetricRecommendation(metric) {
    const recommendations = {
      largestContentfulPaint: 'Optimize largest contentful paint by preloading critical resources, optimizing images, and removing render-blocking resources',
      cumulativeLayoutShift: 'Reduce layout shifts by setting explicit dimensions for images and embedded content, and avoid injecting content above existing content',
      totalBlockingTime: 'Reduce JavaScript execution time by code-splitting, deferring non-critical JavaScript, and optimizing long tasks',
      firstContentfulPaint: 'Improve first contentful paint by eliminating render-blocking resources, minifying CSS, and optimizing the critical rendering path',
      timeToInteractive: 'Improve time to interactive by reducing JavaScript execution time, minimizing main thread work, and keeping request counts low'
    };
    
    return recommendations[metric] || 'Review performance optimization best practices';
  }
  
  /**
   * Calculate ratio between two numbers, handling edge cases
   * 
   * @param {number} a - Numerator
   * @param {number} b - Denominator
   * @returns {number} - Ratio
   */
  calculateRatio(a, b) {
    if (!a || !b || isNaN(a) || isNaN(b) || b === 0) {
      return 1; // Default to 1 for invalid inputs
    }
    return a / b;
  }
  
  /**
   * Calculate variance of a set of values
   * 
   * @param {Array<number>} values - Array of values
   * @returns {number} - Variance
   */
  calculateVariance(values) {
    if (!values || values.length <= 1) {
      return 0;
    }
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  /**
   * Calculate average metrics from multiple browser results
   * 
   * @param {Object} browserResults - Results from multiple browsers
   * @returns {Object} - Averaged metrics
   */
  calculateAverageMetrics(browserResults) {
    const browsers = Object.keys(browserResults);
    
    if (browsers.length === 0) {
      return {};
    }
    
    // If only one browser, just return its metrics
    if (browsers.length === 1) {
      return { ...browserResults[browsers[0]] };
    }
    
    // Collect all metrics from all browsers
    const metrics = {};
    
    // First, find all available metrics
    browsers.forEach(browser => {
      Object.keys(browserResults[browser]).forEach(metric => {
        if (typeof browserResults[browser][metric] === 'number') {
          if (!metrics[metric]) {
            metrics[metric] = [];
          }
          metrics[metric].push(browserResults[browser][metric]);
        }
      });
    });
    
    // Then calculate averages
    const averages = {};
    
    Object.entries(metrics).forEach(([metric, values]) => {
      if (values.length > 0) {
        averages[metric] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });
    
    return averages;
  }
  
  /**
   * Measure performance with retries for reliability
   * 
   * @param {string} browserType - Type of browser to use
   * @param {string} url - URL to measure
   * @param {Object} options - Measurement options
   * @returns {Promise<Object>} - Performance metrics
   */
  async measureWithRetries(browserType, url, options) {
    const maxRetries = options.maxRetries || this.options.maxRetries;
    let attempts = 0;
    let results = [];
    
    while (attempts < maxRetries) {
      try {
        attempts++;
        logger.debug(`Performance measurement attempt ${attempts}/${maxRetries}`);
        
        // Measure performance
        const measurement = await this.measurePerformance(browserType, url, options);
        results.push(measurement);
        
      } catch (error) {
        logger.warn(`Measurement attempt ${attempts} failed: ${error.message}`);
        // Continue to next attempt
      }
    }
    
    if (results.length === 0) {
      throw new Error(`Failed to measure performance after ${maxRetries} attempts`);
    }
    
    // Average the results for a more stable measurement
    return this.averageResults(results);
  }
  
  /**
   * Average multiple performance measurement results
   * 
   * @param {Array<Object>} results - Performance measurement results
   * @returns {Object} - Averaged performance metrics
   */
  averageResults(results) {
    // Get all numeric properties from the first result
    const metrics = Object.entries(results[0])
      .filter(([key, value]) => typeof value === 'number')
      .map(([key]) => key);
    
    // Calculate the average for each metric
    const averaged = { ...results[0] };
    
    metrics.forEach(metric => {
      const values = results.map(result => result[metric]);
      averaged[metric] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });
    
    return averaged;
  }
  
  /**
   * Measure detailed performance metrics for a URL
   * 
   * @param {string} browserType - Type of browser to use
   * @param {string} url - URL to measure
   * @param {Object} options - Measurement options
   * @returns {Promise<Object>} - Performance metrics
   */
  async measurePerformance(browserType, url, options) {
    logger.debug(`Measuring performance with ${browserType} for URL: ${url}`);
    
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
        browser = await chromium.launch({
          // Additional Chrome flags for better performance measurement
          args: [
            '--disable-extensions',
            '--disable-component-extensions-with-background-pages',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--disable-features=Translate,AcceptCHFrame',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-sync',
            '--force-color-profile=srgb',
            '--metrics-recording-only',
            '--no-first-run',
            '--no-default-browser-check',
            '--no-sandbox',
            '--password-store=basic'
          ]
        });
    }
    
    try {
      const device = options.device || 'desktop';
      
      // Create context with appropriate device emulation
      const contextOptions = {};
      
      if (device === 'mobile') {
        // Use a typical mobile device profile
        contextOptions.viewport = { width: 375, height: 667 };
        contextOptions.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1';
        contextOptions.deviceScaleFactor = 2;
        contextOptions.isMobile = true;
        contextOptions.hasTouch = true;
      } else {
        // Desktop profile
        contextOptions.viewport = { width: 1280, height: 800 };
        contextOptions.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      }
      
      const context = await browser.newContext(contextOptions);
      
      // Create page with enhanced tracing if supported
      const page = await context.newPage();
      
      // Set up data collection variables
      let navigationTimingEntries = {};
      let paintTimingEntries = {};
      let layoutShiftEntries = [];
      let largestContentfulPaintEntries = [];
      let longTaskEntries = [];
      let resourceTimingEntries = [];
      let firstInputDelayEntry = null;
      let javaScriptExecutionData = null;
      
      // Initialize counters
      let resourceSize = 0;
      let requestCount = 0;
      
      // Track requests and responses
      const requests = new Map();
      
      page.on('request', request => {
        requests.set(request.url(), {
          url: request.url(),
          resourceType: request.resourceType(),
          method: request.method(),
          startTime: Date.now()
        });
        requestCount++;
      });
      
      page.on('response', async response => {
        const url = response.url();
        const request = requests.get(url);
        
        if (request) {
          request.endTime = Date.now();
          request.status = response.status();
          request.statusText = response.statusText();
          
          const contentType = response.headers()['content-type'] || '';
          request.contentType = contentType;
          
          // Get resource size
          const contentLength = response.headers()['content-length'];
          if (contentLength) {
            request.size = parseInt(contentLength, 10);
            resourceSize += request.size;
          } else {
            try {
              // If content-length header is not available, try to get body size
              const buffer = await response.body().catch(() => null);
              if (buffer) {
                request.size = buffer.length;
                resourceSize += request.size;
              }
            } catch (e) {
              // Ignore errors when trying to get response body
            }
          }
        }
      });
      
      // Collect web vital metrics using PerformanceObserver
      await page.evaluate(() => {
        window.performanceEntries = {
          navigationTiming: {},
          paintTiming: {},
          layoutShifts: [],
          largestContentfulPaints: [],
          longTasks: [],
          resourceTiming: [],
          firstInputDelay: null
        };
        
        // Navigation Timing API
        if (performance.getEntriesByType) {
          const navigationEntries = performance.getEntriesByType('navigation');
          if (navigationEntries && navigationEntries.length > 0) {
            window.performanceEntries.navigationTiming = navigationEntries[0];
          }
        }
        
        // Paint Timing API
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            window.performanceEntries.paintTiming[entry.name] = entry.startTime;
          });
        }).observe({ type: 'paint', buffered: true });
        
        // Layout Instability API
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          window.performanceEntries.layoutShifts.push(...entries);
        }).observe({ type: 'layout-shift', buffered: true });
        
        // Largest Contentful Paint API
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          window.performanceEntries.largestContentfulPaints.push(...entries);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Long Tasks API
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          window.performanceEntries.longTasks.push(...entries);
        }).observe({ type: 'longtask', buffered: true });
        
        // Resource Timing API
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          window.performanceEntries.resourceTiming.push(...entries);
        }).observe({ type: 'resource', buffered: true });
        
        // First Input Delay
        new PerformanceObserver((entryList) => {
          const firstInput = entryList.getEntries()[0];
          if (firstInput) {
            window.performanceEntries.firstInputDelay = {
              startTime: firstInput.startTime,
              processingStart: firstInput.processingStart,
              processingEnd: firstInput.processingEnd,
              duration: firstInput.duration,
              delay: firstInput.processingStart - firstInput.startTime
            };
          }
        }).observe({ type: 'first-input', buffered: true });
      });
      
      // Start JavaScript execution tracking if enabled
      if (options.trackJavaScriptExecution) {
        await page.coverage.startJSCoverage();
      }
      
      // Record navigation start time
      const startTime = Date.now();
      
      // Navigate to the URL with appropriate wait condition
      const response = await page.goto(url, { 
        waitUntil: options.waitUntil || 'networkidle',
        timeout: options.timeout || 30000
      });
      
      // Record page load time
      const loadTime = Date.now() - startTime;
      
      // Wait for metrics to be collected
      await page.waitForTimeout(2000);
      
      // Collect JavaScript execution data if enabled
      if (options.trackJavaScriptExecution) {
        const jsCoverage = await page.coverage.stopJSCoverage();
        
        javaScriptExecutionData = {
          totalBytes: 0,
          usedBytes: 0,
          files: []
        };
        
        jsCoverage.forEach(entry => {
          javaScriptExecutionData.totalBytes += entry.text.length;
          
          let usedBytes = 0;
          entry.ranges.forEach(range => {
            usedBytes += range.end - range.start;
          });
          
          javaScriptExecutionData.usedBytes += usedBytes;
          javaScriptExecutionData.files.push({
            url: entry.url,
            totalBytes: entry.text.length,
            usedBytes,
            unusedBytes: entry.text.length - usedBytes,
            usageRatio: usedBytes / entry.text.length
          });
        });
      }
      
      // Extract collected performance entries
      const performanceEntries = await page.evaluate(() => window.performanceEntries);
      
      navigationTimingEntries = performanceEntries.navigationTiming;
      paintTimingEntries = performanceEntries.paintTiming;
      layoutShiftEntries = performanceEntries.layoutShifts;
      largestContentfulPaintEntries = performanceEntries.largestContentfulPaints;
      longTaskEntries = performanceEntries.longTasks;
      resourceTimingEntries = performanceEntries.resourceTiming;
      firstInputDelayEntry = performanceEntries.firstInputDelay;
      
      // Calculate metrics
      
      // First Contentful Paint
      const firstContentfulPaint = paintTimingEntries['first-contentful-paint'] || 0;
      
      // Largest Contentful Paint (use the last entry)
      const lcp = largestContentfulPaintEntries.length > 0 
        ? largestContentfulPaintEntries[largestContentfulPaintEntries.length - 1].startTime 
        : 0;
      
      // Cumulative Layout Shift
      const cls = layoutShiftEntries
        .filter(entry => !entry.hadRecentInput)
        .reduce((sum, entry) => sum + entry.value, 0);
      
      // Total Blocking Time
      const tbt = longTaskEntries
        .reduce((sum, entry) => sum + (entry.duration > 50 ? entry.duration - 50 : 0), 0);
      
      // Time to Interactive (approximation)
      const tti = navigationTimingEntries.domInteractive || loadTime;
      
      // Speed Index (not directly available, use a proxy)
      const speedIndex = firstContentfulPaint * 0.5 + lcp * 0.5;
      
      // First Input Delay
      const fid = firstInputDelayEntry ? firstInputDelayEntry.delay : 0;
      
      // Extract resource timing data for detailed analysis
      const resources = Array.from(requests.values());
      
      // Add additional timing information from ResourceTiming API
      resources.forEach(resource => {
        const matchingEntries = resourceTimingEntries.filter(entry => entry.name === resource.url);
        if (matchingEntries.length > 0) {
          const entry = matchingEntries[0];
          resource.initiatorType = entry.initiatorType;
          resource.nextHopProtocol = entry.nextHopProtocol;
          
          // Detailed timing
          resource.timing = {
            redirectStart: entry.redirectStart,
            redirectEnd: entry.redirectEnd,
            fetchStart: entry.fetchStart,
            domainLookupStart: entry.domainLookupStart,
            domainLookupEnd: entry.domainLookupEnd,
            connectStart: entry.connectStart,
            connectEnd: entry.connectEnd,
            secureConnectionStart: entry.secureConnectionStart,
            requestStart: entry.requestStart,
            responseStart: entry.responseStart,
            responseEnd: entry.responseEnd
          };
          
          // Calculate individual timings
          resource.timingBreakdown = {
            redirect: entry.redirectEnd - entry.redirectStart,
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            connect: entry.connectEnd - entry.connectStart,
            ssl: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
            request: entry.responseStart - entry.requestStart,
            response: entry.responseEnd - entry.responseStart,
            total: entry.responseEnd - entry.fetchStart
          };
        }
      });
      
      return {
        url,
        device,
        browser: browserType,
        loadTime,
        firstContentfulPaint,
        largestContentfulPaint: lcp,
        cumulativeLayoutShift: cls,
        totalBlockingTime: tbt,
        timeToInteractive: tti,
        speedIndex,
        firstInputDelay: fid,
        resourceSize,
        requestCount,
        statusCode: response.status(),
        resources,
        javaScriptExecution: javaScriptExecutionData,
        navigationTiming: {
          domContentLoaded: navigationTimingEntries.domContentLoadedEventEnd || 0,
          domInteractive: navigationTimingEntries.domInteractive || 0,
          domComplete: navigationTimingEntries.domComplete || 0,
          loadEvent: navigationTimingEntries.loadEventEnd || 0,
          serverTiming: navigationTimingEntries.serverTiming || []
        }
      };
      
    } finally {
      await browser.close();
    }
  }
}

module.exports = PerformanceTracker;
