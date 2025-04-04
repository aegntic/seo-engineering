/**
 * User Behavior Tracker Module
 * 
 * Collects and analyzes user behavior data for A/B test variants.
 * Tracks engagement metrics, click patterns, and user interactions.
 * 
 * Last updated: April 4, 2025
 */

const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const db = require('../../utils/db-connection');

// Define behavior event schema
const BehaviorEventSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4(), unique: true },
  testId: { type: String, required: true },
  variantId: { type: String, required: true },
  visitorId: { type: String, required: true },
  sessionId: { type: String },
  eventType: { 
    type: String, 
    enum: [
      'pageview', 'click', 'scroll', 'conversion', 
      'engagement', 'exit', 'custom', 'impression'
    ],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  data: {
    url: { type: String },
    path: { type: String },
    element: { type: String },
    elementId: { type: String },
    scrollDepth: { type: Number },
    timeOnPage: { type: Number },
    conversionValue: { type: Number },
    conversionType: { type: String },
    customData: { type: mongoose.Schema.Types.Mixed }
  },
  device: { type: String },
  userAgent: { type: String },
  isBot: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Create indexes for efficient querying
BehaviorEventSchema.index({ testId: 1, variantId: 1, timestamp: 1 });
BehaviorEventSchema.index({ testId: 1, visitorId: 1, timestamp: 1 });
BehaviorEventSchema.index({ testId: 1, eventType: 1, timestamp: 1 });

const BehaviorEvent = mongoose.model('BehaviorEvent', BehaviorEventSchema);

/**
 * User Behavior Tracker class for handling user behavior data
 */
class UserBehaviorTracker {
  /**
   * Creates a new UserBehaviorTracker instance
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
   * Initializes the behavior tracker
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      this.logger.info(`Initializing behavior tracker for test: ${this.testId}`);
      
      // Validate variants
      if (!this.variants || this.variants.length === 0) {
        throw new Error('No variants defined');
      }
      
      this.initialized = true;
      this.logger.info(`Behavior tracker initialized for test: ${this.testId}`);
    } catch (error) {
      this.logger.error(`Error initializing behavior tracker: ${error.message}`, { error });
      throw new Error(`Failed to initialize behavior tracker: ${error.message}`);
    }
  }
  
  /**
   * Tracks a user behavior event
   * 
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} - Created event
   */
  async trackEvent(eventData) {
    if (!this.initialized) {
      throw new Error('Behavior tracker not initialized');
    }
    
    try {
      // Validate required fields
      if (!eventData.variantId || !eventData.visitorId || !eventData.eventType) {
        throw new Error('Missing required event data');
      }
      
      // Verify variant is part of the test
      const validVariant = this.variants.find(v => v.id === eventData.variantId);
      if (!validVariant) {
        throw new Error(`Invalid variant ID: ${eventData.variantId}`);
      }
      
      // Create behavior event
      const behaviorEvent = new BehaviorEvent({
        testId: this.testId,
        ...eventData
      });
      
      await behaviorEvent.save();
      
      this.logger.debug(`Tracked behavior event: ${eventData.eventType} for visitor: ${eventData.visitorId}`);
      
      return behaviorEvent;
    } catch (error) {
      this.logger.error(`Error tracking behavior event: ${error.message}`, { error });
      throw new Error(`Failed to track behavior event: ${error.message}`);
    }
  }
  
  /**
   * Gets behavior events for a visitor
   * 
   * @param {string} visitorId - Visitor ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of behavior events
   */
  async getEventsByVisitor(visitorId, options = {}) {
    if (!this.initialized) {
      throw new Error('Behavior tracker not initialized');
    }
    
    try {
      const query = { testId: this.testId, visitorId };
      
      // Add filters
      if (options.eventType) {
        query.eventType = options.eventType;
      }
      
      if (options.startDate) {
        query.timestamp = { $gte: new Date(options.startDate) };
      }
      
      if (options.endDate) {
        query.timestamp = query.timestamp || {};
        query.timestamp.$lte = new Date(options.endDate);
      }
      
      const events = await BehaviorEvent.find(query)
        .sort({ timestamp: options.sort || 'asc' })
        .limit(options.limit || 1000)
        .lean();
      
      return events;
    } catch (error) {
      this.logger.error(`Error retrieving behavior events: ${error.message}`, { error });
      throw new Error(`Failed to retrieve behavior events: ${error.message}`);
    }
  }
  
  /**
   * Gets behavior events for a variant
   * 
   * @param {string} variantId - Variant ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of behavior events
   */
  async getEventsByVariant(variantId, options = {}) {
    if (!this.initialized) {
      throw new Error('Behavior tracker not initialized');
    }
    
    try {
      const query = { testId: this.testId, variantId };
      
      // Add filters
      if (options.eventType) {
        query.eventType = options.eventType;
      }
      
      if (options.startDate) {
        query.timestamp = { $gte: new Date(options.startDate) };
      }
      
      if (options.endDate) {
        query.timestamp = query.timestamp || {};
        query.timestamp.$lte = new Date(options.endDate);
      }
      
      const events = await BehaviorEvent.find(query)
        .sort({ timestamp: options.sort || 'asc' })
        .limit(options.limit || 1000)
        .lean();
      
      return events;
    } catch (error) {
      this.logger.error(`Error retrieving behavior events: ${error.message}`, { error });
      throw new Error(`Failed to retrieve behavior events: ${error.message}`);
    }
  }
  
  /**
   * Gets aggregated behavior metrics by variant
   * 
   * @param {Object} options - Aggregation options
   * @returns {Promise<Object>} - Aggregated metrics by variant
   */
  async getMetricsByVariant(options = {}) {
    if (!this.initialized) {
      throw new Error('Behavior tracker not initialized');
    }
    
    try {
      const query = { testId: this.testId, isBot: false };
      
      // Add filters
      if (options.startDate) {
        query.timestamp = { $gte: new Date(options.startDate) };
      }
      
      if (options.endDate) {
        query.timestamp = query.timestamp || {};
        query.timestamp.$lte = new Date(options.endDate);
      }
      
      // Define aggregation
      const aggregation = [
        { $match: query },
        { $group: {
          _id: {
            variantId: '$variantId',
            eventType: '$eventType'
          },
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' }
        }},
        { $group: {
          _id: '$_id.variantId',
          events: { 
            $push: { 
              eventType: '$_id.eventType',
              count: '$count',
              uniqueVisitors: { $size: '$uniqueVisitors' }
            }
          }
        }},
        { $project: {
          variantId: '$_id',
          events: 1,
          _id: 0
        }}
      ];
      
      const result = await BehaviorEvent.aggregate(aggregation);
      
      // Transform to a more usable structure
      const metricsByVariant = {};
      
      for (const variantData of result) {
        const variantId = variantData.variantId;
        const metrics = {};
        
        for (const event of variantData.events) {
          metrics[event.eventType] = {
            count: event.count,
            uniqueVisitors: event.uniqueVisitors
          };
        }
        
        // Calculate conversion rate if possible
        if (metrics.conversion && metrics.pageview) {
          metrics.conversionRate = metrics.conversion.count / metrics.pageview.uniqueVisitors;
        }
        
        // Calculate engagement rate if possible
        if (metrics.engagement && metrics.pageview) {
          metrics.engagementRate = metrics.engagement.count / metrics.pageview.uniqueVisitors;
        }
        
        metricsByVariant[variantId] = metrics;
      }
      
      return metricsByVariant;
    } catch (error) {
      this.logger.error(`Error getting metrics by variant: ${error.message}`, { error });
      throw new Error(`Failed to get metrics by variant: ${error.message}`);
    }
  }
  
  /**
   * Gets click path analysis for variants
   * 
   * @returns {Promise<Object>} - Click path analysis
   */
  async getClickPathAnalysis() {
    if (!this.initialized) {
      throw new Error('Behavior tracker not initialized');
    }
    
    try {
      // This would be a complex aggregation to analyze click paths
      // Simplified version for demonstration
      
      const clickEvents = await BehaviorEvent.find({
        testId: this.testId,
        eventType: 'click',
        isBot: false
      }).lean();
      
      // Group by variant
      const clicksByVariant = {};
      
      for (const click of clickEvents) {
        if (!clicksByVariant[click.variantId]) {
          clicksByVariant[click.variantId] = [];
        }
        
        clicksByVariant[click.variantId].push({
          element: click.data.element,
          elementId: click.data.elementId,
          path: click.data.path,
          timestamp: click.timestamp
        });
      }
      
      // For each variant, analyze common click paths
      const analysis = {};
      
      for (const [variantId, clicks] of Object.entries(clicksByVariant)) {
        // Count clicks by element
        const elementCounts = {};
        
        for (const click of clicks) {
          const element = click.element || 'unknown';
          elementCounts[element] = (elementCounts[element] || 0) + 1;
        }
        
        // Sort by count
        const sortedElements = Object.entries(elementCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([element, count]) => ({ element, count }));
        
        analysis[variantId] = {
          totalClicks: clicks.length,
          popularElements: sortedElements.slice(0, 10)
        };
      }
      
      return analysis;
    } catch (error) {
      this.logger.error(`Error getting click path analysis: ${error.message}`, { error });
      throw new Error(`Failed to get click path analysis: ${error.message}`);
    }
  }
}

module.exports = {
  UserBehaviorTracker
};
