/**
 * Bottleneck Detector
 * 
 * Identifies performance bottlenecks by analyzing resource loading patterns,
 * JavaScript execution, and other metrics to pinpoint issues.
 */

const logger = require('../../common/logger');

class BottleneckDetector {
  constructor(options = {}) {
    this.options = {
      // Thresholds for bottleneck detection
      thresholds: {
        largeImage: 200 * 1024, // 200 KB
        excessiveDOM: 1500, // elements
        longTask: 100, // ms
        highCLS: 0.25,
        slowTTFB: 600, // ms
        largeBundle: 250 * 1024, // 250 KB for JS bundles
        renderBlocking: 400, // ms
        excessiveRequests: 80, // number of requests
        thirdPartyDomains: 8 // number of domains
      },
      ...options
    };
    
    logger.info('Bottleneck Detector initialized');
  }
  
  /**
   * Detect performance bottlenecks
   * 
   * @param {Object} performanceData - Performance metrics
   * @param {Object} resourceAnalysis - Resource loading data
   * @returns {Array<Object>} - Detected bottlenecks
   */
  detectBottlenecks(performanceData, resourceAnalysis) {
    logger.info('Detecting performance bottlenecks');
    
    const bottlenecks = [];
    
    // 1. Detect bottlenecks from Core Web Vitals
    this.detectCoreWebVitalsBottlenecks(performanceData, bottlenecks);
    
    // 2. Detect bottlenecks from resource analysis
    this.detectResourceBottlenecks(resourceAnalysis, bottlenecks);
    
    // 3. Detect JavaScript execution bottlenecks
    this.detectJavaScriptBottlenecks(performanceData, bottlenecks);
    
    // 4. Detect server response bottlenecks
    this.detectServerBottlenecks(performanceData, resourceAnalysis, bottlenecks);
    
    // Sort by severity and impact
    bottlenecks.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return (severityOrder[a.severity] - severityOrder[b.severity]) || 
             (b.impact - a.impact);
    });
    
    logger.info(`Detected ${bottlenecks.length} performance bottlenecks`);
    return bottlenecks;
  }
  
  /**
   * Detect bottlenecks from Core Web Vitals metrics
   * 
   * @param {Object} performanceData - Performance metrics
   * @param {Array<Object>} bottlenecks - Array to add detected bottlenecks
   */
  detectCoreWebVitalsBottlenecks(performanceData, bottlenecks) {
    // Check both mobile and desktop metrics
    ['mobile', 'desktop'].forEach(device => {
      if (!performanceData[device]) return;
      
      const metrics = performanceData[device];
      
      // 1. Poor Largest Contentful Paint (LCP)
      if (metrics.largestContentfulPaint > 2500) {
        const severity = metrics.largestContentfulPaint > 4000 ? 'high' : 'medium';
        bottlenecks.push({
          type: 'largest-contentful-paint',
          category: 'Core Web Vitals',
          device,
          severity,
          impact: Math.round(metrics.largestContentfulPaint / 100) / 10, // Convert to seconds with 1 decimal
          description: `Slow Largest Contentful Paint (${(metrics.largestContentfulPaint / 1000).toFixed(2)}s)`,
          value: metrics.largestContentfulPaint,
          threshold: 2500,
          possibleCauses: [
            'Slow server response times',
            'Render-blocking JavaScript and CSS',
            'Slow resource load times',
            'Client-side rendering'
          ]
        });
      }
      
      // 2. Poor Cumulative Layout Shift (CLS)
      if (metrics.cumulativeLayoutShift > this.options.thresholds.highCLS) {
        const severity = metrics.cumulativeLayoutShift > 0.5 ? 'high' : 'medium';
        bottlenecks.push({
          type: 'cumulative-layout-shift',
          category: 'Core Web Vitals',
          device,
          severity,
          impact: metrics.cumulativeLayoutShift * 100, // Scale up for sorting
          description: `High Cumulative Layout Shift (${metrics.cumulativeLayoutShift.toFixed(3)})`,
          value: metrics.cumulativeLayoutShift,
          threshold: this.options.thresholds.highCLS,
          possibleCauses: [
            'Images without dimensions',
            'Ads, embeds, or dynamically injected content',
            'Web fonts causing FOIT/FOUT',
            'Actions waiting for network response before updating DOM'
          ]
        });
      }
      
      // 3. Poor Total Blocking Time (TBT)
      if (metrics.totalBlockingTime > 300) {
        const severity = metrics.totalBlockingTime > 600 ? 'high' : 'medium';
        bottlenecks.push({
          type: 'total-blocking-time',
          category: 'Core Web Vitals',
          device,
          severity,
          impact: metrics.totalBlockingTime,
          description: `High Total Blocking Time (${metrics.totalBlockingTime.toFixed(0)}ms)`,
          value: metrics.totalBlockingTime,
          threshold: 300,
          possibleCauses: [
            'Long-running JavaScript',
            'Heavy JavaScript execution',
            'Excessive DOM manipulation',
            'Non-optimized third-party scripts'
          ]
        });
      }
      
      // 4. Poor First Contentful Paint (FCP)
      if (metrics.firstContentfulPaint > 1800) {
        const severity = metrics.firstContentfulPaint > 3000 ? 'high' : 'medium';
        bottlenecks.push({
          type: 'first-contentful-paint',
          category: 'Core Web Vitals',
          device,
          severity,
          impact: Math.round(metrics.firstContentfulPaint / 100) / 10, // Convert to seconds with 1 decimal
          description: `Slow First Contentful Paint (${(metrics.firstContentfulPaint / 1000).toFixed(2)}s)`,
          value: metrics.firstContentfulPaint,
          threshold: 1800,
          possibleCauses: [
            'Render-blocking resources',
            'Slow server response time',
            'Large page resources',
            'Multiple redirects'
          ]
        });
      }
      
      // 5. Slow Time to Interactive (TTI)
      if (metrics.timeToInteractive > 3800) {
        const severity = metrics.timeToInteractive > 7600 ? 'high' : 'medium';
        bottlenecks.push({
          type: 'time-to-interactive',
          category: 'User Experience',
          device,
          severity,
          impact: Math.round(metrics.timeToInteractive / 100) / 10, // Convert to seconds with 1 decimal
          description: `Slow Time to Interactive (${(metrics.timeToInteractive / 1000).toFixed(2)}s)`,
          value: metrics.timeToInteractive,
          threshold: 3800,
          possibleCauses: [
            'Heavy JavaScript execution',
            'Non-optimized third-party scripts',
            'Long tasks blocking the main thread',
            'Large DOM size'
          ]
        });
      }
      
      // 6. Poor Speed Index
      if (metrics.speedIndex > 3000) {
        const severity = metrics.speedIndex > 6000 ? 'high' : 'medium';
        bottlenecks.push({
          type: 'speed-index',
          category: 'User Experience',
          device,
          severity,
          impact: Math.round(metrics.speedIndex / 100) / 10, // Convert to seconds with 1 decimal
          description: `Poor Speed Index (${(metrics.speedIndex / 1000).toFixed(2)}s)`,
          value: metrics.speedIndex,
          threshold: 3000,
          possibleCauses: [
            'Slow visual rendering',
            'Render-blocking resources',
            'Slow resource loading',
            'Client-side rendering'
          ]
        });
      }
      
      // 7. High First Input Delay (FID)
      if (metrics.firstInputDelay > 100) {
        const severity = metrics.firstInputDelay > 300 ? 'high' : 'medium';
        bottlenecks.push({
          type: 'first-input-delay',
          category: 'Core Web Vitals',
          device,
          severity,
          impact: metrics.firstInputDelay,
          description: `High First Input Delay (${metrics.firstInputDelay.toFixed(0)}ms)`,
          value: metrics.firstInputDelay,
          threshold: 100,
          possibleCauses: [
            'Heavy JavaScript execution',
            'Main thread congestion',
            'Complex event handlers',
            'Third-party scripts'
          ]
        });
      }
    });
  }
  
  /**
   * Detect bottlenecks from resource analysis
   * 
   * @param {Object} resourceAnalysis - Resource loading data
   * @param {Array<Object>} bottlenecks - Array to add detected bottlenecks
   */
  detectResourceBottlenecks(resourceAnalysis, bottlenecks) {
    if (!resourceAnalysis) return;
    
    // 1. Too many requests
    if (resourceAnalysis.totalRequests > this.options.thresholds.excessiveRequests) {
      bottlenecks.push({
        type: 'excessive-requests',
        category: 'Resource Loading',
        severity: 'medium',
        impact: resourceAnalysis.totalRequests,
        description: `Excessive number of requests (${resourceAnalysis.totalRequests})`,
        value: resourceAnalysis.totalRequests,
        threshold: this.options.thresholds.excessiveRequests,
        possibleCauses: [
          'Too many small resources',
          'Non-bundled JavaScript and CSS',
          'Excessive image usage',
          'Third-party scripts loading additional resources'
        ]
      });
    }
    
    // 2. Large total page weight
    if (resourceAnalysis.totalSize > 3 * 1024 * 1024) { // 3 MB
      const totalSizeMB = (resourceAnalysis.totalSize / (1024 * 1024)).toFixed(2);
      bottlenecks.push({
        type: 'large-page-size',
        category: 'Resource Loading',
        severity: 'medium',
        impact: resourceAnalysis.totalSize / (1024 * 1024), // MB
        description: `Large total page size (${totalSizeMB} MB)`,
        value: resourceAnalysis.totalSize,
        threshold: 3 * 1024 * 1024,
        possibleCauses: [
          'Uncompressed resources',
          'Unoptimized images',
          'Unnecessary resources',
          'Unused CSS and JavaScript'
        ]
      });
    }
    
    // 3. Large images
    if (resourceAnalysis.byType.image && 
        resourceAnalysis.byType.image.size > 1 * 1024 * 1024) { // 1 MB
      const imageSizeMB = (resourceAnalysis.byType.image.size / (1024 * 1024)).toFixed(2);
      bottlenecks.push({
        type: 'large-images',
        category: 'Resource Loading',
        severity: 'medium',
        impact: resourceAnalysis.byType.image.size / (1024 * 1024), // MB
        description: `Large total image size (${imageSizeMB} MB)`,
        value: resourceAnalysis.byType.image.size,
        threshold: 1 * 1024 * 1024,
        imageCount: resourceAnalysis.byType.image.count,
        possibleCauses: [
          'Unoptimized images',
          'Wrong image format',
          'Missing srcset for responsive images',
          'Images not properly sized for their container'
        ]
      });
    }
    
    // 4. Render-blocking resources
    if (resourceAnalysis.loadingPatterns.renderBlocking) {
      const renderBlockingCount = resourceAnalysis.loadingPatterns.renderBlocking.count;
      if (renderBlockingCount > 3) {
        bottlenecks.push({
          type: 'render-blocking-resources',
          category: 'Resource Loading',
          severity: 'high',
          impact: renderBlockingCount * 100, // Scaled for impact sorting
          description: `${renderBlockingCount} render-blocking resources`,
          value: renderBlockingCount,
          threshold: 3,
          possibleCauses: [
            'Non-deferred or non-async scripts',
            'CSS in document head without media queries',
            'Critical resources not preloaded',
            'Sequential resource loading'
          ]
        });
      }
    }
    
    // 5. Too many third-party domains
    const domains = Object.keys(resourceAnalysis.byDomain || {});
    if (domains.length > this.options.thresholds.thirdPartyDomains) {
      bottlenecks.push({
        type: 'third-party-domains',
        category: 'Resource Loading',
        severity: 'medium',
        impact: domains.length,
        description: `Too many third-party domains (${domains.length})`,
        value: domains.length,
        threshold: this.options.thresholds.thirdPartyDomains,
        domains: domains,
        possibleCauses: [
          'Excessive third-party scripts',
          'Multiple analytics services',
          'Social media widgets',
          'Scattered resource hosting'
        ]
      });
    }
    
    // 6. Check optimization opportunities
    if (resourceAnalysis.optimizationOpportunities) {
      resourceAnalysis.optimizationOpportunities.forEach(opportunity => {
        if (opportunity.severity === 'high') {
          bottlenecks.push({
            type: opportunity.type,
            category: 'Resource Optimization',
            severity: opportunity.severity,
            impact: opportunity.impact,
            description: opportunity.description,
            recommendation: opportunity.recommendation,
            possibleCauses: this.getPossibleCausesForOptimization(opportunity.type)
          });
        }
      });
    }
  }
  
  /**
   * Detect JavaScript execution bottlenecks
   * 
   * @param {Object} performanceData - Performance metrics
   * @param {Array<Object>} bottlenecks - Array to add detected bottlenecks
   */
  detectJavaScriptBottlenecks(performanceData, bottlenecks) {
    // Check both mobile and desktop metrics
    ['mobile', 'desktop'].forEach(device => {
      if (!performanceData[device]) return;
      
      // Look for the browser with JavaScript execution data
      for (const [browser, browserData] of Object.entries(performanceData[device])) {
        if (!browserData.javaScriptExecution) continue;
        
        const jsData = browserData.javaScriptExecution;
        
        // 1. Large unused JavaScript
        const unusedBytes = jsData.totalBytes - jsData.usedBytes;
        const unusedRatio = unusedBytes / jsData.totalBytes;
        
        if (unusedRatio > 0.4 && unusedBytes > 200 * 1024) { // 40% unused and over 200 KB
          bottlenecks.push({
            type: 'unused-javascript',
            category: 'JavaScript',
            device,
            severity: 'medium',
            impact: unusedBytes / 1024, // KB
            description: `Large unused JavaScript (${Math.round(unusedBytes / 1024)} KB, ${Math.round(unusedRatio * 100)}%)`,
            value: unusedBytes,
            totalBytes: jsData.totalBytes,
            unusedRatio,
            possibleCauses: [
              'Dead code not removed by tree-shaking',
              'Importing entire libraries for minimal functionality',
              'Unused polyfills or compatibility code',
              'Bundling inefficiency'
            ]
          });
        }
        
        // 2. Excessive JavaScript size
        if (jsData.totalBytes > 500 * 1024) { // 500 KB
          const severity = jsData.totalBytes > 1000 * 1024 ? 'high' : 'medium';
          bottlenecks.push({
            type: 'excessive-javascript',
            category: 'JavaScript',
            device,
            severity,
            impact: jsData.totalBytes / 1024, // KB
            description: `Excessive JavaScript size (${Math.round(jsData.totalBytes / 1024)} KB)`,
            value: jsData.totalBytes,
            threshold: 500 * 1024,
            fileCount: jsData.files.length,
            possibleCauses: [
              'Large frameworks or libraries',
              'Duplicate code or dependencies',
              'Lack of code splitting',
              'Unminified code'
            ]
          });
        }
        
        // 3. Individual large JavaScript bundles
        const largeFiles = jsData.files.filter(file => file.totalBytes > this.options.thresholds.largeBundle);
        if (largeFiles.length > 0) {
          bottlenecks.push({
            type: 'large-javascript-bundles',
            category: 'JavaScript',
            device,
            severity: 'medium',
            impact: largeFiles.length * 20, // Scaled for impact sorting
            description: `${largeFiles.length} large JavaScript bundles (>${this.options.thresholds.largeBundle / 1024} KB)`,
            bundles: largeFiles.slice(0, 5).map(file => ({
              url: file.url,
              size: Math.round(file.totalBytes / 1024) // KB
            })),
            possibleCauses: [
              'Ineffective code-splitting',
              'Bundling all code into a single file',
              'Large dependencies included in main bundle',
              'Inefficient build configuration'
            ]
          });
        }
        
        break; // Only process the first browser with JS data
      }
    });
  }
  
  /**
   * Detect server response bottlenecks
   * 
   * @param {Object} performanceData - Performance metrics
   * @param {Object} resourceAnalysis - Resource loading data
   * @param {Array<Object>} bottlenecks - Array to add detected bottlenecks
   */
  detectServerBottlenecks(performanceData, resourceAnalysis, bottlenecks) {
    // Check both mobile and desktop metrics
    ['mobile', 'desktop'].forEach(device => {
      if (!performanceData[device]) return;
      
      for (const [browser, browserData] of Object.entries(performanceData[device])) {
        // 1. Slow Time To First Byte (TTFB)
        if (browserData.navigationTiming && 
            browserData.navigationTiming.responseStart > this.options.thresholds.slowTTFB) {
          const ttfb = browserData.navigationTiming.responseStart;
          const severity = ttfb > 1000 ? 'high' : 'medium';
          
          bottlenecks.push({
            type: 'server-response-time',
            category: 'Server',
            device,
            browser,
            severity,
            impact: ttfb,
            description: `Slow Time To First Byte (${ttfb.toFixed(0)}ms)`,
            value: ttfb,
            threshold: this.options.thresholds.slowTTFB,
            possibleCauses: [
              'Slow server processing',
              'Server resource constraints',
              'Database query bottlenecks',
              'Network latency',
              'Missing or inefficient caching'
            ]
          });
        }
        
        // 2. Long connection times
        if (resourceAnalysis && resourceAnalysis.loadingPatterns.longConnections) {
          const connectionIssues = resourceAnalysis.loadingPatterns.longConnections;
          if (connectionIssues.count > 3) {
            bottlenecks.push({
              type: 'connection-bottlenecks',
              category: 'Network',
              device,
              browser,
              severity: 'medium',
              impact: connectionIssues.count * 20, // Scaled for impact sorting
              description: `${connectionIssues.count} resources with slow connection times`,
              count: connectionIssues.count,
              resources: connectionIssues.resources?.slice(0, 5),
              possibleCauses: [
                'Too many unique domains',
                'SSL negotiation overhead',
                'DNS resolution delays',
                'Network congestion'
              ]
            });
          }
        }
        
        break; // Only process first browser with data
      }
    });
  }
  
  /**
   * Get possible causes for specific optimization type
   * 
   * @param {string} type - Optimization type
   * @returns {Array<string>} - Possible causes
   */
  getPossibleCausesForOptimization(type) {
    const causeMap = {
      'image-optimization': [
        'Uncompressed images',
        'Wrong image format for the content type',
        'Images not resized for their display size',
        'Missing next-gen formats like WebP'
      ],
      'render-blocking-resources': [
        'CSS in document head without media queries',
        'Synchronous JavaScript in document head',
        'Critical resources not prioritized',
        'Improper resource hints (preload, prefetch)'
      ],
      'third-party-requests': [
        'Multiple analytics services',
        'Social media widgets',
        'Advertising scripts',
        'Unnecessary third-party services'
      ],
      'slow-resources': [
        'Resources hosted on slow servers',
        'Missing content compression',
        'Large resource files',
        'Resources not served from CDN'
      ],
      'script-size-reduction': [
        'Unused JavaScript',
        'Large frameworks included for minimal features',
        'Inefficient bundle splitting',
        'Lack of minification'
      ],
      'stylesheet-size-reduction': [
        'Unused CSS',
        'Duplicate CSS rules',
        'CSS frameworks included in their entirety',
        'Inefficient CSS selectors'
      ],
      'font-size-reduction': [
        'Too many font variations (weights, styles)',
        'Font files not subset for used characters',
        'Decorative fonts not optimized',
        'Multiple font formats without proper selection'
      ]
    };
    
    return causeMap[type] || [
      'Unoptimized resources',
      'Inefficient loading strategies',
      'Unnecessary resources',
      'Lack of performance optimization'
    ];
  }
  
  /**
   * Detect site-wide bottlenecks across multiple URLs
   * 
   * @param {Array<Object>} urlResults - Results from multiple URLs
   * @returns {Array<Object>} - Site-wide bottlenecks
   */
  detectSiteWideBottlenecks(urlResults) {
    logger.info('Detecting site-wide bottlenecks');
    
    // Initialize counters for bottleneck types
    const bottleneckCounts = {};
    const bottlenecksByType = {};
    
    // Count bottleneck occurrences across all URLs
    urlResults.forEach(result => {
      const url = result.url;
      
      if (result.bottlenecks) {
        result.bottlenecks.forEach(bottleneck => {
          const type = bottleneck.type;
          
          if (!bottleneckCounts[type]) {
            bottleneckCounts[type] = 0;
            bottlenecksByType[type] = {
              count: 0,
              severity: bottleneck.severity,
              category: bottleneck.category,
              description: '',
              affectedUrls: []
            };
          }
          
          bottleneckCounts[type]++;
          bottlenecksByType[type].count++;
          bottlenecksByType[type].affectedUrls.push({
            url,
            value: bottleneck.value,
            description: bottleneck.description
          });
        });
      }
    });
    
    // Convert to site-wide bottlenecks if they affect multiple URLs
    const siteWideBottlenecks = [];
    const urlCount = urlResults.length;
    
    Object.entries(bottlenecksByType).forEach(([type, data]) => {
      // If bottleneck affects at least 25% of URLs
      if (data.count >= Math.max(2, Math.floor(urlCount * 0.25))) {
        // Create site-wide bottleneck entry
        siteWideBottlenecks.push({
          type,
          category: data.category,
          severity: data.severity,
          impact: data.count,
          affectedUrlCount: data.count,
          totalUrlCount: urlCount,
          percentage: Math.round((data.count / urlCount) * 100),
          description: `${type.replace(/-/g, ' ')} issues affecting ${data.count} out of ${urlCount} URLs (${Math.round((data.count / urlCount) * 100)}%)`,
          affectedUrls: data.affectedUrls,
          possibleCauses: this.getPossibleCausesForOptimization(type)
        });
      }
    });
    
    // Sort by percentage affected and severity
    siteWideBottlenecks.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      return severityDiff !== 0 ? severityDiff : b.percentage - a.percentage;
    });
    
    logger.info(`Detected ${siteWideBottlenecks.length} site-wide bottlenecks`);
    return siteWideBottlenecks;
  }
}

module.exports = BottleneckDetector;
