/**
 * Discovery Controller Service
 * 
 * Main service for orchestrating the competitor discovery process
 */

const DiscoveryJob = require('../models/discovery-job');
const CompetitorProfile = require('../models/competitor-profile');
const KeywordAnalyzer = require('./keyword-analyzer');
const SerpAnalyzer = require('./serp-analyzer');
const BacklinkAnalyzer = require('./backlink-analyzer');
const IndustryClassifier = require('./industry-classifier');
const CompetitorRanker = require('./competitor-ranker');
const ProfileGenerator = require('./profile-generator');
const logger = require('../utils/logger');
const config = require('../config/default');
const { normalizeUrl, extractDomain } = require('../utils/url-utils');
const mongoose = require('mongoose');

/**
 * Discovery Service
 */
class DiscoveryService {
  /**
   * Start the discovery process for a job
   * 
   * @param {String} jobId - Discovery job ID
   * @returns {Promise<void>}
   */
  static async startDiscovery(jobId) {
    logger.info(`Starting competitor discovery for job ${jobId}`);
    
    try {
      // Get the job
      const job = await DiscoveryJob.findById(jobId);
      
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }
      
      // Mark job as started
      await job.start();
      
      // Get the site data
      const siteData = await this._getSiteData(job.siteId);
      
      // Initialize analyzers
      const keywordAnalyzer = new KeywordAnalyzer(config.keywords);
      const serpAnalyzer = new SerpAnalyzer(config.serp);
      const backlinkAnalyzer = new BacklinkAnalyzer(config.backlinks);
      const industryClassifier = new IndustryClassifier(config.industry);
      const competitorRanker = new CompetitorRanker(config.ranking);
      const profileGenerator = new ProfileGenerator(config.profile);
      
      // Update progress
      await job.updateProgress(10);
      
      // 1. Discover competitors using keywords
      logger.info(`Discovering competitors using keywords for job ${jobId}`);
      const keywordCompetitors = await keywordAnalyzer.findCompetitors(siteData);
      
      // Update progress
      await job.updateProgress(30);
      
      // 2. Discover competitors using SERP analysis
      logger.info(`Discovering competitors using SERP analysis for job ${jobId}`);
      const serpCompetitors = await serpAnalyzer.findCompetitors(siteData);
      
      // Update progress
      await job.updateProgress(50);
      
      // 3. Discover competitors using backlink analysis
      logger.info(`Discovering competitors using backlink analysis for job ${jobId}`);
      const backlinkCompetitors = await backlinkAnalyzer.findCompetitors(siteData);
      
      // Update progress
      await job.updateProgress(70);
      
      // 4. Determine industry and find industry-specific competitors
      logger.info(`Discovering industry-specific competitors for job ${jobId}`);
      const industryCompetitors = await industryClassifier.findCompetitors(siteData);
      
      // 5. Combine all competitors and remove duplicates
      const allCompetitors = this._combineCompetitors([
        keywordCompetitors,
        serpCompetitors,
        backlinkCompetitors,
        industryCompetitors
      ]);
      
      // Update progress
      await job.updateProgress(80);
      
      // 6. Rank competitors by relevance
      logger.info(`Ranking competitors for job ${jobId}`);
      const rankedCompetitors = await competitorRanker.rankCompetitors(allCompetitors, siteData);
      
      // 7. Limit to max competitors
      const maxCompetitors = job.options.maxCompetitors || config.discovery.maxCompetitors;
      const topCompetitors = rankedCompetitors.slice(0, maxCompetitors);
      
      // 8. Generate stats
      const stats = this._generateStats(topCompetitors);
      
      // Update progress
      await job.updateProgress(90);
      
      // 9. Generate profiles for top competitors
      logger.info(`Generating profiles for top competitors for job ${jobId}`);
      for (const competitor of topCompetitors) {
        try {
          // Generate or update competitor profile
          await profileGenerator.generateProfile(job.siteId, competitor, siteData);
        } catch (error) {
          logger.error(`Error generating profile for competitor ${competitor.domain}`, {
            jobId,
            siteId: job.siteId,
            competitor: competitor.domain,
            error: error.message
          });
          // Continue with next competitor
        }
      }
      
      // 10. Complete the job
      const results = {
        competitors: topCompetitors,
        stats
      };
      
      await job.complete(results);
      
      logger.info(`Competitor discovery completed for job ${jobId}`);
    } catch (error) {
      logger.error(`Error in discovery process for job ${jobId}: ${error.message}`, {
        jobId,
        error: error.stack
      });
      
      // Try to mark the job as failed
      try {
        const job = await DiscoveryJob.findById(jobId);
        if (job) {
          await job.fail(error.message);
        }
      } catch (markFailedError) {
        logger.error(`Error marking job ${jobId} as failed: ${markFailedError.message}`);
      }
    }
  }
  
  /**
   * Get site data required for competitor discovery
   * 
   * @param {String} siteId - Site ID
   * @returns {Promise<Object>} - Site data
   * @private
   */
  static async _getSiteData(siteId) {
    // In a real implementation, this would fetch site data from the database
    // For now, we'll simulate it with a placeholder
    
    // TODO: Implement proper site data retrieval from Crawler and Analysis modules
    
    logger.info(`Getting site data for site ${siteId}`);
    
    // Placeholder site data
    return {
      _id: siteId,
      url: 'https://example.com',
      domain: 'example.com',
      keywords: [
        { keyword: 'example keyword 1', importance: 0.9 },
        { keyword: 'example keyword 2', importance: 0.8 },
        { keyword: 'example keyword 3', importance: 0.7 }
      ],
      pages: [
        { url: 'https://example.com', title: 'Example Homepage' },
        { url: 'https://example.com/about', title: 'About Example' },
        { url: 'https://example.com/products', title: 'Example Products' }
      ],
      backlinks: [
        { domain: 'referrer1.com', url: 'https://referrer1.com/link' },
        { domain: 'referrer2.com', url: 'https://referrer2.com/link' }
      ],
      industry: 'Technology'
    };
  }
  
  /**
   * Combine competitors from different discovery methods
   * 
   * @param {Array<Array<Object>>} competitorArrays - Arrays of competitors from different methods
   * @returns {Array<Object>} - Combined unique competitors
   * @private
   */
  static _combineCompetitors(competitorArrays) {
    // Create a map to deduplicate competitors by domain
    const competitorMap = new Map();
    
    // Method priority for discovery method
    const methodPriority = {
      'keyword': 3,
      'serp': 2,
      'backlink': 1,
      'industry': 0
    };
    
    // Process each competitor array
    competitorArrays.forEach((competitors, arrayIndex) => {
      if (!Array.isArray(competitors)) {
        logger.warn(`Expected array of competitors but got ${typeof competitors}`, {
          arrayIndex
        });
        return;
      }
      
      competitors.forEach(competitor => {
        const domain = competitor.domain;
        
        if (!domain) {
          logger.warn('Competitor missing domain', { competitor });
          return;
        }
        
        if (competitorMap.has(domain)) {
          // Competitor already exists, merge data
          const existingCompetitor = competitorMap.get(domain);
          
          // Keep the higher relevance score
          if (competitor.relevanceScore > existingCompetitor.relevanceScore) {
            existingCompetitor.relevanceScore = competitor.relevanceScore;
          }
          
          // Keep the higher priority discovery method
          if (methodPriority[competitor.discoveryMethod] > methodPriority[existingCompetitor.discoveryMethod]) {
            existingCompetitor.discoveryMethod = competitor.discoveryMethod;
          }
          
          // Merge other metrics
          existingCompetitor.keywordOverlap = competitor.keywordOverlap || existingCompetitor.keywordOverlap;
          existingCompetitor.backlinksInCommon = competitor.backlinksInCommon || existingCompetitor.backlinksInCommon;
          existingCompetitor.serpOverlap = competitor.serpOverlap || existingCompetitor.serpOverlap;
          existingCompetitor.industryMatch = competitor.industryMatch || existingCompetitor.industryMatch;
        } else {
          // New competitor, add to map with _id
          competitor._id = new mongoose.Types.ObjectId();
          competitorMap.set(domain, competitor);
        }
      });
    });
    
    // Convert map back to array
    return Array.from(competitorMap.values());
  }
  
  /**
   * Generate statistics about discovered competitors
   * 
   * @param {Array<Object>} competitors - Ranked competitors
   * @returns {Object} - Statistics object
   * @private
   */
  static _generateStats(competitors) {
    const stats = {
      totalCompetitors: competitors.length,
      keywordBased: 0,
      serpBased: 0,
      backlinkBased: 0,
      industryBased: 0,
      averageRelevance: 0
    };
    
    let totalRelevance = 0;
    
    competitors.forEach(competitor => {
      totalRelevance += competitor.relevanceScore;
      
      // Count by discovery method
      switch (competitor.discoveryMethod) {
        case 'keyword':
          stats.keywordBased++;
          break;
        case 'serp':
          stats.serpBased++;
          break;
        case 'backlink':
          stats.backlinkBased++;
          break;
        case 'industry':
          stats.industryBased++;
          break;
      }
    });
    
    // Calculate average relevance
    if (competitors.length > 0) {
      stats.averageRelevance = totalRelevance / competitors.length;
    }
    
    return stats;
  }
}

module.exports = {
  DiscoveryService
};
