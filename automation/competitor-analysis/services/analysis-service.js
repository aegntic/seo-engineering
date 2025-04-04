/**
 * Competitor Analysis Service
 * 
 * This service coordinates the competitor analysis process, from crawling
 * competitor websites to generating analysis reports.
 */

const CompetitorCrawler = require('../crawlers/competitor-crawler');
const { createConfig } = require('../config/crawler-config');
const { createGapAnalysisService } = require('./gap-analysis');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

class CompetitorAnalysisService {
  /**
   * Create a new competitor analysis service
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.config = createConfig(options);
    this.outputDir = options.outputDir || path.join(process.cwd(), 'competitor-analysis');
    this.dataDir = path.join(this.outputDir, 'data');
    this.reportsDir = path.join(this.outputDir, 'reports');
    this.crawler = null;
    this.activeJobs = new Map();
    this.jobCounter = 0;
    this.gapAnalysisService = createGapAnalysisService({
      outputDir: this.outputDir
    });
  }

  /**
   * Initialize the service
   * @returns {Promise<void>}
   */
  async initialize() {
    logger.info('Initializing competitor analysis service');
    
    // Create output directories
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.mkdir(this.reportsDir, { recursive: true });
    
    // Initialize crawler
    this.crawler = new CompetitorCrawler({
      outputDir: this.dataDir,
      ...this.config
    });
    
    await this.crawler.initialize();
    
    logger.info('Competitor analysis service initialized');
  }

  /**
   * Run a competitor analysis job
   * @param {Object} options Analysis options
   * @param {Array} options.competitors List of competitor URLs
   * @param {string} options.clientSiteUrl URL of the client's site for comparison
   * @param {Array} options.keywords Keywords to analyze
   * @param {Object} options.crawlerOptions Specific options for the crawler
   * @returns {Promise<Object>} Job information including ID
   */
  async runAnalysis(options) {
    if (!this.crawler) {
      await this.initialize();
    }
    
    // Generate a unique job ID
    const jobId = this._generateJobId();
    
    // Validate input options
    if (!options.competitors || !Array.isArray(options.competitors) || options.competitors.length === 0) {
      throw new Error('At least one competitor URL must be provided');
    }
    
    if (!options.clientSiteUrl) {
      logger.warn('No client site URL provided for comparison. Some analyses will be limited.');
    }
    
    // Create job structure
    const job = {
      id: jobId,
      status: 'initializing',
      startTime: Date.now(),
      options,
      progress: {
        total: options.competitors.length,
        completed: 0,
        failed: 0
      },
      results: {},
      error: null
    };
    
    // Store job in active jobs map
    this.activeJobs.set(jobId, job);
    
    // Start analysis process asynchronously
    this._processAnalysisJob(job).catch(err => {
      logger.error(`Error in job ${jobId}: ${err.message}`);
      job.status = 'failed';
      job.error = err.message;
    });
    
    // Return job information
    return {
      jobId,
      status: job.status,
      competitors: options.competitors.length
    };
  }

