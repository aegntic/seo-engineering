/**
 * Verification Scheduler
 * 
 * Manages scheduled verification tasks, ensuring that sites are
 * regularly verified to detect issues and measure improvements.
 */

const cron = require('node-cron');
const VerificationSystem = require('../verification');
const siteRepository = require('../../api/repositories/siteRepository');
const verificationRepository = require('../../api/repositories/verificationRepository');
const notificationService = require('../common/notificationService');
const logger = require('../common/logger');

class VerificationScheduler {
  constructor(options = {}) {
    this.verificationSystem = new VerificationSystem(options);
    this.schedules = new Map();
    this.defaultSchedule = options.defaultSchedule || '0 0 * * *'; // Default: daily at midnight
    this.config = {
      maxConcurrent: options.maxConcurrent || 5,
      retryDelay: options.retryDelay || 3600000, // 1 hour
      maxRetries: options.maxRetries || 3,
      ...options
    };
    
    // Track running verifications
    this.runningVerifications = new Set();
    
    logger.info('Verification Scheduler initialized');
  }
  
  /**
   * Start the scheduler
   * 
   * @returns {Promise<void>}
   */
  async start() {
    logger.info('Starting Verification Scheduler');
    
    // Load site schedules from database
    await this.loadSchedules();
    
    // Start master scheduler that checks for due verifications
    this.masterSchedule = cron.schedule('*/10 * * * *', async () => {
      await this.checkDueVerifications();
    });
    
    logger.info('Verification Scheduler started');
  }
  
  /**
   * Stop the scheduler
   * 
   * @returns {Promise<void>}
   */
  async stop() {
    logger.info('Stopping Verification Scheduler');
    
    // Stop master scheduler
    if (this.masterSchedule) {
      this.masterSchedule.stop();
    }
    
    // Stop all individual site schedules
    for (const [siteId, schedule] of this.schedules.entries()) {
      schedule.task.stop();
      logger.debug(`Stopped schedule for site ${siteId}`);
    }
    
    this.schedules.clear();
    logger.info('Verification Scheduler stopped');
  }
  
