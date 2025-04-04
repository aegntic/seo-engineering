const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Client Schema
 * Represents a client managed by an agency
 */
const ClientSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  agency: {
    type: Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  website: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'archived'],
    default: 'active'
  },
  seoScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  performance: {
    desktop: {
      type: Number,
      min: 0,
      max:
      100,
      default: 0
    },
    mobile: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    pagespeed: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  analytics: {
    organicTraffic: {
      type: Number,
      default: 0
    },
    conversion: {
      type: Number,
      default: 0
    },
    bounceRate: {
      type: Number,
      default: 0
    },
    averagePosition: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date
    }
  },
  contact: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  lastScan: {
    type: Date
  },
  plan: {
    type: String,
    enum: ['basic', 'professional', 'enterprise'],
    default: 'basic'
  },
  notes: {
    type: String
  },
  issues: [{
    type: {
      type: String,
      enum: ['Mobile', 'Links', 'Content', 'Meta', 'Performance', 'Technical', 'Security', 'Other'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'fixed', 'ignored'],
      default: 'open'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    fixedAt: {
      type: Date
    },
    fixedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AgencyUser'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
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
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'AgencyUser'
  }]
}, { timestamps: true });

// Pre-save hook to update timestamps
ClientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
ClientSchema.index({ agency: 1, status: 1 });
ClientSchema.index({ agency: 1, name: 1 });
ClientSchema.index({ agency: 1, website: 1 });

module.exports = mongoose.model('Client', ClientSchema);