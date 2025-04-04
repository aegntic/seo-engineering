/**
 * Webhook Routes
 * 
 * Defines API endpoints for webhook management operations.
 * Maps HTTP requests to controller methods.
 */

const express = require('express');
const router = express.Router();
const { WebhookController } = require('../../controllers/webhooks');
const { authenticate, authorizeAgency, validateSchema } = require('../../middleware');
const { webhookSchema } = require('../../validation/webhookSchemas');

/**
 * @route   GET /api/webhooks
 * @desc    Get all webhook subscriptions for agency
 * @access  Private (Agency users with settings view permission)
 */
router.get(
  '/',
  authenticate,
  authorizeAgency('settings', 'view'),
  WebhookController.getSubscriptions
);

/**
 * @route   GET /api/webhooks/events
 * @desc    Get available webhook event types
 * @access  Private (Agency users with settings view permission)
 */
router.get(
  '/events',
  authenticate,
  authorizeAgency('settings', 'view'),
  WebhookController.getEventTypes
);

/**
 * @route   GET /api/webhooks/:id
 * @desc    Get webhook subscription by ID
 * @access  Private (Agency users with settings view permission)
 */
router.get(
  '/:id',
  authenticate,
  authorizeAgency('settings', 'view'),
  WebhookController.getSubscription
);

/**
 * @route   POST /api/webhooks
 * @desc    Create new webhook subscription
 * @access  Private (Agency users with settings edit permission)
 */
router.post(
  '/',
  authenticate,
  validateSchema(webhookSchema.create),
  authorizeAgency('settings', 'edit'),
  WebhookController.createSubscription
);

/**
 * @route   PUT /api/webhooks/:id
 * @desc    Update webhook subscription
 * @access  Private (Agency users with settings edit permission)
 */
router.put(
  '/:id',
  authenticate,
  validateSchema(webhookSchema.update),
  authorizeAgency('settings', 'edit'),
  WebhookController.updateSubscription
);

/**
 * @route   DELETE /api/webhooks/:id
 * @desc    Delete webhook subscription
 * @access  Private (Agency users with settings edit permission)
 */
router.delete(
  '/:id',
  authenticate,
  authorizeAgency('settings', 'edit'),
  WebhookController.deleteSubscription
);

/**
 * @route   GET /api/webhooks/:id/deliveries
 * @desc    Get webhook delivery history
 * @access  Private (Agency users with settings view permission)
 */
router.get(
  '/:id/deliveries',
  authenticate,
  authorizeAgency('settings', 'view'),
  WebhookController.getDeliveryHistory
);

/**
 * @route   POST /api/webhooks/trigger
 * @desc    Trigger webhook event manually (for testing)
 * @access  Private (Agency users with settings edit permission)
 */
router.post(
  '/trigger',
  authenticate,
  validateSchema(webhookSchema.trigger),
  authorizeAgency('settings', 'edit'),
  WebhookController.triggerEvent
);

module.exports = router;
