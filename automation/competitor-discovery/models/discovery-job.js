/**
 * Discovery Job Model
 * 
 * Represents a competitor discovery job in the database
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscoveryJobSchema = new Schema({
  siteId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Site'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  options: {
    type: Object,
    default: {}
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  results: {
    competitors: [{
      _id: Schema.Types.ObjectId,
      url: String,
      domain: String,
      relevanceScore: Number,
      discoveryMethod: {
        type: String,
        enum: ['keyword', 'serp', 'backlink', 'industry']
      },
      keywordOverlap: Number,
      backlinksInCommon: Number,
      serpOverlap: Number,
      industryMatch: Boolean,
      rank: Number
    }],
    stats: {
      totalCompetitors: {
        type: Number,
        default: 0
      },
      keywordBased: {
        type: Number,
        default: 0
      },
      serpBased: {
        type: Number,
        default: 0
      },
      backlinkBased: {
        type: Number,
        default: 0
      },
      industryBased: {
        type: Number,
        default: 0
      },
      averageRelevance: {
        type: Number,
        default: 0
      }
    }
  },
  error: {
    type: String,
    default: null
  },
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

// Create indexes for efficient queries
DiscoveryJobSchema.index({ siteId: 1 });
DiscoveryJobSchema.index({ status: 1 });
DiscoveryJobSchema.index({ createdAt: 1 });

/**
 * Update job progress
 * @param {Number} progress - Progress percentage (0-100)
 * @returns {Promise} - Updated document
 */
DiscoveryJobSchema.methods.updateProgress = function(progress) {
  this.progress = progress;
  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Mark job as started
 * @returns {Promise} - Updated document
 */
DiscoveryJobSchema.methods.start = function() {
  this.status = 'in_progress';
  this.startTime = Date.now();
  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Mark job as completed
 * @param {Object} results - Job results
 * @returns {Promise} - Updated document
 */
DiscoveryJobSchema.methods.complete = function(results) {
  this.status = 'completed';
  this.endTime = Date.now();
  this.progress = 100;
  this.results = results;
  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Mark job as failed
 * @param {String} error - Error message
 * @returns {Promise} - Updated document
 */
DiscoveryJobSchema.methods.fail = function(error) {
  this.status = 'failed';
  this.endTime = Date.now();
  this.error = error;
  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Static method to find recent jobs for a site
 * @param {ObjectId} siteId - Site ID
 * @param {Number} limit - Maximum number of jobs to return
 * @returns {Promise} - Array of jobs
 */
DiscoveryJobSchema.statics.findRecentBySiteId = function(siteId, limit = 10) {
  return this.find({ siteId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

/**
 * Static method to find active jobs
 * @returns {Promise} - Array of active jobs
 */
DiscoveryJobSchema.statics.findActive = function() {
  return this.find({ status: 'in_progress' })
    .sort({ startTime: 1 })
    .exec();
};

// Create the model
const DiscoveryJob = mongoose.model('DiscoveryJob', DiscoveryJobSchema, 'competitor_discovery_jobs');

module.exports = DiscoveryJob;
