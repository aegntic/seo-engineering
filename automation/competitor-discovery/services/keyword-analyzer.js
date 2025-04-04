/**
 * Keyword Analyzer Service
 * 
 * Responsible for discovering competitors based on keyword overlap
 */

const logger = require('../utils/logger');
const { extractDomain } = require('../utils/url-utils');

/**
 * KeywordAnalyzer Class
 * Discovers competitors based on keyword similarity
 */
class KeywordAnalyzer {
  /**
   * Constructor
   * 
   * @param {Object} config - Keyword analyzer configuration
   */
  constructor(config) {
    this.config = config;
    this.ignoredKeywords = new Set(config.ignoredKeywords || []);
    this.minOverlap = config.minOverlap || 0.3;
    this.maxKeywords = config.maxKeywords || 100;
    this.prioritizeTopRanking = config.prioritizeTopRanking !== false;
    this.keywordImportanceWeights = config.keywordImportanceWeights || {
      title: 1.5,
      headings: 1.2,
      content: 1.0,
      meta: 0.8
    };
  }
  
  /**
   * Find competitors based on keyword similarity
   * 
   * @param {Object} siteData - Site data including keywords
   * @returns {Promise<Array<Object>>} - Discovered competitors
   */
  async findCompetitors(siteData) {
    logger.info(`Finding competitors using keyword analysis for site ${siteData._id}`);
    
    try {
      // 1. Get site keywords
      const siteKeywords = this._extractKeywords(siteData);
      
      if (siteKeywords.length === 0) {
        logger.warn(`No keywords found for site ${siteData._id}`);
        return [];
      }
      
      // 2. Search for top-ranking content for these keywords
      const competitorsByKeyword = await this._searchCompetitorsForKeywords(siteKeywords);
      
      // 3. Calculate keyword overlap and relevance scores
      const competitors = this._calculateCompetitorRelevance(competitorsByKeyword, siteKeywords);
      
      // 4. Filter and format results
      const formattedCompetitors = this._formatCompetitors(competitors, siteData.domain);
      
      logger.info(`Found ${formattedCompetitors.length} competitors using keyword analysis for site ${siteData._id}`);
      
      return formattedCompetitors;
    } catch (error) {
      logger.error(`Error finding competitors using keyword analysis: ${error.message}`, {
        siteId: siteData._id,
        error: error.stack
      });
      
      // Return empty array on error
      return [];
    }
  }
  
  /**
   * Extract keywords from site data
   * 
   * @param {Object} siteData - Site data
   * @returns {Array<Object>} - Extracted keywords with importance
   * @private
   */
  _extractKeywords(siteData) {
    // In a real implementation, this would analyze site content
    // For now, we'll use the keywords provided in site data
    
    const keywords = siteData.keywords || [];
    
    // Filter out ignored keywords
    const filteredKeywords = keywords.filter(kw => 
      !this.ignoredKeywords.has(kw.keyword.toLowerCase())
    );
    
    // Limit to max keywords
    return filteredKeywords.slice(0, this.maxKeywords);
  }
  
  /**
   * Search for competitors ranking for the site's keywords
   * 
   * @param {Array<Object>} keywords - Site keywords
   * @returns {Promise<Object>} - Map of competitors by keyword
   * @private
   */
  async _searchCompetitorsForKeywords(keywords) {
    // In a real implementation, this would query a SERP API for each keyword
    // For now, we'll simulate the results
    
    const competitorsByKeyword = {};
    
    for (const keywordObj of keywords) {
      const keyword = keywordObj.keyword;
      
      // Simulate SERP results for this keyword
      competitorsByKeyword[keyword] = this._simulateKeywordResults(keyword);
    }
    
    return competitorsByKeyword;
  }
  
  /**
   * Simulate SERP results for a keyword (for development purposes)
   * 
   * @param {String} keyword - Keyword to simulate results for
   * @returns {Array<Object>} - Simulated SERP results
   * @private
   */
  _simulateKeywordResults(keyword) {
    // Generate deterministic but varied results based on keyword string
    // This is just for development and testing
    
    const keywordHash = this._simpleHash(keyword);
    const resultCount = 5 + (keywordHash % 5); // 5-9 results
    
    const domains = [
      'competitor1.com',
      'competitor2.com',
      'competitor3.com',
      'competitor4.com',
      'competitor5.com',
      'competitor6.com',
      'competitor7.com',
      'competitor8.com',
      'competitor9.com',
      'competitor10.com'
    ];
    
    const results = [];
    
    for (let i = 0; i < resultCount; i++) {
      const domainIndex = (keywordHash + i) % domains.length;
      const domain = domains[domainIndex];
      const position = i + 1;
      
      results.push({
        domain,
        url: `https://${domain}/page-${i}`,
        title: `${domain} - ${keyword} page`,
        position,
        snippet: `This is a result about ${keyword} from ${domain}.`
      });
    }
    
    return results;
  }
  
