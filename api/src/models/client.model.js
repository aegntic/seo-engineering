/**
 * Client model
 * Stores information about client websites being monitored and optimized
 */

const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  websiteUrl: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'paused', 'canceled'],
    default: 'pending'
  },
  gitRepository: {
    url: String,
    branch: String,
    accessToken: String
  },
  seoScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  crawlSettings: {
    depth: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    },
    maxPages: {
      type: Number,
      default: 1000
    },
    userAgent: {
      type: String,
      default: 'SEOAutomate Crawler'
    },
    respectRobotsTxt: {
      type: Boolean,
      default: true
    },
    crawlFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    lastCrawled: {
      type: Date,
      default: null
    }
  },
  apiAccess: {
    googleSearch: {
      enabled: {
        type: Boolean,
        default: false
      },
      apiKey: String
    },
    googleAnalytics: {
      enabled: {
        type: Boolean,
        default: false
      },
      viewId: String,
      credentials: Object
    }
  },
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;