/**
 * SERP Analyzer Service
 * 
 * Responsible for discovering competitors based on search engine results page analysis
 */

const logger = require('../utils/logger');
const { extractDomain } = require('../utils/url-utils');
const axios = require('axios').default;

/**
 * SerpAnalyzer Class
 * Discovers competitors by analyzing search engine results pages
 */
class SerpAnalyzer {
  /**
   * Constructor
   * 
   * @param {Object} config - SERP analyzer configuration
   */
  constructor(config) {
    this.config = config;
    this.maxResults = config.maxResults || 20;
    this.includeAds = config.includeAds || false;
    this.regions = config.regions || ['us'];
    this.engines = config.engines || ['google'];
    this.maxQueriesPerDay = config.maxQueriesPerDay || 100;
    this.resultWeight = config.resultWeight || {
      position1_3: 1.0,
      position4_10: 0.8,
      position11_20: 0.5,
      position21_plus: 0.2
    };
    this.apiEndpoints = config.apiEndpoints || {
      google: process.env.GOOGLE_SERP_API_ENDPOINT || 'https://serpapi.com/search'
    };
    this.apiKeys = {
      google: process.env.SERP_API_KEY || ''
    };
  }
  
  /**
   * Find competitors based on SERP analysis
   * 
   * @param {Object} siteData - Site data including domain and keywords
   * @returns {Promise<Array<Object>>} - Discovered competitors
   */
  async findCompetitors(siteData) {
    logger.info(`Finding competitors using SERP analysis for site ${siteData._id}`);
    
    try {
      // 1. Extract queries to search
      const queries = this._buildQueries(siteData);
      
      if (queries.length === 0) {
        logger.warn(`No queries generated for site ${siteData._id}`);
        return [];
      }
      
      // 2. Get SERP results for these queries
      const serpResults = await this._fetchSerpResults(queries);
      
      // 3. Analyze results to find competitors
      const competitorData = this._analyzeSerpResults(serpResults, siteData.domain);
      
      // 4. Calculate relevance scores
      const competitors = this._calculateRelevanceScores(competitorData, siteData.domain);
      
      logger.info(`Found ${competitors.length} competitors using SERP analysis for site ${siteData._id}`);
      
      return competitors;
    } catch (error) {
      logger.error(`Error finding competitors using SERP analysis: ${error.message}`, {
        siteId: siteData._id,
        error: error.stack
      });
      
      // Return empty array on error
      return [];
    }
  }
  
  /**
   * Build search queries from site data
   * 
   * @param {Object} siteData - Site data
   * @returns {Array<Object>} - Search queries
   * @private
   */
  _buildQueries(siteData) {
    // Build search queries from keywords and site information
    const queries = [];
    
    // Use keywords as primary queries
    if (siteData.keywords && Array.isArray(siteData.keywords)) {
      // Sort keywords by importance
      const sortedKeywords = [...siteData.keywords]
        .sort((a, b) => (b.importance || 0) - (a.importance || 0))
        .slice(0, Math.min(10, siteData.keywords.length)); // Limit to top 10
      
      // Add each keyword as a query
      for (const keywordObj of sortedKeywords) {
        queries.push({
          query: keywordObj.keyword,
          importance: keywordObj.importance || 1.0,
          type: 'keyword'
        });
      }
    }
    
    // Add site-specific queries
    if (siteData.domain) {
      // "alternatives to" query
      queries.push({
        query: `alternatives to ${siteData.domain}`,
        importance: 1.0,
        type: 'alternative'
      });
      
      // "vs" query for top competitors if available
      if (siteData.knownCompetitors && Array.isArray(siteData.knownCompetitors)) {
        for (const competitor of siteData.knownCompetitors.slice(0, 3)) {
          queries.push({
            query: `${siteData.domain} vs ${competitor}`,
            importance: 0.9,
            type: 'comparison'
          });
        }
      }
      
      // Industry-specific query if available
      if (siteData.industry) {
        queries.push({
          query: `best ${siteData.industry} websites`,
          importance: 0.8,
          type: 'industry'
        });
      }
    }
    
    return queries;
  }
  
  /**
   * Fetch SERP results for queries
   * 
   * @param {Array<Object>} queries - Search queries
   * @returns {Promise<Array<Object>>} - SERP results
   * @private
   */
  async _fetchSerpResults(queries) {
    // In a real implementation, this would call a SERP API
    // For now, we'll simulate the results
    
    logger.info(`Fetching SERP results for ${queries.length} queries`);
    
    const results = [];
    
    for (const query of queries) {
      try {
        // Simulate API call to search engine
        const serpResult = await this._simulateSerpApiCall(query.query);
        
        results.push({
          query: query.query,
          importance: query.importance,
          type: query.type,
          results: serpResult
        });
      } catch (error) {
        logger.error(`Error fetching SERP results for query "${query.query}": ${error.message}`);
        // Continue with next query
      }
    }
    
    return results;
  }
  
