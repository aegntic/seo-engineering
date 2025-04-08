/**
 * Technical SEO Checks Module
 * 
 * This module provides comprehensive technical SEO auditing capabilities
 * to identify and help resolve common technical issues that affect search engine rankings.
 */

const PageSpeedAnalyzer = require('./analyzers/page-speed');
const MetaTagValidator = require('./analyzers/meta-tags');
const SchemaMarkupChecker = require('./analyzers/schema-markup');
const SslVerifier = require('./analyzers/ssl');
const CrawlabilityChecker = require('./analyzers/crawlability');
const ContentQualityAnalyzer = require('./analyzers/content-quality');
const UrlStructureChecker = require('./analyzers/url-structure');
const SiteArchitectureAnalyzer = require('./analyzers/site-architecture');
const InternationalSeoChecker = require('./analyzers/international-seo');
const JSErrorDetector = require('./analyzers/js-error-detector');
const BrokenLinkIdentifier = require('./analyzers/broken-link-identifier');
const AdvancedSeoScoreCalculator = require('./analyzers/advanced-seo-score');
const { calculateOverallScore } = require('./utils/scoring');
const { prioritizeIssues } = require('./utils/prioritization');
const { generateTechnicalReport } = require('./reporting/technical-report');

// Mobile Optimization Integration
const { runMobileChecks, generateMobileRecommendations } = require('./integrations/mobile-optimization-integration');

/**
 * Runs a comprehensive technical SEO audit on a website
 * @param {string} url - The URL of the website to audit
 * @param {Object} options - Configuration options for the audit
 * @returns {Promise<Object>} - The audit results
 */
