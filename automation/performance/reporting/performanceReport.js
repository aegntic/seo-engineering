/**
 * Performance Report
 * 
 * Generates comprehensive performance reports with visualizations,
 * insights, and recommendations based on collected performance data.
 */

const logger = require('../../common/logger');
const { URL } = require('url');

class PerformanceReport {
  constructor(data) {
    this.url = data.url;
    this.performanceData = data.performanceData || {};
    this.resourceAnalysis = data.resourceAnalysis || {};
    this.bottlenecks = data.bottlenecks || [];
    this.browserComparison = data.browserComparison || {};
    this.config = data.config || {};
    
    logger.debug('Performance Report initialized for URL:', this.url);
  }
  
  /**
   * Generate a comprehensive performance report
   * 
   * @returns {Object} - Complete performance report
   */
  generate() {
    logger.info('Generating performance report for URL:', this.url);
    
    try {
      // Create the base report structure
      const report = {
        url: this.url,
        timestamp: new Date().toISOString(),
        summary: this.generateSummary(),
        scores: this.calculateScores(),
        coreWebVitals: this.extractCoreWebVitals(),
        performanceMetrics: this.extractPerformanceMetrics(),
        resourceBreakdown: this.extractResourceBreakdown(),
        bottlenecks: this.prioritizeBottlenecks(),
        recommendations: this.generateRecommendations(),
        browserInsights: this.extractBrowserInsights(),
        visualizations: this.generateVisualizations()
      };
      
      logger.info('Performance report generated successfully');
      return report;
      
    } catch (error) {
      logger.error('Failed to generate performance report:', error.message);
      throw error;
    }
  }
  
  /**
   * Generate an overall performance summary
   * 
   * @returns {Object} - Performance summary
   */
  generateSummary() {
    // Extract domain name for the summary
    let domain = '';
    try {
      domain = new URL(this.url).hostname;
    } catch (e) {
      domain = this.url;
    }
    
    // Get the most critical bottlenecks
    const criticalBottlenecks = this.bottlenecks
      .filter(b => b.severity === 'high')
      .slice(0, 3);
    
    // Count bottlenecks by severity
    const bottleneckCounts = {
      high: this.bottlenecks.filter(b => b.severity === 'high').length,
      medium: this.bottlenecks.filter(b => b.severity === 'medium').length,
      low: this.bottlenecks.filter(b => b.severity === 'low').length
    };
    
    // Get overall performance score
    const scores = this.calculateScores();
    const overallScore = scores.overall;
    
    // Create performance rating text
    let performanceRating;
    if (overallScore >= 90) {
      performanceRating = 'excellent';
    } else if (overallScore >= 70) {
      performanceRating = 'good';
    } else if (overallScore >= 50) {
      performanceRating = 'average';
    } else if (overallScore >= 30) {
      performanceRating = 'poor';
    } else {
      performanceRating = 'critical';
    }
    
    // Count optimization opportunities
    const opportunityCount = this.resourceAnalysis.optimizationOpportunities?.length || 0;
    
    // Create desktop and mobile performance summary
    const desktopLCP = this.performanceData.desktop?.largestContentfulPaint;
    const mobileLCP = this.performanceData.mobile?.largestContentfulPaint;
    const lcpRatio = desktopLCP && mobileLCP ? mobileLCP / desktopLCP : null;
    
    const mobileSummary = lcpRatio 
      ? `Mobile performance is ${lcpRatio.toFixed(1)}x slower than desktop`
      : 'Mobile performance data not available';
    
    return {
      domain,
      url: this.url,
      timestamp: new Date().toISOString(),
      overallScore,
      performanceRating,
      bottleneckCounts,
      criticalBottlenecks: criticalBottlenecks.map(b => b.description),
      opportunityCount,
      resourceStats: {
        totalSize: this.resourceAnalysis.totalSize 
          ? `${(this.resourceAnalysis.totalSize / (1024 * 1024)).toFixed(2)} MB`
          : 'Unknown',
        requestCount: this.resourceAnalysis.totalRequests || 'Unknown'
      },
      mobileSummary,
      summaryText: this.generateSummaryText(
        domain, overallScore, performanceRating, bottleneckCounts, mobileSummary
      )
    };
  }
  
