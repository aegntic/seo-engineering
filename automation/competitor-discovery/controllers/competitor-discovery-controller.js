/**
 * Competitor Discovery Controller
 * 
 * Handles API requests for the competitor discovery module
 */

const { DiscoveryService } = require('../services/discovery-controller');
const DiscoveryJob = require('../models/discovery-job');
const CompetitorProfile = require('../models/competitor-profile');
const logger = require('../utils/logger');
const { validateObjectId } = require('../utils/validators');

/**
 * Competitor Discovery Controller
 */
const competitorDiscoveryController = {
  /**
   * Start a new competitor discovery job
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async startDiscovery(req, res) {
    try {
      const { siteId } = req.body;
      const options = req.body.options || {};
      
      if (!validateObjectId(siteId)) {
        return res.status(400).json({ error: 'Invalid site ID' });
      }
      
      // Create a new discovery job
      const job = new DiscoveryJob({
        siteId,
        options,
        status: 'pending'
      });
      
      await job.save();
      
      // Start the discovery process asynchronously
      DiscoveryService.startDiscovery(job._id)
        .catch(error => {
          logger.error(`Error starting discovery job: ${error.message}`, {
            jobId: job._id,
            siteId,
            error
          });
        });
      
      res.status(202).json({
        message: 'Competitor discovery job started',
        jobId: job._id
      });
    } catch (error) {
      logger.error(`Error in startDiscovery: ${error.message}`, { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  /**
   * Get the status of a competitor discovery job
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDiscoveryStatus(req, res) {
    try {
      const { id } = req.params;
      
      if (!validateObjectId(id)) {
        return res.status(400).json({ error: 'Invalid job ID' });
      }
      
      const job = await DiscoveryJob.findById(id);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.status(200).json({
        jobId: job._id,
        siteId: job.siteId,
        status: job.status,
        progress: job.progress,
        startTime: job.startTime,
        endTime: job.endTime,
        error: job.error
      });
    } catch (error) {
      logger.error(`Error in getDiscoveryStatus: ${error.message}`, { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  /**
   * Get the results of a competitor discovery job
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDiscoveryResults(req, res) {
    try {
      const { id } = req.params;
      
      if (!validateObjectId(id)) {
        return res.status(400).json({ error: 'Invalid job ID' });
      }
      
      const job = await DiscoveryJob.findById(id);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      if (job.status !== 'completed') {
        return res.status(400).json({ 
          error: 'Job not completed',
          status: job.status,
          progress: job.progress
        });
      }
      
      res.status(200).json({
        jobId: job._id,
        siteId: job.siteId,
        startTime: job.startTime,
        endTime: job.endTime,
        results: job.results
      });
    } catch (error) {
      logger.error(`Error in getDiscoveryResults: ${error.message}`, { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  /**
   * Get competitors for a site
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCompetitors(req, res) {
    try {
      const { siteId } = req.params;
      
      if (!validateObjectId(siteId)) {
        return res.status(400).json({ error: 'Invalid site ID' });
      }
      
      // Find the most recent completed job for this site
      const job = await DiscoveryJob.findOne({ 
        siteId, 
        status: 'completed' 
      }).sort({ endTime: -1 });
      
      if (!job) {
        return res.status(404).json({ error: 'No completed discovery jobs found for this site' });
      }
      
      res.status(200).json({
        siteId,
        lastDiscovery: job.endTime,
        competitors: job.results.competitors
      });
    } catch (error) {
      logger.error(`Error in getCompetitors: ${error.message}`, { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  /**
   * Get competitor profile
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCompetitorProfile(req, res) {
    try {
      const { siteId, competitorId } = req.params;
      
      if (!validateObjectId(siteId) || !validateObjectId(competitorId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const profile = await CompetitorProfile.findOne({
        siteId,
        competitorId
      });
      
      if (!profile) {
        return res.status(404).json({ error: 'Competitor profile not found' });
      }
      
      res.status(200).json(profile);
    } catch (error) {
      logger.error(`Error in getCompetitorProfile: ${error.message}`, { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  /**
   * Start a competitor discovery job programmatically
   * 
   * @param {String} siteId - Site ID
   * @param {Object} options - Discovery options
   * @returns {Promise<Object>} - Job object
   */
  async startDiscoveryProgrammatic(siteId, options = {}) {
    try {
      if (!validateObjectId(siteId)) {
        throw new Error('Invalid site ID');
      }
      
      // Create a new discovery job
      const job = new DiscoveryJob({
        siteId,
        options,
        status: 'pending'
      });
      
      await job.save();
      
      // Start the discovery process
      await DiscoveryService.startDiscovery(job._id);
      
      return job;
    } catch (error) {
      logger.error(`Error in startDiscoveryProgrammatic: ${error.message}`, { 
        siteId, 
        error 
      });
      throw error;
    }
  }
};

module.exports = {
  competitorDiscoveryController
};