  /**
   * Get the status of an analysis job
   * @param {string} jobId The job ID
   * @returns {Object} Job status information
   */
  getJobStatus(jobId) {
    const job = this.activeJobs.get(jobId);
    
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      startTime: job.startTime,
      endTime: job.endTime,
      error: job.error
    };
  }

  /**
   * Get the results of a completed analysis job
   * @param {string} jobId The job ID
   * @returns {Object} Analysis results
   */
  async getAnalysisResults(jobId) {
    const job = this.activeJobs.get(jobId);
    
    if (!job) {
      // Try to load from file
      try {
        const filePath = path.join(this.reportsDir, `job-${jobId}.json`);
        const fileContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContent);
      } catch (err) {
        throw new Error(`Job with ID ${jobId} not found`);
      }
    }
    
    if (job.status !== 'completed') {
      throw new Error(`Job with ID ${jobId} is not completed (status: ${job.status})`);
    }
    
    return job.results;
  }

  /**
   * Process an analysis job
   * @param {Object} job The job to process
   * @returns {Promise<void>}
   * @private
   */
  async _processAnalysisJob(job) {
    try {
      logger.info(`Starting competitor analysis job ${job.id}`);
      job.status = 'crawling';
      
      // Set up event listeners
      this.crawler.on('competitor:complete', data => {
        job.progress.completed++;
        
        if (!data.success) {
          job.progress.failed++;
        }
      });
      
      // Crawl competitor websites
      const crawlResults = await this.crawler.analyzeCompetitors(
        job.options.competitors,
        job.options.crawlerOptions
      );
      
      job.status = 'analyzing';
      
      // Analyze the crawl results
      const analysisResults = await this._analyzeCompetitorData(
        crawlResults,
        job.options.clientSiteUrl,
        job.options.keywords
      );
      
      // Generate reports
      job.status = 'generating_reports';
      const reports = await this._generateReports(analysisResults, job.id);
      
      // Update job with results
      job.results = {
        summary: analysisResults.summary,
        competitorData: analysisResults.competitorData,
        reports
      };
      
      job.status = 'completed';
      job.endTime = Date.now();
      job.duration = job.endTime - job.startTime;
      
      // Save results to file
      await this._saveJobResults(job);
      
      logger.info(`Completed competitor analysis job ${job.id}`);
    } catch (err) {
      logger.error(`Failed to process job ${job.id}: ${err.message}`);
      job.status = 'failed';
      job.error = err.message;
      job.endTime = Date.now();
      
      // Save failed job results
      await this._saveJobResults(job);
    }
  }

  /**
   * Analyze competitor data to generate insights
   * @param {Object} crawlResults Results from the crawler
   * @param {string} clientSiteUrl URL of the client's site
   * @param {Array} keywords Keywords to analyze
   * @returns {Promise<Object>} Analysis results
   * @private
   */
  async _analyzeCompetitorData(crawlResults, clientSiteUrl, keywords) {
    logger.info('Analyzing competitor data');
    
    // Initialize results structure
    const results = {
      competitorData: {},
      summary: {
        competitors: Object.keys(crawlResults).length,
        averagePerformance: {},
        contentStats: {},
        seoHealthAverage: {},
        keywordUsage: {}
      }
    };
    
    // Process each competitor's data
    for (const [url, data] of Object.entries(crawlResults)) {
      // Skip competitors that failed
      if (data.error) {
        results.competitorData[url] = { error: data.error };
        continue;
      }
      
      // Store competitor data
      results.competitorData[url] = {
        domain: data.domain,
        summary: data.summary,
        keywordAnalysis: keywords ? await this._analyzeKeywords(data, keywords) : null,
        strengthsWeaknesses: this._identifyStrengthsWeaknesses(data)
      };
      
      // Add to summary
      this._updateAnalysisSummary(results.summary, data);
    }
    
    // Calculate averages for summary
    this._calculateAverages(results.summary);
    
    // Compare client site if available
    if (clientSiteUrl && crawlResults[clientSiteUrl]) {
      results.clientSiteComparison = this._compareClientSite(
        crawlResults[clientSiteUrl],
        results
      );
      
      // Perform gap analysis
      logger.info('Performing gap analysis');
      const clientData = crawlResults[clientSiteUrl];
      const competitorsData = { ...crawlResults };
      delete competitorsData[clientSiteUrl];
      
      try {
        const gapAnalysis = await this.gapAnalysisService.analyzeGaps(
          clientData,
          competitorsData,
          keywords
        );
        
        // Add gap analysis to results
        results.gapAnalysis = {
          scores: gapAnalysis.scores,
          gaps: gapAnalysis.getAllGaps(),
          opportunities: gapAnalysis.getAllOpportunities(),
          gapsSortedByImpact: gapAnalysis.getGapsSortedByImpact(),
          opportunitiesSortedByImpact: gapAnalysis.getOpportunitiesSortedByImpact(),
          report: gapAnalysis.generateMarkdownReport()
        };
        
        logger.info('Gap analysis completed successfully');
      } catch (error) {
        logger.error(`Gap analysis failed: ${error.message}`);
        results.gapAnalysis = {
          error: error.message
        };
      }
    }
    
    logger.info('Competitor data analysis completed');
    return results;
  }

  /**
   * Analyze keyword usage in competitor content
   * @param {Object} competitorData Competitor data
   * @param {Array} keywords Keywords to analyze
   * @returns {Promise<Object>} Keyword analysis results
   * @private
   */
  async _analyzeKeywords(competitorData, keywords) {
    const keywordResults = {};
    
    // Convert keywords to lowercase for case-insensitive matching
    const keywordsLower = keywords.map(keyword => keyword.toLowerCase());
    
    // Count keyword occurrences in page content and metadata
    for (const [url, pageData] of Object.entries(competitorData.pages)) {
      const pageContent = pageData.content?.text || '';
      const contentLower = pageContent.toLowerCase();
      
      keywordsLower.forEach((keyword, index) => {
        const originalKeyword = keywords[index];
        
        if (!keywordResults[originalKeyword]) {
          keywordResults[originalKeyword] = {
            occurrences: 0,
            pages: 0,
            inTitle: 0,
            inDescription: 0,
            inHeadings: 0
          };
        }
        
        // Count in content
        const matches = contentLower.match(new RegExp(keyword, 'g'));
        const occurrences = matches ? matches.length : 0;
        
        if (occurrences > 0) {
          keywordResults[originalKeyword].occurrences += occurrences;
          keywordResults[originalKeyword].pages++;
        }
        
        // Check in title
        if (pageData.seo?.title && pageData.seo.title.toLowerCase().includes(keyword)) {
          keywordResults[originalKeyword].inTitle++;
        }
        
        // Check in description
        if (pageData.seo?.description && pageData.seo.description.toLowerCase().includes(keyword)) {
          keywordResults[originalKeyword].inDescription++;
        }
        
        // Check in headings
        let inHeadings = 0;
        for (const [headingType, headings] of Object.entries(pageData.content?.headings || {})) {
          headings.forEach(heading => {
            if (heading.toLowerCase().includes(keyword)) {
              inHeadings++;
            }
          });
        }
        
        if (inHeadings > 0) {
          keywordResults[originalKeyword].inHeadings += inHeadings;
        }
      });
    }
    
    // Calculate density and importance scores
    const totalPages = Object.keys(competitorData.pages).length;
    
    for (const [keyword, data] of Object.entries(keywordResults)) {
      data.density = totalPages > 0 ? (data.pages / totalPages) * 100 : 0;
      
      // Calculate an importance score (0-100)
      data.importanceScore = this._calculateKeywordImportance(
        data.inTitle,
        data.inDescription,
        data.inHeadings,
        data.density
      );
    }
    
    return keywordResults;
  }

  /**
   * Calculate keyword importance score
   * @param {number} inTitle Number of pages with keyword in title
   * @param {number} inDescription Number of pages with keyword in description
   * @param {number} inHeadings Number of headings containing the keyword
   * @param {number} density Percentage of pages containing the keyword
   * @returns {number} Importance score (0-100)
   * @private
   */
  _calculateKeywordImportance(inTitle, inDescription, inHeadings, density) {
    // Simple weighted score calculation
    // Title presence is most important, followed by headings, description, and density
    const weightTitle = 40;
    const weightHeadings = 30;
    const weightDescription = 20;
    const weightDensity = 10;
    
    // Normalize inputs to 0-1 range (assuming reasonable maximums)
    const normalizedTitle = Math.min(inTitle / 5, 1);
    const normalizedHeadings = Math.min(inHeadings / 10, 1);
    const normalizedDescription = Math.min(inDescription / 5, 1);
    const normalizedDensity = Math.min(density / 100, 1);
    
    // Calculate weighted score
    const score = (
      (normalizedTitle * weightTitle) +
      (normalizedHeadings * weightHeadings) +
      (normalizedDescription * weightDescription) +
      (normalizedDensity * weightDensity)
    );
    
    return Math.round(score);
  }

  /**
   * Identify strengths and weaknesses of a competitor
   * @param {Object} competitorData Competitor data
   * @returns {Object} Strengths and weaknesses
   * @private
   */
  _identifyStrengthsWeaknesses(competitorData) {
    const strengths = [];
    const weaknesses = [];
    const summary = competitorData.summary;
    
    // Performance strengths/weaknesses
    if (summary.averagePerformance.domContentLoaded < 1000) {
      strengths.push({ 
        category: 'Performance', 
        item: 'Fast DOM Content Loaded time', 
        value: `${summary.averagePerformance.domContentLoaded.toFixed(2)}ms` 
      });
    } else if (summary.averagePerformance.domContentLoaded > 2500) {
      weaknesses.push({ 
        category: 'Performance', 
        item: 'Slow DOM Content Loaded time', 
        value: `${summary.averagePerformance.domContentLoaded.toFixed(2)}ms` 
      });
    }
    
    if (summary.averagePerformance.load < 3000) {
      strengths.push({ 
        category: 'Performance', 
        item: 'Fast page load time', 
        value: `${summary.averagePerformance.load.toFixed(2)}ms` 
      });
    } else if (summary.averagePerformance.load > 5000) {
      weaknesses.push({ 
        category: 'Performance', 
        item: 'Slow page load time', 
        value: `${summary.averagePerformance.load.toFixed(2)}ms` 
      });
    }
    
    // Content strengths/weaknesses
    if (summary.contentStats.averageTitleLength > 30 && summary.contentStats.averageTitleLength < 60) {
      strengths.push({ 
        category: 'Content', 
        item: 'Optimal title lengths', 
        value: `${Math.round(summary.contentStats.averageTitleLength)} characters` 
      });
    } else if (summary.contentStats.averageTitleLength < 20 || summary.contentStats.averageTitleLength > 70) {
      weaknesses.push({ 
        category: 'Content', 
        item: 'Suboptimal title lengths', 
        value: `${Math.round(summary.contentStats.averageTitleLength)} characters` 
      });
    }
    
    if (summary.contentStats.averageDescriptionLength > 120 && summary.contentStats.averageDescriptionLength < 160) {
      strengths.push({ 
        category: 'Content', 
        item: 'Optimal meta description lengths', 
        value: `${Math.round(summary.contentStats.averageDescriptionLength)} characters` 
      });
    } else if (summary.contentStats.averageDescriptionLength < 70 || summary.contentStats.averageDescriptionLength > 320) {
      weaknesses.push({ 
        category: 'Content', 
        item: 'Suboptimal meta description lengths', 
        value: `${Math.round(summary.contentStats.averageDescriptionLength)} characters` 
      });
    }
    
    // SEO health strengths/weaknesses
    if (summary.seoHealth.missingTitlesPercent < 5) {
      strengths.push({ 
        category: 'SEO', 
        item: 'Consistent page titles', 
        value: `${(100 - summary.seoHealth.missingTitlesPercent).toFixed(1)}% of pages have titles` 
      });
    } else if (summary.seoHealth.missingTitlesPercent > 20) {
      weaknesses.push({ 
        category: 'SEO', 
        item: 'Missing page titles', 
        value: `${summary.seoHealth.missingTitlesPercent.toFixed(1)}% of pages missing titles` 
      });
    }
    
    if (summary.seoHealth.missingDescriptionsPercent < 10) {
      strengths.push({ 
        category: 'SEO', 
        item: 'Good meta description coverage', 
        value: `${(100 - summary.seoHealth.missingDescriptionsPercent).toFixed(1)}% of pages have descriptions` 
      });
    } else if (summary.seoHealth.missingDescriptionsPercent > 30) {
      weaknesses.push({ 
        category: 'SEO', 
        item: 'Missing meta descriptions', 
        value: `${summary.seoHealth.missingDescriptionsPercent.toFixed(1)}% of pages missing descriptions` 
      });
    }
    
    if (summary.seoHealth.hasSchemaMarkupPercent > 50) {
      strengths.push({ 
        category: 'SEO', 
        item: 'Good schema markup usage', 
        value: `${summary.seoHealth.hasSchemaMarkupPercent.toFixed(1)}% of pages have schema markup` 
      });
    } else if (summary.seoHealth.hasSchemaMarkupPercent < 10) {
      weaknesses.push({ 
        category: 'SEO', 
        item: 'Limited schema markup usage', 
        value: `${summary.seoHealth.hasSchemaMarkupPercent.toFixed(1)}% of pages have schema markup` 
      });
    }
    
    // Image optimization
    const totalImages = (competitorData.seo.images.withAlt || 0) + (competitorData.seo.images.withoutAlt || 0);
    if (totalImages > 0) {
      const altTextPercentage = (competitorData.seo.images.withAlt || 0) / totalImages * 100;
      
      if (altTextPercentage > 80) {
        strengths.push({ 
          category: 'Accessibility', 
          item: 'Good image alt text usage', 
          value: `${altTextPercentage.toFixed(1)}% of images have alt text` 
        });
      } else if (altTextPercentage < 50) {
        weaknesses.push({ 
          category: 'Accessibility', 
          item: 'Poor image alt text usage', 
          value: `${(100 - altTextPercentage).toFixed(1)}% of images missing alt text` 
        });
      }
    }
    
    return { strengths, weaknesses };
  }

  /**
   * Update analysis summary with competitor data
   * @param {Object} summary The summary object to update
   * @param {Object} competitorData Competitor data
   * @private
   */
  _updateAnalysisSummary(summary, competitorData) {
    // Update performance averages
    for (const [metric, data] of Object.entries(competitorData.summary.averagePerformance)) {
      if (!summary.averagePerformance[metric]) {
        summary.averagePerformance[metric] = {
          sum: 0,
          count: 0
        };
      }
      
      summary.averagePerformance[metric].sum += data;
      summary.averagePerformance[metric].count++;
    }
    
    // Update content stats
    for (const [stat, value] of Object.entries(competitorData.summary.contentStats)) {
      if (stat === 'headingsDistribution') {
        // Handle heading distributions separately
        if (!summary.contentStats.headingsDistribution) {
          summary.contentStats.headingsDistribution = {};
        }
        
        for (const [headingType, count] of Object.entries(value)) {
          if (!summary.contentStats.headingsDistribution[headingType]) {
            summary.contentStats.headingsDistribution[headingType] = 0;
          }
          
          summary.contentStats.headingsDistribution[headingType] += count;
        }
      } else {
        // Handle numeric stats
        if (!summary.contentStats[stat]) {
          summary.contentStats[stat] = {
            sum: 0,
            count: 0
          };
        }
        
        summary.contentStats[stat].sum += value;
        summary.contentStats[stat].count++;
      }
    }
    
    // Update SEO health metrics
    for (const [metric, value] of Object.entries(competitorData.summary.seoHealth)) {
      // Skip percentage fields
      if (metric.endsWith('Percent')) {
        continue;
      }
      
      if (!summary.seoHealthAverage[metric]) {
        summary.seoHealthAverage[metric] = {
          sum: 0,
          count: 0
        };
      }
      
      summary.seoHealthAverage[metric].sum += value;
      summary.seoHealthAverage[metric].count++;
    }
  }

  /**
   * Calculate averages for the analysis summary
   * @param {Object} summary The summary object
   * @private
   */
  _calculateAverages(summary) {
    // Calculate performance averages
    const avgPerformance = {};
    for (const [metric, data] of Object.entries(summary.averagePerformance)) {
      if (data.count > 0) {
        avgPerformance[metric] = data.sum / data.count;
      }
    }
    summary.averagePerformance = avgPerformance;
    
    // Calculate content stat averages
    const avgContentStats = {
      headingsDistribution: summary.contentStats.headingsDistribution
    };
    
    for (const [stat, data] of Object.entries(summary.contentStats)) {
      if (stat !== 'headingsDistribution' && data.count > 0) {
        avgContentStats[stat] = data.sum / data.count;
      }
    }
    summary.contentStats = avgContentStats;
    
    // Calculate SEO health averages
    const avgSeoHealth = {};
    for (const [metric, data] of Object.entries(summary.seoHealthAverage)) {
      if (data.count > 0) {
        avgSeoHealth[metric] = data.sum / data.count;
        
        // Calculate percentage versions
        if (!metric.endsWith('Percent')) {
          avgSeoHealth[`${metric}Percent`] = avgSeoHealth[metric] / summary.competitors * 100;
        }
      }
    }
    summary.seoHealthAverage = avgSeoHealth;
  }

  /**
   * Compare client site to competitors
   * @param {Object} clientSiteData Client site data
   * @param {Object} analysisResults Overall analysis results
   * @returns {Object} Comparison results
   * @private
   */
  _compareClientSite(clientSiteData, analysisResults) {
    const comparison = {
      performance: {},
      content: {},
      seoHealth: {},
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
    
    // Compare performance metrics
    for (const [metric, avg] of Object.entries(analysisResults.summary.averagePerformance)) {
      const clientValue = clientSiteData.summary.averagePerformance[metric];
      
      if (clientValue !== undefined && avg !== undefined) {
        const diff = avg - clientValue;
        const percentDiff = avg > 0 ? (diff / avg) * 100 : 0;
        
        comparison.performance[metric] = {
          clientValue,
          competitorAverage: avg,
          difference: diff,
          percentDifference: percentDiff,
          isBetter: diff > 0 // For load times, lower is better
        };
        
        // Add to strengths/weaknesses based on performance comparison
        if (Math.abs(percentDiff) > 20) {
          if (diff > 0) {
            comparison.strengths.push({
              category: 'Performance',
              item: `Better ${this._formatMetricName(metric)}`,
              value: `${percentDiff.toFixed(1)}% better than average`
            });
          } else {
            comparison.weaknesses.push({
              category: 'Performance',
              item: `Worse ${this._formatMetricName(metric)}`,
              value: `${Math.abs(percentDiff).toFixed(1)}% worse than average`
            });
            
            comparison.recommendations.push({
              category: 'Performance',
              item: `Improve ${this._formatMetricName(metric)}`,
              description: `Your site's ${this._formatMetricName(metric)} is ${Math.abs(percentDiff).toFixed(1)}% slower than competitors. Consider optimization techniques like image compression, code minification, or server-side caching.`
            });
          }
        }
      }
    }
    
    // Compare content metrics
    for (const [stat, avg] of Object.entries(analysisResults.summary.contentStats)) {
      if (stat === 'headingsDistribution') continue;
      
      const clientValue = clientSiteData.summary.contentStats[stat];
      
      if (clientValue !== undefined && avg !== undefined) {
        const diff = clientValue - avg;
        const percentDiff = avg > 0 ? (diff / avg) * 100 : 0;
        
        comparison.content[stat] = {
          clientValue,
          competitorAverage: avg,
          difference: diff,
          percentDifference: percentDiff
        };
        
        // Add content-specific recommendations
        if (stat === 'averageTitleLength') {
          if (clientValue < 30) {
            comparison.recommendations.push({
              category: 'Content',
              item: 'Increase page title lengths',
              description: 'Your average title length is too short. Aim for 50-60 characters to improve SEO.'
            });
          } else if (clientValue > 70) {
            comparison.recommendations.push({
              category: 'Content',
              item: 'Decrease page title lengths',
              description: 'Your average title length is too long. Keep titles under 60 characters to avoid truncation in search results.'
            });
          }
        } else if (stat === 'averageDescriptionLength') {
          if (clientValue < 80) {
            comparison.recommendations.push({
              category: 'Content',
              item: 'Increase meta description lengths',
              description: 'Your average meta description length is too short. Aim for 120-158 characters for optimal display in search results.'
            });
          } else if (clientValue > 160) {
            comparison.recommendations.push({
              category: 'Content',
              item: 'Optimize meta description lengths',
              description: 'Your average meta description length is too long. Keep descriptions under 160 characters to avoid truncation in search results.'
            });
          }
        }
      }
    }
    
    // Compare SEO health metrics
    for (const [metric, avg] of Object.entries(analysisResults.summary.seoHealthAverage)) {
      if (!metric.endsWith('Percent')) continue;
      
      const clientValue = clientSiteData.summary.seoHealth[metric];
      
      if (clientValue !== undefined && avg !== undefined) {
        const diff = clientValue - avg;
        
        comparison.seoHealth[metric] = {
          clientValue,
          competitorAverage: avg,
          difference: diff
        };
        
        // Add SEO-specific recommendations
        if (metric === 'missingTitlesPercent' && clientValue > 5) {
          comparison.recommendations.push({
            category: 'SEO',
            item: 'Fix missing page titles',
            description: `${clientValue.toFixed(1)}% of your pages are missing titles. Add unique and descriptive titles to all pages.`
          });
        } else if (metric === 'missingDescriptionsPercent' && clientValue > 10) {
          comparison.recommendations.push({
            category: 'SEO',
            item: 'Add missing meta descriptions',
            description: `${clientValue.toFixed(1)}% of your pages are missing meta descriptions. Add unique and compelling descriptions to improve click-through rates.`
          });
        } else if (metric === 'hasSchemaMarkupPercent' && clientValue < 30) {
          comparison.recommendations.push({
            category: 'SEO',
            item: 'Implement schema markup',
            description: 'Add structured data markup to improve how search engines understand your content and enable rich snippets in search results.'
          });
        }
      }
    }
    
    return comparison;
  }

  /**
   * Format a metric name for display
   * @param {string} metric The metric name
   * @returns {string} Formatted metric name
   * @private
   */
  _formatMetricName(metric) {
    return metric
      .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/DCL/g, 'DOM Content Loaded') // Replace abbreviations
      .replace(/FCP/g, 'First Contentful Paint')
      .replace(/LCP/g, 'Largest Contentful Paint')
      .replace(/CLS/g, 'Cumulative Layout Shift');
  }

  /**
   * Generate analysis reports
   * @param {Object} analysisResults Analysis results
   * @param {string} jobId Job ID
   * @returns {Promise<Object>} Generated reports
   * @private
   */
  async _generateReports(analysisResults, jobId) {
    logger.info(`Generating reports for job ${jobId}`);
    
    const reports = {
      summary: await this._generateSummaryReport(analysisResults, jobId),
      detailed: await this._generateDetailedReport(analysisResults, jobId)
    };
    
    // Generate gap analysis report if available
    if (analysisResults.gapAnalysis && !analysisResults.gapAnalysis.error) {
      reports.gapAnalysis = await this._generateGapAnalysisReport(analysisResults.gapAnalysis, jobId);
      
      // Generate visualizations for gap analysis
      try {
        const gapAnalysis = {
          ...analysisResults.gapAnalysis,
          calculateScores: () => analysisResults.gapAnalysis.scores,
          generateVisualizationData: () => ({
            radar: {
              categories: Object.keys(analysisResults.gapAnalysis.scores).filter(key => key !== 'overall'),
              clientScores: Object.entries(analysisResults.gapAnalysis.scores)
                .filter(([key]) => key !== 'overall')
                .map(([_, score]) => score)
            },
            comparison: {
              categories: Object.keys(analysisResults.gapAnalysis.scores).filter(key => key !== 'overall')
            },
            opportunities: {
              categories: Object.keys(analysisResults.gapAnalysis.gaps),
              counts: Object.entries(analysisResults.gapAnalysis.gaps).map(([_, gaps]) => gaps.length)
            }
          })
        };
        
        reports.visualizations = await this.gapAnalysisService.generateVisualizations(gapAnalysis, jobId);
      } catch (error) {
        logger.error(`Failed to generate gap analysis visualizations: ${error.message}`);
      }
    }
    
    return reports;
  }
  
  /**
   * Generate a gap analysis report
   * @param {Object} gapAnalysis Gap analysis results
   * @param {string} jobId Job ID
   * @returns {Promise<string>} Report file path
   * @private
   */
  async _generateGapAnalysisReport(gapAnalysis, jobId) {
    const reportPath = path.join(this.reportsDir, `gap-analysis-${jobId}.md`);
    
    // Use the generated markdown report if available
    if (gapAnalysis.report) {
      await fs.writeFile(reportPath, gapAnalysis.report);
      return reportPath;
    }
    
    // Otherwise, generate a report from the gap analysis data
    let reportContent = `# SEO Gap Analysis Report\n\n`;
    reportContent += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    reportContent += `**Job ID:** ${jobId}\n\n`;
    
    // Overall Score
    reportContent += `## Overall Score\n\n`;
    reportContent += `Your site scores **${Math.round(gapAnalysis.scores.overall)}%** compared to competitors.\n\n`;
    
    // Category Scores
    reportContent += `## Category Scores\n\n`;
    reportContent += `| Category | Your Score |\n`;
    reportContent += `|----------|------------|\n`;
    
    const categories = Object.keys(gapAnalysis.scores).filter(key => key !== 'overall');
    
    categories.forEach(category => {
      const score = Math.round(gapAnalysis.scores[category]);
      reportContent += `| ${category.charAt(0).toUpperCase() + category.slice(1)} | ${score}% |\n`;
    });
    
    // Top Opportunities
    reportContent += `\n## Top Opportunities\n\n`;
    
    const topOpportunities = gapAnalysis.opportunitiesSortedByImpact.slice(0, 5);
    
    topOpportunities.forEach((opportunity, index) => {
      reportContent += `### ${index + 1}. ${opportunity.title}\n\n`;
      reportContent += `**Impact Score:** ${opportunity.impactScore.toFixed(1)}/5\n\n`;
      reportContent += `${opportunity.description}\n\n`;
      reportContent += `**Recommended Actions:**\n\n`;
      
      opportunity.actions.forEach(action => {
        reportContent += `- ${action}\n`;
      });
      
      reportContent += `\n`;
    });
    
    // Most Critical Gaps
    reportContent += `## Most Critical Gaps\n\n`;
    
    const criticalGaps = gapAnalysis.gapsSortedByImpact
      .filter(gap => gap.impactScore >= 4)
      .slice(0, 5);
    
    if (criticalGaps.length === 0) {
      reportContent += `No critical gaps identified.\n\n`;
    } else {
      criticalGaps.forEach((gap, index) => {
        reportContent += `### ${index + 1}. ${gap.title} (${gap.category})\n\n`;
        reportContent += `**Impact Score:** ${gap.impactScore.toFixed(1)}/5\n\n`;
        reportContent += `${gap.description}\n\n`;
        
        if (gap.data) {
          reportContent += `**Details:**\n\n`;
          reportContent += `- Current Value: ${gap.data.clientValue}\n`;
          reportContent += `- Competitor Average: ${gap.data.competitorAverage}\n`;
          reportContent += `- Difference: ${gap.data.difference}\n\n`;
        }
      });
    }
    
    // Save the report
    await fs.writeFile(reportPath, reportContent);
    
    return reportPath;
  }

  /**
   * Generate a summary report
   * @param {Object} analysisResults Analysis results
   * @param {string} jobId Job ID
   * @returns {Promise<string>} Report file path
   * @private
   */
  async _generateSummaryReport(analysisResults, jobId) {
    const reportPath = path.join(this.reportsDir, `summary-${jobId}.md`);
    
    // Generate summary report content
    let reportContent = `# Competitor Analysis Summary Report\n\n`;
    reportContent += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    reportContent += `**Job ID:** ${jobId}\n\n`;
    
    // Add overview
    reportContent += `## Overview\n\n`;
    reportContent += `This report provides a summary of the competitive analysis conducted for ${analysisResults.competitorData ? Object.keys(analysisResults.competitorData).length : 0} competitor websites.\n\n`;
    
    // List competitors analyzed
    reportContent += `## Competitors Analyzed\n\n`;
    if (analysisResults.competitorData) {
      reportContent += `| Website | Pages Analyzed | Performance | Status |\n`;
      reportContent += `|---------|----------------|------------|--------|\n`;
      
      for (const [url, data] of Object.entries(analysisResults.competitorData)) {
        if (data.error) {
          reportContent += `| ${url} | - | - | ❌ Failed: ${data.error} |\n`;
        } else {
          const avgLoadTime = data.summary.averagePerformance.load ? 
            `${data.summary.averagePerformance.load.toFixed(2)}ms` : '-';
          
          reportContent += `| ${url} | ${data.summary.pagesAnalyzed} | ${avgLoadTime} | ✅ Success |\n`;
        }
      }
    } else {
      reportContent += `No competitor data available.\n\n`;
    }
    
    // Performance summary
    reportContent += `\n## Performance Summary\n\n`;
    if (analysisResults.summary.averagePerformance) {
      reportContent += `| Metric | Average |\n`;
      reportContent += `|--------|--------|\n`;
      
      for (const [metric, value] of Object.entries(analysisResults.summary.averagePerformance)) {
        if (typeof value === 'number') {
          reportContent += `| ${this._formatMetricName(metric)} | ${value.toFixed(2)}ms |\n`;
        }
      }
    } else {
      reportContent += `No performance data available.\n\n`;
    }
    
    // Content statistics
    reportContent += `\n## Content Statistics\n\n`;
    if (analysisResults.summary.contentStats) {
      reportContent += `| Statistic | Average |\n`;
      reportContent += `|-----------|--------|\n`;
      
      for (const [stat, value] of Object.entries(analysisResults.summary.contentStats)) {
        if (stat !== 'headingsDistribution' && typeof value === 'number') {
          reportContent += `| ${this._formatMetricName(stat)} | ${value.toFixed(2)} |\n`;
        }
      }
      
      // Add heading distribution
      if (analysisResults.summary.contentStats.headingsDistribution) {
        reportContent += `\n### Heading Distribution\n\n`;
        reportContent += `| Heading Type | Count |\n`;
        reportContent += `|--------------|-------|\n`;
        
        for (const [type, count] of Object.entries(analysisResults.summary.contentStats.headingsDistribution)) {
          reportContent += `| ${type} | ${count} |\n`;
        }
      }
    } else {
      reportContent += `No content statistics available.\n\n`;
    }
    
    // SEO health
    reportContent += `\n## SEO Health\n\n`;
    if (analysisResults.summary.seoHealthAverage) {
      reportContent += `| Metric | Average |\n`;
      reportContent += `|--------|--------|\n`;
      
      for (const [metric, value] of Object.entries(analysisResults.summary.seoHealthAverage)) {
        if (metric.endsWith('Percent') && typeof value === 'number') {
          reportContent += `| ${this._formatMetricName(metric.replace('Percent', ''))} | ${value.toFixed(2)}% |\n`;
        }
      }
    } else {
      reportContent += `No SEO health data available.\n\n`;
    }
    
    // Client site comparison
    if (analysisResults.clientSiteComparison) {
      reportContent += `\n## Your Site Comparison\n\n`;
      reportContent += `### Performance Comparison\n\n`;
      reportContent += `| Metric | Your Site | Competitor Average | Difference |\n`;
      reportContent += `|--------|-----------|-------------------|------------|\n`;
      
      for (const [metric, data] of Object.entries(analysisResults.clientSiteComparison.performance)) {
        const diffIcon = data.isBetter ? '✅ ' : '❌ ';
        reportContent += `| ${this._formatMetricName(metric)} | ${data.clientValue.toFixed(2)}ms | ${data.competitorAverage.toFixed(2)}ms | ${diffIcon}${Math.abs(data.percentDifference).toFixed(1)}% ${data.isBetter ? 'better' : 'worse'} |\n`;
      }
      
      // Add recommendations
      if (analysisResults.clientSiteComparison.recommendations.length > 0) {
        reportContent += `\n## Recommendations\n\n`;
        
        const recommendationsByCategory = {};
        
        // Group recommendations by category
        analysisResults.clientSiteComparison.recommendations.forEach(rec => {
          if (!recommendationsByCategory[rec.category]) {
            recommendationsByCategory[rec.category] = [];
          }
          
          recommendationsByCategory[rec.category].push(rec);
        });
        
        // Output recommendations by category
        for (const [category, recommendations] of Object.entries(recommendationsByCategory)) {
          reportContent += `### ${category} Recommendations\n\n`;
          
          recommendations.forEach(rec => {
            reportContent += `- **${rec.item}**: ${rec.description}\n`;
          });
          
          reportContent += `\n`;
        }
      }
    }
    
    // Save the report
    await fs.writeFile(reportPath, reportContent);
    
    return reportPath;
  }

  /**
   * Generate a detailed report
   * @param {Object} analysisResults Analysis results
   * @param {string} jobId Job ID
   * @returns {Promise<string>} Report file path
   * @private
   */
  async _generateDetailedReport(analysisResults, jobId) {
    const reportPath = path.join(this.reportsDir, `detailed-${jobId}.md`);
    
    // Generate detailed report content
    let reportContent = `# Competitor Analysis Detailed Report\n\n`;
    reportContent += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    reportContent += `**Job ID:** ${jobId}\n\n`;
    
    // Add table of contents
    reportContent += `## Table of Contents\n\n`;
    reportContent += `1. [Overview](#overview)\n`;
    reportContent += `2. [Competitor Analysis](#competitor-analysis)\n`;
    
    // Add competitors to TOC
    let sectionNum = 2;
    if (analysisResults.competitorData) {
      for (const url of Object.keys(analysisResults.competitorData)) {
        const domain = new URL(url).hostname;
        const anchor = domain.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        
        sectionNum++;
        reportContent += `   ${sectionNum-2}. [${domain}](#${anchor})\n`;
      }
    }
    
    // Add client comparison to TOC if available
    if (analysisResults.clientSiteComparison) {
      sectionNum++;
      reportContent += `${sectionNum}. [Your Site Comparison](#your-site-comparison)\n`;
      sectionNum++;
      reportContent += `${sectionNum}. [Recommendations](#recommendations)\n`;
    }
    
    // Overview section
    reportContent += `\n## Overview\n\n`;
    reportContent += `This report provides a detailed analysis of ${analysisResults.competitorData ? Object.keys(analysisResults.competitorData).length : 0} competitor websites.\n\n`;
    
    // Competitor analysis summary
    reportContent += `\n## Competitor Analysis\n\n`;
    reportContent += `### Performance Averages\n\n`;
    
    if (analysisResults.summary && analysisResults.summary.averagePerformance) {
      reportContent += `| Metric | Average | Description |\n`;
      reportContent += `|--------|---------|-------------|\n`;
      
      const metricDescriptions = {
        domContentLoaded: 'Time until the initial HTML document has been completely loaded and parsed',
        load: 'Time until the complete page has finished loading',
        firstPaint: 'Time when the browser first renders any pixel after navigation',
        firstContentfulPaint: 'Time when the browser renders the first bit of content from the DOM'
      };
      
      for (const [metric, value] of Object.entries(analysisResults.summary.averagePerformance)) {
        const description = metricDescriptions[metric] || '';
        reportContent += `| ${this._formatMetricName(metric)} | ${value.toFixed(2)}ms | ${description} |\n`;
      }
    } else {
      reportContent += `No performance data available.\n\n`;
    }
    
    // Content statistics
    reportContent += `\n### Content Statistics\n\n`;
    
    if (analysisResults.summary && analysisResults.summary.contentStats) {
      reportContent += `| Statistic | Average | Description |\n`;
      reportContent += `|-----------|---------|-------------|\n`;
      
      const statDescriptions = {
        averageTitleLength: 'Average character length of page titles (optimal: 50-60 characters)',
        averageDescriptionLength: 'Average character length of meta descriptions (optimal: 120-158 characters)'
      };
      
      for (const [stat, value] of Object.entries(analysisResults.summary.contentStats)) {
        if (stat !== 'headingsDistribution' && typeof value === 'number') {
          const description = statDescriptions[stat] || '';
          reportContent += `| ${this._formatMetricName(stat)} | ${value.toFixed(2)} | ${description} |\n`;
        }
      }
      
      // Add heading distribution
      if (analysisResults.summary.contentStats.headingsDistribution) {
        reportContent += `\n#### Heading Distribution\n\n`;
        reportContent += `| Heading Type | Count | Percentage |\n`;
        reportContent += `|--------------|-------|------------|\n`;
        
        const totalHeadings = Object.values(analysisResults.summary.contentStats.headingsDistribution)
          .reduce((sum, count) => sum + count, 0);
        
        for (const [type, count] of Object.entries(analysisResults.summary.contentStats.headingsDistribution)) {
          const percentage = totalHeadings > 0 ? (count / totalHeadings * 100).toFixed(1) : '0.0';
          reportContent += `| ${type} | ${count} | ${percentage}% |\n`;
        }
      }
    } else {
      reportContent += `No content statistics available.\n\n`;
    }
    
    // Individual competitor sections
    if (analysisResults.competitorData) {
      for (const [url, data] of Object.entries(analysisResults.competitorData)) {
        const domain = new URL(url).hostname;
        
        reportContent += `\n## ${domain}\n\n`;
        reportContent += `**URL:** ${url}\n\n`;
        
        if (data.error) {
          reportContent += `❌ **Analysis failed:** ${data.error}\n\n`;
          continue;
        }
        
        reportContent += `**Pages analyzed:** ${data.summary.pagesAnalyzed}\n\n`;
        
        // Performance summary
        reportContent += `### Performance\n\n`;
        
        if (data.summary.averagePerformance) {
          reportContent += `| Metric | Value |\n`;
          reportContent += `|--------|-------|\n`;
          
          for (const [metric, value] of Object.entries(data.summary.averagePerformance)) {
            reportContent += `| ${this._formatMetricName(metric)} | ${value.toFixed(2)}ms |\n`;
          }
        } else {
          reportContent += `No performance data available.\n\n`;
        }
        
        // Content summary
        reportContent += `\n### Content\n\n`;
        
        if (data.summary.contentStats) {
          reportContent += `| Statistic | Value |\n`;
          reportContent += `|-----------|-------|\n`;
          
          for (const [stat, value] of Object.entries(data.summary.contentStats)) {
            if (stat !== 'headingsDistribution' && typeof value === 'number') {
              reportContent += `| ${this._formatMetricName(stat)} | ${value.toFixed(2)} |\n`;
            }
          }
        } else {
          reportContent += `No content statistics available.\n\n`;
        }
        
        // SEO health
        reportContent += `\n### SEO Health\n\n`;
        
        if (data.summary.seoHealth) {
          reportContent += `| Metric | Value |\n`;
          reportContent += `|--------|-------|\n`;
          
          for (const [metric, value] of Object.entries(data.summary.seoHealth)) {
            if (metric.endsWith('Percent') && typeof value === 'number') {
              reportContent += `| ${this._formatMetricName(metric.replace('Percent', ''))} | ${value.toFixed(2)}% |\n`;
            }
          }
        } else {
          reportContent += `No SEO health data available.\n\n`;
        }
        
        // Strengths and weaknesses
        if (data.strengthsWeaknesses) {
          // Strengths
          if (data.strengthsWeaknesses.strengths && data.strengthsWeaknesses.strengths.length > 0) {
            reportContent += `\n### Strengths\n\n`;
            
            const strengthsByCategory = {};
            
            // Group strengths by category
            data.strengthsWeaknesses.strengths.forEach(strength => {
              if (!strengthsByCategory[strength.category]) {
                strengthsByCategory[strength.category] = [];
              }
              
              strengthsByCategory[strength.category].push(strength);
            });
            
            // Output strengths by category
            for (const [category, strengths] of Object.entries(strengthsByCategory)) {
              reportContent += `#### ${category}\n\n`;
              
              strengths.forEach(strength => {
                reportContent += `- **${strength.item}**: ${strength.value}\n`;
              });
              
              reportContent += `\n`;
            }
          }
          
          // Weaknesses
          if (data.strengthsWeaknesses.weaknesses && data.strengthsWeaknesses.weaknesses.length > 0) {
            reportContent += `\n### Weaknesses\n\n`;
            
            const weaknessesByCategory = {};
            
            // Group weaknesses by category
            data.strengthsWeaknesses.weaknesses.forEach(weakness => {
              if (!weaknessesByCategory[weakness.category]) {
                weaknessesByCategory[weakness.category] = [];
              }
              
              weaknessesByCategory[weakness.category].push(weakness);
            });
            
            // Output weaknesses by category
            for (const [category, weaknesses] of Object.entries(weaknessesByCategory)) {
              reportContent += `#### ${category}\n\n`;
              
              weaknesses.forEach(weakness => {
                reportContent += `- **${weakness.item}**: ${weakness.value}\n`;
              });
              
              reportContent += `\n`;
            }
          }
        }
        
        // Keyword analysis
        if (data.keywordAnalysis && Object.keys(data.keywordAnalysis).length > 0) {
          reportContent += `\n### Keyword Analysis\n\n`;
          reportContent += `| Keyword | Occurrences | Pages | Density | Importance |\n`;
          reportContent += `|---------|-------------|-------|---------|------------|\n`;
          
          // Sort keywords by importance score
          const sortedKeywords = Object.entries(data.keywordAnalysis)
            .sort(([, a], [, b]) => b.importanceScore - a.importanceScore);
          
          for (const [keyword, analysis] of sortedKeywords) {
            reportContent += `| ${keyword} | ${analysis.occurrences} | ${analysis.pages} | ${analysis.density.toFixed(1)}% | ${analysis.importanceScore}/100 |\n`;
          }
          
          reportContent += `\n`;
        }
      }
    }
    
    // Client site comparison
    if (analysisResults.clientSiteComparison) {
      reportContent += `\n## Your Site Comparison\n\n`;
      
      // Performance comparison
      reportContent += `### Performance Comparison\n\n`;
      reportContent += `| Metric | Your Site | Competitor Average | Difference |\n`;
      reportContent += `|--------|-----------|-------------------|------------|\n`;
      
      for (const [metric, data] of Object.entries(analysisResults.clientSiteComparison.performance)) {
        const diffIcon = data.isBetter ? '✅ ' : '❌ ';
        reportContent += `| ${this._formatMetricName(metric)} | ${data.clientValue.toFixed(2)}ms | ${data.competitorAverage.toFixed(2)}ms | ${diffIcon}${Math.abs(data.percentDifference).toFixed(1)}% ${data.isBetter ? 'better' : 'worse'} |\n`;
      }
      
      // Content comparison
      reportContent += `\n### Content Comparison\n\n`;
      reportContent += `| Statistic | Your Site | Competitor Average | Difference |\n`;
      reportContent += `|-----------|-----------|-------------------|------------|\n`;
      
      for (const [stat, data] of Object.entries(analysisResults.clientSiteComparison.content)) {
        reportContent += `| ${this._formatMetricName(stat)} | ${data.clientValue.toFixed(2)} | ${data.competitorAverage.toFixed(2)} | ${data.percentDifference > 0 ? '+' : ''}${data.percentDifference.toFixed(1)}% |\n`;
      }
      
      // SEO health comparison
      reportContent += `\n### SEO Health Comparison\n\n`;
      reportContent += `| Metric | Your Site | Competitor Average | Difference |\n`;
      reportContent += `|--------|-----------|-------------------|------------|\n`;
      
      for (const [metric, data] of Object.entries(analysisResults.clientSiteComparison.seoHealth)) {
        const metricName = this._formatMetricName(metric.replace('Percent', ''));
        const diffIcon = data.difference < 0 ? '✅ ' : '❌ ';
        
        if (metric === 'hasSchemaMarkupPercent' || metric === 'hasCanonicalPercent') {
          // For these metrics, higher is better
          reportContent += `| ${metricName} | ${data.clientValue.toFixed(1)}% | ${data.competitorAverage.toFixed(1)}% | ${data.difference > 0 ? '✅ +' : '❌ '}${Math.abs(data.difference).toFixed(1)}% |\n`;
        } else {
          // For these metrics, lower is better (missing things)
          reportContent += `| ${metricName} | ${data.clientValue.toFixed(1)}% | ${data.competitorAverage.toFixed(1)}% | ${diffIcon}${Math.abs(data.difference).toFixed(1)}% |\n`;
        }
      }
      
      // Strengths and weaknesses
      if (analysisResults.clientSiteComparison.strengths && analysisResults.clientSiteComparison.strengths.length > 0) {
        reportContent += `\n### Strengths\n\n`;
        
        const strengthsByCategory = {};
        
        // Group strengths by category
        analysisResults.clientSiteComparison.strengths.forEach(strength => {
          if (!strengthsByCategory[strength.category]) {
            strengthsByCategory[strength.category] = [];
          }
          
          strengthsByCategory[strength.category].push(strength);
        });
        
        // Output strengths by category
        for (const [category, strengths] of Object.entries(strengthsByCategory)) {
          reportContent += `#### ${category}\n\n`;
          
          strengths.forEach(strength => {
            reportContent += `- **${strength.item}**: ${strength.value}\n`;
          });
          
          reportContent += `\n`;
        }
      }
      
      if (analysisResults.clientSiteComparison.weaknesses && analysisResults.clientSiteComparison.weaknesses.length > 0) {
        reportContent += `\n### Weaknesses\n\n`;
        
        const weaknessesByCategory = {};
        
        // Group weaknesses by category
        analysisResults.clientSiteComparison.weaknesses.forEach(weakness => {
          if (!weaknessesByCategory[weakness.category]) {
            weaknessesByCategory[weakness.category] = [];
          }
          
          weaknessesByCategory[weakness.category].push(weakness);
        });
        
        // Output weaknesses by category
        for (const [category, weaknesses] of Object.entries(weaknessesByCategory)) {
          reportContent += `#### ${category}\n\n`;
          
          weaknesses.forEach(weakness => {
            reportContent += `- **${weakness.item}**: ${weakness.value}\n`;
          });
          
          reportContent += `\n`;
        }
      }
      
      // Recommendations
      if (analysisResults.clientSiteComparison.recommendations && analysisResults.clientSiteComparison.recommendations.length > 0) {
        reportContent += `\n## Recommendations\n\n`;
        
        const recommendationsByCategory = {};
        
        // Group recommendations by category
        analysisResults.clientSiteComparison.recommendations.forEach(rec => {
          if (!recommendationsByCategory[rec.category]) {
            recommendationsByCategory[rec.category] = [];
          }
          
          recommendationsByCategory[rec.category].push(rec);
        });
        
        // Output recommendations by category
        for (const [category, recommendations] of Object.entries(recommendationsByCategory)) {
          reportContent += `### ${category} Recommendations\n\n`;
          
          recommendations.forEach(rec => {
            reportContent += `- **${rec.item}**: ${rec.description}\n`;
          });
          
          reportContent += `\n`;
        }
      }
    }
    
    // Save the report
    await fs.writeFile(reportPath, reportContent);
    
    return reportPath;
  }

  /**
   * Save job results to a file
   * @param {Object} job The job object
   * @returns {Promise<void>}
   * @private
   */
  async _saveJobResults(job) {
    try {
      const filePath = path.join(this.reportsDir, `job-${job.id}.json`);
      
      // Create a simplified version of the job for storage
      const jobData = {
        id: job.id,
        status: job.status,
        startTime: job.startTime,
        endTime: job.endTime,
        duration: job.duration,
        progress: job.progress,
        results: job.results,
        error: job.error
      };
      
      await fs.writeFile(filePath, JSON.stringify(jobData, null, 2));
      logger.info(`Saved job results to ${filePath}`);
    } catch (err) {
      logger.error(`Failed to save job results: ${err.message}`);
    }
  }

  /**
   * Generate a unique job ID
   * @returns {string} The job ID
   * @private
   */
  _generateJobId() {
    this.jobCounter++;
    return `${Date.now()}-${this.jobCounter}`;
  }

  /**
   * Close the service and release resources
   * @returns {Promise<void>}
   */
  async close() {
    logger.info('Closing competitor analysis service');
    
    if (this.crawler) {
      await this.crawler.close();
      this.crawler = null;
    }
    
    logger.info('Competitor analysis service closed');
  }
}

module.exports = CompetitorAnalysisService;
