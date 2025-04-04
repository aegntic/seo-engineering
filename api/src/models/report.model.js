/**
 * Report model
 * Stores SEO audit reports with technical issues and fixes
 */

const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'meta_tags', 
      'page_speed', 
      'mobile_responsiveness',
      'ssl_security',
      'schema_markup',
      'image_optimization',
      'robots_txt',
      'sitemap',
      'broken_links',
      'header_structure',
      'duplicate_content',
      'canonical_tags',
      'core_web_vitals',
      'other'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low']
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  screenshotUrl: String,
  fixImplemented: {
    type: Boolean,
    default: false
  },
  fixDetails: {
    implementation: String,
    gitCommitId: String,
    fixedAt: Date,
    previousValue: String,
    newValue: String
  },
  impact: {
    type: String,
    enum: ['high', 'medium', 'low']
  }
});

const metricsSchema = new mongoose.Schema({
  pagespeed: {
    mobile: Number,
    desktop: Number
  },
  coreWebVitals: {
    LCP: Number, // Largest Contentful Paint
    FID: Number, // First Input Delay
    CLS: Number  // Cumulative Layout Shift
  },
  meta: {
    titleTags: {
      missing: Number,
      duplicate: Number,
      tooLong: Number,
      tooShort: Number
    },
    metaDescriptions: {
      missing: Number,
      duplicate: Number,
      tooLong: Number,
      tooShort: Number
    }
  },
  crawlability: {
    indexablePages: Number,
    nonIndexablePages: Number,
    brokenLinks: Number
  },
  security: {
    sslValid: Boolean,
    mixedContent: Boolean
  },
  sitemapStatus: {
    exists: Boolean,
    validFormat: Boolean,
    brokenUrls: Number
  }
});

const reportSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  crawlDate: {
    type: Date,
    default: Date.now
  },
  seoScore: {
    type: Number,
    min: 0,
    max: 100
  },
  metrics: metricsSchema,
  issues: [issueSchema],
  pagesScanned: {
    type: Number,
    required: true
  },
  crawlDuration: {
    type: Number, // in seconds
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'in_progress', 'failed'],
    default: 'in_progress'
  },
  summary: {
    criticalIssues: Number,
    highIssues: Number,
    mediumIssues: Number,
    lowIssues: Number,
    fixedIssues: Number
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

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;