async function runTechnicalSeoAudit(url, options = {}) {
  try {
    // Default options
    const defaultOptions = {
      maxPages: 100,
      userAgent: 'SEO.engineering/1.0',
      includeSubdomains: false,
      checkExternal: false,
      depth: 3,
      timeout: 30000, // 30 seconds
      checks: {
        pageSpeed: true,
        mobileOptimization: true, // New integrated mobile checks
        metaTags: true,
        schemaMarkup: true,
        ssl: true,
        crawlability: true,
        contentQuality: true,
        urlStructure: true,
        siteArchitecture: true,
        internationalSeo: false,
        javascriptErrors: true,
        brokenLinks: true,
        advancedSeoScore: true
      },
      mobileChecks: {
        viewportConfig: true,
        touchElements: true,
        responsiveDesign: true,
        mobilePerformance: true
      }
    };

    // Merge default options with user-provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    if (typeof mergedOptions.checks === 'object') {
      mergedOptions.checks = { ...defaultOptions.checks, ...mergedOptions.checks };
    }

    console.log(`Starting technical SEO audit for: ${url}`);
    
    // Initialize results object
    const results = {
      url,
      scanDate: new Date().toISOString(),
      scores: {},
      issues: [],
      recommendations: [],
      summary: {}
    };
    
    // Run enabled checks in parallel
    const checkPromises = [];
    
    if (mergedOptions.checks.pageSpeed) {
      checkPromises.push(
        PageSpeedAnalyzer.analyze(url, mergedOptions)
          .then(data => {
            results.scores.pageSpeed = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.pageSpeed = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.mobileOptimization) {
      checkPromises.push(
        runMobileChecks(url, {
          userAgent: mergedOptions.userAgent,
          timeout: mergedOptions.timeout,
          devices: mergedOptions.devices,
          mobileChecks: mergedOptions.mobileChecks
        })
          .then(data => {
            results.scores.mobileOptimization = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.mobileOptimization = data.summary;
            
            // Store detailed mobile data for reporting
            results.mobileDetails = data.details;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.metaTags) {
      checkPromises.push(
        MetaTagValidator.validate(url, mergedOptions)
          .then(data => {
            results.scores.metaTags = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.metaTags = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.schemaMarkup) {
      checkPromises.push(
        SchemaMarkupChecker.check(url, mergedOptions)
          .then(data => {
            results.scores.schemaMarkup = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.schemaMarkup = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.ssl) {
      checkPromises.push(
        SslVerifier.verify(url, mergedOptions)
          .then(data => {
            results.scores.ssl = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.ssl = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.crawlability) {
      checkPromises.push(
        CrawlabilityChecker.check(url, mergedOptions)
          .then(data => {
            results.scores.crawlability = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.crawlability = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.contentQuality) {
      checkPromises.push(
        ContentQualityAnalyzer.analyze(url, mergedOptions)
          .then(data => {
            results.scores.contentQuality = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.contentQuality = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.urlStructure) {
      checkPromises.push(
        UrlStructureChecker.check(url, mergedOptions)
          .then(data => {
            results.scores.urlStructure = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.urlStructure = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.siteArchitecture) {
      checkPromises.push(
        SiteArchitectureAnalyzer.analyze(url, mergedOptions)
          .then(data => {
            results.scores.siteArchitecture = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.siteArchitecture = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.internationalSeo) {
      checkPromises.push(
        InternationalSeoChecker.check(url, mergedOptions)
          .then(data => {
            results.scores.internationalSeo = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.internationalSeo = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.javascriptErrors) {
      checkPromises.push(
        JSErrorDetector.detect(url, mergedOptions)
          .then(data => {
            results.scores.javascriptErrors = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.javascriptErrors = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.brokenLinks) {
      checkPromises.push(
        BrokenLinkIdentifier.identify(url, mergedOptions)
          .then(data => {
            results.scores.brokenLinks = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.brokenLinks = data.summary;
            return data;
          })
      );
    }
    
    // Wait for all checks to complete
    await Promise.all(checkPromises);
    
    // Calculate overall score
    results.scores.overall = calculateOverallScore(results.scores);
    
    // Calculate advanced SEO score if enabled
    if (mergedOptions.checks.advancedSeoScore) {
      try {
        const advancedScoreResults = await AdvancedSeoScoreCalculator.calculate(url, results, {
          industry: mergedOptions.industry,
          vertical: mergedOptions.vertical,
          competitorData: mergedOptions.competitorData,
          historicalData: mergedOptions.historicalData
        });
        
        // Store advanced score data
        results.advancedScore = advancedScoreResults;
        
        // Update overall score with advanced calculation if it exists
        if (advancedScoreResults.score && advancedScoreResults.score.overall) {
          results.scores.advancedOverall = advancedScoreResults.score.overall;
          
          // Add advanced score recommendations to the main recommendations
          if (advancedScoreResults.recommendations && advancedScoreResults.recommendations.length > 0) {
            if (!results.recommendations) {
              results.recommendations = [];
            }
            results.recommendations = [
              ...results.recommendations,
              ...advancedScoreResults.recommendations
            ];
          }
          
          // Add advanced score issues to the main issues list
          if (advancedScoreResults.issues && advancedScoreResults.issues.length > 0) {
            results.issues = [
              ...results.issues,
              ...advancedScoreResults.issues
            ];
          }
        }
      } catch (error) {
        console.error('Error calculating advanced SEO score:', error);
        // Continue without advanced score
      }
    }
    
    // Prioritize issues
    results.issues = prioritizeIssues(results.issues);
    
    // Generate recommendations based on issues
    results.recommendations = generateRecommendations(results.issues);
    
    // Generate report summary
    results.summary.overall = {
      score: results.scores.overall,
      totalIssues: results.issues.length,
      criticalIssues: results.issues.filter(issue => issue.severity === 'critical').length,
      highIssues: results.issues.filter(issue => issue.severity === 'high').length,
      mediumIssues: results.issues.filter(issue => issue.severity === 'medium').length,
      lowIssues: results.issues.filter(issue => issue.severity === 'low').length,
    };
    
    console.log(`Technical SEO audit completed for: ${url}`);
    
    return results;
  } catch (error) {
    console.error(`Error running technical SEO audit for ${url}:`, error);
    throw error;
  }
}

/**
 * Generate recommendations based on discovered issues
 * @param {Array} issues - List of technical SEO issues
 * @returns {Array} - List of recommendations
 */
function generateRecommendations(issues) {
  // This is a placeholder - will be implemented in detail later
  // For now, we'll return a basic recommendation for each issue
  return issues.map(issue => ({
    id: `rec-${issue.id}`,
    title: `Fix: ${issue.title}`,
    description: `We recommend addressing this issue by ${issue.recommendation || 'following best practices'}`,
    priority: issue.severity,
    impact: issue.impact || 'unknown',
    effort: issue.effort || 'medium',
    category: issue.category
  }));
}

/**
 * Generate a full technical SEO report
 * @param {Object} auditResults - Results from runTechnicalSeoAudit
 * @param {Object} options - Report options
 * @returns {Object} - Formatted report
 */
function generateReport(auditResults, options = {}) {
  return generateTechnicalReport(auditResults, options);
}

module.exports = {
  runTechnicalSeoAudit,
  generateReport,
  analyzers: {
    PageSpeedAnalyzer,
    MetaTagValidator,
    SchemaMarkupChecker,
    SslVerifier,
    CrawlabilityChecker,
    ContentQualityAnalyzer,
    UrlStructureChecker,
    SiteArchitectureAnalyzer,
    InternationalSeoChecker,
    JSErrorDetector,
    BrokenLinkIdentifier,
    AdvancedSeoScoreCalculator
  },
  integrations: {
    mobileOptimization: {
      runMobileChecks,
      generateMobileRecommendations
    }
  }
};