  /**
   * Simple string hash function for simulation
   * 
   * @param {String} str - Input string
   * @returns {Number} - Numeric hash
   * @private
   */
  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Calculate relevance scores for potential competitors
   * 
   * @param {Object} competitorsByKeyword - Map of competitors by keyword
   * @param {Array<Object>} siteKeywords - Site keywords
   * @returns {Array<Object>} - Competitors with relevance scores
   * @private
   */
  _calculateCompetitorRelevance(competitorsByKeyword, siteKeywords) {
    // Build a map of competitors with keyword overlap information
    const competitorsMap = new Map();
    const totalKeywords = siteKeywords.length;
    
    // Process each keyword
    for (const keywordObj of siteKeywords) {
      const keyword = keywordObj.keyword;
      const keywordImportance = keywordObj.importance || 1.0;
      
      // Skip if no competitors for this keyword
      if (!competitorsByKeyword[keyword] || !Array.isArray(competitorsByKeyword[keyword])) {
        continue;
      }
      
      // Process each competitor for this keyword
      for (const result of competitorsByKeyword[keyword]) {
        const domain = result.domain;
        
        // Skip if no domain
        if (!domain) continue;
        
        // Calculate position weight (higher positions get higher weight)
        const positionWeight = this.prioritizeTopRanking
          ? 1 - ((result.position - 1) / 10) // Positions 1-10 get weights 1.0-0.1
          : 1.0;
        
        // Calculate keyword score considering importance and position
        const keywordScore = keywordImportance * positionWeight;
        
        // Update competitor data
        if (competitorsMap.has(domain)) {
          // Existing competitor
          const competitor = competitorsMap.get(domain);
          competitor.keywords.push(keyword);
          competitor.score += keywordScore;
          competitor.urls.add(result.url);
          
          // Update best position if this one is better
          if (result.position < competitor.bestPosition) {
            competitor.bestPosition = result.position;
            competitor.bestKeyword = keyword;
          }
        } else {
          // New competitor
          competitorsMap.set(domain, {
            domain,
            keywords: [keyword],
            score: keywordScore,
            bestPosition: result.position,
            bestKeyword: keyword,
            urls: new Set([result.url])
          });
        }
      }
    }
    
    // Convert map to array and calculate final relevance scores
    const competitors = Array.from(competitorsMap.values()).map(competitor => {
      // Calculate keyword overlap percentage
      const keywordOverlap = competitor.keywords.length / totalKeywords;
      
      // Normalize score based on total possible score
      const maxPossibleScore = totalKeywords; // simplified; could be more complex with weights
      const normalizedScore = competitor.score / maxPossibleScore;
      
      // Calculate final relevance score (combination of keyword overlap and normalized score)
      const relevanceScore = (keywordOverlap * 0.7) + (normalizedScore * 0.3);
      
      return {
        domain: competitor.domain,
        relevanceScore,
        keywordOverlap,
        matchedKeywords: competitor.keywords,
        bestPosition: competitor.bestPosition,
        bestKeyword: competitor.bestKeyword,
        discoveryMethod: 'keyword',
        urls: Array.from(competitor.urls)
      };
    });
    
    // Filter by minimum overlap and sort by relevance
    return competitors
      .filter(competitor => competitor.keywordOverlap >= this.minOverlap)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  /**
   * Format competitors for final output
   * 
   * @param {Array<Object>} competitors - Raw competitor data
   * @param {String} siteDomain - The site's own domain to exclude
   * @returns {Array<Object>} - Formatted competitors
   * @private
   */
  _formatCompetitors(competitors, siteDomain) {
    return competitors
      // Filter out the site itself
      .filter(competitor => competitor.domain !== siteDomain)
      // Format for output
      .map(competitor => ({
        url: competitor.urls[0] || `https://${competitor.domain}`,
        domain: competitor.domain,
        relevanceScore: competitor.relevanceScore,
        discoveryMethod: 'keyword',
        keywordOverlap: competitor.matchedKeywords.length,
        backlinksInCommon: 0, // Will be filled by backlink analyzer
        serpOverlap: 0, // Will be filled by SERP analyzer
        industryMatch: false // Will be filled by industry classifier
      }));
  }
}

module.exports = KeywordAnalyzer;
