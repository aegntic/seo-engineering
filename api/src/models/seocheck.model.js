/**
 * SEO Check model
 * Defines the available SEO checks and their configurations
 */

const mongoose = require('mongoose');

const seoCheckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'technical', 
      'content', 
      'performance', 
      'security', 
      'mobile',
      'structure'
    ]
  },
  description: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low']
  },
  autoFix: {
    available: {
      type: Boolean,
      default: false
    },
    requiresApproval: {
      type: Boolean,
      default: true
    }
  },
  checkFunction: {
    type: String,
    required: true
  },
  fixFunction: {
    type: String
  },
  parameters: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
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

const SeoCheck = mongoose.model('SeoCheck', seoCheckSchema);

// Create initial SEO checks if collection is empty
const initializeChecks = async () => {
  const count = await SeoCheck.countDocuments();
  if (count === 0) {
    const initialChecks = [
      {
        name: 'Missing Meta Title',
        category: 'technical',
        description: 'Checks if pages have missing meta title tags',
        enabled: true,
        severity: 'high',
        autoFix: {
          available: true,
          requiresApproval: true
        },
        checkFunction: 'checkMissingMetaTitle',
        fixFunction: 'fixMissingMetaTitle',
        parameters: {
          minLength: 10,
          maxLength: 60
        }
      },
      {
        name: 'Missing Meta Description',
        category: 'technical',
        description: 'Checks if pages have missing meta description tags',
        enabled: true,
        severity: 'high',
        autoFix: {
          available: true,
          requiresApproval: true
        },
        checkFunction: 'checkMissingMetaDescription',
        fixFunction: 'fixMissingMetaDescription',
        parameters: {
          minLength: 50,
          maxLength: 160
        }
      },
      {
        name: 'SSL Verification',
        category: 'security',
        description: 'Checks if website has a valid SSL certificate',
        enabled: true,
        severity: 'critical',
        autoFix: {
          available: false,
          requiresApproval: true
        },
        checkFunction: 'checkSSL',
        parameters: {}
      },
      {
        name: 'Mobile Responsiveness',
        category: 'mobile',
        description: 'Checks if website is mobile-friendly',
        enabled: true,
        severity: 'high',
        autoFix: {
          available: false,
          requiresApproval: true
        },
        checkFunction: 'checkMobileResponsiveness',
        parameters: {
          viewports: ['375x667', '414x896', '768x1024']
        }
      },
      {
        name: 'Page Speed',
        category: 'performance',
        description: 'Checks page loading speed',
        enabled: true,
        severity: 'high',
        autoFix: {
          available: false,
          requiresApproval: true
        },
        checkFunction: 'checkPageSpeed',
        parameters: {
          threshold: 70
        }
      }
    ];
    
    await SeoCheck.insertMany(initialChecks);
  }
};

module.exports = {
  SeoCheck,
  initializeChecks
};