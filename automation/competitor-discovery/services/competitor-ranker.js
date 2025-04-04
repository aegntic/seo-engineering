/**
 * Competitor Ranker Service
 * 
 * Responsible for ranking discovered competitors by relevance
 */

const logger = require('../utils/logger');
const { extractDomain } = require('../utils/url-utils');

/**
 * CompetitorRanker Class
 * Ranks competitors based on relevance scores and other factors
 */
class CompetitorRanker {
  /**
   * Constructor
   * 
   * @param {Object} config - Competitor ranker configuration
   */
  constructor(config) {
    this.config = config;
    this.factors = config.factors || {
      keywordOverlap: 0.4,
      serpOverlap: 0.3,
      backlinkSimilarity: 0.2,
      industryMatch: 0.1
    };
    this.boostFactors = config.boostFactors || {
      domainAuthority: 0.05,
      trafficEstimate: 0.05
    };
    
    // Normalize weights to ensure they sum to 1
    this._normalizeWeights();
  }
  
  /**
   * Normalize weights to ensure they sum to 1
   * 
   * @private
   */
  _normalizeWeights() {
    // Calculate sum of weights
    const factorSum = Object.values(this.factors).reduce((sum, weight) => sum + weight, 0);
    
    // Normalize if not already 1
    if (Math.abs(factorSum - 1) > 0.001) {
      for (const key in this.factors) {
        this.factors[key] = this.factors[key] / factorSum;
      }
    }
    
    // Calculate sum of boost weights
    const boostSum = Object.values(this.boostFactors).reduce((sum, weight) => sum + weight, 0);
    
    // Normalize boost factors
    if (boostSum > 0) {
      for (const key in this.boostFactors) {
        this.boostFactors[key] = this.boostFactors[key] / boostSum;
      }
    }
  }
  
  /**
   * Rank competitors by relevance
   * 
   * @param {Array<Object>} competitors - Discovered competitors
   * @param {Object} siteData - Original site data
   * @returns {Promise<Array<Object>>} - Ranked competitors
   */
  async rankCompetitors(competitors, siteData) {
    logger.info(`Ranking ${competitors.length} competitors for site ${siteData._id}`);
    
    try {
      // 1. Ensure each competitor has all required properties
      const normalizedCompetitors = this._normalizeCompetitors(competitors);
      
      // 2. Get additional competitor data if needed
      const enrichedCompetitors = await this._enrichCompetitors(normalizedCompetitors);
      
      // 3. Calculate final relevance scores
      const rankedCompetitors = this._calculateFinalScores(enrichedCompetitors);
      
      // 4. Sort and assign ranks
      const finalCompetitors = this._assignRanks(rankedCompetitors);
      
      logger.info(`Successfully ranked ${finalCompetitors.length} competitors for site ${siteData._id}`);
      
      return finalCompetitors;
    } catch (error) {
      logger.error(`Error ranking competitors: ${error.message}`, {
        siteId: siteData._id,
        error: error.stack
      });
      
      // Return the original competitors if ranking fails
      return competitors;
    }
  }
  
  /**
   * Normalize competitors to ensure all have required properties
   * 
   * @param {Array<Object>} competitors - Discovered competitors
   * @returns {Array<Object>} - Normalized competitors
   * @private
   */
  _normalizeCompetitors(competitors) {
    return competitors.map(competitor => {
      // Ensure all required properties exist
      return {
        url: competitor.url || `https://${competitor.domain}`,
        domain: competitor.domain,
        relevanceScore: competitor.relevanceScore || 0,
        discoveryMethod: competitor.discoveryMethod || 'unknown',
        keywordOverlap: competitor.keywordOverlap || 0,
        backlinksInCommon: competitor.backlinksInCommon || 0,
        serpOverlap: competitor.serpOverlap || 0,
        industryMatch: competitor.industryMatch || false,
        
        // Additional properties that may be used for ranking
        domainAuthority: competitor.domainAuthority,
        trafficEstimate: competitor.trafficEstimate,
        
        // Method-specific properties
        industry: competitor.industry,
        industryRank: competitor.industryRank,
        sharedAuthority: competitor.sharedAuthority,
        bestPosition: competitor.bestPosition,
        bestKeyword: competitor.bestKeyword,
        bestQuery: competitor.bestQuery
      };
    });
  }
  
  /**
   * Enrich competitors with additional data
   * 
   * @param {Array<Object>} competitors - Normalized competitors
   * @returns {Promise<Array<Object>>} - Enriched competitors
   * @private
   */
  async _enrichCompetitors(competitors) {
    // In a real implementation, this would fetch domain authority, traffic estimates, etc.
    // For now, we'll simulate this data
    
    return Promise.all(competitors.map(async competitor => {
      try {
        // Simulate domain authority if not already present
        if (competitor.domainAuthority === undefined) {
          competitor.domainAuthority = this._simulateDomainAuthority(competitor.domain);
        }
        
        // Simulate traffic estimate if not already present
        if (competitor.trafficEstimate === undefined) {
          competitor.trafficEstimate = this._simulateTrafficEstimate(competitor.domain);
        }
        
        return competitor;
      } catch (error) {
        logger.error(`Error enriching competitor ${competitor.domain}: ${error.message}`);
        return competitor;
      }
    }));
  }
  
