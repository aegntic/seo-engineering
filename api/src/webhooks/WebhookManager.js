/**
 * Webhook Manager
 * 
 * Central service for managing webhook subscriptions and event delivery.
 * Provides a modular architecture for webhook handling and delivery.
 */

const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose');
const { ServerError } = require('../../utils/errors');

/**
 * WebhookManager class
 * Manages webhook subscriptions and event delivery
 */
class WebhookManager {
  /**
   * Create a new WebhookManager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      signatureHeader: options.signatureHeader || 'X-SEO.engineering-Signature',
      signatureAlgorithm: options.signatureAlgorithm || 'sha256',
      maxRetries: options.maxRetries || 5,
      retryDelay: options.retryDelay || 5000, // 5 seconds
      timeout: options.timeout || 10000, // 10 seconds
      ...options
    };
    
    // Event handlers
    this.eventHandlers = new Map();
    
    // Models
    this.WebhookSubscription = mongoose.model('WebhookSubscription');
    this.WebhookDelivery = mongoose.model('WebhookDelivery');
    
    // Queue for processing events (would use a real queue in production)
    this.eventQueue = [];
    this.isProcessing = false;
  }

  /**
   * Register event types and their handlers
   * @param {String} eventType - Type of event
   * @param {Function} handler - Event handler function
   */
  registerEventType(eventType, handler) {
    this.eventHandlers.set(eventType, handler);
  }

  /**
   * Get all registered event types
   * @returns {Array<String>} Array of event types
   */
  getEventTypes() {
    return Array.from(this.eventHandlers.keys());
  }

  /**
   * Subscribe to webhook events
   * @param {String} agencyId - ID of the agency
   * @param {Object} subscription - Subscription data
   * @returns {Promise<Object>} Created subscription
   */
  async subscribe(agencyId, subscription) {
    try {
      // Validate event types
      const validEventTypes = this.getEventTypes();
      const invalidEvents = subscription.events.filter(event => !validEventTypes.includes(event));
      
      if (invalidEvents.length > 0) {
        throw new Error(`Invalid event types: ${invalidEvents.join(', ')}`);
      }
      
      // Generate secret if not provided
      const secret = subscription.secret || crypto.randomBytes(32).toString('hex');
      
      // Create subscription
      const webhookSubscription = new this.WebhookSubscription({
        agency: agencyId,
        url: subscription.url,
        events: subscription.events,
        description: subscription.description,
        secret,
        active: subscription.active !== undefined ? subscription.active : true,
        createdBy: subscription.createdBy
      });
      
      await webhookSubscription.save();
      
      // Return without exposing secret
      const result = webhookSubscription.toObject();
      delete result.secret;
      
      return result;
    } catch (error) {
      throw new ServerError(`Failed to create webhook subscription: ${error.message}`);
    }
  }

  /**
   * Update webhook subscription
   * @param {String} agencyId - ID of the agency
   * @param {String} subscriptionId - ID of the subscription
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated subscription
   */
  async updateSubscription(agencyId, subscriptionId, updates) {
    try {
      // Validate event types if provided
      if (updates.events) {
        const validEventTypes = this.getEventTypes();
        const invalidEvents = updates.events.filter(event => !validEventTypes.includes(event));
        
        if (invalidEvents.length > 0) {
          throw new Error(`Invalid event types: ${invalidEvents.join(', ')}`);
        }
      }
      
      // Generate new secret if requested
      if (updates.regenerateSecret) {
        updates.secret = crypto.randomBytes(32).toString('hex');
      }
      
      // Update subscription
      const subscription = await this.WebhookSubscription.findOneAndUpdate(
        { _id: subscriptionId, agency: agencyId },
        { $set: updates },
        { new: true }
      );
      
      if (!subscription) {
        throw new Error('Webhook subscription not found');
      }
      
      // Return without exposing secret
      const result = subscription.toObject();
      delete result.secret;
      
      return result;
    } catch (error) {
      throw new ServerError(`Failed to update webhook subscription: ${error.message}`);
    }
  }

  /**
   * Delete webhook subscription
   * @param {String} agencyId - ID of the agency
   * @param {String} subscriptionId - ID of the subscription
   * @returns {Promise<Boolean>} Success status
   */
  async deleteSubscription(agencyId, subscriptionId) {
    try {
      const result = await this.WebhookSubscription.deleteOne({
        _id: subscriptionId,
        agency: agencyId
      });
      
      if (result.deletedCount === 0) {
        throw new Error('Webhook subscription not found');
      }
      
      return true;
    } catch (error) {
      throw new ServerError(`Failed to delete webhook subscription: ${error.message}`);
    }
  }

  /**
   * Get all subscriptions for an agency
   * @param {String} agencyId - ID of the agency
   * @returns {Promise<Array<Object>>} Array of subscriptions
   */
  async getSubscriptions(agencyId) {
    try {
      const subscriptions = await this.WebhookSubscription.find({ agency: agencyId })
        .select('-secret')
        .lean();
      
      return subscriptions;
    } catch (error) {
      throw new ServerError(`Failed to get webhook subscriptions: ${error.message}`);
    }
  }

