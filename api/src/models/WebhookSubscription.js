/**
 * Webhook Subscription Model
 * 
 * Defines the schema for webhook subscriptions.
 * Represents a subscription to receive webhook events.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * WebhookSubscription Schema
 */
const WebhookSubscriptionSchema = new Schema({
  agency: {
    type: Schema.Types.ObjectId,
    ref: 'Agency',
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  events: {
    type: [String],
    required: true,
    validate: {
      validator: function(events) {
        return events && events.length > 0;
      },
      message: 'At least one event must be specified'
    }
  },
  description: {
    type: String,
    trim: true
  },
  secret: {
    type: String,
    required: true,
    select: false // Do not include in query results by default
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'AgencyUser'
  },
  lastTriggered: {
    type: Date
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for efficient queries
WebhookSubscriptionSchema.index({ agency: 1, events: 1 });

// Pre-save hook to update timestamps
WebhookSubscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update success and failure counts
WebhookSubscriptionSchema.methods.updateDeliveryStats = async function(success) {
  const update = {
    lastTriggered: Date.now()
  };
  
  if (success) {
    update.$inc = { successCount: 1 };
  } else {
    update.$inc = { failureCount: 1 };
  }
  
  await this.constructor.updateOne({ _id: this._id }, update);
};

module.exports = mongoose.model('WebhookSubscription', WebhookSubscriptionSchema);
