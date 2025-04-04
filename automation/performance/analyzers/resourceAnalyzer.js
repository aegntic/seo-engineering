/**
 * Resource Analyzer
 * 
 * Analyzes resource loading and creates waterfall visualizations
 * to identify inefficient resource loading patterns.
 */

const { URL } = require('url');
const logger = require('../../common/logger');

class ResourceAnalyzer {
  constructor(options = {}) {
    this.options = {
      // Whether to enable waterfall visualization
      enableWaterfallVisualization: options.enableWaterfallVisualization !== false,
      // Whether to capture resource details
      captureResourceDetails: options.captureResourceDetails !== false,
      // Group resources by size threshold (in bytes)
      sizeThresholds: options.sizeThresholds || {
        small: 10 * 1024, // 10 KB
        medium: 100 * 1024, // 100 KB
        large: 1024 * 1024 // 1 MB
      },
      ...options
    };
    
    logger.info('Resource Analyzer initialized');
  }
  
  /**
   * Analyze resources for a specific URL
   * 
   * @param {string} url - The URL to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Resource analysis data
   */
  async analyzeResources(url, options = {}) {
    logger.info(`Analyzing resources for URL: ${url}`);
    
    try {
      const performanceData = options.performanceData;
      
      if (!performanceData) {
        throw new Error('Performance data required for resource analysis');
      }
      
      // Initialize analysis object
      const analysis = {
        url,
        totalRequests: 0,
        totalSize: 0,
        byType: {},
        byDomain: {},
        bySize: {
          small: { count: 0, size: 0 },
          medium: { count: 0, size: 0 },
          large: { count: 0, size: 0 },
          xlarge: { count: 0, size: 0 }
        },
        loadingPatterns: {},
        waterfall: this.options.enableWaterfallVisualization ? [] : undefined,
        criticalResources: [],
        optimizationOpportunities: []
      };
      
      // Process resources from each device type
      for (const [device, deviceData] of Object.entries(performanceData)) {
        // Skip the analysis property
        if (device === 'analysis') continue;
        
        // Find the browser with the most detailed data
        let mostDetailedBrowser = null;
        let mostDetailedData = null;
        
        for (const [browser, browserData] of Object.entries(deviceData)) {
          if (browserData.resources && (!mostDetailedData || 
              browserData.resources.length > mostDetailedData.resources.length)) {
            mostDetailedBrowser = browser;
            mostDetailedData = browserData;
          }
        }
        
        if (mostDetailedData && mostDetailedData.resources) {
          this.processResources(analysis, mostDetailedData.resources, device, mostDetailedBrowser);
        }
      }
      
      // Generate optimization opportunities based on analysis
      this.identifyOptimizationOpportunities(analysis);
      
      // Create waterfall visualization if enabled
      if (this.options.enableWaterfallVisualization) {
        this.createWaterfallVisualization(analysis);
      }
      
      logger.info(`Resource analysis complete for URL: ${url}`);
      return analysis;
      
    } catch (error) {
      logger.error(`Resource analysis failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Process resource data to extract insights
   * 
   * @param {Object} analysis - The analysis object to populate
   * @param {Array<Object>} resources - Resource data from performance tracking
   * @param {string} device - Device type (desktop or mobile)
   * @param {string} browser - Browser type
   */
  processResources(analysis, resources, device, browser) {
    logger.debug(`Processing ${resources.length} resources from ${device} ${browser}`);
    
    // Track total request count and size
    analysis.totalRequests += resources.length;
    
    // Use the size thresholds from options
    const { sizeThresholds } = this.options;
    
    // Process each resource
    resources.forEach(resource => {
      // Extract size
      const size = resource.size || 0;
      analysis.totalSize += size;
      
      // Process by resource type
      const type = resource.resourceType || 'other';
      if (!analysis.byType[type]) {
        analysis.byType[type] = { count: 0, size: 0, resources: [] };
      }
      analysis.byType[type].count++;
      analysis.byType[type].size += size;
      
      if (this.options.captureResourceDetails) {
        analysis.byType[type].resources.push({
          url: resource.url,
          size,
          timing: resource.timingBreakdown,
          startTime: resource.startTime,
          endTime: resource.endTime
        });
      }
      
      // Process by domain
      try {
        const domain = new URL(resource.url).hostname;
        if (!analysis.byDomain[domain]) {
          analysis.byDomain[domain] = { count: 0, size: 0, resources: [] };
        }
        analysis.byDomain[domain].count++;
        analysis.byDomain[domain].size += size;
        
        if (this.options.captureResourceDetails) {
          analysis.byDomain[domain].resources.push({
            url: resource.url,
            type,
            size,
            timing: resource.timingBreakdown
          });
        }
      } catch (e) {
        // Skip invalid URLs
      }
      
      // Process by size category
      let sizeCategory;
      if (size < sizeThresholds.small) {
        sizeCategory = 'small';
      } else if (size < sizeThresholds.medium) {
        sizeCategory = 'medium';
      } else if (size < sizeThresholds.large) {
        sizeCategory = 'large';
      } else {
        sizeCategory = 'xlarge';
      }
      
      analysis.bySize[sizeCategory].count++;
      analysis.bySize[sizeCategory].size += size;
      
      // Add to waterfall data if enabled
      if (analysis.waterfall) {
        analysis.waterfall.push({
          url: resource.url,
          type,
          size,
          startTime: resource.startTime,
          endTime: resource.endTime,
          timing: resource.timingBreakdown,
          device,
          browser
        });
      }
      
      // Identify critical resources
      this.identifyCriticalResource(analysis, resource, device);
      
      // Analyze resource loading patterns
      this.analyzeLoadingPattern(analysis, resource);
    });
  }
  
  /**
   * Identify if a resource is critical for page rendering
   * 
   * @param {Object} analysis - The analysis object to update
   * @param {Object} resource - The resource to analyze
   * @param {string} device - Device type
   */
  identifyCriticalResource(analysis, resource, device) {
    // Criteria for critical resources:
    // 1. Loaded early in the page load process (first 500ms)
    // 2. Blocking resources like CSS and JS in the head
    // 3. Large resources that significantly impact load time
    
    const isCriticalByTime = resource.startTime && resource.startTime < 500;
    const isCriticalByType = ['script', 'stylesheet', 'document', 'font'].includes(resource.resourceType);
    const isCriticalBySize = resource.size && resource.size > 100 * 1024; // 100 KB
    
    if (isCriticalByTime || (isCriticalByType && isCriticalBySize)) {
      analysis.criticalResources.push({
        url: resource.url,
        type: resource.resourceType,
        size: resource.size,
        startTime: resource.startTime,
        endTime: resource.endTime,
        timing: resource.timingBreakdown,
        isCriticalByTime,
        isCriticalByType,
        isCriticalBySize,
        device
      });
    }
  }
  
  /**
   * Analyze resource loading patterns
   * 
   * @param {Object} analysis - The analysis object to update
   * @param {Object} resource - The resource to analyze
   */
  analyzeLoadingPattern(analysis, resource) {
    if (!resource.timing) return;
    
    // Look for specific patterns
    
    // 1. Long connection times
    if (resource.timing.connect > 100) {
      if (!analysis.loadingPatterns.longConnections) {
        analysis.loadingPatterns.longConnections = { count: 0, resources: [] };
      }
      analysis.loadingPatterns.longConnections.count++;
      if (this.options.captureResourceDetails) {
        analysis.loadingPatterns.longConnections.resources.push({
          url: resource.url,
          connectTime: resource.timing.connect,
          resourceType: resource.resourceType
        });
      }
    }
    
    // 2. Long DNS lookup times
    if (resource.timing.dns > 50) {
      if (!analysis.loadingPatterns.longDnsLookups) {
        analysis.loadingPatterns.longDnsLookups = { count: 0, resources: [] };
      }
      analysis.loadingPatterns.longDnsLookups.count++;
      if (this.options.captureResourceDetails) {
        analysis.loadingPatterns.longDnsLookups.resources.push({
          url: resource.url,
          dnsTime: resource.timing.dns,
          resourceType: resource.resourceType
        });
      }
    }
    
    // 3. Long TTFB (Time To First Byte)
    if (resource.timing.request > 200) {
      if (!analysis.loadingPatterns.longTtfb) {
        analysis.loadingPatterns.longTtfb = { count: 0, resources: [] };
      }
      analysis.loadingPatterns.longTtfb.count++;
      if (this.options.captureResourceDetails) {
        analysis.loadingPatterns.longTtfb.resources.push({
          url: resource.url,
          ttfb: resource.timing.request,
          resourceType: resource.resourceType
        });
      }
    }
    
    // 4. Resources with long download times
    if (resource.timing.response > 500) {
      if (!analysis.loadingPatterns.longDownloads) {
        analysis.loadingPatterns.longDownloads = { count: 0, resources: [] };
      }
      analysis.loadingPatterns.longDownloads.count++;
      if (this.options.captureResourceDetails) {
        analysis.loadingPatterns.longDownloads.resources.push({
          url: resource.url,
          downloadTime: resource.timing.response,
          size: resource.size,
          resourceType: resource.resourceType
        });
      }
    }
  }
  
  /**
   * Identify opportunities for resource optimization
   * 
   * @param {Object} analysis - The analysis object to update
   */
  identifyOptimizationOpportunities(analysis) {
    const opportunities = [];
    
    // 1. Image optimization opportunities
    if (analysis.byType.image) {
      const largeImages = (analysis.byType.image.resources || [])
        .filter(img => img.size > 200 * 1024) // 200 KB
        .sort((a, b) => b.size - a.size);
      
      if (largeImages.length > 0) {
        opportunities.push({
          type: 'image-optimization',
          severity: 'medium',
          impact: largeImages.reduce((sum, img) => sum + img.size, 0),
          description: `${largeImages.length} large images found (>200 KB each)`,
          recommendation: 'Compress images and use next-gen formats like WebP or AVIF',
          resources: largeImages.slice(0, 5) // Top 5 largest images
        });
      }
    }
    
    // 2. Render-blocking resources
    const renderBlockingTypes = ['script', 'stylesheet'];
    const renderBlockingResources = analysis.criticalResources.filter(
      res => renderBlockingTypes.includes(res.type)
    );
    
    if (renderBlockingResources.length > 3) {
      opportunities.push({
        type: 'render-blocking-resources',
        severity: 'high',
        impact: renderBlockingResources.length,
        description: `${renderBlockingResources.length} render-blocking resources found`,
        recommendation: 'Defer non-critical JavaScript and CSS, inline critical CSS',
        resources: renderBlockingResources.slice(0, 5) // Top 5 examples
      });
    }
    
    // 3. Too many requests to third-party domains
    const firstPartyDomain = new URL(analysis.url).hostname;
    const thirdPartyDomains = Object.entries(analysis.byDomain)
      .filter(([domain]) => domain !== firstPartyDomain)
      .map(([domain, data]) => ({ domain, ...data }))
      .sort((a, b) => b.count - a.count);
    
    if (thirdPartyDomains.length > 5) {
      const totalThirdPartyRequests = thirdPartyDomains.reduce((sum, domain) => sum + domain.count, 0);
      
      if (totalThirdPartyRequests > 15) {
        opportunities.push({
          type: 'third-party-requests',
          severity: 'medium',
          impact: totalThirdPartyRequests,
          description: `${totalThirdPartyRequests} requests to ${thirdPartyDomains.length} third-party domains`,
          recommendation: 'Audit third-party scripts and remove unnecessary ones',
          domains: thirdPartyDomains.slice(0, 5) // Top 5 third-party domains
        });
      }
    }
    
    // 4. Long loading resources
    if (analysis.loadingPatterns.longDownloads && analysis.loadingPatterns.longDownloads.count > 3) {
      opportunities.push({
        type: 'slow-resources',
        severity: 'medium',
        impact: analysis.loadingPatterns.longDownloads.count,
        description: `${analysis.loadingPatterns.longDownloads.count} resources with long download times (>500ms)`,
        recommendation: 'Use a CDN, optimize server response times, and compress resources',
        resources: analysis.loadingPatterns.longDownloads.resources?.slice(0, 5) // Top 5 slow resources
      });
    }
    
    // 5. Excessive resource size by type
    for (const [type, data] of Object.entries(analysis.byType)) {
      let recommendationThreshold, severity;
      
      switch (type) {
        case 'script':
          recommendationThreshold = 500 * 1024; // 500 KB
          severity = 'high';
          break;
        case 'stylesheet':
          recommendationThreshold = 100 * 1024; // 100 KB
          severity = 'medium';
          break;
        case 'font':
          recommendationThreshold = 200 * 1024; // 200 KB
          severity = 'low';
          break;
        case 'image':
          recommendationThreshold = 1024 * 1024; // 1 MB
          severity = 'medium';
          break;
        default:
          recommendationThreshold = 1024 * 1024; // 1 MB
          severity = 'low';
      }
      
      if (data.size > recommendationThreshold) {
        opportunities.push({
          type: `${type}-size-reduction`,
          severity,
          impact: Math.round(data.size / 1024), // KB
          description: `Excessive ${type} size: ${(data.size / 1024 / 1024).toFixed(2)} MB`,
          recommendation: this.getRecommendationForType(type),
          stats: {
            count: data.count,
            totalSize: data.size,
            averageSize: data.count > 0 ? Math.round(data.size / data.count) : 0
          }
        });
      }
    }
    
    // Sort opportunities by severity and impact
    opportunities.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      return severityDiff !== 0 ? severityDiff : b.impact - a.impact;
    });
    
    analysis.optimizationOpportunities = opportunities;
  }
  
  /**
   * Get optimization recommendation based on resource type
   * 
   * @param {string} type - Resource type
   * @returns {string} - Recommendation text
   */
  getRecommendationForType(type) {
    const recommendations = {
      script: 'Minify JavaScript, remove unused code, and consider code-splitting',
      stylesheet: 'Minify CSS, remove unused styles, and consider critical CSS inlining',
      font: 'Use system fonts where possible, subset fonts, and use font-display: swap',
      image: 'Compress images, use modern formats, and implement lazy loading',
      document: 'Minimize HTML size and remove unnecessary comments and whitespace',
      media: 'Use appropriate media compression and consider lazy loading',
      other: 'Audit resources to identify unnecessary content',
    };
    
    return recommendations[type] || recommendations.other;
  }
  
  /**
   * Create a waterfall visualization of resource loading
   * 
   * @param {Object} analysis - The analysis object to update
   */
  createWaterfallVisualization(analysis) {
    if (!analysis.waterfall) return;
    
    // Sort resources by start time
    analysis.waterfall.sort((a, b) => a.startTime - b.startTime);
    
    // Find the latest end time to determine the timeline scale
    const latestEndTime = Math.max(...analysis.waterfall.map(r => r.endTime));
    
    // Prepare waterfall data for visualization
    // This is essentially a data transformation step to make it more suitable
    // for visualization libraries like d3.js or Chart.js
    
    // Add additional data for visualization
    analysis.waterfall.forEach((resource, index) => {
      resource.index = index;
      resource.startPercent = (resource.startTime / latestEndTime) * 100;
      resource.durationPercent = ((resource.endTime - resource.startTime) / latestEndTime) * 100;
      
      // Add timing breakdown percentages if available
      if (resource.timing) {
        const timing = resource.timing;
        const totalTime = timing.total || (resource.endTime - resource.startTime);
        
        resource.timingPercentages = {
          redirect: timing.redirect ? (timing.redirect / totalTime) * 100 : 0,
          dns: timing.dns ? (timing.dns / totalTime) * 100 : 0,
          connect: timing.connect ? (timing.connect / totalTime) * 100 : 0,
          ssl: timing.ssl ? (timing.ssl / totalTime) * 100 : 0,
          request: timing.request ? (timing.request / totalTime) * 100 : 0,
          response: timing.response ? (timing.response / totalTime) * 100 : 0
        };
      }
    });
    
    // Add visualization metadata
    analysis.waterfallMeta = {
      timeRange: latestEndTime,
      resourceCount: analysis.waterfall.length,
      criticalPathIndex: this.findCriticalPathIndex(analysis.waterfall),
      colorMap: {
        document: '#4285F4',
        script: '#0F9D58',
        stylesheet: '#F4B400',
        image: '#DB4437',
        font: '#AA46BC',
        media: '#26A69A',
        other: '#757575'
      }
    };
  }
  
  /**
   * Find the index of resources that form the critical path
   * 
   * @param {Array<Object>} waterfall - Waterfall data
   * @returns {Array<number>} - Indices of critical path resources
   */
  findCriticalPathIndex(waterfall) {
    const criticalPathIndices = [];
    
    // For this simple implementation, we'll consider the document and render-blocking
    // resources (CSS, JS) loaded before the first contentful paint to be on the critical path
    
    // Find document resource (first HTML)
    const documentIndex = waterfall.findIndex(r => r.type === 'document');
    if (documentIndex !== -1) {
      criticalPathIndices.push(documentIndex);
    }
    
    // Find the first contentful paint time (approximation)
    // In a real implementation, this would come from actual FCP metric
    const fcpResource = waterfall.find(r => r.type === 'image' || r.type === 'font');
    const fcpTime = fcpResource ? fcpResource.startTime : 1000; // Default to 1s if not found
    
    // Find render-blocking resources loaded before FCP
    waterfall.forEach((resource, index) => {
      if ((resource.type === 'script' || resource.type === 'stylesheet') && 
          resource.startTime < fcpTime) {
        criticalPathIndices.push(index);
      }
    });
    
    return criticalPathIndices;
  }
}

module.exports = ResourceAnalyzer;
