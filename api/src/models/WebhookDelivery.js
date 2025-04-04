/**
 * Webhook Delivery Model
 * 
 * Defines the schema for webhook delivery logs.
 * Records attempts to deliver webhook events.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * WebhookDelivery Schema
 */
const WebhookDeliverySchema = new Schema({
  agency: {
    type: Schema.Types.ObjectId,
    ref: 'Agency',
    required: true,
    index: true
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: 'WebhookSubscription',
    required: true,
    index: true
  },
  event: {
    type: String,
    required: true,
    index: true
  },
  eventId: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  payload: {
    type: Schema.Types.Mixed,
    required: true
  },
  success: {
    type: Boolean,
    required: true,
    index: true
  },
  statusCode: {
    type: Number
  },
  error: {
    type: String
  },
  responseHeaders: {
    type: Schema.Types.Mixed
  },
  responseBody: {
    type: Schema.Types.Mixed
  },
  processingTimeMs: {
    type: Number
  },
  attempts: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// Compound index for efficient queries
WebhookDeliverySchema.index({ subscription: 1, createdAt: -1 });
WebhookDeliverySchema.index({ agency: 1, event: 1, createdAt: -1 });

// Update subscription stats after save
WebhookDeliverySchema.post('save', async function(doc) {
  try {
    const WebhookSubscription = mongoose.model('WebhookSubscription');
    await WebhookSubscription.updateOne(
      { _id: doc.subscription },
      { 
        $set: { lastTriggered: doc.createdAt },
        $inc: doc.success ? { successCount: 1 } : { failureCount: 1 }
      }
    );
  } catch (error) {
    console.error('Failed to update webhook subscription stats:', error);
  }
});

module.exports = mongoose.model('WebhookDelivery', WebhookDeliverySchema);
