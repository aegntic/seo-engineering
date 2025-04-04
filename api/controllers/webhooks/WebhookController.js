/**
 * Webhook Controller
 * 
 * Handles HTTP requests related to webhook management.
 * Provides endpoints for webhook subscriptions and delivery history.
 */

const WebhookManager = require('../../src/webhooks/WebhookManager');
const { ValidationError, NotFoundError } = require('../../utils/errors');

// Initialize WebhookManager
const webhookManager = new WebhookManager();

// Register event types
const eventTypes = [
  'client.created',
  'client.updated',
  'client.deleted',
  'scan.started',
  'scan.completed',
  'scan.failed',
  'issue.detected',
  'issue.fixed',
  'report.generated',
  'user.invited',
  'user.created',
  'user.updated'
];

// Register all event types
eventTypes.forEach(eventType => {
  webhookManager.registerEventType(eventType, (event) => {
    // Event-specific processing logic could go here
    console.log(`Processing event: ${eventType}`);
    return event;
  });
});

module.exports = {
  /**
   * Get all webhook subscriptions for agency
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSubscriptions(req, res) {
    try {
      const agencyId = req.agency._id;
      
      const subscriptions = await webhookManager.getSubscriptions(agencyId);
      
      return res.status(200).json({
        success: true,
        data: subscriptions
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving webhook subscriptions',
        error: error.message
      });
    }
  },
  
  /**
   * Get webhook subscription by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSubscription(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      const subscriptions = await webhookManager.getSubscriptions(agencyId);
      const subscription = subscriptions.find(sub => sub._id.toString() === id);
      
      if (!subscription) {
        throw new NotFoundError('Webhook subscription not found');
      }
      
      return res.status(200).json({
        success: true,
        data: subscription
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error retrieving webhook subscription',
        error: error.message
      });
    }
  },
  
  /**
   * Create new webhook subscription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createSubscription(req, res) {
    try {
      const agencyId = req.agency._id;
      const { url, events, description, secret, active } = req.body;
      
      // Validate required fields
      if (!url) {
        throw new ValidationError('Webhook URL is required');
      }
      
      if (!events || !Array.isArray(events) || events.length === 0) {
        throw new ValidationError('At least one event is required');
      }
      
      const subscription = await webhookManager.subscribe(agencyId, {
        url,
        events,
        description,
        secret,
        active,
        createdBy: req.user._id
      });
      
      return res.status(201).json({
        success: true,
        data: subscription,
        message: 'Webhook subscription created successfully'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error creating webhook subscription',
        error: error.message
      });
    }
  },
  
  /**
   * Update webhook subscription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateSubscription(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      const { url, events, description, active, regenerateSecret } = req.body;
      
      // Prepare updates
      const updates = {};
      
      if (url !== undefined) updates.url = url;
      if (events !== undefined) updates.events = events;
      if (description !== undefined) updates.description = description;
      if (active !== undefined) updates.active = active;
      if (regenerateSecret !== undefined) updates.regenerateSecret = regenerateSecret;
      
      const subscription = await webhookManager.updateSubscription(agencyId, id, updates);
      
      return res.status(200).json({
        success: true,
        data: subscription,
        message: 'Webhook subscription updated successfully'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error updating webhook subscription',
        error: error.message
      });
    }
  },
  
  /**
   * Delete webhook subscription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteSubscription(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      await webhookManager.deleteSubscription(agencyId, id);
      
      return res.status(200).json({
        success: true,
        message: 'Webhook subscription deleted successfully'
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error deleting webhook subscription',
        error: error.message
      });
    }
  },
  
  /**
   * Get webhook delivery history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDeliveryHistory(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      // Parse filter options from query
      const filters = {
        success: req.query.success === 'true' ? true : 
                req.query.success === 'false' ? false : undefined,
        event: req.query.event,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };
      
      const result = await webhookManager.getDeliveryHistory(agencyId, id, filters);
      
      return res.status(200).json({
        success: true,
        data: result.deliveries,
        pagination: result.pagination
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving webhook delivery history',
        error: error.message
      });
    }
  },
  
  /**
   * Get available webhook event types
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getEventTypes(req, res) {
    try {
      const availableEvents = webhookManager.getEventTypes();
      
      return res.status(200).json({
        success: true,
        data: availableEvents
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving webhook event types',
        error: error.message
      });
    }
  },
  
  /**
   * Trigger webhook event manually (for testing)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async triggerEvent(req, res) {
    try {
      const { eventType, payload } = req.body;
      const agencyId = req.agency._id;
      
      if (!eventType) {
        throw new ValidationError('Event type is required');
      }
      
      // Check if event type is valid
      const availableEvents = webhookManager.getEventTypes();
      if (!availableEvents.includes(eventType)) {
        throw new ValidationError(`Invalid event type: ${eventType}`);
      }
      
      await webhookManager.triggerEvent(agencyId, eventType, payload || {});
      
      return res.status(200).json({
        success: true,
        message: `Webhook event "${eventType}" triggered successfully`
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error triggering webhook event',
        error: error.message
      });
    }
  }
};
