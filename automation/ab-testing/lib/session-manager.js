/**
 * Session Manager Module
 * 
 * Manages user sessions across variants, ensuring consistent
 * user experience throughout the test.
 * 
 * Last updated: April 4, 2025
 */

const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const db = require('../../utils/db-connection');

// Define session schema
const SessionSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4(), unique: true },
  testId: { type: String, required: true },
  visitorId: { type: String, required: true },
  variantId: { type: String, required: true },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 1 },
  device: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  ipAddress: { type: String },
  country: { type: String },
  isBot: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create indexes for efficient querying
SessionSchema.index({ testId: 1, visitorId: 1 }, { unique: true });
SessionSchema.index({ testId: 1, variantId: 1 });

const Session = mongoose.model('Session', SessionSchema);

/**
 * Session Manager class for handling user sessions
 */
class SessionManager {
  /**
   * Creates a new SessionManager instance
   * 
   * @param {string} testId - ID of the test
   * @param {Array} variants - Array of variants
   */
  constructor(testId, variants) {
    this.testId = testId;
    this.variants = variants;
    this.initialized = false;
    this.logger = logger;
  }
  
  /**
   * Initializes the session manager
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      this.logger.info(`Initializing session manager for test: ${this.testId}`);
      
      // Validate variants
      if (!this.variants || this.variants.length === 0) {
        throw new Error('No variants defined');
      }
      
      this.initialized = true;
      this.logger.info(`Session manager initialized for test: ${this.testId}`);
    } catch (error) {
      this.logger.error(`Error initializing session manager: ${error.message}`, { error });
      throw new Error(`Failed to initialize session manager: ${error.message}`);
    }
  }
  
  /**
   * Creates or updates a session for a visitor
   * 
   * @param {string} visitorId - Unique identifier for the visitor
   * @param {string} variantId - ID of the assigned variant
   * @param {Object} sessionData - Additional session data
   * @returns {Promise<Object>} - Session object
   */
  async createOrUpdateSession(visitorId, variantId, sessionData = {}) {
    if (!this.initialized) {
      throw new Error('Session manager not initialized');
    }
    
    try {
      // Check if session exists
      let session = await Session.findOne({ testId: this.testId, visitorId });
      
      if (session) {
        // Update existing session
        session.lastSeen = new Date();
        session.visitCount += 1;
        
        // Update session data if provided
        if (sessionData.device) session.device = sessionData.device;
        if (sessionData.userAgent) session.userAgent = sessionData.userAgent;
        if (sessionData.referrer) session.referrer = sessionData.referrer;
        if (sessionData.ipAddress) session.ipAddress = sessionData.ipAddress;
        if (sessionData.country) session.country = sessionData.country;
        if (sessionData.isBot !== undefined) session.isBot = sessionData.isBot;
        
        session.updatedAt = new Date();
        
        await session.save();
        
        this.logger.debug(`Updated session for visitor: ${visitorId}`);
        
        return session;
      } else {
        // Create new session
        const newSession = new Session({
          testId: this.testId,
          visitorId,
          variantId,
          ...sessionData
        });
        
        await newSession.save();
        
        this.logger.debug(`Created new session for visitor: ${visitorId}`);
        
        return newSession;
      }
    } catch (error) {
      this.logger.error(`Error creating/updating session: ${error.message}`, { error });
      throw new Error(`Failed to create/update session: ${error.message}`);
    }
  }
  
  /**
   * Gets the session for a visitor
   * 
   * @param {string} visitorId - Unique identifier for the visitor
   * @returns {Promise<Object>} - Session object or null if not found
   */
  async getSession(visitorId) {
    if (!this.initialized) {
      throw new Error('Session manager not initialized');
    }
    
    try {
      const session = await Session.findOne({ testId: this.testId, visitorId }).lean();
      return session;
    } catch (error) {
      this.logger.error(`Error retrieving session: ${error.message}`, { error });
      throw new Error(`Failed to retrieve session: ${error.message}`);
    }
  }
  
  /**
   * Detects if a request is from a bot
   * 
   * @param {string} userAgent - User agent string
   * @returns {boolean} - True if the request is from a bot
   */
  isBot(userAgent) {
    if (!userAgent) return false;
    
    const botPatterns = [
      'bot', 'crawler', 'spider', 'slurp', 'baiduspider',
      'yandex', 'googlebot', 'bingbot', 'semrushbot',
      'ahrefsbot', 'mj12bot', 'dotbot', 'rogerbot'
    ];
    
    const lowerUserAgent = userAgent.toLowerCase();
    
    return botPatterns.some(pattern => lowerUserAgent.includes(pattern));
  }
  
  /**
   * Gets the total sessions per variant
   * 
   * @returns {Promise<Object>} - Sessions per variant
   */
  async getSessionsPerVariant() {
    if (!this.initialized) {
      throw new Error('Session manager not initialized');
    }
    
    try {
      const aggregation = [
        { $match: { testId: this.testId, isBot: false } },
        { $group: {
          _id: '$variantId',
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' }
        }},
        { $project: {
          variantId: '$_id',
          sessionCount: '$count',
          uniqueVisitorCount: { $size: '$uniqueVisitors' },
          _id: 0
        }}
      ];
      
      const result = await Session.aggregate(aggregation);
      
      // Convert to map
      const sessionsPerVariant = {};
      for (const item of result) {
        sessionsPerVariant[item.variantId] = {
          sessionCount: item.sessionCount,
          uniqueVisitorCount: item.uniqueVisitorCount
        };
      }
      
      return sessionsPerVariant;
    } catch (error) {
      this.logger.error(`Error getting sessions per variant: ${error.message}`, { error });
      throw new Error(`Failed to get sessions per variant: ${error.message}`);
    }
  }
  
  /**
   * Gets the session count for the test
   * 
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - Session count
   */
  async getSessionCount(filters = {}) {
    if (!this.initialized) {
      throw new Error('Session manager not initialized');
    }
    
    try {
      const query = { testId: this.testId, ...filters };
      const count = await Session.countDocuments(query);
      
      return { count };
    } catch (error) {
      this.logger.error(`Error getting session count: ${error.message}`, { error });
      throw new Error(`Failed to get session count: ${error.message}`);
    }
  }
}

module.exports = {
  SessionManager
};