  /**
   * Simulate domain authority (for development purposes)
   * 
   * @param {String} domain - Domain to simulate authority for
   * @returns {Number} - Simulated domain authority (0-100)
   * @private
   */
  _simulateDomainAuthority(domain) {
    const domainHash = this._simpleHash(domain);
    return 20 + (domainHash % 80); // 20-99
  }
  
  /**
   * Simulate traffic estimate (for development purposes)
   * 
   * @param {String} domain - Domain to simulate traffic for
   * @returns {Number} - Simulated monthly traffic
   * @private
   */
  _simulateTrafficEstimate(domain) {
    const domainHash = this._simpleHash(domain);
    const baseTraffic = 1000 + (domainHash % 9000); // 1,000-9,999 
    const multiplier = 10 ** (domainHash % 4); // 1, 10, 100, or 1000
    return baseTraffic * multiplier;
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
   * Calculate final relevance scores
   * 
   * @param {Array<Object>} competitors - Enriched competitors
   * @returns {Array<Object>} - Competitors with final scores
   * @private
   */
  _calculateFinalScores(competitors) {
    // Find maximum values for normalization
    const maxValues = this._findMaxValues(competitors);
    
    return competitors.map(competitor => {
      // Normalize and weight each factor
      const keywordScore = maxValues.keywordOverlap > 0
        ? (competitor.keywordOverlap / maxValues.keywordOverlap) * this.factors.keywordOverlap
        : 0;
      
      const serpScore = maxValues.serpOverlap > 0
        ? (competitor.serpOverlap / maxValues.serpOverlap) * this.factors.serpOverlap
        : 0;
      
      const backlinkScore = maxValues.backlinksInCommon > 0
        ? (competitor.backlinksInCommon / maxValues.backlinksInCommon) * this.factors.backlinkSimilarity
        : 0;
      
      const industryScore = competitor.industryMatch
        ? this.factors.industryMatch
        : 0;
      
      // Calculate base score from main factors
      const baseScore = keywordScore + serpScore + backlinkScore + industryScore;
      
      // Apply boost factors
      let boostScore = 0;
      
      if (competitor.domainAuthority !== undefined && maxValues.domainAuthority > 0) {
        boostScore += (competitor.domainAuthority / 100) * this.boostFactors.domainAuthority;
      }
      
      if (competitor.trafficEstimate !== undefined && maxValues.trafficEstimate > 0) {
        boostScore += (competitor.trafficEstimate / maxValues.trafficEstimate) * this.boostFactors.trafficEstimate;
      }
      
      // Calculate final score
      const finalScore = baseScore * (1 + boostScore);
      
      // Add factor details for transparency
      return {
        ...competitor,
        relevanceScore: Math.min(finalScore, 1.0), // Cap at 1.0
        factorScores: {
          keywordScore,
          serpScore,
          backlinkScore,
          industryScore,
          boostScore
        }
      };
    });
  }
  
  /**
   * Find maximum values across competitors for normalization
   * 
   * @param {Array<Object>} competitors - Competitors
   * @returns {Object} - Maximum values
   * @private
   */
  _findMaxValues(competitors) {
    const maxValues = {
      keywordOverlap: 0,
      serpOverlap: 0,
      backlinksInCommon: 0,
      domainAuthority: 0,
      trafficEstimate: 0
    };
    
    for (const competitor of competitors) {
      if (competitor.keywordOverlap > maxValues.keywordOverlap) {
        maxValues.keywordOverlap = competitor.keywordOverlap;
      }
      
      if (competitor.serpOverlap > maxValues.serpOverlap) {
        maxValues.serpOverlap = competitor.serpOverlap;
      }
      
      if (competitor.backlinksInCommon > maxValues.backlinksInCommon) {
        maxValues.backlinksInCommon = competitor.backlinksInCommon;
      }
      
      if (competitor.domainAuthority > maxValues.domainAuthority) {
        maxValues.domainAuthority = competitor.domainAuthority;
      }
      
      if (competitor.trafficEstimate > maxValues.trafficEstimate) {
        maxValues.trafficEstimate = competitor.trafficEstimate;
      }
    }
    
    return maxValues;
  }
  
  /**
   * Sort competitors by relevance score and assign ranks
   * 
   * @param {Array<Object>} competitors - Competitors with final scores
   * @returns {Array<Object>} - Ranked competitors
   * @private
   */
  _assignRanks(competitors) {
    // Sort by relevance score (descending)
    const sortedCompetitors = [...competitors].sort(
      (a, b) => b.relevanceScore - a.relevanceScore
    );
    
    // Assign ranks
    return sortedCompetitors.map((competitor, index) => ({
      ...competitor,
      rank: index + 1
    }));
  }
}

module.exports = CompetitorRanker;