  /**
   * Generate human-readable summary text
   * 
   * @param {string} domain - Website domain
   * @param {number} score - Overall score
   * @param {string} rating - Performance rating
   * @param {Object} bottleneckCounts - Bottleneck counts by severity
   * @param {string} mobileSummary - Mobile performance summary
   * @returns {string} - Summary text
   */
  generateSummaryText(domain, score, rating, bottleneckCounts, mobileSummary) {
    const bottleneckTotal = bottleneckCounts.high + bottleneckCounts.medium + bottleneckCounts.low;
    
    let summary = `${domain} achieves a ${rating} performance score of ${score}/100. `;
    
    if (bottleneckTotal > 0) {
      summary += `Found ${bottleneckTotal} performance issues `;
      
      const severityParts = [];
      if (bottleneckCounts.high > 0) {
        severityParts.push(`${bottleneckCounts.high} critical`);
      }
      if (bottleneckCounts.medium > 0) {
        severityParts.push(`${bottleneckCounts.medium} important`);
      }
      if (bottleneckCounts.low > 0) {
        severityParts.push(`${bottleneckCounts.low} minor`);
      }
      
      summary += `(${severityParts.join(', ')}). `;
    } else {
      summary += 'No significant performance issues found. ';
    }
    
    // Add mobile vs desktop insights if available
    if (mobileSummary) {
      summary += mobileSummary + '. ';
    }
    
    // Add resource insights
    if (this.resourceAnalysis.totalSize) {
      const totalSizeMB = (this.resourceAnalysis.totalSize / (1024 * 1024)).toFixed(2);
      summary += `Total page size is ${totalSizeMB} MB across ${this.resourceAnalysis.totalRequests} requests. `;
    }
    
    // Add recommendation teaser
    if (bottleneckCounts.high > 0) {
      summary += 'Focus on addressing critical performance bottlenecks for significant improvements.';
    } else if (bottleneckCounts.medium > 0) {
      summary += 'Addressing the identified issues will help improve overall performance.';
    } else {
      summary += 'Continue monitoring performance to maintain this level.';
    }
    
    return summary;
  }
  
  /**
   * Calculate performance scores
   * 
   * @returns {Object} - Performance scores by category
   */
  calculateScores() {
    // Initialize scores
    const scores = {
      overall: 0,
      coreWebVitals: 0,
      resourceEfficiency: 0,
      javascriptExecution: 0,
      browserCompatibility: 0
    };
    
    // Calculate Core Web Vitals score
    const webVitalsScore = this.calculateCoreWebVitalsScore();
    scores.coreWebVitals = webVitalsScore;
    
    // Calculate Resource Efficiency score
    const resourceScore = this.calculateResourceScore();
    scores.resourceEfficiency = resourceScore;
    
    // Calculate JavaScript Execution score
    const jsScore = this.calculateJavaScriptScore();
    scores.javascriptExecution = jsScore;
    
    // Calculate Browser Compatibility score
    const browserScore = this.calculateBrowserCompatibilityScore();
    scores.browserCompatibility = browserScore;
    
    // Calculate overall score with weightings
    scores.overall = Math.round(
      webVitalsScore * 0.4 +
      resourceScore * 0.3 +
      jsScore * 0.2 +
      browserScore * 0.1
    );
    
    return scores;
  }
  
  /**
   * Calculate Core Web Vitals score
   * 
   * @returns {number} - Core Web Vitals score (0-100)
   */
  calculateCoreWebVitalsScore() {
    // Initialize subscore components
    let lcpScore = 0;
    let clsScore = 0;
    let fidScore = 0;
    let tbtScore = 0;
    
    // Get mobile and desktop data
    const mobile = this.performanceData.mobile || {};
    const desktop = this.performanceData.desktop || {};
    
    // LCP scoring (weight by device - mobile more important)
    if (mobile.largestContentfulPaint) {
      lcpScore = this.scoreLCP(mobile.largestContentfulPaint) * 0.6;
    }
    if (desktop.largestContentfulPaint) {
      lcpScore += this.scoreLCP(desktop.largestContentfulPaint) * 0.4;
    }
    
    // CLS scoring
    if (mobile.cumulativeLayoutShift) {
      clsScore = this.scoreCLS(mobile.cumulativeLayoutShift) * 0.6;
    }
    if (desktop.cumulativeLayoutShift) {
      clsScore += this.scoreCLS(desktop.cumulativeLayoutShift) * 0.4;
    }
    
    // FID/TBT scoring (TBT is used as a proxy for FID)
    if (mobile.firstInputDelay) {
      fidScore = this.scoreFID(mobile.firstInputDelay) * 0.6;
    } else if (mobile.totalBlockingTime) {
      tbtScore = this.scoreTBT(mobile.totalBlockingTime) * 0.6;
    }
    
    if (desktop.firstInputDelay) {
      fidScore += this.scoreFID(desktop.firstInputDelay) * 0.4;
    } else if (desktop.totalBlockingTime) {
      tbtScore += this.scoreTBT(desktop.totalBlockingTime) * 0.4;
    }
    
    // Use either FID or TBT score, with FID taking precedence
    const interactivityScore = fidScore > 0 ? fidScore : tbtScore;
    
    // Combine scores with weighting
    const combinedScore = lcpScore * 0.4 + clsScore * 0.3 + interactivityScore * 0.3;
    
    // Return rounded score
    return Math.round(combinedScore);
  }
  
