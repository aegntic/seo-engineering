/**
 * Competitor Profile Model
 * 
 * Represents a detailed competitor profile in the database
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompetitorProfileSchema = new Schema({
  siteId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Site'
  },
  competitorId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastCrawledAt: {
    type: Date,
    default: null
  },
  domainMetrics: {
    domainAuthority: {
      type: Number,
      default: null
    },
    pageAuthority: {
      type: Number,
      default: null
    },
    trustFlow: {
      type: Number,
      default: null
    },
    citationFlow: {
      type: Number,
      default: null
    },
    domainAge: {
      type: Number,
      default: null
    },
    estimatedTraffic: {
      type: Number,
      default: null
    },
    dataSource: {
      type: String,
      default: null
    },
    dataTimestamp: {
      type: Date,
      default: null
    }
  },
  keywordData: {
    totalKeywords: {
      type: Number,
      default: 0
    },
    topKeywords: [{
      keyword: String,
      volume: Number,
      position: Number,
      url: String
    }],
    keywordsInCommon: [{
      keyword: String,
      competitorPosition: Number,
      sitePosition: Number,
      volume: Number
    }],
    keywordGaps: [{
      keyword: String,
      volume: Number,
      position: Number,
      url: String
    }]
  },
  backlinks: {
    totalBacklinks: {
      type: Number,
      default: 0
    },
    backlinkDomains: {
      type: Number,
      default: 0
    },
    commonBacklinks: [{
      domain: String,
      url: String,
      authority: Number
    }],
    uniqueBacklinks: [{
      domain: String,
      url: String,
      authority: Number
    }]
  },
  content: {
    pageCount: {
      type: Number,
      default: 0
    },
    averageWordCount: {
      type: Number,
      default: 0
    },
    contentCategories: [String],
    samplePages: [{
      url: String,
      title: String,
      wordCount: Number,
      topKeywords: [String]
    }]
  },
  socialMedia: {
    profiles: [{
      platform: String,
      url: String,
      followers: Number,
      engagement: Number,
      lastUpdated: Date
    }],
    totalFollowers: {
      type: Number,
      default: 0
    }
  },
  technologies: [{
    category: String,
    name: String,
    url: String
  }],
  seo: {
    titleTags: {
      average: {
        length: Number,
        keywords: Number
      },
      examples: [{
        url: String,
        title: String
      }]
    },
    metaDescriptions: {
      average: {
        length: Number,
        keywords: Number
      },
      examples: [{
        url: String,
        description: String
      }]
    },
    headingStructure: {
      averageH1PerPage: Number,
      averageH2PerPage: Number,
      examples: [{
        url: String,
        h1: String,
        h2s: [String]
      }]
    }
  },
  performance: {
    coreWebVitals: {
      lcp: Number,
      fid: Number,
      cls: Number
    },
    pagespeed: {
      mobile: Number,
      desktop: Number
    },
    serverResponse: {
      ttfb: Number
    }
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
CompetitorProfileSchema.index({ siteId: 1 });
CompetitorProfileSchema.index({ competitorId: 1 });
CompetitorProfileSchema.index({ siteId: 1, competitorId: 1 }, { unique: true });
CompetitorProfileSchema.index({ domain: 1 });

/**
 * Update profile data
 * @param {Object} data - New profile data
 * @returns {Promise} - Updated document
 */
CompetitorProfileSchema.methods.updateProfile = function(data) {
  Object.assign(this, data);
  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Update domain metrics
 * @param {Object} metrics - Domain metrics data
 * @returns {Promise} - Updated document
 */
CompetitorProfileSchema.methods.updateDomainMetrics = function(metrics) {
  this.domainMetrics = {
    ...this.domainMetrics,
    ...metrics,
    dataTimestamp: Date.now()
  };
  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Update keyword data
 * @param {Object} keywordData - Keyword data
 * @returns {Promise} - Updated document
 */
CompetitorProfileSchema.methods.updateKeywordData = function(keywordData) {
  this.keywordData = {
    ...this.keywordData,
    ...keywordData
  };
  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Static method to find by site and competitor
 * @param {ObjectId} siteId - Site ID
 * @param {ObjectId} competitorId - Competitor ID
 * @returns {Promise} - Profile document
 */
CompetitorProfileSchema.statics.findBySiteAndCompetitor = function(siteId, competitorId) {
  return this.findOne({ siteId, competitorId }).exec();
};

/**
 * Static method to find profiles by site
 * @param {ObjectId} siteId - Site ID
 * @returns {Promise} - Array of profiles
 */
CompetitorProfileSchema.statics.findBySite = function(siteId) {
  return this.find({ siteId }).exec();
};

/**
 * Static method to find profiles by domain
 * @param {String} domain - Domain name
 * @returns {Promise} - Array of profiles
 */
CompetitorProfileSchema.statics.findByDomain = function(domain) {
  return this.find({ domain }).exec();
};

// Create the model
const CompetitorProfile = mongoose.model('CompetitorProfile', CompetitorProfileSchema, 'competitor_discovery_profiles');

module.exports = CompetitorProfile;