  /**
   * Trigger an event and deliver to subscribers
   * @param {String} agencyId - ID of the agency
   * @param {String} eventType - Type of event
   * @param {Object} payload - Event payload
   * @returns {Promise<Boolean>} Success status
   */
  async triggerEvent(agencyId, eventType, payload) {
    try {
      // Validate event type
      if (!this.eventHandlers.has(eventType)) {
        throw new Error(`Invalid event type: ${eventType}`);
      }
      
      // Get subscriptions for this event
      const subscriptions = await this.WebhookSubscription.find({
        agency: agencyId,
        events: eventType,
        active: true
      });
      
      if (subscriptions.length === 0) {
        // No subscribers, but not an error
        return true;
      }
      
      // Prepare event data
      const event = {
        id: new mongoose.Types.ObjectId().toString(),
        type: eventType,
        createdAt: new Date().toISOString(),
        agency: agencyId,
        data: payload
      };
      
      // Process event for each subscription
      for (const subscription of subscriptions) {
        // Add to queue
        this.eventQueue.push({
          event,
          subscription: subscription.toObject(),
          attempts: 0
        });
      }
      
      // Start processing queue if not already running
      if (!this.isProcessing) {
        this.processEventQueue();
      }
      
      return true;
    } catch (error) {
      throw new ServerError(`Failed to trigger webhook event: ${error.message}`);
    }
  }

  /**
   * Process event queue
   * @private
   */
  async processEventQueue() {
    if (this.eventQueue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    
    // Get next event from queue
    const queueItem = this.eventQueue.shift();
    
    try {
      // Deliver event to subscriber
      await this.deliverEvent(queueItem.event, queueItem.subscription);
    } catch (error) {
      console.error('Error delivering webhook event:', error);
      
      // Retry if attempts < maxRetries
      if (queueItem.attempts < this.options.maxRetries) {
        queueItem.attempts += 1;
        
        // Add back to queue with exponential backoff
        const delay = this.options.retryDelay * Math.pow(2, queueItem.attempts - 1);
        
        setTimeout(() => {
          this.eventQueue.push(queueItem);
          
          // Continue processing queue if not already running
          if (!this.isProcessing) {
            this.processEventQueue();
          }
        }, delay);
      } else {
        // Max retries exceeded, log failure
        await this.logDelivery(queueItem.event, queueItem.subscription, false, error.message);
      }
    }
    
    // Continue processing queue
    setImmediate(() => this.processEventQueue());
  }

  /**
   * Deliver event to subscriber
   * @param {Object} event - Event data
   * @param {Object} subscription - Subscription data
   * @returns {Promise<Boolean>} Success status
   * @private
   */
  async deliverEvent(event, subscription) {
    try {
      // Generate signature
      const signature = this.generateSignature(event, subscription.secret);
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        [this.options.signatureHeader]: signature
      };
      
      // Send HTTP request
      const response = await axios.post(subscription.url, event, {
        headers,
        timeout: this.options.timeout
      });
      
      // Log successful delivery
      await this.logDelivery(event, subscription, true);
      
      return true;
    } catch (error) {
      // Log error and rethrow
      console.error(`Webhook delivery failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate signature for webhook payload
   * @param {Object} payload - Event payload
   * @param {String} secret - Webhook secret
   * @returns {String} Signature
   * @private
   */
  generateSignature(payload, secret) {
    const stringPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
    
    return crypto
      .createHmac(this.options.signatureAlgorithm, secret)
      .update(stringPayload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   * @param {Object|String} payload - Event payload
   * @param {String} signature - Provided signature
   * @param {String} secret - Webhook secret
   * @returns {Boolean} Verification result
   */
  verifySignature(payload, signature, secret) {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Log webhook delivery
   * @param {Object} event - Event data
   * @param {Object} subscription - Subscription data
   * @param {Boolean} success - Success status
   * @param {String} error - Error message if failed
   * @returns {Promise<Object>} Created log entry
   * @private
   */
  async logDelivery(event, subscription, success, error = null) {
    try {
      const delivery = new this.WebhookDelivery({
        agency: subscription.agency,
        subscription: subscription._id,
        event: event.type,
        eventId: event.id,
        url: subscription.url,
        payload: event,
        success,
        statusCode: success ? 200 : null,
        error
      });
      
      await delivery.save();
      
      return delivery;
    } catch (error) {
      console.error('Failed to log webhook delivery:', error);
      return null;
    }
  }

  /**
   * Get delivery history for a subscription
   * @param {String} agencyId - ID of the agency
   * @param {String} subscriptionId - ID of the subscription
   * @param {Object} filters - Filter options
   * @returns {Promise<Array<Object>>} Array of delivery logs
   */
  async getDeliveryHistory(agencyId, subscriptionId, filters = {}) {
    try {
      const query = {
        agency: agencyId,
        subscription: subscriptionId
      };
      
      if (filters.success !== undefined) {
        query.success = filters.success;
      }
      
      if (filters.event) {
        query.event = filters.event;
      }
      
      // Add date range if provided
      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      } else if (filters.startDate) {
        query.createdAt = { $gte: new Date(filters.startDate) };
      } else if (filters.endDate) {
        query.createdAt = { $lte: new Date(filters.endDate) };
      }
      
      // Fetch results with pagination
      const limit = filters.limit || 20;
      const page = filters.page || 1;
      const skip = (page - 1) * limit;
      
      const deliveries = await this.WebhookDelivery.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await this.WebhookDelivery.countDocuments(query);
      
      return {
        deliveries,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new ServerError(`Failed to get webhook delivery history: ${error.message}`);
    }
  }
}

module.exports = WebhookManager;
