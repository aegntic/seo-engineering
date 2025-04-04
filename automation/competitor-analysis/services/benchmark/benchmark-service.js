/**
 * Benchmark Comparison Service
 * 
 * This service analyzes client data against competitors and industry benchmarks
 * to provide comparative insights and ranking information.
 */

const BenchmarkComparison = require('../../models/benchmark-comparison');
const BenchmarkVisualizationService = require('./visualization-service');
const logger = require('../../utils/logger');

class BenchmarkService {
  /**
   * Create a new benchmark service
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.options = {
      industryData: null,
      enableForecasting: true,
      forecastPeriods: 3,
      minimumDataPoints: 3,
      outputDir: null,
      ...options
    };
    
    this.industryBenchmarks = {};
    this.initialized = false;
    this.visualizationService = new BenchmarkVisualizationService({
      outputDir: this.options.outputDir
    });
  }

  /**
   * Initialize the service with industry benchmark data
   * @param {Object} industryData Industry benchmark data
   * @returns {Promise<void>}
   */
  async initialize(industryData = null) {
    // Use provided industry data or load from options
    this.industryBenchmarks = industryData || this.options.industryData || {};
    
    // If no industry data provided, use defaults
    if (Object.keys(this.industryBenchmarks).length === 0) {
      logger.warn('No industry benchmark data provided. Using default values.');
      this.industryBenchmarks = this._getDefaultIndustryBenchmarks();
    }
    
    // Initialize visualization service
    await this.visualizationService.initialize();
    
    this.initialized = true;
    logger.info('Benchmark service initialized');
  }

  /**
   * Analyze client data against competitors and industry benchmarks
   * @param {Object} clientData Client site data
   * @param {Object} competitorsData Competitors data
   * @param {Array} categories Categories to benchmark
   * @param {Object} historicalData Historical data for trend analysis
   * @returns {Promise<BenchmarkComparison>} Benchmark comparison results
   */
  async analyzeBenchmarks(clientData, competitorsData, categories = [], historicalData = null) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    logger.info('Starting benchmark analysis');
    
    // Create benchmark comparison model
    const benchmarkComparison = new BenchmarkComparison(
      clientData,
      competitorsData,
      this.industryBenchmarks,
      categories
    );
    
