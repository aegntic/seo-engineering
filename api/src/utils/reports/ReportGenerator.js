/**
 * ReportGenerator.js
 * 
 * Handles the generation of SEO reports based on templates.
 */

class ReportGenerator {
  /**
   * Create a new report generator
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      includeScreenshots: true,
      detailedAnalysis: true,
      recommendationPriority: true,
      ...options
    };
  }

  /**
   * Generate a standard SEO report from scan data
   * @param {Object} scanData - The SEO scan data to build the report from
   * @param {String} template - The template to use (summary, detailed, executive)
   * @returns {Object} The generated report data
   */
  generateReport(scanData, template = 'detailed') {
    if (!scanData) {
      throw new Error('Scan data is required to generate a report');
    }

    // Select template function based on requested template type
    const templateFunction = this.getTemplateFunction(template);
    
    // Process data through the template
    const reportData = templateFunction(scanData, this.options);
    
    // Add metadata
    reportData.metadata = {
      generatedAt: new Date().toISOString(),
      template: template,
      version: '1.0.0'
    };
    
    return reportData;
  }

  /**
   * Get the appropriate template function
   * @param {String} templateName - The name of the template to use
   * @returns {Function} The template function
   */
  getTemplateFunction(templateName) {
    const templates = {
      summary: this.summaryTemplate,
      detailed: this.detailedTemplate,
      executive: this.executiveTemplate,
    };

    if (!templates[templateName]) {
      throw new Error(`Unknown template: ${templateName}`);
    }

    return templates[templateName];
  }

  /**
   * Summary template - Provides a quick overview
   * @param {Object} data - Scan data
   * @param {Object} options - Generation options
   * @returns {Object} Formatted report data
   */
  summaryTemplate(data, options) {
    const { url, scannedAt, issues, score, metrics } = data;
    
    // Group issues by severity
    const groupedIssues = this.groupIssuesBySeverity(issues);
    
    return {
      title: `SEO Summary Report - ${url}`,
      url,
      scannedAt,
      score,
      keyMetrics: {
        loadTime: metrics.loadTime,
        mobileCompatibility: metrics.mobileCompatibility,
        securityScore: metrics.securityScore
      },
      issuesSummary: {
        critical: groupedIssues.critical.length,
        high: groupedIssues.high.length,
        medium: groupedIssues.medium.length,
        low: groupedIssues.low.length
      },
      topIssues: this.getTopIssues(issues, 5)
    };
  }

  /**
   * Detailed template - Comprehensive analysis
   * @param {Object} data - Scan data
   * @param {Object} options - Generation options
   * @returns {Object} Formatted report data
   */
  detailedTemplate(data, options) {
    const { url, scannedAt, issues, score, metrics, pages } = data;
    
    // Start with the summary report
    const report = this.summaryTemplate(data, options);
    
    // Add detailed sections
    report.sections = [
      {
        title: 'Technical SEO Analysis',
        content: this.generateTechnicalSection(data)
      },
      {
        title: 'Page Performance Analysis',
        content: this.generatePerformanceSection(data)
      },
      {
        title: 'Content Analysis',
        content: this.generateContentSection(data)
      },
      {
        title: 'Mobile Compatibility',
        content: this.generateMobileSection(data)
      },
      {
        title: 'Security Analysis',
        content: this.generateSecuritySection(data)
      }
    ];
    
    // Include all issues with detailed information
    report.allIssues = issues.map(issue => ({
      ...issue,
      recommendations: this.generateRecommendations(issue)
    }));
    
    // Include page-by-page analysis if available
    if (pages && pages.length > 0) {
      report.pageAnalysis = pages.map(page => ({
        url: page.url,
        score: page.score,
        issues: page.issues.length,
        metrics: {
          loadTime: page.metrics.loadTime,
          contentQuality: page.metrics.contentQuality
        }
      }));
    }
    
    return report;
  }

  /**
   * Executive template - Business-focused overview
   * @param {Object} data - Scan data
   * @param {Object} options - Generation options
   * @returns {Object} Formatted report data
   */
  executiveTemplate(data, options) {
    const { url, scannedAt, issues, score, metrics, competitors } = data;
    
    // Start with a simplified summary
    const report = {
      title: `SEO Executive Report - ${url}`,
      url,
      scannedAt,
      score,
      executiveSummary: this.generateExecutiveSummary(data),
      businessImpact: this.assessBusinessImpact(issues),
      competitiveAnalysis: this.generateCompetitiveAnalysis(data),
      actionPlan: this.generateActionPlan(issues),
      keyMetrics: {
        loadTime: metrics.loadTime,
        mobileCompatibility: metrics.mobileCompatibility,
        securityScore: metrics.securityScore,
        contentQuality: metrics.contentQuality
      }
    };
    
    return report;
  }

