/**
 * Gap Analyzer Service
 * 
 * This service analyzes client and competitor data to identify gaps and opportunities
 * in the client's SEO strategy.
 */

const GapAnalysis = require('../../models/gap-analysis');
const logger = require('../../utils/logger');

class GapAnalyzer {
  /**
   * Create a new gap analyzer
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.options = {
      impactThresholds: {
        critical: 4.5,
        high: 3.5,
        medium: 2.5,
        low: 1
      },
      ...options
    };
  }

  /**
   * Analyze gaps between client site and competitors
   * @param {Object} clientData Client site data
   * @param {Object} competitorsData Competitors data
   * @param {Array} keywords Keywords to analyze
   * @returns {Promise<GapAnalysis>} Gap analysis results
   */
  async analyzeGaps(clientData, competitorsData, keywords = []) {
    logger.info('Starting gap analysis');
    
    // Create gap analysis model
    const gapAnalysis = new GapAnalysis(clientData, competitorsData, keywords);
    
    try {
      // Perform analysis for each category
      await this._analyzeTechnicalGaps(gapAnalysis);
      await this._analyzeContentGaps(gapAnalysis);
      await this._analyzeKeywordGaps(gapAnalysis);
      await this._analyzePerformanceGaps(gapAnalysis);
      await this._analyzeOnPageGaps(gapAnalysis);
      await this._analyzeStructureGaps(gapAnalysis);
      
      // Generate opportunities based on gaps
      await this._generateOpportunities(gapAnalysis);
      
      // Calculate scores
      gapAnalysis.calculateScores();
      
      // Generate visualization data
      gapAnalysis.generateVisualizationData();
      
      logger.info('Gap analysis completed successfully');
      
      return gapAnalysis;
    } catch (error) {
      logger.error(`Gap analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze technical SEO gaps
   * @param {GapAnalysis} gapAnalysis Gap analysis model
   * @returns {Promise<void>}
   * @private
   */
  async _analyzeTechnicalGaps(gapAnalysis) {
    logger.info('Analyzing technical SEO gaps');
    
    const { clientData, competitorsData } = gapAnalysis;
    
    // Skip if client data is missing or has errors
    if (!clientData || clientData.error) {
      return;
    }
    
    // Get client SEO health metrics
    const clientSeoHealth = clientData.summary?.seoHealth || {};
    
    // Calculate average competitor SEO health metrics
    const competitorMetrics = {};
    let competitors = 0;
    
    Object.values(competitorsData).forEach(competitor => {
      if (!competitor.error && competitor.summary?.seoHealth) {
        competitors++;
        
        Object.entries(competitor.summary.seoHealth).forEach(([metric, value]) => {
          if (typeof value === 'number') {
            if (!competitorMetrics[metric]) {
              competitorMetrics[metric] = 0;
            }
            
            competitorMetrics[metric] += value;
          }
        });
      }
    });
    
    // Calculate averages
    if (competitors > 0) {
      Object.keys(competitorMetrics).forEach(metric => {
        competitorMetrics[metric] /= competitors;
      });
    }
    
    // Check for missing title tags
    if (clientSeoHealth.missingTitlesPercent !== undefined && 
        competitorMetrics.missingTitlesPercent !== undefined) {
      const difference = clientSeoHealth.missingTitlesPercent - competitorMetrics.missingTitlesPercent;
      
      if (difference > 5) {
        // Higher percentage of missing titles than competitors
        const impactScore = this._calculateImpactScore(difference, 5, 30);
        
        gapAnalysis.addGap('technical', {
          title: 'Missing Page Titles',
          description: `${clientSeoHealth.missingTitlesPercent.toFixed(1)}% of your pages are missing title tags, compared to ${competitorMetrics.missingTitlesPercent.toFixed(1)}% for competitors.`,
          impactScore,
          data: {
            clientValue: clientSeoHealth.missingTitlesPercent.toFixed(1) + '%',
            competitorAverage: competitorMetrics.missingTitlesPercent.toFixed(1) + '%',
            difference: difference.toFixed(1) + '%'
          }
        });
      }
    }
    
    // Check for missing meta descriptions
    if (clientSeoHealth.missingDescriptionsPercent !== undefined && 
        competitorMetrics.missingDescriptionsPercent !== undefined) {
      const difference = clientSeoHealth.missingDescriptionsPercent - competitorMetrics.missingDescriptionsPercent;
      
      if (difference > 10) {
        // Higher percentage of missing descriptions than competitors
        const impactScore = this._calculateImpactScore(difference, 10, 40);
        
        gapAnalysis.addGap('technical', {
          title: 'Missing Meta Descriptions',
          description: `${clientSeoHealth.missingDescriptionsPercent.toFixed(1)}% of your pages are missing meta descriptions, compared to ${competitorMetrics.missingDescriptionsPercent.toFixed(1)}% for competitors.`,
          impactScore,
          data: {
            clientValue: clientSeoHealth.missingDescriptionsPercent.toFixed(1) + '%',
            competitorAverage: competitorMetrics.missingDescriptionsPercent.toFixed(1) + '%',
            difference: difference.toFixed(1) + '%'
          }
        });
      }
    }
    
    // Check for schema markup usage
    if (clientSeoHealth.hasSchemaMarkupPercent !== undefined && 
        competitorMetrics.hasSchemaMarkupPercent !== undefined) {
      const difference = competitorMetrics.hasSchemaMarkupPercent - clientSeoHealth.hasSchemaMarkupPercent;
      
      if (difference > 15) {
        // Lower percentage of schema markup than competitors
        const impactScore = this._calculateImpactScore(difference, 15, 50);
        
        gapAnalysis.addGap('technical', {
          title: 'Limited Schema Markup Usage',
          description: `Only ${clientSeoHealth.hasSchemaMarkupPercent.toFixed(1)}% of your pages use schema markup, compared to ${competitorMetrics.hasSchemaMarkupPercent.toFixed(1)}% for competitors.`,
          impactScore,
          data: {
            clientValue: clientSeoHealth.hasSchemaMarkupPercent.toFixed(1) + '%',
            competitorAverage: competitorMetrics.hasSchemaMarkupPercent.toFixed(1) + '%',
            difference: difference.toFixed(1) + '%'
          }
        });
      }
    }
    
    // Check for canonical tag usage
    if (clientSeoHealth.hasCanonicalPercent !== undefined && 
        competitorMetrics.hasCanonicalPercent !== undefined) {
      const difference = competitorMetrics.hasCanonicalPercent - clientSeoHealth.hasCanonicalPercent;
      
      if (difference > 20) {
        // Lower percentage of canonical tags than competitors
        const impactScore = this._calculateImpactScore(difference, 20, 60);
        
        gapAnalysis.addGap('technical', {
          title: 'Insufficient Canonical Tag Usage',
          description: `Only ${clientSeoHealth.hasCanonicalPercent.toFixed(1)}% of your pages use canonical tags, compared to ${competitorMetrics.hasCanonicalPercent.toFixed(1)}% for competitors.`,
          impactScore,
          data: {
            clientValue: clientSeoHealth.hasCanonicalPercent.toFixed(1) + '%',
            competitorAverage: competitorMetrics.hasCanonicalPercent.toFixed(1) + '%',
            difference: difference.toFixed(1) + '%'
          }
        });
      }
    }
    
    // Check for mobile responsiveness
    if (clientSeoHealth.hasMobileViewportPercent !== undefined && 
        competitorMetrics.hasMobileViewportPercent !== undefined) {
      const difference = competitorMetrics.hasMobileViewportPercent - clientSeoHealth.hasMobileViewportPercent;
      
      if (difference > 10) {
        // Lower percentage of mobile viewport meta tags than competitors
        const impactScore = this._calculateImpactScore(difference, 10, 40);
        
        gapAnalysis.addGap('technical', {
          title: 'Poor Mobile Optimization',
          description: `Only ${clientSeoHealth.hasMobileViewportPercent.toFixed(1)}% of your pages have mobile viewport meta tags, compared to ${competitorMetrics.hasMobileViewportPercent.toFixed(1)}% for competitors.`,
          impactScore,
          data: {
            clientValue: clientSeoHealth.hasMobileViewportPercent.toFixed(1) + '%',
            competitorAverage: competitorMetrics.hasMobileViewportPercent.toFixed(1) + '%',
            difference: difference.toFixed(1) + '%'
          }
        });
      }
    }
    
    logger.info(`Technical SEO gap analysis completed, found ${gapAnalysis.gaps.technical.length} gaps`);
  }

  /**
   * Analyze content gaps
   * @param {GapAnalysis} gapAnalysis Gap analysis model
   * @returns {Promise<void>}
   * @private
   */
  async _analyzeContentGaps(gapAnalysis) {
    logger.info('Analyzing content gaps');
    
    const { clientData, competitorsData } = gapAnalysis;
    
    // Skip if client data is missing or has errors
    if (!clientData || clientData.error) {
      return;
    }
    
    // Get client content stats
    const clientContentStats = clientData.summary?.contentStats || {};
    
    // Calculate average competitor content stats
    const competitorStats = {};
    let competitors = 0;
    
    Object.values(competitorsData).forEach(competitor => {
      if (!competitor.error && competitor.summary?.contentStats) {
        competitors++;
        
        Object.entries(competitor.summary.contentStats).forEach(([stat, value]) => {
          if (stat !== 'headingsDistribution' && typeof value === 'number') {
            if (!competitorStats[stat]) {
              competitorStats[stat] = 0;
            }
            
            competitorStats[stat] += value;
          }
        });
      }
    });
    
    // Calculate averages
    if (competitors > 0) {
      Object.keys(competitorStats).forEach(stat => {
        competitorStats[stat] /= competitors;
      });
    }
    
    // Check for title length issues
    if (clientContentStats.averageTitleLength !== undefined && 
        competitorStats.averageTitleLength !== undefined) {
      // Optimal title length is 50-60 characters
      const clientTitleLength = clientContentStats.averageTitleLength;
      const competitorTitleLength = competitorStats.averageTitleLength;
      
      if (clientTitleLength < 30 || clientTitleLength > 70) {
        // Title length is outside optimal range
        const difference = Math.abs(clientTitleLength - competitorTitleLength);
        const impactScore = this._calculateImpactScore(difference, 5, 25);
        
        gapAnalysis.addGap('content', {
          title: 'Suboptimal Title Lengths',
          description: `Your average title length is ${Math.round(clientTitleLength)} characters, which is ${clientTitleLength < 40 ? 'too short' : 'too long'}. Competitor average is ${Math.round(competitorTitleLength)} characters.`,
          impactScore,
          data: {
            clientValue: `${Math.round(clientTitleLength)} characters`,
            competitorAverage: `${Math.round(competitorTitleLength)} characters`,
            difference: `${Math.round(Math.abs(clientTitleLength - competitorTitleLength))} characters`,
            optimal: '50-60 characters'
          }
        });
      }
    }
    
    // Check for description length issues
    if (clientContentStats.averageDescriptionLength !== undefined && 
        competitorStats.averageDescriptionLength !== undefined) {
      // Optimal description length is 120-158 characters
      const clientDescLength = clientContentStats.averageDescriptionLength;
      const competitorDescLength = competitorStats.averageDescriptionLength;
      
      if (clientDescLength < 80 || clientDescLength > 170) {
        // Description length is outside optimal range
        const difference = Math.abs(clientDescLength - competitorDescLength);
        const impactScore = this._calculateImpactScore(difference, 10, 50);
        
        gapAnalysis.addGap('content', {
          title: 'Suboptimal Meta Description Lengths',
          description: `Your average meta description length is ${Math.round(clientDescLength)} characters, which is ${clientDescLength < 100 ? 'too short' : 'too long'}. Competitor average is ${Math.round(competitorDescLength)} characters.`,
          impactScore,
          data: {
            clientValue: `${Math.round(clientDescLength)} characters`,
            competitorAverage: `${Math.round(competitorDescLength)} characters`,
            difference: `${Math.round(Math.abs(clientDescLength - competitorDescLength))} characters`,
            optimal: '120-158 characters'
          }
        });
      }
    }
    
    // Check for content length issues
    if (clientContentStats.averageContentLength !== undefined && 
        competitorStats.averageContentLength !== undefined) {
      const clientContentLength = clientContentStats.averageContentLength;
      const competitorContentLength = competitorStats.averageContentLength;
      
      // If client content is significantly shorter than competitor content
      if (clientContentLength < competitorContentLength * 0.7) {
        const difference = competitorContentLength - clientContentLength;
        const impactScore = this._calculateImpactScore(difference, 200, 1000);
        
        gapAnalysis.addGap('content', {
          title: 'Thin Content',
          description: `Your average content length is ${Math.round(clientContentLength)} characters, which is ${Math.round((clientContentLength / competitorContentLength) * 100)}% of your competitors' average (${Math.round(competitorContentLength)} characters).`,
          impactScore,
          data: {
            clientValue: `${Math.round(clientContentLength)} characters`,
            competitorAverage: `${Math.round(competitorContentLength)} characters`,
            difference: `${Math.round(difference)} characters (${Math.round((1 - clientContentLength / competitorContentLength) * 100)}% less)`
          }
        });
      }
    }
    
    // Check for heading structure issues
    if (clientContentStats.headingsDistribution && competitorStats.headingsDistribution) {
      const clientH1Ratio = clientContentStats.headingsDistribution.h1 / clientData.summary.pagesAnalyzed;
      const competitorH1Ratio = competitorStats.headingsDistribution.h1 / 
        Object.values(competitorsData).reduce((sum, c) => !c.error ? sum + c.summary.pagesAnalyzed : sum, 0);
      
      if (clientH1Ratio < 0.9 && competitorH1Ratio > 0.9) {
        // Missing H1 tags
        const impactScore = this._calculateImpactScore((competitorH1Ratio - clientH1Ratio) * 100, 10, 40);
        
        gapAnalysis.addGap('content', {
          title: 'Missing H1 Headings',
          description: `Only ${Math.round(clientH1Ratio * 100)}% of your pages have H1 headings, compared to ${Math.round(competitorH1Ratio * 100)}% for competitors.`,
          impactScore,
          data: {
            clientValue: `${Math.round(clientH1Ratio * 100)}%`,
            competitorAverage: `${Math.round(competitorH1Ratio * 100)}%`,
            difference: `${Math.round((competitorH1Ratio - clientH1Ratio) * 100)}%`
          }
        });
      }
    }
    
    logger.info(`Content gap analysis completed, found ${gapAnalysis.gaps.content.length} gaps`);
  }

  /**
   * Analyze keyword gaps
   * @param {GapAnalysis} gapAnalysis Gap analysis model
   * @returns {Promise<void>}
   * @private
   */
  async _analyzeKeywordGaps(gapAnalysis) {
    logger.info('Analyzing keyword gaps');
    
    const { clientData, competitorsData, keywords } = gapAnalysis;
    
    // Skip if client data is missing or has errors
    if (!clientData || clientData.error || !keywords || keywords.length === 0) {
      return;
    }
    
    // Get client keyword data
    const clientKeywords = {};
    const competitorKeywords = {};
    
    // Process client keywords
    if (clientData.keywordAnalysis) {
      keywords.forEach(keyword => {
        if (clientData.keywordAnalysis[keyword]) {
          clientKeywords[keyword] = clientData.keywordAnalysis[keyword];
        }
      });
    }
    
    // Process competitor keywords
    keywords.forEach(keyword => {
      competitorKeywords[keyword] = {
        occurrences: 0,
        pages: 0,
        inTitle: 0,
        inDescription: 0,
        inHeadings: 0,
        density: 0,
        importanceScore: 0,
        competitors: 0
      };
    });
    
    Object.values(competitorsData).forEach(competitor => {
      if (!competitor.error && competitor.keywordAnalysis) {
        keywords.forEach(keyword => {
          if (competitor.keywordAnalysis[keyword]) {
            const data = competitor.keywordAnalysis[keyword];
            
            competitorKeywords[keyword].occurrences += data.occurrences;
            competitorKeywords[keyword].pages += data.pages;
            competitorKeywords[keyword].inTitle += data.inTitle;
            competitorKeywords[keyword].inDescription += data.inDescription;
            competitorKeywords[keyword].inHeadings += data.inHeadings;
            competitorKeywords[keyword].density += data.density;
            competitorKeywords[keyword].importanceScore += data.importanceScore;
            competitorKeywords[keyword].competitors++;
          }
        });
      }
    });
    
    // Calculate competitor keyword averages
    keywords.forEach(keyword => {
      const data = competitorKeywords[keyword];
      
      if (data.competitors > 0) {
        data.occurrences /= data.competitors;
        data.pages /= data.competitors;
        data.inTitle /= data.competitors;
        data.inDescription /= data.competitors;
        data.inHeadings /= data.competitors;
        data.density /= data.competitors;
        data.importanceScore /= data.competitors;
      }
    });
    
    // Analyze keyword gaps
    keywords.forEach(keyword => {
      const competitorData = competitorKeywords[keyword];
      const clientData = clientKeywords[keyword];
      
      // Skip keywords with insufficient competitor data
      if (competitorData.competitors <= 0) {
        return;
      }
      
      // Check if keyword is missing or underutilized
      if (!clientData || clientData.pages === 0) {
        // Keyword is completely missing
        const impactScore = this._calculateImpactScore(competitorData.importanceScore, 20, 100);
        
        gapAnalysis.addGap('keywords', {
          title: `Missing Keyword: "${keyword}"`,
          description: `Your site does not use the keyword "${keyword}" which appears on ${Math.round(competitorData.density)}% of competitor pages with an importance score of ${Math.round(competitorData.importanceScore)}/100.`,
          impactScore,
          data: {
            clientValue: 'Not used',
            competitorAverage: `Used on ${Math.round(competitorData.density)}% of pages`,
            difference: `100% gap`
          }
        });
      } else if (clientData.density < competitorData.density * 0.5) {
        // Keyword is significantly underutilized
        const impactScore = this._calculateImpactScore(competitorData.importanceScore * 0.8, 20, 100);
        
        gapAnalysis.addGap('keywords', {
          title: `Underutilized Keyword: "${keyword}"`,
          description: `Your site uses the keyword "${keyword}" on only ${Math.round(clientData.density)}% of pages, compared to ${Math.round(competitorData.density)}% for competitors.`,
          impactScore,
          data: {
            clientValue: `Used on ${Math.round(clientData.density)}% of pages`,
            competitorAverage: `Used on ${Math.round(competitorData.density)}% of pages`,
            difference: `${Math.round(competitorData.density - clientData.density)}% gap`
          }
        });
      } else if (clientData.inTitle < competitorData.inTitle * 0.5) {
        // Keyword is underutilized in titles
        const impactScore = this._calculateImpactScore(competitorData.importanceScore * 0.6, 20, 100);
        
        gapAnalysis.addGap('keywords', {
          title: `Keyword Missing from Titles: "${keyword}"`,
          description: `Your site uses the keyword "${keyword}" in titles on only ${clientData.inTitle} pages, compared to ${Math.round(competitorData.inTitle)} for competitors.`,
          impactScore,
          data: {
            clientValue: `Used in ${clientData.inTitle} titles`,
            competitorAverage: `Used in ${Math.round(competitorData.inTitle)} titles`,
            difference: `${Math.round(competitorData.inTitle - clientData.inTitle)} gap`
          }
        });
      }
    });
    
    logger.info(`Keyword gap analysis completed, found ${gapAnalysis.gaps.keywords.length} gaps`);
  }

  /**
   * Analyze performance gaps
   * @param {GapAnalysis} gapAnalysis Gap analysis model
   * @returns {Promise<void>}
   * @private
   */
  async _analyzePerformanceGaps(gapAnalysis) {
    logger.info('Analyzing performance gaps');
    
    const { clientData, competitorsData } = gapAnalysis;
    
    // Skip if client data is missing or has errors
    if (!clientData || clientData.error) {
      return;
    }
    
    // Get client performance metrics
    const clientPerformance = clientData.summary?.averagePerformance || {};
    
    // Calculate average competitor performance metrics
    const competitorMetrics = {};
    let competitors = 0;
    
    Object.values(competitorsData).forEach(competitor => {
      if (!competitor.error && competitor.summary?.averagePerformance) {
        competitors++;
        
        Object.entries(competitor.summary.averagePerformance).forEach(([metric, value]) => {
          if (typeof value === 'number') {
            if (!competitorMetrics[metric]) {
              competitorMetrics[metric] = 0;
            }
            
            competitorMetrics[metric] += value;
          }
        });
      }
    });
    
    // Calculate averages
    if (competitors > 0) {
      Object.keys(competitorMetrics).forEach(metric => {
        competitorMetrics[metric] /= competitors;
      });
    }
    
    // Check for load time issues
    if (clientPerformance.load !== undefined && competitorMetrics.load !== undefined) {
      const clientLoad = clientPerformance.load;
      const competitorLoad = competitorMetrics.load;
      
      if (clientLoad > competitorLoad * 1.2) {
        // Client load time is at least 20% slower than competitors
        const difference = clientLoad - competitorLoad;
        const percentDifference = (difference / competitorLoad) * 100;
        const impactScore = this._calculateImpactScore(percentDifference, 20, 100);
        
        gapAnalysis.addGap('performance', {
          title: 'Slow Page Load Time',
          description: `Your average page load time is ${clientLoad.toFixed(2)}ms, which is ${percentDifference.toFixed(1)}% slower than your competitors (${competitorLoad.toFixed(2)}ms).`,
          impactScore,
          data: {
            clientValue: `${clientLoad.toFixed(2)}ms`,
            competitorAverage: `${competitorLoad.toFixed(2)}ms`,
            difference: `${difference.toFixed(2)}ms (${percentDifference.toFixed(1)}% slower)`
          }
        });
      }
    }
    
    // Check for DOM content loaded issues
    if (clientPerformance.domContentLoaded !== undefined && competitorMetrics.domContentLoaded !== undefined) {
      const clientDCL = clientPerformance.domContentLoaded;
      const competitorDCL = competitorMetrics.domContentLoaded;
      
      if (clientDCL > competitorDCL * 1.2) {
        // Client DCL time is at least 20% slower than competitors
        const difference = clientDCL - competitorDCL;
        const percentDifference = (difference / competitorDCL) * 100;
        const impactScore = this._calculateImpactScore(percentDifference, 20, 100);
        
        gapAnalysis.addGap('performance', {
          title: 'Slow DOM Content Loaded Time',
          description: `Your average DOM content loaded time is ${clientDCL.toFixed(2)}ms, which is ${percentDifference.toFixed(1)}% slower than your competitors (${competitorDCL.toFixed(2)}ms).`,
          impactScore,
          data: {
            clientValue: `${clientDCL.toFixed(2)}ms`,
            competitorAverage: `${competitorDCL.toFixed(2)}ms`,
            difference: `${difference.toFixed(2)}ms (${percentDifference.toFixed(1)}% slower)`
          }
        });
      }
    }
    
    // Check for first paint issues
    if (clientPerformance.firstPaint !== undefined && competitorMetrics.firstPaint !== undefined) {
      const clientFP = clientPerformance.firstPaint;
      const competitorFP = competitorMetrics.firstPaint;
      
      if (clientFP > competitorFP * 1.2) {
        // Client first paint time is at least 20% slower than competitors
        const difference = clientFP - competitorFP;
        const percentDifference = (difference / competitorFP) * 100;
        const impactScore = this._calculateImpactScore(percentDifference, 20, 100);
        
        gapAnalysis.addGap('performance', {
          title: 'Slow First Paint Time',
          description: `Your average first paint time is ${clientFP.toFixed(2)}ms, which is ${percentDifference.toFixed(1)}% slower than your competitors (${competitorFP.toFixed(2)}ms).`,
          impactScore,
          data: {
            clientValue: `${clientFP.toFixed(2)}ms`,
            competitorAverage: `${competitorFP.toFixed(2)}ms`,
            difference: `${difference.toFixed(2)}ms (${percentDifference.toFixed(1)}% slower)`
          }
        });
      }
    }
    
    logger.info(`Performance gap analysis completed, found ${gapAnalysis.gaps.performance.length} gaps`);
  }

  /**
   * Analyze on-page SEO gaps
   * @param {GapAnalysis} gapAnalysis Gap analysis model
   * @returns {Promise<void>}
   * @private
   */
  async _analyzeOnPageGaps(gapAnalysis) {
    logger.info('Analyzing on-page SEO gaps');
    
    const { clientData, competitorsData } = gapAnalysis;
    
    // Skip if client data is missing or has errors
    if (!clientData || clientData.error) {
      return;
    }
    
    // Get client on-page SEO data
    const clientSeo = clientData.seo || {};
    
    // Calculate aggregate competitor on-page SEO data
    const competitorSeo = {
      images: { withAlt: 0, withoutAlt: 0 },
      links: { internal: 0, external: 0 }
    };
    let competitors = 0;
    
    Object.values(competitorsData).forEach(competitor => {
      if (!competitor.error && competitor.seo) {
        competitors++;
        
        // Aggregate image data
        if (competitor.seo.images) {
          competitorSeo.images.withAlt += competitor.seo.images.withAlt || 0;
          competitorSeo.images.withoutAlt += competitor.seo.images.withoutAlt || 0;
        }
        
        // Aggregate link data
        if (competitor.seo.links) {
          competitorSeo.links.internal += competitor.seo.links.internal || 0;
          competitorSeo.links.external += competitor.seo.links.external || 0;
        }
      }
    });
    
    // Calculate averages
    if (competitors > 0) {
      competitorSeo.images.withAlt /= competitors;
      competitorSeo.images.withoutAlt /= competitors;
      competitorSeo.links.internal /= competitors;
      competitorSeo.links.external /= competitors;
    }
    
    // Check for image alt text issues
    if (clientSeo.images && competitorSeo.images) {
      const clientTotal = (clientSeo.images.withAlt || 0) + (clientSeo.images.withoutAlt || 0);
      const clientAltPercent = clientTotal > 0 ? (clientSeo.images.withAlt || 0) / clientTotal * 100 : 0;
      
      const competitorTotal = competitorSeo.images.withAlt + competitorSeo.images.withoutAlt;
      const competitorAltPercent = competitorTotal > 0 ? competitorSeo.images.withAlt / competitorTotal * 100 : 0;
      
      if (clientAltPercent < competitorAltPercent * 0.8) {
        // Client alt text usage is at least 20% lower than competitors
        const difference = competitorAltPercent - clientAltPercent;
        const impactScore = this._calculateImpactScore(difference, 10, 50);
        
        gapAnalysis.addGap('onPage', {
          title: 'Poor Image Alt Text Usage',
          description: `Only ${clientAltPercent.toFixed(1)}% of your images have alt text, compared to ${competitorAltPercent.toFixed(1)}% for competitors.`,
          impactScore,
          data: {
            clientValue: `${clientAltPercent.toFixed(1)}% with alt text`,
            competitorAverage: `${competitorAltPercent.toFixed(1)}% with alt text`,
            difference: `${difference.toFixed(1)}% gap`
          }
        });
      }
    }
    
    // Check for internal linking issues
    if (clientSeo.links && competitorSeo.links) {
      const clientPagesAnalyzed = clientData.summary?.pagesAnalyzed || 1;
      const clientInternalPerPage = clientSeo.links.internal / clientPagesAnalyzed;
      
      const competitorPagesAnalyzed = Object.values(competitorsData).reduce((sum, c) => 
        !c.error ? sum + (c.summary?.pagesAnalyzed || 0) : sum, 0) / (competitors || 1);
      const competitorInternalPerPage = competitorSeo.links.internal / competitorPagesAnalyzed;
      
      if (clientInternalPerPage < competitorInternalPerPage * 0.7) {
        // Client has significantly fewer internal links per page
        const difference = competitorInternalPerPage - clientInternalPerPage;
        const percentDifference = (difference / competitorInternalPerPage) * 100;
        const impactScore = this._calculateImpactScore(percentDifference, 20, 70);
        
        gapAnalysis.addGap('onPage', {
          title: 'Insufficient Internal Linking',
          description: `Your pages have an average of ${clientInternalPerPage.toFixed(1)} internal links per page, compared to ${competitorInternalPerPage.toFixed(1)} for competitors.`,
          impactScore,
          data: {
            clientValue: `${clientInternalPerPage.toFixed(1)} internal links per page`,
            competitorAverage: `${competitorInternalPerPage.toFixed(1)} internal links per page`,
            difference: `${difference.toFixed(1)} links (${percentDifference.toFixed(1)}% fewer)`
          }
        });
      }
    }
    
    logger.info(`On-page SEO gap analysis completed, found ${gapAnalysis.gaps.onPage.length} gaps`);
  }

  /**
   * Analyze site structure gaps
   * @param {GapAnalysis} gapAnalysis Gap analysis model
   * @returns {Promise<void>}
   * @private
   */
  async _analyzeStructureGaps(gapAnalysis) {
    logger.info('Analyzing site structure gaps');
    
    const { clientData, competitorsData } = gapAnalysis;
    
    // Skip if client data is missing or has errors
    if (!clientData || clientData.error) {
      return;
    }
    
    // Get client structure data (this is a simplified placeholder - would be more detailed in production)
    const clientStructure = {
      averageDepth: 0,
      categories: 0,
      orphanedPages: 0
    };
    
    // In production, this would be extracted from the actual crawl data
    if (clientData.structure) {
      clientStructure.averageDepth = clientData.structure.averageDepth || 0;
      clientStructure.categories = clientData.structure.categories || 0;
      clientStructure.orphanedPages = clientData.structure.orphanedPages || 0;
    }
    
    // Calculate average competitor structure metrics
    const competitorStructure = {
      averageDepth: 0,
      categories: 0,
      orphanedPages: 0
    };
    let competitors = 0;
    
    Object.values(competitorsData).forEach(competitor => {
      if (!competitor.error && competitor.structure) {
        competitors++;
        
        competitorStructure.averageDepth += competitor.structure.averageDepth || 0;
        competitorStructure.categories += competitor.structure.categories || 0;
        competitorStructure.orphanedPages += competitor.structure.orphanedPages || 0;
      }
    });
    
    // Calculate averages
    if (competitors > 0) {
      competitorStructure.averageDepth /= competitors;
      competitorStructure.categories /= competitors;
      competitorStructure.orphanedPages /= competitors;
    }
    
    // This is a placeholder for structure analysis
    // In a real implementation, we would analyze site hierarchy, URL structure, content organization, etc.
    
    // Example placeholder gap
    if (clientStructure.averageDepth > 0 && competitorStructure.averageDepth > 0) {
      if (clientStructure.averageDepth > competitorStructure.averageDepth * 1.3) {
        // Client site has a deeper structure (potentially problematic)
        const difference = clientStructure.averageDepth - competitorStructure.averageDepth;
        const impactScore = this._calculateImpactScore(difference, 1, 3);
        
        gapAnalysis.addGap('structure', {
          title: 'Excessive Site Depth',
          description: `Your site has an average depth of ${clientStructure.averageDepth.toFixed(1)} levels, compared to ${competitorStructure.averageDepth.toFixed(1)} for competitors.`,
          impactScore,
          data: {
            clientValue: `${clientStructure.averageDepth.toFixed(1)} levels deep`,
            competitorAverage: `${competitorStructure.averageDepth.toFixed(1)} levels deep`,
            difference: `${difference.toFixed(1)} extra levels`
          }
        });
      }
    }
    
    logger.info(`Structure gap analysis completed, found ${gapAnalysis.gaps.structure.length} gaps`);
  }

  /**
   * Generate opportunities based on identified gaps
   * @param {GapAnalysis} gapAnalysis Gap analysis model
   * @returns {Promise<void>}
   * @private
   */
  async _generateOpportunities(gapAnalysis) {
    logger.info('Generating opportunities from gap analysis');
    
    // Get all gaps sorted by impact
    const sortedGaps = gapAnalysis.getGapsSortedByImpact();
    
    // Group gaps by category
    const gapsByCategory = {};
    
    sortedGaps.forEach(gap => {
      if (!gapsByCategory[gap.category]) {
        gapsByCategory[gap.category] = [];
      }
      
      gapsByCategory[gap.category].push(gap);
    });
    
    // Generate opportunities for technical SEO gaps
    if (gapsByCategory.technical && gapsByCategory.technical.length > 0) {
      const technicalGaps = gapsByCategory.technical;
      
      // Title tag optimization opportunity
      const titleGaps = technicalGaps.filter(gap => gap.title.includes('Title'));
      
      if (titleGaps.length > 0) {
        gapAnalysis.addOpportunity({
          title: 'Optimize Page Titles',
          description: 'Improve your page titles to increase search visibility and click-through rates.',
          category: 'Technical SEO',
          impactScore: Math.max(...titleGaps.map(g => g.impactScore)),
          actions: [
            'Ensure every page has a unique, descriptive title tag',
            'Keep titles between 50-60 characters to avoid truncation in search results',
            'Include primary keywords in the title, preferably near the beginning',
            'Follow a consistent title format across the site'
          ],
          relatedGaps: titleGaps.map(g => g.title)
        });
      }
      
      // Meta description optimization opportunity
      const descriptionGaps = technicalGaps.filter(gap => gap.title.includes('Description'));
      
      if (descriptionGaps.length > 0) {
        gapAnalysis.addOpportunity({
          title: 'Improve Meta Descriptions',
          description: 'Create compelling meta descriptions to increase click-through rates from search results.',
          category: 'Technical SEO',
          impactScore: Math.max(...descriptionGaps.map(g => g.impactScore)),
          actions: [
            'Add unique meta descriptions to all pages',
            'Keep descriptions between 120-158 characters',
            'Include a call-to-action to encourage clicks',
            'Incorporate relevant keywords naturally'
          ],
          relatedGaps: descriptionGaps.map(g => g.title)
        });
      }
      
      // Schema markup opportunity
      const schemaGaps = technicalGaps.filter(gap => gap.title.includes('Schema'));
      
      if (schemaGaps.length > 0) {
        gapAnalysis.addOpportunity({
          title: 'Implement Schema Markup',
          description: 'Add structured data markup to improve how search engines understand your content and enable rich snippets in search results.',
          category: 'Technical SEO',
          impactScore: Math.max(...schemaGaps.map(g => g.impactScore)),
          actions: [
            'Implement schema.org markup for your primary content types',
            'Add Organization, LocalBusiness, or Person schema to your homepage',
            'Add Product schema to all product pages',
            'Implement Article or BlogPosting schema for blog content',
            'Use Schema markup validator to ensure correct implementation'
          ],
          relatedGaps: schemaGaps.map(g => g.title)
        });
      }
    }
    
    // Generate opportunities for content gaps
    if (gapsByCategory.content && gapsByCategory.content.length > 0) {
      const contentGaps = gapsByCategory.content;
      
      // Content length optimization opportunity
      const contentLengthGaps = contentGaps.filter(gap => gap.title.includes('Thin Content'));
      
      if (contentLengthGaps.length > 0) {
        gapAnalysis.addOpportunity({
          title: 'Expand Content Depth',
          description: 'Create more comprehensive content to better satisfy user intent and improve search rankings.',
          category: 'Content',
          impactScore: Math.max(...contentLengthGaps.map(g => g.impactScore)),
          actions: [
            'Identify and prioritize thin content pages',
            'Expand content with valuable, relevant information',
            'Add subheadings to improve content structure',
            'Include more examples, statistics, and visual elements',
            'Address common questions related to the topic'
          ],
          relatedGaps: contentLengthGaps.map(g => g.title)
        });
      }
      
      // Heading structure optimization opportunity
      const headingGaps = contentGaps.filter(gap => gap.title.includes('Heading'));
      
      if (headingGaps.length > 0) {
        gapAnalysis.addOpportunity({
          title: 'Improve Heading Structure',
          description: 'Optimize your content structure with proper headings to enhance readability and SEO.',
          category: 'Content',
          impactScore: Math.max(...headingGaps.map(g => g.impactScore)),
          actions: [
            'Ensure every page has a single H1 tag containing the primary keyword',
            'Use H2 tags for main sections and H3 tags for subsections',
            'Include relevant keywords in headings naturally',
            'Create a logical hierarchy with your heading structure',
            'Keep headings descriptive and concise'
          ],
          relatedGaps: headingGaps.map(g => g.title)
        });
      }
    }
    
    // Generate opportunities for keyword gaps
    if (gapsByCategory.keywords && gapsByCategory.keywords.length > 0) {
      const keywordGaps = gapsByCategory.keywords;
      
      // Keyword coverage opportunity
      const missingKeywordGaps = keywordGaps.filter(gap => gap.title.includes('Missing Keyword'));
      
      if (missingKeywordGaps.length > 0) {
        gapAnalysis.addOpportunity({
          title: 'Expand Keyword Coverage',
          description: 'Target important keywords that your competitors are ranking for but are missing from your site.',
          category: 'Keywords',
          impactScore: Math.max(...missingKeywordGaps.map(g => g.impactScore)),
          actions: [
            'Create new content targeting the missing keywords',
            'Update existing content to incorporate missing keywords',
            'Add missing keywords to titles and headings where relevant',
            'Include missing keywords in meta descriptions'
          ],
          relatedGaps: missingKeywordGaps.map(g => g.title)
        });
      }
      
      // Keyword optimization opportunity
      const underutilizedKeywordGaps = keywordGaps.filter(gap => gap.title.includes('Underutilized'));
      
      if (underutilizedKeywordGaps.length > 0) {
        gapAnalysis.addOpportunity({
          title: 'Optimize Existing Keywords',
          description: 'Improve your usage of keywords that are underutilized compared to competitors.',
          category: 'Keywords',
          impactScore: Math.max(...underutilizedKeywordGaps.map(g => g.impactScore)),
          actions: [
            'Incorporate underutilized keywords in more pages',
            'Add keywords to important on-page elements (titles, headings, first paragraph)',
            'Create new content clusters around underutilized keywords',
            'Update internal linking to target keyword-focused pages'
          ],
          relatedGaps: underutilizedKeywordGaps.map(g => g.title)
        });
      }
    }
    
    // Generate opportunities for performance gaps
    if (gapsByCategory.performance && gapsByCategory.performance.length > 0) {
      const performanceGaps = gapsByCategory.performance;
      
      // Page speed optimization opportunity
      const speedGaps = performanceGaps.filter(gap => gap.title.includes('Slow'));
      
      if (speedGaps.length > 0) {
        gapAnalysis.addOpportunity({
          title: 'Improve Page Speed',
          description: 'Optimize your site speed to enhance user experience and search rankings.',
          category: 'Performance',
          impactScore: Math.max(...speedGaps.map(g => g.impactScore)),
          actions: [
            'Optimize and compress images',
            'Minify CSS, JavaScript, and HTML',
            'Implement browser caching',
            'Reduce server response time',
            'Prioritize visible content',
            'Reduce the number of HTTP requests',
            'Use a content delivery network (CDN)'
          ],
          relatedGaps: speedGaps.map(g => g.title)
        });
      }
    }
    
    // Generate opportunities for on-page SEO gaps
    if (gapsByCategory.onPage && gapsByCategory.onPage.length > 0) {
      const onPageGaps = gapsByCategory.onPage;
      
      // Image optimization opportunity
      const imageGaps = onPageGaps.filter(gap => gap.title.includes('Image'));
      
      if (imageGaps.length > 0) {
        gapAnalysis.addOpportunity({
          title: 'Optimize Images',
          description: 'Improve image optimization for better accessibility, user experience, and SEO.',
          category: 'On-Page SEO',
          impactScore: Math.max(...imageGaps.map(g => g.impactScore)),
          actions: [
            'Add descriptive alt text to all images',
            'Compress images to reduce file size without sacrificing quality',
            'Use appropriate image formats (JPEG for photos, PNG for graphics)',
            'Implement lazy loading for images',
            'Ensure responsive images for mobile devices'
          ],
          relatedGaps: imageGaps.map(g => g.title)
        });
      }
      
      // Internal linking opportunity
      const linkingGaps = onPageGaps.filter(gap => gap.title.includes('Linking'));
      
      if (linkingGaps.length > 0) {
        gapAnalysis.addOpportunity({
          title: 'Improve Internal Linking',
          description: 'Enhance your internal linking structure to better distribute page authority and help users navigate your site.',
          category: 'On-Page SEO',
          impactScore: Math.max(...linkingGaps.map(g => g.impactScore)),
          actions: [
            'Create a logical site structure with clear navigation',
            'Add contextual links within content',
            'Use descriptive anchor text that includes target keywords',
            'Link from high-authority pages to important content',
            'Create pillar pages and content clusters',
            'Fix broken internal links'
          ],
          relatedGaps: linkingGaps.map(g => g.title)
        });
      }
    }
    
    // Generate opportunities for structure gaps
    if (gapsByCategory.structure && gapsByCategory.structure.length > 0) {
      const structureGaps = gapsByCategory.structure;
      
      // Site structure opportunity
      const depthGaps = structureGaps.filter(gap => gap.title.includes('Depth'));
      
      if (depthGaps.length > 0) {
        gapAnalysis.addOpportunity({
          title: 'Flatten Site Architecture',
          description: 'Improve your site structure to reduce click depth and make important pages more accessible to users and search engines.',
          category: 'Site Structure',
          impactScore: Math.max(...depthGaps.map(g => g.impactScore)),
          actions: [
            'Reorganize site navigation to reduce depth',
            'Ensure important pages are no more than 3 clicks from the homepage',
            'Implement a logical category structure',
            'Add breadcrumb navigation',
            'Create an HTML sitemap for users',
            'Maintain an updated XML sitemap for search engines'
          ],
          relatedGaps: depthGaps.map(g => g.title)
        });
      }
    }
    
    logger.info(`Generated ${gapAnalysis.getAllOpportunities().length} opportunities from gap analysis`);
  }

  /**
   * Calculate impact score based on the severity of the gap
   * @param {number} value The value to evaluate
   * @param {number} minThreshold Minimum threshold for impact
   * @param {number} maxThreshold Maximum threshold for impact
   * @returns {number} Impact score (1-5)
   * @private
   */
  _calculateImpactScore(value, minThreshold, maxThreshold) {
    // Value below minimum threshold has minimal impact
    if (value < minThreshold) {
      return 1;
    }
    
    // Value above maximum threshold has maximum impact
    if (value >= maxThreshold) {
      return 5;
    }
    
    // Calculate normalized score between 1 and 5
    const normalizedValue = (value - minThreshold) / (maxThreshold - minThreshold);
    return 1 + normalizedValue * 4;
  }
}

module.exports = GapAnalyzer;