  /**
   * Load schedules for all sites from the database
   * 
   * @returns {Promise<void>}
   */
  async loadSchedules() {
    try {
      logger.info('Loading verification schedules');
      
      // Clear existing schedules
      for (const [siteId, schedule] of this.schedules.entries()) {
        schedule.task.stop();
        logger.debug(`Stopped schedule for site ${siteId}`);
      }
      
      this.schedules.clear();
      
      // Get all sites with verification enabled
      const sites = await siteRepository.getSitesWithVerification();
      
      // Create schedules for each site
      for (const site of sites) {
        await this.scheduleSite(site.id, site.verificationSchedule || this.defaultSchedule);
      }
      
      logger.info(`Loaded ${this.schedules.size} verification schedules`);
      
    } catch (error) {
      logger.error(`Error loading verification schedules: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Schedule verification for a specific site
   * 
   * @param {string} siteId - The site identifier
   * @param {string} cronSchedule - Cron schedule expression
   * @returns {Promise<void>}
   */
  async scheduleSite(siteId, cronSchedule) {
    try {
      // Validate cron schedule
      if (!this.isValidCronExpression(cronSchedule)) {
        logger.warn(`Invalid cron schedule for site ${siteId}: ${cronSchedule}. Using default.`);
        cronSchedule = this.defaultSchedule;
      }
      
      // Stop existing schedule if any
      if (this.schedules.has(siteId)) {
        this.schedules.get(siteId).task.stop();
      }
      
      // Create new schedule
      const task = cron.schedule(cronSchedule, async () => {
        await this.runVerification(siteId);
      });
      
      // Store schedule
      this.schedules.set(siteId, {
        task,
        schedule: cronSchedule,
        lastRun: null,
        nextRun: this.getNextRunTime(cronSchedule)
      });
      
      logger.info(`Scheduled verification for site ${siteId}: ${cronSchedule}`);
      
    } catch (error) {
      logger.error(`Error scheduling site ${siteId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Check for sites that are due for verification
   * 
   * @returns {Promise<void>}
   */
  async checkDueVerifications() {
    try {
      logger.debug('Checking for due verifications');
      
      // Skip if max concurrent reached
      if (this.runningVerifications.size >= this.config.maxConcurrent) {
        logger.debug(`Max concurrent verifications reached (${this.runningVerifications.size}/${this.config.maxConcurrent})`);
        return;
      }
      
      // Get all sites due for manual verification
      const dueManualVerifications = await verificationRepository.getDueManualVerifications();
      
      // Get sites from schedules that are due (in case the scheduled task was missed)
      const now = new Date();
      const dueScheduledSites = [];
      
      for (const [siteId, schedule] of this.schedules.entries()) {
        if (schedule.nextRun <= now && !this.runningVerifications.has(siteId)) {
          dueScheduledSites.push(siteId);
        }
      }
      
      // Combine and deduplicate
      const allDueSiteIds = [...new Set([
        ...dueManualVerifications.map(v => v.siteId),
        ...dueScheduledSites
      ])];
      
      // Start verifications up to max concurrent
      const availableSlots = this.config.maxConcurrent - this.runningVerifications.size;
      const sitesToVerify = allDueSiteIds.slice(0, availableSlots);
      
      logger.debug(`Starting ${sitesToVerify.length} due verifications`);
      
      // Run verifications
      for (const siteId of sitesToVerify) {
        this.runVerification(siteId);
      }
      
    } catch (error) {
      logger.error(`Error checking due verifications: ${error.message}`);
    }
  }
  
  /**
   * Run verification for a site
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} options - Verification options
   * @returns {Promise<void>}
   */
  async runVerification(siteId, options = {}) {
    // Skip if already running
    if (this.runningVerifications.has(siteId)) {
      logger.debug(`Verification already running for site ${siteId}`);
      return;
    }
    
    try {
      // Add to running set
      this.runningVerifications.add(siteId);
      
      logger.info(`Starting scheduled verification for site ${siteId}`);
      
      // Update schedule last run time
      if (this.schedules.has(siteId)) {
        const schedule = this.schedules.get(siteId);
        schedule.lastRun = new Date();
        schedule.nextRun = this.getNextRunTime(schedule.schedule);
      }
      
      // Run verification
      const result = await this.verificationSystem.verifySite(siteId, options);
      
      // Save result
      await verificationRepository.saveVerificationResult(siteId, result);
      
      // Update last verification status
      await siteRepository.updateSiteLastVerification(siteId, {
        timestamp: new Date(),
        success: result.success,
        summary: result.summary
      });
      
      // Send notifications if needed
      if (!result.success) {
        await notificationService.sendVerificationFailureNotification(siteId, result);
      }
      
      logger.info(`Completed scheduled verification for site ${siteId}, success: ${result.success}`);
      
    } catch (error) {
      logger.error(`Error running verification for site ${siteId}: ${error.message}`);
      
      // Record error
      await verificationRepository.saveVerificationError(siteId, error);
      
      // Check if retry is needed
      const retryCount = options.retryCount || 0;
      
      if (retryCount < this.config.maxRetries) {
        logger.info(`Scheduling retry (${retryCount + 1}/${this.config.maxRetries}) for site ${siteId}`);
        
        // Schedule retry
        setTimeout(() => {
          this.runVerification(siteId, {
            ...options,
            retryCount: retryCount + 1
          });
        }, this.config.retryDelay);
      } else {
        logger.warn(`Max retries reached for site ${siteId}`);
        
        // Send notification about max retries
        await notificationService.sendVerificationErrorNotification(siteId, error);
      }
      
    } finally {
      // Remove from running set
      this.runningVerifications.delete(siteId);
    }
  }
  
  /**
   * Update schedule for a site
   * 
   * @param {string} siteId - The site identifier
   * @param {string} cronSchedule - New cron schedule
   * @returns {Promise<void>}
   */
  async updateSchedule(siteId, cronSchedule) {
    try {
      // Validate site exists
      const site = await siteRepository.getSiteById(siteId);
      
      if (!site) {
        throw new Error(`Site not found: ${siteId}`);
      }
      
      // Update schedule
      await this.scheduleSite(siteId, cronSchedule);
      
      // Update in database
      await siteRepository.updateSiteVerificationSchedule(siteId, cronSchedule);
      
      logger.info(`Updated verification schedule for site ${siteId}: ${cronSchedule}`);
      
    } catch (error) {
      logger.error(`Error updating schedule for site ${siteId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Check if a cron expression is valid
   * 
   * @param {string} expression - Cron expression to validate
   * @returns {boolean} - Whether the expression is valid
   */
  isValidCronExpression(expression) {
    try {
      // Attempt to validate the expression
      return cron.validate(expression);
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Calculate the next run time for a cron schedule
   * 
   * @param {string} cronSchedule - Cron schedule expression
   * @returns {Date} - Next run time
   */
  getNextRunTime(cronSchedule) {
    try {
      return cron.schedule(cronSchedule).nextDate().toDate();
    } catch (error) {
      logger.error(`Error calculating next run time: ${error.message}`);
      // Return a default (now + 1 day)
      return new Date(Date.now() + 86400000);
    }
  }
}

module.exports = VerificationScheduler;