    try {
      // Analyze each category
      const allCategories = categories.length > 0 ? categories : [
        'technical', 'content', 'keywords', 'performance', 'onPage', 'structure'
      ];
      
      for (const category of allCategories) {
        // Calculate benchmark data
        const benchmarkData = await this._calculateBenchmarkData(
          category,
          clientData,
          competitorsData,
          this.industryBenchmarks
        );
        
        benchmarkComparison.setBenchmarkData(category, benchmarkData);
        
        // Calculate rankings
        const rankingData = await this._calculateRankings(
          category,
          clientData,
          competitorsData,
          benchmarkData
        );
        
        benchmarkComparison.setRankingData(category, rankingData);
        
        // Calculate trends if historical data is available
        if (historicalData) {
          const trendData = await this._calculateTrends(
            category,
            clientData,
            competitorsData,
            this.industryBenchmarks,
            historicalData
          );
          
          benchmarkComparison.setTrendData(category, trendData);
        }
      }
      
      // Generate recommendations based on benchmark analysis
      await this._generateRecommendations(benchmarkComparison);
      
      logger.info('Benchmark analysis completed successfully');
      
      return benchmarkComparison;
    } catch (error) {
      logger.error(`Benchmark analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate visualizations for benchmark comparison results
   * @param {BenchmarkComparison} benchmarkComparison Benchmark comparison results
   * @param {string} jobId Job ID for naming files
   * @returns {Promise<Object>} Generated visualization paths
   */
  async generateVisualizations(benchmarkComparison, jobId) {
    try {
      return await this.visualizationService.generateVisualizations(benchmarkComparison, jobId);
    } catch (error) {
      logger.error(`Failed to generate benchmark visualizations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate benchmark data for a specific category
   * @param {string} category Category name
   * @param {Object} clientData Client site data
   * @param {Object} competitorsData Competitors data
   * @param {Object} industryBenchmarks Industry benchmark data
   * @returns {Promise<Object>} Benchmark data
   * @private
   */
  async _calculateBenchmarkData(category, clientData, competitorsData, industryBenchmarks) {
    logger.info(`Calculating benchmark data for ${category}`);
    
    // Initialize benchmark data object
    const benchmarkData = {
      clientScore: 0,
      competitorAverage: 0,
      industryBenchmark: 0,
      metrics: {}
    };
    
    // Calculate based on category
    switch (category) {
      case 'technical':
        return this._calculateTechnicalBenchmarks(clientData, competitorsData, industryBenchmarks);
      
      case 'content':
        return this._calculateContentBenchmarks(clientData, competitorsData, industryBenchmarks);
      
      case 'keywords':
        return this._calculateKeywordBenchmarks(clientData, competitorsData, industryBenchmarks);
      
      case 'performance':
        return this._calculatePerformanceBenchmarks(clientData, competitorsData, industryBenchmarks);
      
      case 'onPage':
        return this._calculateOnPageBenchmarks(clientData, competitorsData, industryBenchmarks);
      
      case 'structure':
        return this._calculateStructureBenchmarks(clientData, competitorsData, industryBenchmarks);
      
      default:
        logger.warn(`Unknown category: ${category}`);
        return benchmarkData;
    }
  }
  
  /**
   * Calculate rankings based on benchmark data
   * @param {string} category Category name
   * @param {Object} clientData Client site data
   * @param {Object} competitorsData Competitors data
   * @param {Object} benchmarkData Benchmark data
   * @returns {Promise<Object>} Ranking data
   * @private
   */
  async _calculateRankings(category, clientData, competitorsData, benchmarkData) {
    logger.info(`Calculating rankings for ${category}`);
    
    const clientScore = benchmarkData.clientScore;
    const competitors = [];
    
    // Extract scores for all competitors
    Object.entries(competitorsData).forEach(([url, data]) => {
      if (!data.error) {
        let score = 0;
        
        // Calculate score based on category
        switch (category) {
          case 'technical':
            score = this._calculateTechnicalScore(data);
            break;
          
          case 'content':
            score = this._calculateContentScore(data);
            break;
          
          case 'keywords':
            score = this._calculateKeywordScore(data);
            break;
          
          case 'performance':
            score = this._calculatePerformanceScore(data);
            break;
          
          case 'onPage':
            score = this._calculateOnPageScore(data);
            break;
          
          case 'structure':
            score = this._calculateStructureScore(data);
            break;
        }
        
        competitors.push({
          url,
          name: this._getDomainFromUrl(url),
          score
        });
      }
    });
    
    // Sort competitors by score (highest first)
    competitors.sort((a, b) => b.score - a.score);
    
    // Determine client rank
    let clientRank = 1; // Default to first if no competitors
    
    for (let i = 0; i < competitors.length; i++) {
      if (clientScore < competitors[i].score) {
        clientRank++;
      } else {
        break;
      }
    }
    
    // Create ranking data
    const rankingData = {
      clientRank,
      competitors
    };
    
    return rankingData;
  }
  
  /**
   * Calculate trends based on historical data
   * @param {string} category Category name
   * @param {Object} clientData Current client site data
   * @param {Object} competitorsData Current competitors data
   * @param {Object} industryBenchmarks Industry benchmark data
   * @param {Object} historicalData Historical data
   * @returns {Promise<Object>} Trend data
   * @private
   */
  async _calculateTrends(category, clientData, competitorsData, industryBenchmarks, historicalData) {
    logger.info(`Calculating trends for ${category}`);
    
    // Get current client score
    const currentClientScore = this._getCategoryScore(category, clientData);
    
    // Process client historical data
    const clientHistory = [];
    
    if (historicalData.client && historicalData.client[category]) {
      // Add historical data points
      historicalData.client[category].forEach(point => {
        clientHistory.push({
          date: point.date,
          value: point.score
        });
      });
    }
    
    // Add current data point
    const currentDate = new Date().toISOString().split('T')[0];
    clientHistory.push({
      date: currentDate,
      value: currentClientScore
    });
    
    // Process competitor historical data
    const competitorHistory = [];
    
    if (historicalData.competitors && historicalData.competitors[category]) {
      // Add historical data points
      historicalData.competitors[category].forEach(point => {
        competitorHistory.push({
          date: point.date,
          value: point.averageScore
        });
      });
    }
    
    // Calculate current competitor average
    let competitorTotal = 0;
    let competitorCount = 0;
    
    Object.values(competitorsData).forEach(data => {
      if (!data.error) {
        competitorTotal += this._getCategoryScore(category, data);
        competitorCount++;
      }
    });
    
    const currentCompetitorAvg = competitorCount > 0 ? competitorTotal / competitorCount : 0;
    
    // Add current data point for competitors
    competitorHistory.push({
      date: currentDate,
      value: currentCompetitorAvg
    });
    
    // Process industry benchmark historical data
    const industryHistory = [];
    
    if (historicalData.industry && historicalData.industry[category]) {
      // Add historical data points
      historicalData.industry[category].forEach(point => {
        industryHistory.push({
          date: point.date,
          value: point.score
        });
      });
    }
    
    // Add current industry benchmark
    const currentIndustryBenchmark = industryBenchmarks[category]?.overall || 0;
    
    industryHistory.push({
      date: currentDate,
      value: currentIndustryBenchmark
    });
    
    // Generate forecasts if enabled
    let forecastClient = [];
    let forecastCompetitor = [];
    
    if (this.options.enableForecasting && clientHistory.length >= this.options.minimumDataPoints) {
      forecastClient = this._generateForecast(clientHistory, this.options.forecastPeriods);
      forecastCompetitor = this._generateForecast(competitorHistory, this.options.forecastPeriods);
    }
    
    return {
      clientHistory,
      competitorHistory,
      industryHistory,
      forecastClient,
      forecastCompetitor
    };
  }
  
  /**
   * Get score for a specific category
   * @param {string} category Category name
   * @param {Object} data Site data
   * @returns {number} Score for the category
   * @private
   */
  _getCategoryScore(category, data) {
    switch (category) {
      case 'technical':
        return this._calculateTechnicalScore(data);
      
      case 'content':
        return this._calculateContentScore(data);
      
      case 'keywords':
        return this._calculateKeywordScore(data);
      
      case 'performance':
        return this._calculatePerformanceScore(data);
      
      case 'onPage':
        return this._calculateOnPageScore(data);
      
      case 'structure':
        return this._calculateStructureScore(data);
      
      default:
        return 0;
    }
  }
  
  /**
   * Generate recommendations based on benchmark analysis
   * @param {BenchmarkComparison} benchmarkComparison Benchmark comparison model
   * @returns {Promise<void>}
   * @private
   */
  async _generateRecommendations(benchmarkComparison) {
    logger.info('Generating recommendations based on benchmark analysis');
    
    // Process each category for recommendations
    for (const category of benchmarkComparison.categories) {
      const benchmarkData = benchmarkComparison.getBenchmarkData(category);
      const rankingData = benchmarkComparison.getRankingData(category);
      
      // Skip if no benchmark data
      if (!benchmarkData || Object.keys(benchmarkData).length === 0) {
        continue;
      }
      
      // Generate recommendations based on category
      switch (category) {
        case 'technical':
          this._generateTechnicalRecommendations(benchmarkComparison, benchmarkData, rankingData);
          break;
        
        case 'content':
          this._generateContentRecommendations(benchmarkComparison, benchmarkData, rankingData);
          break;
        
        case 'keywords':
          this._generateKeywordRecommendations(benchmarkComparison, benchmarkData, rankingData);
          break;
        
        case 'performance':
          this._generatePerformanceRecommendations(benchmarkComparison, benchmarkData, rankingData);
          break;
        
        case 'onPage':
          this._generateOnPageRecommendations(benchmarkComparison, benchmarkData, rankingData);
          break;
        
        case 'structure':
          this._generateStructureRecommendations(benchmarkComparison, benchmarkData, rankingData);
          break;
      }
    }
    
    logger.info(`Generated ${benchmarkComparison.getRecommendations().length} recommendations`);
  }
  
  /**
   * Generate technical SEO recommendations
   * @param {BenchmarkComparison} benchmarkComparison Benchmark comparison model
   * @param {Object} benchmarkData Technical benchmark data
   * @param {Object} rankingData Technical ranking data
   * @private
   */
  _generateTechnicalRecommendations(benchmarkComparison, benchmarkData, rankingData) {
    // Check if client is underperforming compared to competitors or industry
    const clientScore = benchmarkData.clientScore;
    const competitorAvg = benchmarkData.competitorAverage;
    const industryBenchmark = benchmarkData.industryBenchmark;
    
    // Overall recommendation if significantly behind
    if (clientScore < competitorAvg * 0.8 || clientScore < industryBenchmark * 0.8) {
      benchmarkComparison.addRecommendation({
        title: 'Improve Technical SEO Foundation',
        description: `Your technical SEO score (${clientScore.toFixed(1)}) is significantly below ${
          clientScore < competitorAvg * 0.8 ? `competitors (${competitorAvg.toFixed(1)})` : `industry benchmark (${industryBenchmark.toFixed(1)})`
        }. Technical SEO provides the foundation for all other SEO efforts.`,
        category: 'Technical SEO',
        impact: 'High - Technical issues can prevent search engines from properly indexing and ranking your content.'
      });
    }
    
    // Check specific metrics for gaps
    if (benchmarkData.metrics) {
      // Missing title tags
      if (benchmarkData.metrics.missingTitlesPercent) {
        const metric = benchmarkData.metrics.missingTitlesPercent;
        const clientValue = metric.clientValue;
        const competitorAvg = metric.competitorAverage;
        const industryAvg = metric.industryAverage;
        
        // Compare to the best available benchmark
        const benchmark = competitorAvg !== undefined ? competitorAvg : industryAvg;
        const benchmarkName = competitorAvg !== undefined ? 'competitors' : 'industry benchmark';
        
        if (clientValue > benchmark * 1.5 && clientValue > 5) {
          benchmarkComparison.addRecommendation({
            title: 'Optimize Page Titles',
            description: `${clientValue.toFixed(1)}% of your pages are missing title tags, compared to ${benchmark.toFixed(1)}% for ${benchmarkName}. Title tags are critical for SEO and user experience.`,
            category: 'Technical SEO',
            impact: 'High - Title tags are one of the most important on-page SEO elements.',
            actions: [
              'Audit all pages to identify those missing title tags',
              'Create unique, descriptive titles for each page',
              'Keep titles under 60 characters to avoid truncation in search results',
              'Include primary keywords in title tags',
              'Implement a template system for automatically generating titles for new content'
            ]
          });
        }
      }
      
      // Missing meta descriptions
      if (benchmarkData.metrics.missingDescriptionsPercent) {
        const metric = benchmarkData.metrics.missingDescriptionsPercent;
        const clientValue = metric.clientValue;
        const competitorAvg = metric.competitorAverage;
        const industryAvg = metric.industryAverage;
        
        // Compare to the best available benchmark
        const benchmark = competitorAvg !== undefined ? competitorAvg : industryAvg;
        const benchmarkName = competitorAvg !== undefined ? 'competitors' : 'industry benchmark';
        
        if (clientValue > benchmark * 1.5 && clientValue > 10) {
          benchmarkComparison.addRecommendation({
            title: 'Add Meta Descriptions',
            description: `${clientValue.toFixed(1)}% of your pages are missing meta descriptions, compared to ${benchmark.toFixed(1)}% for ${benchmarkName}. Meta descriptions improve click-through rates from search results.`,
            category: 'Technical SEO',
            impact: 'Medium - Meta descriptions influence click-through rates from search results.',
            actions: [
              'Audit pages to identify those missing meta descriptions',
              'Write compelling descriptions that encourage clicks',
              'Keep descriptions between 120-158 characters',
              'Include relevant keywords naturally',
              'Make each description unique and relevant to the page content'
            ]
          });
        }
      }
      
      // Schema markup usage
      if (benchmarkData.metrics.hasSchemaMarkupPercent) {
        const metric = benchmarkData.metrics.hasSchemaMarkupPercent;
        const clientValue = metric.clientValue;
        const competitorAvg = metric.competitorAverage;
        const industryAvg = metric.industryAverage;
        
        // Compare to the best available benchmark
        const benchmark = competitorAvg !== undefined ? competitorAvg : industryAvg;
        const benchmarkName = competitorAvg !== undefined ? 'competitors' : 'industry benchmark';
        
        if (clientValue < benchmark * 0.7 && clientValue < 50) {
          benchmarkComparison.addRecommendation({
            title: 'Implement Schema Markup',
            description: `Only ${clientValue.toFixed(1)}% of your pages use schema markup, compared to ${benchmark.toFixed(1)}% for ${benchmarkName}. Schema markup helps search engines understand your content and can enable rich snippets.`,
            category: 'Technical SEO',
            impact: 'Medium - Schema markup enhances search visibility and enables rich results.',
            actions: [
              'Identify key page types for schema implementation (products, articles, events, etc.)',
              'Implement appropriate schema.org markup for each page type',
              'Test markup with Google's Structured Data Testing Tool',
              'Prioritize markup that enables rich snippets in search results',
              'Consider implementing JSON-LD format for easier maintenance'
            ]
          });
        }
      }
    }
  }

  // [Technical benchmarks, content benchmarks, keyword benchmarks, performance benchmarks, on-page benchmarks methods omitted for brevity]
  
  /**
   * Generate site structure recommendations
   * @param {BenchmarkComparison} benchmarkComparison Benchmark comparison model
   * @param {Object} benchmarkData Structure benchmark data
   * @param {Object} rankingData Structure ranking data
   * @private
   */
  _generateStructureRecommendations(benchmarkComparison, benchmarkData, rankingData) {
    // Check if client is underperforming compared to competitors or industry
    const clientScore = benchmarkData.clientScore;
    const competitorAvg = benchmarkData.competitorAverage;
    const industryBenchmark = benchmarkData.industryBenchmark;
    
    // Overall recommendation if significantly behind
    if (clientScore < competitorAvg * 0.8 || clientScore < industryBenchmark * 0.8) {
      benchmarkComparison.addRecommendation({
        title: 'Improve Site Structure',
        description: `Your site structure score (${clientScore.toFixed(1)}) is significantly below ${
          clientScore < competitorAvg * 0.8 ? `competitors (${competitorAvg.toFixed(1)})` : `industry benchmark (${industryBenchmark.toFixed(1)})`
        }. A well-organized site structure improves user experience and helps search engines understand your content.`,
        category: 'Site Structure',
        impact: 'High - Site structure affects both user experience and search engine crawling.'
      });
    }
    
    // Check specific metrics for gaps
    Object.entries(benchmarkData.metrics).forEach(([metric, data]) => {
      const clientValue = data.clientValue;
      const competitorAvg = data.competitorAverage;
      const industryAvg = data.industryAverage;
      const threshold = data.threshold;
      
      // Skip if no competitor or industry data
      if (competitorAvg === undefined && industryAvg === undefined) {
        return;
      }
      
      // Compare to the best available benchmark
      const benchmark = competitorAvg !== undefined ? competitorAvg : industryAvg;
      const benchmarkName = competitorAvg !== undefined ? 'competitors' : 'industry benchmark';
      
      // Process based on metric type
      switch (metric) {
        case 'averageDepth':
          // Higher is worse for this metric (inverse)
          if (clientValue > benchmark * 1.3 && clientValue > threshold.min) {
            benchmarkComparison.addRecommendation({
              title: 'Flatten Site Architecture',
              description: `Your site has an average depth of ${clientValue.toFixed(1)} levels, compared to ${benchmark.toFixed(1)} for ${benchmarkName}. Deep site architectures make it harder for users and search engines to find important content.`,
              category: 'Site Structure',
              impact: 'High - Flatter site structures improve crawling and user navigation.',
              actions: [
                'Ensure important pages are no more than 3 clicks from the homepage',
                'Restructure navigation to reduce depth',
                'Implement a clear hierarchy with categories and subcategories',
                'Add breadcrumb navigation for deeper pages',
                'Create hub pages that link to related content',
                'Implement an HTML sitemap for users and XML sitemap for search engines'
              ]
            });
          }
          break;
          
        case 'categoryRatio':
          // Lower is worse for this metric
          if (clientValue < benchmark * 0.7 && clientValue < threshold.min) {
            benchmarkComparison.addRecommendation({
              title: 'Improve Content Organization',
              description: `Your site's category ratio is ${clientValue.toFixed(2)}, compared to ${benchmark.toFixed(2)} for ${benchmarkName}. This indicates that your content may not be well-organized into logical categories.`,
              category: 'Site Structure',
              impact: 'Medium - Logical content organization improves user experience and SEO.',
              actions: [
                'Create a clear content hierarchy with well-defined categories',
                'Organize similar content together in topic clusters',
                'Implement proper URL structure that reflects content hierarchy',
                'Use breadcrumbs to show content relationships',
                'Ensure navigation reflects your content structure'
              ]
            });
          }
          break;
          
        case 'orphanedPagesPercent':
          // Higher is worse for this metric (inverse)
          if (clientValue > benchmark * 1.5 && clientValue > threshold.min) {
            benchmarkComparison.addRecommendation({
              title: 'Fix Orphaned Pages',
              description: `${clientValue.toFixed(1)}% of your pages are orphaned (not linked from other pages), compared to ${benchmark.toFixed(1)}% for ${benchmarkName}. Orphaned pages are difficult for users and search engines to discover.`,
              category: 'Site Structure',
              impact: 'Medium - Orphaned pages may not be crawled or found by users.',
              actions: [
                'Identify all orphaned pages with a site audit',
                'Add internal links to orphaned pages from relevant content',
                'Create section or category pages that link to related content',
                'Include orphaned but valuable pages in your sitemap',
                'Consider removing or redirecting low-value orphaned pages'
              ]
            });
          }
          break;
      }
    });
  }

  /**
   * Calculate distribution data for visualization
   * @param {number} clientScore Client score
   * @param {Array} competitorScores Array of competitor scores
   * @returns {Object} Distribution data
   * @private
   */
  _calculateDistribution(clientScore, competitorScores) {
    // Initialize distribution data
    const distribution = {
      ranges: [
        { min: 0, max: 20, label: '0-20' },
        { min: 20, max: 40, label: '20-40' },
        { min: 40, max: 60, label: '40-60' },
        { min: 60, max: 80, label: '60-80' },
        { min: 80, max: 100, label: '80-100' }
      ],
      counts: [0, 0, 0, 0, 0],
      clientPosition: null
    };
    
    // Add client score to distribution
    for (let i = 0; i < distribution.ranges.length; i++) {
      const range = distribution.ranges[i];
      
      if (clientScore >= range.min && clientScore < range.max) {
        distribution.clientPosition = i;
        break;
      }
    }
    
    // Add competitor scores to distribution
    competitorScores.forEach(score => {
      for (let i = 0; i < distribution.ranges.length; i++) {
        const range = distribution.ranges[i];
        
        if (score >= range.min && score < range.max) {
          distribution.counts[i]++;
          break;
        }
      }
    });
    
    // Calculate percentiles
    let scores = [...competitorScores];
    scores.sort((a, b) => a - b);
    
    const percentiles = {
      p25: this._calculatePercentile(scores, 25),
      p50: this._calculatePercentile(scores, 50),
      p75: this._calculatePercentile(scores, 75),
      client: clientScore
    };
    
    distribution.percentiles = percentiles;
    
    return distribution;
  }

  /**
   * Calculate a specific percentile from an array of scores
   * @param {Array} scores Sorted array of scores
   * @param {number} percentile Percentile to calculate (1-99)
   * @returns {number} Percentile value
   * @private
   */
  _calculatePercentile(scores, percentile) {
    if (scores.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * scores.length) - 1;
    return scores[Math.max(0, Math.min(scores.length - 1, index))];
  }

  /**
   * Generate a forecast based on historical data
   * @param {Array} history Array of {date, value} objects
   * @param {number} periods Number of periods to forecast
   * @returns {Array} Forecast data as array of {date, value} objects
   * @private
   */
  _generateForecast(history, periods) {
    if (history.length < 2) {
      return [];
    }
    
    // For simplicity, use simple moving average forecast
    // In a real implementation, this would use more sophisticated forecasting methods
    
    // Get last few data points
    const lastPoints = history.slice(-3);
    
    // Calculate average change
    let totalChange = 0;
    
    for (let i = 1; i < lastPoints.length; i++) {
      totalChange += lastPoints[i].value - lastPoints[i - 1].value;
    }
    
    const avgChange = totalChange / (lastPoints.length - 1);
    
    // Generate forecast
    const forecast = [];
    let lastValue = history[history.length - 1].value;
    let lastDate = new Date(history[history.length - 1].date);
    
    for (let i = 0; i < periods; i++) {
      lastValue += avgChange;
      lastDate = new Date(lastDate);
      lastDate.setMonth(lastDate.getMonth() + 1);
      
      forecast.push({
        date: lastDate.toISOString().split('T')[0],
        value: Math.max(0, Math.min(100, lastValue))
      });
    }
    
    return forecast;
  }

  /**
   * Get default industry benchmarks
   * @returns {Object} Default industry benchmark data
   * @private
   */
  _getDefaultIndustryBenchmarks() {
    return {
      technical: {
        overall: 70,
        metrics: {
          missingTitlesPercent: 5,
          missingDescriptionsPercent: 10,
          hasSchemaMarkupPercent: 60,
          hasCanonicalPercent: 80,
          hasMobileViewportPercent: 95
        }
      },
      content: {
        overall: 70,
        metrics: {
          averageTitleLength: 55,
          averageDescriptionLength: 150,
          averageContentLength: 1500
        }
      },
      keywords: {
        overall: 70,
        metrics: {
          keywordCoverage: 80,
          averageDensity: 2.5,
          averageImportance: 70,
          inTitlePercent: 80,
          inDescriptionPercent: 70,
          inHeadingsPercent: 60
        }
      },
      performance: {
        overall: 70,
        metrics: {
          domContentLoaded: 1000,
          load: 2500,
          firstPaint: 800,
          firstContentfulPaint: 1000,
          largestContentfulPaint: 2500
        }
      },
      onPage: {
        overall: 70,
        metrics: {
          imageAltTextPercent: 90,
          internalLinksPerPage: 15,
          externalLinksPerPage: 3,
          brokenLinksPercent: 1
        }
      },
      structure: {
        overall: 70,
        metrics: {
          averageDepth: 3,
          categoryRatio: 0.6,
          orphanedPagesPercent: 5
        }
      }
    };
  }

  /**
   * Calculate technical SEO score
   * @param {Object} data Site data
   * @returns {number} Technical SEO score (0-100)
   * @private
   */
  _calculateTechnicalScore(data) {
    if (!data.summary?.seoHealth) {
      return 0;
    }
    
    const seoHealth = data.summary.seoHealth;
    
    // Calculate technical score based on key metrics
    const metricWeights = {
      missingTitlesPercent: 0.2,
      missingDescriptionsPercent: 0.2,
      hasSchemaMarkupPercent: 0.2,
      hasCanonicalPercent: 0.2,
      hasMobileViewportPercent: 0.2
    };
    
    let total = 0;
    let weightSum = 0;
    
    Object.entries(metricWeights).forEach(([metric, weight]) => {
      if (seoHealth[metric] !== undefined) {
        let value = seoHealth[metric];
        
        // For "missing" metrics, invert the percentage
        if (metric.startsWith('missing')) {
          value = 100 - value;
        }
        
        total += value * weight;
        weightSum += weight;
      }
    });
    
    return weightSum > 0 ? total / weightSum : 0;
  }

  /**
   * Calculate content score
   * @param {Object} data Site data
   * @returns {number} Content score (0-100)
   * @private
   */
  _calculateContentScore(data) {
    if (!data.summary?.contentStats) {
      return 0;
    }
    
    const contentStats = data.summary.contentStats;
    
    // Define optimal ranges for content metrics
    const optimalRanges = {
      averageTitleLength: { min: 50, max: 60 },
      averageDescriptionLength: { min: 140, max: 160 },
      averageContentLength: { min: 800, max: 2000 }
    };
    
    // Calculate content score based on key metrics
    const metricWeights = {
      averageTitleLength: 0.25,
      averageDescriptionLength: 0.25,
      averageContentLength: 0.5
    };
    
    let total = 0;
    let weightSum = 0;
    
    Object.entries(metricWeights).forEach(([metric, weight]) => {
      if (contentStats[metric] !== undefined) {
        const value = contentStats[metric];
        const range = optimalRanges[metric];
        
        // Calculate score based on optimal range
        let score = 0;
        
        if (value >= range.min && value <= range.max) {
          // Value is in optimal range - 100% score
          score = 100;
        } else if (value < range.min) {
          // Value is below minimum - prorated score
          score = (value / range.min) * 100;
        } else {
          // Value is above maximum - prorated score (inverse)
          score = (range.max / value) * 100;
        }
        
        total += score * weight;
        weightSum += weight;
      }
    });
    
    return weightSum > 0 ? total / weightSum : 0;
  }

  /**
   * Calculate keyword score
   * @param {Object} data Site data
   * @returns {number} Keyword score (0-100)
   * @private
   */
  _calculateKeywordScore(data) {
    if (!data.keywordAnalysis || Object.keys(data.keywordAnalysis).length === 0) {
      return 0;
    }
    
    // Calculate keyword score based on key metrics
    let keywordImportanceTotal = 0;
    let keywordCount = 0;
    
    Object.values(data.keywordAnalysis).forEach(keyword => {
      keywordImportanceTotal += keyword.importanceScore || 0;
      keywordCount++;
    });
    
    // Return average importance score
    return keywordCount > 0 ? keywordImportanceTotal / keywordCount : 0;
  }

  /**
   * Calculate performance score
   * @param {Object} data Site data
   * @returns {number} Performance score (0-100)
   * @private
   */
  _calculatePerformanceScore(data) {
    if (!data.summary?.averagePerformance) {
      return 0;
    }
    
    const performance = data.summary.averagePerformance;
    
    // Define performance thresholds (lower is better)
    const performanceThresholds = {
      domContentLoaded: { good: 1000, medium: 2000, poor: 3000 },
      load: { good: 2000, medium: 4000, poor: 6000 },
      firstPaint: { good: 800, medium: 1500, poor: 2500 },
      firstContentfulPaint: { good: 1000, medium: 2000, poor: 3000 },
      largestContentfulPaint: { good: 2500, medium: 4000, poor: 6000 }
    };
    
    // Calculate performance score based on key metrics
    const metricWeights = {
      domContentLoaded: 0.25,
      load: 0.25,
      firstPaint: 0.2,
      firstContentfulPaint: 0.15,
      largestContentfulPaint: 0.15
    };
    
    let total = 0;
    let weightSum = 0;
    
    Object.entries(metricWeights).forEach(([metric, weight]) => {
      if (performance[metric] !== undefined) {
        const value = performance[metric];
        const thresholds = performanceThresholds[metric];
        
        // Calculate score based on thresholds (lower is better)
        let score = 0;
        
        if (value <= thresholds.good) {
          score = 100;
        } else if (value <= thresholds.medium) {
          score = 75 - ((value - thresholds.good) / (thresholds.medium - thresholds.good)) * 25;
        } else if (value <= thresholds.poor) {
          score = 50 - ((value - thresholds.medium) / (thresholds.poor - thresholds.medium)) * 25;
        } else {
          score = Math.max(0, 25 - ((value - thresholds.poor) / thresholds.poor) * 25);
        }
        
        total += score * weight;
        weightSum += weight;
      }
    });
    
    return weightSum > 0 ? total / weightSum : 0;
  }

  /**
   * Calculate on-page SEO score
   * @param {Object} data Site data
   * @returns {number} On-page SEO score (0-100)
   * @private
   */
  _calculateOnPageScore(data) {
    if (!data.seo) {
      return 0;
    }
    
    const seo = data.seo;
    const summary = data.summary || {};
    
    // Calculate on-page metrics
    const metrics = {};
    
    // Image alt text percentage
    if (seo.images) {
      const totalImages = (seo.images.withAlt || 0) + (seo.images.withoutAlt || 0);
      
      if (totalImages > 0) {
        metrics.imageAltTextPercent = (seo.images.withAlt || 0) / totalImages * 100;
      }
    }
    
    // Internal links per page
    if (seo.links && seo.links.internal !== undefined && summary.pagesAnalyzed) {
      metrics.internalLinksPerPage = seo.links.internal / summary.pagesAnalyzed;
    }
    
    // Calculate on-page score based on key metrics
    const metricWeights = {
      imageAltTextPercent: 0.5,
      internalLinksPerPage: 0.5
    };
    
    const metricThresholds = {
      imageAltTextPercent: { min: 80, max: 100 },
      internalLinksPerPage: { min: 5, max: 50 }
    };
    
    let total = 0;
    let weightSum = 0;
    
    Object.entries(metrics).forEach(([metric, value]) => {
      if (metricWeights[metric] !== undefined) {
        const threshold = metricThresholds[metric];
        const weight = metricWeights[metric];
        
        // Calculate score based on threshold
        let score = 0;
        
        if (value >= threshold.max) {
          score = 100;
        } else if (value >= threshold.min) {
          score = 50 + ((value - threshold.min) / (threshold.max - threshold.min)) * 50;
        } else {
          score = Math.max(0, (value / threshold.min) * 50);
        }
        
        total += score * weight;
        weightSum += weight;
      }
    });
    
    return weightSum > 0 ? total / weightSum : 0;
  }

  /**
   * Calculate site structure score
   * @param {Object} data Site data
   * @returns {number} Structure score (0-100)
   * @private
   */
  _calculateStructureScore(data) {
    // For the structure score, we would typically need more detailed data
    // about site architecture, but we'll use what's available or defaults
    
    const structure = data.structure || {};
    
    // Define metrics and defaults if not available
    const metrics = {
      averageDepth: structure.averageDepth || 3,
      categoryRatio: structure.categoryRatio || 0.6,
      orphanedPagesPercent: structure.orphanedPagesPercent || 5
    };
    
    // Define thresholds for metrics
    const metricThresholds = {
      averageDepth: { inverse: true, min: 2, max: 4 }, // Lower is better
      categoryRatio: { min: 0.4, max: 0.8 }, // Higher is better
      orphanedPagesPercent: { inverse: true, min: 0, max: 10 } // Lower is better
    };
    
    // Calculate structure score based on metrics
    const metricWeights = {
      averageDepth: 0.4,
      categoryRatio: 0.3,
      orphanedPagesPercent: 0.3
    };
    
    let total = 0;
    
    Object.entries(metrics).forEach(([metric, value]) => {
      const threshold = metricThresholds[metric];
      const weight = metricWeights[metric];
      let score = 0;
      
      if (threshold.inverse) {
        // For metrics where lower is better
        if (value <= threshold.min) {
          score = 100;
        } else if (value <= threshold.max) {
          score = 100 - ((value - threshold.min) / (threshold.max - threshold.min)) * 50;
        } else {
          score = Math.max(0, 50 - ((value - threshold.max) / threshold.max) * 50);
        }
      } else {
        // For metrics where higher is better
        if (value >= threshold.max) {
          score = 100;
        } else if (value >= threshold.min) {
          score = 50 + ((value - threshold.min) / (threshold.max - threshold.min)) * 50;
        } else {
          score = Math.max(0, (value / threshold.min) * 50);
        }
      }
      
      total += score * weight;
    });
    
    return total;
  }

  /**
   * Extract domain from URL
   * @param {string} url URL
   * @returns {string} Domain name
   * @private
   */
  _getDomainFromUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return domain.startsWith('www.') ? domain.substring(4) : domain;
    } catch (error) {
      return url;
    }
  }
}

module.exports = BenchmarkService;