  /**
   * Simulate a SERP API call (for development purposes)
   * 
   * @param {String} query - Search query
   * @returns {Promise<Array<Object>>} - Simulated SERP results
   * @private
   */
  async _simulateSerpApiCall(query) {
    // Generate deterministic but varied results based on query string
    // This is just for development and testing
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const queryHash = this._simpleHash(query);
    const resultCount = 10 + (queryHash % 10); // 10-19 results
    
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
      'competitor10.com',
      'competitor11.com',
      'competitor12.com',
      'competitor13.com',
      'competitor14.com',
      'competitor15.com'
    ];
    
    const results = [];
    
    for (let i = 0; i < resultCount; i++) {
      const domainIndex = (queryHash + i * 3) % domains.length;
      const domain = domains[domainIndex];
      const position = i + 1;
      
      results.push({
        position,
        title: `${domain} - ${query} Page`,
        url: `https://${domain}/page-about-${query.replace(/\s+/g, '-')}`,
        domain,
        snippet: `This is a result for ${query} from ${domain}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        cachedUrl: `https://webcache.example.com/cache?q=${domain}`,
        linkType: 'organic'
      });
    }
    
    // Add some ad results if includeAds is true
    if (this.includeAds) {
      for (let i = 0; i < 2; i++) {
        const domainIndex = (queryHash + i * 7) % domains.length;
        const domain = `ad-${domains[domainIndex]}`;
        
        results.push({
          position: i + 1,
          title: `[Ad] ${domain} - ${query} Products`,
          url: `https://${domain}/products?ref=${query.replace(/\s+/g, '+')}`,
          domain,
          snippet: `Sponsored: ${query} products and services from ${domain}. Best prices guaranteed!`,
          linkType: 'paid'
        });
      }
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
   * Analyze SERP results to identify potential competitors
   * 
   * @param {Array<Object>} serpResults - SERP results
   * @param {String} siteDomain - Site domain to exclude
   * @returns {Object} - Competitor data
   * @private
   */
  _analyzeSerpResults(serpResults, siteDomain) {
    const competitorData = new Map();
    
    // Process each SERP result
    for (const serp of serpResults) {
      const query = serp.query;
      const queryImportance = serp.importance || 1.0;
      const queryType = serp.type;
      
      // Skip if no results
      if (!serp.results || !Array.isArray(serp.results)) {
        continue;
      }
      
      // Process each result in the SERP
      for (const result of serp.results) {
        // Skip if no domain or matching the site's own domain
        if (!result.domain || result.domain === siteDomain) {
          continue;
        }
        
        // Skip ads if not including them
        if (result.linkType === 'paid' && !this.includeAds) {
          continue;
        }
        
        // Calculate position weight
        let positionWeight;
        if (result.position <= 3) {
          positionWeight = this.resultWeight.position1_3;
        } else if (result.position <= 10) {
          positionWeight = this.resultWeight.position4_10;
        } else if (result.position <= 20) {
          positionWeight = this.resultWeight.position11_20;
        } else {
          positionWeight = this.resultWeight.position21_plus;
        }
        
        // Calculate result score
        const resultScore = queryImportance * positionWeight;
        
        // Update competitor data
        if (competitorData.has(result.domain)) {
          // Existing competitor
          const competitor = competitorData.get(result.domain);
          
          // Update queries
          if (!competitor.queries[query]) {
            competitor.queries[query] = {
              position: result.position,
              url: result.url,
              score: resultScore,
              type: queryType
            };
            competitor.queryCount++;
          } else if (result.position < competitor.queries[query].position) {
            // Update if better position
            competitor.queries[query].position = result.position;
            competitor.queries[query].url = result.url;
            competitor.queries[query].score = resultScore;
          }
          
          // Update total score
          competitor.totalScore += resultScore;
          
          // Update best position
          if (result.position < competitor.bestPosition) {
            competitor.bestPosition = result.position;
            competitor.bestQuery = query;
          }
          
          // Add URL to set
          competitor.urls.add(result.url);
          
          // Update query types
          if (!competitor.queryTypes.includes(queryType)) {
            competitor.queryTypes.push(queryType);
          }
        } else {
          // New competitor
          competitorData.set(result.domain, {
            domain: result.domain,
            queries: {
              [query]: {
                position: result.position,
                url: result.url,
                score: resultScore,
                type: queryType
              }
            },
            queryCount: 1,
            totalScore: resultScore,
            bestPosition: result.position,
            bestQuery: query,
            urls: new Set([result.url]),
            queryTypes: [queryType]
          });
        }
      }
    }
    
    return competitorData;
  }
  
  /**
   * Calculate relevance scores for potential competitors
   * 
   * @param {Map} competitorData - Competitor data
   * @param {String} siteDomain - Site domain
   * @returns {Array<Object>} - Competitors with relevance scores
   * @private
   */
  _calculateRelevanceScores(competitorData, siteDomain) {
    // Calculate the maximum possible score
    const totalQueries = new Set(
      Array.from(competitorData.values()).flatMap(c => Object.keys(c.queries))
    ).size;
    const maxPossibleScore = totalQueries * this.resultWeight.position1_3;
    
    // Convert map to array and calculate relevance scores
    const competitors = Array.from(competitorData.values()).map(competitor => {
      // Calculate SERP overlap - percentage of queries the competitor appears for
      const serpOverlap = competitor.queryCount / totalQueries;
      
      // Calculate normalized score
      const normalizedScore = maxPossibleScore > 0
        ? competitor.totalScore / maxPossibleScore
        : 0;
      
      // Bonus for appearing in specific query types
      let queryTypeBonus = 0;
      if (competitor.queryTypes.includes('alternative')) queryTypeBonus += 0.1;
      if (competitor.queryTypes.includes('comparison')) queryTypeBonus += 0.1;
      if (competitor.queryTypes.includes('industry')) queryTypeBonus += 0.05;
      
      // Calculate final relevance score
      const relevanceScore = (serpOverlap * 0.4) + (normalizedScore * 0.5) + queryTypeBonus;
      
      // Convert URL set to array and get primary URL
      const urls = Array.from(competitor.urls);
      const primaryUrl = urls[0] || `https://${competitor.domain}`;
      
      return {
        url: primaryUrl,
        domain: competitor.domain,
        relevanceScore: Math.min(relevanceScore, 1.0), // Cap at 1.0
        discoveryMethod: 'serp',
        keywordOverlap: 0, // Will be filled by keyword analyzer
        backlinksInCommon: 0, // Will be filled by backlink analyzer
        serpOverlap: competitor.queryCount,
        industryMatch: false, // Will be filled by industry classifier
        bestPosition: competitor.bestPosition,
        bestQuery: competitor.bestQuery
      };
    });
    
    // Sort by relevance score
    return competitors.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  /**
   * Real SERP API call implementation (commented out, would be used in production)
   * 
   * @param {String} query - Search query
   * @param {String} engine - Search engine
   * @param {String} region - Region code
   * @returns {Promise<Array<Object>>} - SERP results
   * @private
   */
  /*
  async _callSerpApi(query, engine = 'google', region = 'us') {
    const apiKey = this.apiKeys[engine];
    const endpoint = this.apiEndpoints[engine];
    
    if (!apiKey) {
      throw new Error(`No API key found for engine: ${engine}`);
    }
    
    logger.debug(`Calling SERP API for query: ${query}, engine: ${engine}, region: ${region}`);
    
    // Different parameters based on engine
    let params;
    if (engine === 'google') {
      params = {
        q: query,
        api_key: apiKey,
        num: this.maxResults,
        gl: region,
        hl: 'en'
      };
    } else if (engine === 'bing') {
      params = {
        q: query,
        subscription_key: apiKey,
        count: this.maxResults,
        mkt: region === 'us' ? 'en-US' : `en-${region.toUpperCase()}`
      };
    } else {
      throw new Error(`Unsupported engine: ${engine}`);
    }
    
    try {
      const response = await axios.get(endpoint, { params });
      
      if (response.status !== 200) {
        throw new Error(`SERP API returned status ${response.status}`);
      }
      
      // Parse results based on engine
      let results = [];
      if (engine === 'google') {
        const organicResults = response.data.organic_results || [];
        results = organicResults.map(result => ({
          position: result.position,
          title: result.title,
          url: result.link,
          domain: extractDomain(result.link),
          snippet: result.snippet,
          cachedUrl: result.cached_page_link,
          linkType: 'organic'
        }));
        
        // Add ads if requested
        if (this.includeAds && response.data.ads) {
          const adResults = response.data.ads.map(ad => ({
            position: ad.position,
            title: ad.title,
            url: ad.link,
            domain: extractDomain(ad.link),
            snippet: ad.snippet,
            linkType: 'paid'
          }));
          
          results = [...adResults, ...results];
        }
      } else if (engine === 'bing') {
        const webPages = response.data.webPages?.value || [];
        results = webPages.map((result, index) => ({
          position: index + 1,
          title: result.name,
          url: result.url,
          domain: extractDomain(result.url),
          snippet: result.snippet,
          linkType: 'organic'
        }));
      }
      
      return results;
    } catch (error) {
      logger.error(`Error calling SERP API: ${error.message}`, {
        query,
        engine,
        region,
        error: error.stack
      });
      throw error;
    }
  }
  */
}

module.exports = SerpAnalyzer;