  // Helper methods for report generation
  
  /**
   * Group issues by severity level
   * @param {Array} issues - List of SEO issues
   * @returns {Object} Issues grouped by severity
   */
  groupIssuesBySeverity(issues) {
    return issues.reduce((groups, issue) => {
      const severity = issue.severity.toLowerCase();
      if (!groups[severity]) {
        groups[severity] = [];
      }
      groups[severity].push(issue);
      return groups;
    }, { critical: [], high: [], medium: [], low: [] });
  }
  
  /**
   * Get the top issues by severity
   * @param {Array} issues - List of SEO issues
   * @param {Number} limit - Maximum number of issues to return
   * @returns {Array} Top issues
   */
  getTopIssues(issues, limit = 5) {
    return issues
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity.toLowerCase()] - severityOrder[b.severity.toLowerCase()];
      })
      .slice(0, limit)
      .map(issue => ({
        title: issue.title,
        severity: issue.severity,
        description: issue.description
      }));
  }
  
  /**
   * Generate technical section of the report
   * @param {Object} data - Scan data
   * @returns {Object} Technical section content
   */
  generateTechnicalSection(data) {
    // Filter issues related to technical SEO
    const technicalIssues = data.issues.filter(issue => 
      issue.category === 'technical' || 
      issue.tags.includes('technical')
    );
    
    return {
      summary: `Found ${technicalIssues.length} technical SEO issues`,
      issues: technicalIssues,
      metrics: {
        sitemapStatus: data.metrics.sitemapStatus,
        robotsTxt: data.metrics.robotsTxt,
        crawlability: data.metrics.crawlability
      }
    };
  }
  
  /**
   * Generate performance section of the report
   * @param {Object} data - Scan data
   * @returns {Object} Performance section content
   */
  generatePerformanceSection(data) {
    // Filter issues related to performance
    const performanceIssues = data.issues.filter(issue => 
      issue.category === 'performance' || 
      issue.tags.includes('performance')
    );
    
    return {
      summary: `Found ${performanceIssues.length} performance issues`,
      issues: performanceIssues,
      metrics: {
        loadTime: data.metrics.loadTime,
        firstContentfulPaint: data.metrics.firstContentfulPaint,
        largestContentfulPaint: data.metrics.largestContentfulPaint,
        cumulativeLayoutShift: data.metrics.cumulativeLayoutShift
      }
    };
  }
  
  /**
   * Generate content section of the report
   * @param {Object} data - Scan data
   * @returns {Object} Content section content
   */
  generateContentSection(data) {
    // Filter issues related to content
    const contentIssues = data.issues.filter(issue => 
      issue.category === 'content' || 
      issue.tags.includes('content')
    );
    
    return {
      summary: `Found ${contentIssues.length} content-related issues`,
      issues: contentIssues,
      metrics: {
        contentQuality: data.metrics.contentQuality,
        readabilityScore: data.metrics.readabilityScore,
        keywordDensity: data.metrics.keywordDensity
      }
    };
  }
  
  /**
   * Generate mobile section of the report
   * @param {Object} data - Scan data
   * @returns {Object} Mobile section content
   */
  generateMobileSection(data) {
    // Filter issues related to mobile
    const mobileIssues = data.issues.filter(issue => 
      issue.category === 'mobile' || 
      issue.tags.includes('mobile')
    );
    
    return {
      summary: `Found ${mobileIssues.length} mobile compatibility issues`,
      issues: mobileIssues,
      metrics: {
        mobileCompatibility: data.metrics.mobileCompatibility,
        viewportConfiguration: data.metrics.viewportConfiguration,
        touchTargetSize: data.metrics.touchTargetSize
      }
    };
  }
  
  /**
   * Generate security section of the report
   * @param {Object} data - Scan data
   * @returns {Object} Security section content
   */
  generateSecuritySection(data) {
    // Filter issues related to security
    const securityIssues = data.issues.filter(issue => 
      issue.category === 'security' || 
      issue.tags.includes('security')
    );
    
    return {
      summary: `Found ${securityIssues.length} security issues`,
      issues: securityIssues,
      metrics: {
        securityScore: data.metrics.securityScore,
        httpsStatus: data.metrics.httpsStatus,
        mixedContent: data.metrics.mixedContent
      }
    };
  }
  
  /**
   * Generate recommendations for an issue
   * @param {Object} issue - The SEO issue
   * @returns {Array} List of recommendations
   */
  generateRecommendations(issue) {
    // In a real implementation, this would use more sophisticated logic
    // based on the issue type and context
    if (!issue.recommendations || issue.recommendations.length === 0) {
      return [
        `Fix the ${issue.title} issue to improve your SEO score`,
        `Consider implementing best practices for ${issue.category} optimization`
      ];
    }
    
    return issue.recommendations;
  }
  
  /**
   * Generate an executive summary
   * @param {Object} data - Scan data
   * @returns {String} Executive summary text
   */
  generateExecutiveSummary(data) {
    const { url, score, issues } = data;
    const criticalCount = issues.filter(i => i.severity.toLowerCase() === 'critical').length;
    const highCount = issues.filter(i => i.severity.toLowerCase() === 'high').length;
    
    let status = 'excellent';
    if (criticalCount > 0) {
      status = 'critical';
    } else if (highCount > 0) {
      status = 'needs improvement';
    } else if (score < 80) {
      status = 'average';
    } else if (score < 90) {
      status = 'good';
    }
    
    return `The SEO performance of ${url} is currently ${status} with an overall score of ${score}/100. ` +
           `We identified ${issues.length} issues (${criticalCount} critical, ${highCount} high priority) ` +
           `that impact your site's search engine visibility and performance. Addressing these issues ` +
           `could significantly improve your ranking and organic traffic.`;
  }
  
  /**
   * Assess the business impact of SEO issues
   * @param {Array} issues - List of SEO issues
   * @returns {Object} Business impact assessment
   */
  assessBusinessImpact(issues) {
    // Group issues by business impact
    const impactGroups = issues.reduce((groups, issue) => {
      const impact = issue.businessImpact || 'unknown';
      if (!groups[impact]) {
        groups[impact] = [];
      }
      groups[impact].push(issue);
      return groups;
    }, { visibility: [], conversion: [], traffic: [], reputation: [], unknown: [] });
    
    return {
      visibility: {
        issues: impactGroups.visibility.length,
        description: 'Issues affecting your site visibility in search engines'
      },
      conversion: {
        issues: impactGroups.conversion.length,
        description: 'Issues affecting user conversion and engagement'
      },
      traffic: {
        issues: impactGroups.traffic.length,
        description: 'Issues affecting organic traffic to your site'
      },
      reputation: {
        issues: impactGroups.reputation.length,
        description: 'Issues affecting your site reputation and authority'
      }
    };
  }
  
  /**
   * Generate competitive analysis section
   * @param {Object} data - Scan data with competitor information
   * @returns {Object} Competitive analysis content
   */
  generateCompetitiveAnalysis(data) {
    const { competitors } = data;
    
    if (!competitors || competitors.length === 0) {
      return {
        summary: 'No competitor data available for analysis',
        comparison: []
      };
    }
    
    return {
      summary: `Analyzed ${competitors.length} competitors in your niche`,
      comparison: competitors.map(competitor => ({
        name: competitor.name,
        url: competitor.url,
        score: competitor.score,
        strengths: competitor.strengths,
        weaknesses: competitor.weaknesses,
        scoreDifference: data.score - competitor.score
      }))
    };
  }
  
  /**
   * Generate an action plan based on issues
   * @param {Array} issues - List of SEO issues
   * @returns {Array} Prioritized action items
   */
  generateActionPlan(issues) {
    // Sort issues by priority (severity and impact)
    const prioritizedIssues = [...issues].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff = severityOrder[a.severity.toLowerCase()] - severityOrder[b.severity.toLowerCase()];
      
      if (severityDiff !== 0) return severityDiff;
      
      // If same severity, sort by effort (low effort first)
      const effortOrder = { low: 0, medium: 1, high: 2 };
      return (effortOrder[a.effort] || 1) - (effortOrder[b.effort] || 1);
    });
    
    // Create action items from prioritized issues
    return prioritizedIssues.slice(0, 10).map((issue, index) => ({
      priority: index + 1,
      title: `Fix: ${issue.title}`,
      description: issue.description,
      severity: issue.severity,
      effort: issue.effort || 'medium',
      impact: issue.businessImpact || 'visibility',
      recommendation: this.generateRecommendations(issue)[0]
    }));
  }
}

module.exports = ReportGenerator;