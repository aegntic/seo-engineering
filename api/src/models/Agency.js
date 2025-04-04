const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Agency Schema
 * Represents an agency partner that can manage multiple clients
 */
const AgencySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  plan: {
    type: String,
    enum: ['basic', 'professional', 'enterprise'],
    default: 'basic'
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial', 'past_due', 'canceled'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date,
    trialEndsAt: Date
  },
  billing: {
    method: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer', 'invoice'],
      default: 'credit_card'
    },
    contactName: String,
    contactEmail: String
  },
  clientCount: {
    type: Number,
    default: 0
  },
  whiteLabelSettings: {
    enabled: {
      type: Boolean,
      default: false
    },
    brandName: String,
    logoUrl: String,
    faviconUrl: String,
    primaryColor: {
      type: String,
      default: '#3B82F6' // Default blue color
    },
    accentColor: {
      type: String,
      default: '#10B981' // Default green color
    },
    customDomain: String,
    customEmailEnabled: {
      type: Boolean,
      default: false
    },
    customEmail: String,
    emailFooter: String,
    hideSeoBranding: {
      type: Boolean,
      default: false
    }
  }
}, { timestamps: true });

// Pre-save hook to update timestamps
AgencySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a slug from the agency name if not provided
AgencySchema.pre('validate', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Agency', AgencySchema);