  /**
   * Calculate resource efficiency score
   * 
   * @returns {number} - Resource efficiency score (0-100)
   */
  calculateResourceScore() {
    if (!this.resourceAnalysis) {
      return 50; // Default score if no resource analysis data
    }
    
    let score = 100; // Start with perfect score
    
    // Deduct points for excessive resource count
    const requestCount = this.resourceAnalysis.totalRequests || 0;
    if (requestCount > 150) {
      score -= 30;
    } else if (requestCount > 100) {
      score -= 20;
    } else if (requestCount > 75) {
      score -= 10;
    } else if (requestCount > 50) {
      score -= 5;
    }
    
    // Deduct points for excessive page weight
    const totalSize = this.resourceAnalysis.totalSize || 0;
    if (totalSize > 5 * 1024 * 1024) { // > 5 MB
      score -= 30;
    } else if (totalSize > 3 * 1024 * 1024) { // > 3 MB
      score -= 20;
    } else if (totalSize > 2 * 1024 * 1024) { // > 2 MB
      score -= 10;
    } else if (totalSize > 1 * 1024 * 1024) { // > 1 MB
      score -= 5;
    }
    
    // Deduct points for optimization opportunities
    const opportunities = this.resourceAnalysis.optimizationOpportunities || [];
    const highSeverityCount = opportunities.filter(o => o.severity === 'high').length;
    const mediumSeverityCount = opportunities.filter(o => o.severity === 'medium').length;
    
    score -= (highSeverityCount * 10);
    score -= (mediumSeverityCount * 5);
    
    // Deduct points for excessive third-party domains
    const domains = Object.keys(this.resourceAnalysis.byDomain || {});
    if (domains.length > 15) {
      score -= 15;
    } else if (domains.length > 10) {
      score -= 10;
    } else if (domains.length > 7) {
      score -= 5;
    }
    
    // Ensure score stays in valid range
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  
  /**
   * Calculate JavaScript execution score
   * 
   * @returns {number} - JavaScript execution score (0-100)
   */
  calculateJavaScriptScore() {
    // If no JavaScript execution data, use bottlenecks as a proxy
    const jsBottlenecks = this.bottlenecks.filter(
      b => b.category === 'JavaScript' || b.type.includes('javascript')
    );
    
    if (jsBottlenecks.length === 0) {
      // No specific JS bottlenecks found, use a default good score
      return 80;
    }
    
    // Start with a perfect score and deduct based on bottlenecks
    let score = 100;
    
    // Deduct points based on bottleneck severity
    const highSeverity = jsBottlenecks.filter(b => b.severity === 'high').length;
    const mediumSeverity = jsBottlenecks.filter(b => b.severity === 'medium').length;
    const lowSeverity = jsBottlenecks.filter(b => b.severity === 'low').length;
    
    score -= (highSeverity * 20);
    score -= (mediumSeverity * 10);
    score -= (lowSeverity * 5);
    
    // If total blocking time is available, use it to adjust the score
    const tbtMobile = this.performanceData.mobile?.totalBlockingTime;
    const tbtDesktop = this.performanceData.desktop?.totalBlockingTime;
    
    if (tbtMobile) {
      if (tbtMobile > 600) {
        score -= 20;
      } else if (tbtMobile > 300) {
        score -= 10;
      } else if (tbtMobile > 200) {
        score -= 5;
      }
    }
    
    if (tbtDesktop) {
      if (tbtDesktop > 600) {
        score -= 15;
      } else if (tbtDesktop > 300) {
        score -= 8;
      } else if (tbtDesktop > 200) {
        score -= 3;
      }
    }
    
    // Ensure score stays within range
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  
  /**
   * Calculate browser compatibility score
   * 
   * @returns {number} - Browser compatibility score (0-100)
   */
  calculateBrowserCompatibilityScore() {
    // If no browser comparison data, return default score
    if (!this.browserComparison || !this.browserComparison.comparisonPerformed) {
      return 75; // Default score
    }
    
    // Start with perfect score
    let score = 100;
    
    // Deduct points based on variances
    const variances = this.browserComparison.variances || [];
    
    const highVariances = variances.filter(v => v.severity === 'high').length;
    const mediumVariances = variances.filter(v => v.severity === 'medium').length;
    
    score -= (highVariances * 15);
    score -= (mediumVariances * 8);
    
    // Ensure score stays within range
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  
  /**
   * Score Largest Contentful Paint metric
   * 
   * @param {number} lcp - Largest Contentful Paint (ms)
   * @returns {number} - Score (0-100)
   */
  scoreLCP(lcp) {
    if (lcp <= 1500) return 100;
    if (lcp <= 2000) return 90;
    if (lcp <= 2500) return 80;
    if (lcp <= 3000) return 70;
    if (lcp <= 3500) return 60;
    if (lcp <= 4000) return 50;
    if (lcp <= 4500) return 40;
    if (lcp <= 5000) return 30;
    if (lcp <= 6000) return 20;
    if (lcp <= 8000) return 10;
    return 0;
  }
  
  /**
   * Score Cumulative Layout Shift metric
   * 
   * @param {number} cls - Cumulative Layout Shift
   * @returns {number} - Score (0-100)
   */
  scoreCLS(cls) {
    if (cls <= 0.05) return 100;
    if (cls <= 0.1) return 90;
    if (cls <= 0.15) return 80;
    if (cls <= 0.2) return 70;
    if (cls <= 0.25) return 50;
    if (cls <= 0.3) return 30;
    if (cls <= 0.4) return 10;
    return 0;
  }
  
  /**
   * Score First Input Delay metric
   * 
   * @param {number} fid - First Input Delay (ms)
   * @returns {number} - Score (0-100)
   */
  scoreFID(fid) {
    if (fid <= 50) return 100;
    if (fid <= 70) return 90;
    if (fid <= 100) return 80;
    if (fid <= 150) return 70;
    if (fid <= 200) return 60;
    if (fid <= 300) return 40;
    if (fid <= 500) return 20;
    return 0;
  }
  
  /**
   * Score Total Blocking Time metric
   * 
   * @param {number} tbt - Total Blocking Time (ms)
   * @returns {number} - Score (0-100)
   */
  scoreTBT(tbt) {
    if (tbt <= 100) return 100;
    if (tbt <= 150) return 90;
    if (tbt <= 200) return 80;
    if (tbt <= 250) return 70;
    if (tbt <= 300) return 60;
    if (tbt <= 400) return 50;
    if (tbt <= 500) return 40;
    if (tbt <= 600) return 30;
    if (tbt <= 800) return 20;
    if (tbt <= 1000) return 10;
    return 0;
  }
  
  /**
   * Extract Core Web Vitals metrics
   * 
   * @returns {Object} - Core Web Vitals data
   */
  extractCoreWebVitals() {
    const webVitals = {
      mobile: {},
      desktop: {}
    };
    
    // Metrics to extract
    const vitalMetrics = [
      'largestContentfulPaint',
      'cumulativeLayoutShift',
      'firstInputDelay',
      'totalBlockingTime',
      'firstContentfulPaint',
      'speedIndex'
    ];
    
    // Extract metrics for each device
    ['mobile', 'desktop'].forEach(device => {
      if (this.performanceData[device]) {
        const deviceData = this.performanceData[device];
        
        vitalMetrics.forEach(metric => {
          if (deviceData[metric] !== undefined) {
            webVitals[device][metric] = {
              value: deviceData[metric],
              rating: this.getRatingForMetric(metric, deviceData[metric]),
              threshold: this.getThresholdForMetric(metric)
            };
          }
        });
      }
    });
    
    return webVitals;
  }
  
  /**
   * Extract general performance metrics
   * 
   * @returns {Object} - Performance metrics
   */
  extractPerformanceMetrics() {
    const metrics = {
      mobile: {},
      desktop: {}
    };
    
    // Additional metrics to extract
    const additionalMetrics = [
      'loadTime',
      'timeToInteractive',
      'requestCount',
      'resourceSize'
    ];
    
    // Extract metrics for each device
    ['mobile', 'desktop'].forEach(device => {
      if (this.performanceData[device]) {
        const deviceData = this.performanceData[device];
        
        additionalMetrics.forEach(metric => {
          if (deviceData[metric] !== undefined) {
            metrics[device][metric] = deviceData[metric];
          }
        });
        
        // Extract navigation timing if available
        if (deviceData.navigationTiming) {
          metrics[device].navigationTiming = deviceData.navigationTiming;
        }
      }
    });
    
    return metrics;
  }
  
  /**
   * Extract resource breakdown
   * 
   * @returns {Object} - Resource breakdown data
   */
  extractResourceBreakdown() {
    if (!this.resourceAnalysis) {
      return {};
    }
    
    // Extract key resource data
    return {
      totalRequests: this.resourceAnalysis.totalRequests,
      totalSize: this.resourceAnalysis.totalSize,
      byType: this.resourceAnalysis.byType,
      byDomain: this.resourceAnalysis.byDomain,
      bySize: this.resourceAnalysis.bySize,
      loadingPatterns: this.resourceAnalysis.loadingPatterns,
      criticalResources: this.resourceAnalysis.criticalResources
    };
  }
  
  /**
   * Prioritize bottlenecks
   * 
   * @returns {Array<Object>} - Prioritized bottlenecks
   */
  prioritizeBottlenecks() {
    if (!this.bottlenecks || this.bottlenecks.length === 0) {
      return [];
    }
    
    // Group bottlenecks by category
    const categorized = this.bottlenecks.reduce((acc, bottleneck) => {
      const category = bottleneck.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(bottleneck);
      return acc;
    }, {});
    
    // Return categorized and prioritized bottlenecks
    return {
      all: this.bottlenecks,
      bySeverity: {
        high: this.bottlenecks.filter(b => b.severity === 'high'),
        medium: this.bottlenecks.filter(b => b.severity === 'medium'),
        low: this.bottlenecks.filter(b => b.severity === 'low')
      },
      byCategory: categorized
    };
  }
  
  /**
   * Generate prioritized recommendations
   * 
   * @returns {Object} - Recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // 1. Add recommendations from bottlenecks
    this.bottlenecks.forEach(bottleneck => {
      if (bottleneck.severity === 'high' || bottleneck.severity === 'medium') {
        recommendations.push({
          title: this.generateRecommendationTitle(bottleneck),
          description: bottleneck.description,
          severity: bottleneck.severity,
          impact: bottleneck.impact,
          category: bottleneck.category || 'Performance',
          type: bottleneck.type,
          steps: this.getRecommendationSteps(bottleneck),
          resources: this.getRecommendationResources(bottleneck.type)
        });
      }
    });
    
    // 2. Add recommendations from resource analysis
    if (this.resourceAnalysis && this.resourceAnalysis.optimizationOpportunities) {
      this.resourceAnalysis.optimizationOpportunities.forEach(opportunity => {
        // Skip if already covered by a bottleneck
        const alreadyCovered = recommendations.some(r => r.type === opportunity.type);
        if (!alreadyCovered) {
          recommendations.push({
            title: this.generateOpportunityTitle(opportunity),
            description: opportunity.description,
            severity: opportunity.severity,
            impact: opportunity.impact,
            category: 'Resource Optimization',
            type: opportunity.type,
            recommendation: opportunity.recommendation,
            steps: this.getOpportunitySteps(opportunity),
            resources: this.getRecommendationResources(opportunity.type)
          });
        }
      });
    }
    
    // 3. Add browser compatibility recommendations
    if (this.browserComparison && this.browserComparison.insights) {
      this.browserComparison.insights.forEach(insight => {
        if (insight.category === 'Browser Compatibility' && insight.severity === 'high') {
          recommendations.push({
            title: `Fix ${insight.browser} compatibility issue`,
            description: insight.description,
            severity: insight.severity,
            category: 'Browser Compatibility',
            type: insight.type,
            recommendation: insight.recommendation,
            steps: this.getBrowserCompatibilitySteps(insight),
            resources: [
              {
                title: 'Browser compatibility testing guide',
                url: 'https://web.dev/cross-browser-testing/'
              }
            ]
          });
        }
      });
    }
    
    // Sort by severity and impact
    recommendations.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      return severityDiff !== 0 ? severityDiff : (b.impact || 0) - (a.impact || 0);
    });
    
    // Group recommendations by categories for better organization
    const categorized = recommendations.reduce((acc, recommendation) => {
      const category = recommendation.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(recommendation);
      return acc;
    }, {});
    
    return {
      prioritized: recommendations.slice(0, 5),
      all: recommendations,
      byCategory: categorized
    };
  }
  
  /**
   * Extract browser insights
   * 
   * @returns {Object} - Browser comparison insights
   */
  extractBrowserInsights() {
    if (!this.browserComparison || !this.browserComparison.comparisonPerformed) {
      return {
        performed: false,
        message: 'Browser comparison not performed'
      };
    }
    
    return {
      performed: true,
      summary: this.browserComparison.summary,
      variances: this.browserComparison.variances,
      insights: this.browserComparison.insights,
      rawData: this.browserComparison.rawData
    };
  }
  
  /**
   * Generate data for visualizations
   * 
   * @returns {Object} - Visualization data
   */
  generateVisualizations() {
    return {
      performanceScores: this.generateScoreVisualizationData(),
      coreWebVitals: this.generateWebVitalsVisualizationData(),
      resourceBreakdown: this.generateResourceVisualizationData(),
      waterfall: this.generateWaterfallData(),
      browserComparison: this.generateBrowserComparisonVisualization()
    };
  }
  
  /**
   * Generate score visualization data
   * 
   * @returns {Object} - Score visualization data
   */
  generateScoreVisualizationData() {
    const scores = this.calculateScores();
    
    return {
      type: 'radar',
      categories: [
        'Core Web Vitals',
        'Resource Efficiency',
        'JavaScript Execution',
        'Browser Compatibility'
      ],
      data: [
        scores.coreWebVitals,
        scores.resourceEfficiency,
        scores.javascriptExecution,
        scores.browserCompatibility
      ],
      overall: scores.overall
    };
  }
  
  /**
   * Generate Core Web Vitals visualization data
   * 
   * @returns {Object} - Web Vitals visualization data
   */
  generateWebVitalsVisualizationData() {
    const mobileData = this.performanceData.mobile || {};
    const desktopData = this.performanceData.desktop || {};
    
    // Prepare metrics for visualization
    const metrics = {
      'Largest Contentful Paint': {
        mobile: mobileData.largestContentfulPaint,
        desktop: desktopData.largestContentfulPaint,
        unit: 'ms',
        good: 2500,
        needsImprovement: 4000
      },
      'Cumulative Layout Shift': {
        mobile: mobileData.cumulativeLayoutShift,
        desktop: desktopData.cumulativeLayoutShift,
        unit: '',
        good: 0.1,
        needsImprovement: 0.25
      },
      'Total Blocking Time': {
        mobile: mobileData.totalBlockingTime,
        desktop: desktopData.totalBlockingTime,
        unit: 'ms',
        good: 200,
        needsImprovement: 600
      },
      'First Contentful Paint': {
        mobile: mobileData.firstContentfulPaint,
        desktop: desktopData.firstContentfulPaint,
        unit: 'ms',
        good: 1800,
        needsImprovement: 3000
      }
    };
    
    // Convert to visualization data format
    return Object.entries(metrics).map(([metricName, metricData]) => ({
      name: metricName,
      mobile: metricData.mobile,
      desktop: metricData.desktop,
      unit: metricData.unit,
      thresholds: {
        good: metricData.good,
        needsImprovement: metricData.needsImprovement
      }
    }));
  }
  
  /**
   * Generate resource visualization data
   * 
   * @returns {Object} - Resource visualization data
   */
  generateResourceVisualizationData() {
    if (!this.resourceAnalysis) {
      return {};
    }
    
    // Prepare data by type
    const byTypeData = {
      labels: [],
      sizes: [],
      counts: []
    };
    
    if (this.resourceAnalysis.byType) {
      Object.entries(this.resourceAnalysis.byType).forEach(([type, data]) => {
        byTypeData.labels.push(type);
        byTypeData.sizes.push(data.size);
        byTypeData.counts.push(data.count);
      });
    }
    
    // Prepare data by domain (top 5)
    const byDomainData = {
      labels: [],
      sizes: [],
      counts: []
    };
    
    if (this.resourceAnalysis.byDomain) {
      Object.entries(this.resourceAnalysis.byDomain)
        .sort((a, b) => b[1].size - a[1].size)
        .slice(0, 5)
        .forEach(([domain, data]) => {
          byDomainData.labels.push(domain);
          byDomainData.sizes.push(data.size);
          byDomainData.counts.push(data.count);
        });
    }
    
    return {
      byType: byTypeData,
      byDomain: byDomainData,
      bySize: this.resourceAnalysis.bySize
    };
  }
  
  /**
   * Generate waterfall visualization data
   * 
   * @returns {Object} - Waterfall visualization data
   */
  generateWaterfallData() {
    if (!this.resourceAnalysis || !this.resourceAnalysis.waterfall) {
      return {
        available: false
      };
    }
    
    return {
      available: true,
      data: this.resourceAnalysis.waterfall,
      meta: this.resourceAnalysis.waterfallMeta
    };
  }
  
  /**
   * Generate browser comparison visualization data
   * 
   * @returns {Object} - Browser comparison visualization data
   */
  generateBrowserComparisonVisualization() {
    if (!this.browserComparison || !this.browserComparison.comparisonPerformed) {
      return {
        available: false
      };
    }
    
    const metrics = ['firstContentfulPaint', 'largestContentfulPaint', 'cumulativeLayoutShift', 'totalBlockingTime'];
    const browsers = Object.keys(this.browserComparison.rawData || {});
    const chartData = {
      labels: metrics.map(m => this.formatMetricName(m)),
      datasets: []
    };
    
    // Create dataset for each browser
    browsers.forEach(browser => {
      const browserData = this.browserComparison.rawData[browser];
      if (!browserData.error) {
        chartData.datasets.push({
          label: browser,
          data: metrics.map(m => browserData[m])
        });
      }
    });
    
    return {
      available: true,
      chartData,
      variances: this.browserComparison.variances
    };
  }
  
  /**
   * Get rating for a metric
   * 
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @returns {string} - Rating (good, needs-improvement, poor)
   */
  getRatingForMetric(metric, value) {
    const thresholds = this.getThresholdForMetric(metric);
    
    if (metric === 'cumulativeLayoutShift') {
      // For CLS, lower is better
      if (value <= thresholds.good) return 'good';
      if (value <= thresholds.needsImprovement) return 'needs-improvement';
      return 'poor';
    } else {
      // For timing metrics, lower is better (in milliseconds)
      if (value <= thresholds.good) return 'good';
      if (value <= thresholds.needsImprovement) return 'needs-improvement';
      return 'poor';
    }
  }
  
  /**
   * Get threshold for a metric
   * 
   * @param {string} metric - Metric name
   * @returns {Object} - Thresholds
   */
  getThresholdForMetric(metric) {
    const thresholds = {
      largestContentfulPaint: { good: 2500, needsImprovement: 4000 },
      cumulativeLayoutShift: { good: 0.1, needsImprovement: 0.25 },
      firstInputDelay: { good: 100, needsImprovement: 300 },
      totalBlockingTime: { good: 200, needsImprovement: 600 },
      firstContentfulPaint: { good: 1800, needsImprovement: 3000 },
      speedIndex: { good: 3400, needsImprovement: 5800 }
    };
    
    return thresholds[metric] || { good: 0, needsImprovement: 0 };
  }
  
  /**
   * Format metric name for display
   * 
   * @param {string} metric - Metric name
   * @returns {string} - Formatted name
   */
  formatMetricName(metric) {
    return metric
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }
  
  /**
   * Generate recommendation title
   * 
   * @param {Object} bottleneck - Bottleneck data
   * @returns {string} - Recommendation title
   */
  generateRecommendationTitle(bottleneck) {
    const actionVerbs = {
      'largest-contentful-paint': 'Improve',
      'cumulative-layout-shift': 'Reduce',
      'total-blocking-time': 'Reduce',
      'first-contentful-paint': 'Improve',
      'time-to-interactive': 'Improve',
      'speed-index': 'Improve',
      'first-input-delay': 'Improve',
      'excessive-requests': 'Reduce',
      'large-page-size': 'Reduce',
      'large-images': 'Optimize',
      'render-blocking-resources': 'Remove',
      'third-party-domains': 'Reduce',
      'unused-javascript': 'Eliminate',
      'excessive-javascript': 'Reduce',
      'large-javascript-bundles': 'Split',
      'server-response-time': 'Improve',
      'connection-bottlenecks': 'Fix'
    };
    
    const verb = actionVerbs[bottleneck.type] || 'Fix';
    const readableType = bottleneck.type
      .replace(/-/g, ' ')
      .replace(/^./, str => str.toUpperCase());
    
    return `${verb} ${readableType}`;
  }
  
  /**
   * Generate opportunity title
   * 
   * @param {Object} opportunity - Optimization opportunity
   * @returns {string} - Opportunity title
   */
  generateOpportunityTitle(opportunity) {
    const actionVerbs = {
      'image-optimization': 'Optimize',
      'render-blocking-resources': 'Eliminate',
      'third-party-requests': 'Reduce',
      'slow-resources': 'Speed up',
      'script-size-reduction': 'Reduce',
      'stylesheet-size-reduction': 'Minimize',
      'font-size-reduction': 'Optimize'
    };
    
    const verb = actionVerbs[opportunity.type] || 'Improve';
    const readableType = opportunity.type
      .replace(/-/g, ' ')
      .replace(/^./, str => str.toUpperCase());
    
    return `${verb} ${readableType}`;
  }
  
  /**
   * Get recommendation steps
   * 
   * @param {Object} bottleneck - Bottleneck data
   * @returns {Array<string>} - Recommendation steps
   */
  getRecommendationSteps(bottleneck) {
    // Map bottleneck types to implementation steps
    const stepsMap = {
      'largest-contentful-paint': [
        'Identify the largest contentful paint element using the Performance panel in Chrome DevTools',
        'Optimize the loading of this element (preload, compress, or use a more efficient format)',
        'Eliminate render-blocking resources by deferring non-critical JavaScript and CSS',
        'Improve server response time if TTFB is high',
        'Implement proper resource prioritization using preload, preconnect, and prefetch'
      ],
      'cumulative-layout-shift': [
        'Add width and height attributes to all image and video elements',
        'Reserve space for dynamic content and ads before they load',
        'Avoid inserting content above existing content, especially during loading',
        'Prefer transform animations over animations of properties that trigger layout changes',
        'Use CSS contain:layout, contain:size, or contain:content to isolate layout changes'
      ],
      'total-blocking-time': [
        'Break up long JavaScript tasks into smaller, asynchronous tasks',
        'Remove unused JavaScript code through code splitting and tree shaking',
        'Defer or remove non-critical third-party scripts',
        'Use a web worker for expensive computations that would block the main thread',
        'Optimize JavaScript execution by reducing complex calculations and DOM manipulations'
      ],
      'large-images': [
        'Compress images using tools like ImageOptim, TinyPNG, or Squoosh',
        'Use modern formats like WebP or AVIF with fallbacks for older browsers',
        'Implement responsive images using srcset and sizes attributes',
        'Lazy load images that are below the fold',
        'Resize images to their displayed size rather than scaling in the browser'
      ],
      'render-blocking-resources': [
        'Inline critical CSS and load the rest asynchronously',
        'Use defer or async attributes for non-critical scripts',
        'Split CSS files by importance and media queries',
        'Reduce the size of blocking resources through minification and compression',
        'Remove unused CSS and JavaScript from critical rendering path'
      ]
    };
    
    return stepsMap[bottleneck.type] || 
      (bottleneck.possibleCauses || []).map(cause => 
        `Address the issue: ${cause.charAt(0).toLowerCase() + cause.slice(1)}`
      );
  }
  
  /**
   * Get opportunity implementation steps
   * 
   * @param {Object} opportunity - Optimization opportunity
   * @returns {Array<string>} - Implementation steps
   */
  getOpportunitySteps(opportunity) {
    if (opportunity.recommendation) {
      // Split the recommendation into steps if it contains commas
      const steps = opportunity.recommendation.split(/,\s*/);
      if (steps.length > 1) {
        return steps.map(step => 
          step.charAt(0).toUpperCase() + step.slice(1)
        );
      }
    }
    
    // Default to generic steps based on type
    return this.getRecommendationSteps({ 
      type: opportunity.type,
      possibleCauses: []
    });
  }
  
  /**
   * Get browser compatibility steps
   * 
   * @param {Object} insight - Browser insight
   * @returns {Array<string>} - Implementation steps
   */
  getBrowserCompatibilitySteps(insight) {
    return [
      `Test the website in ${insight.browser} to reproduce the issue`,
      'Use browser developer tools to identify the root cause',
      'Create a minimal test case to isolate the problem',
      'Fix the issue using appropriate polyfills or browser-specific code',
      'Verify the fix across all major browsers'
    ];
  }
  
  /**
   * Get recommendation resources
   * 
   * @param {string} type - Bottleneck or opportunity type
   * @returns {Array<Object>} - Resources
   */
  getRecommendationResources(type) {
    // Map types to helpful resources
    const resourcesMap = {
      'largest-contentful-paint': [
        {
          title: 'Optimize Largest Contentful Paint',
          url: 'https://web.dev/optimize-lcp/'
        },
        {
          title: 'Defining the Core Web Vitals metrics thresholds',
          url: 'https://web.dev/defining-core-web-vitals-thresholds/'
        }
      ],
      'cumulative-layout-shift': [
        {
          title: 'Optimize Cumulative Layout Shift',
          url: 'https://web.dev/optimize-cls/'
        },
        {
          title: 'Debug layout shifts',
          url: 'https://web.dev/debug-layout-shifts/'
        }
      ],
      'total-blocking-time': [
        {
          title: 'Optimize Total Blocking Time',
          url: 'https://web.dev/optimize-tbt/'
        },
        {
          title: 'First Input Delay',
          url: 'https://web.dev/fid/'
        }
      ],
      'image-optimization': [
        {
          title: 'Use WebP images',
          url: 'https://web.dev/serve-images-webp/'
        },
        {
          title: 'Responsive images',
          url: 'https://web.dev/serve-responsive-images/'
        }
      ],
      'render-blocking-resources': [
        {
          title: 'Eliminate render-blocking resources',
          url: 'https://web.dev/render-blocking-resources/'
        },
        {
          title: 'Defer non-critical CSS',
          url: 'https://web.dev/defer-non-critical-css/'
        }
      ]
    };
    
    return resourcesMap[type] || [
      {
        title: 'Web Performance',
        url: 'https://web.dev/performance-scoring/'
      },
      {
        title: 'Core Web Vitals',
        url: 'https://web.dev/vitals/'
      }
    ];
  }
}

module.exports = PerformanceReport;
