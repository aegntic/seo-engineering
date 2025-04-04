/**
 * Competitor Analysis Crawler Configuration
 * 
 * This file contains the configuration for the competitor analysis crawler.
 */

const defaultConfig = {
  // Crawl behavior settings
  maxPagesPerCompetitor: 100,
  maxConcurrency: 5,
  maxRequestsPerSecond: 3,
  navigationTimeout: 30000,
  requestTimeout: 15000,
  
  // Resource handling
  skipResources: ['image', 'media', 'font', 'stylesheet'],
  maxResourceSize: 5 * 1024 * 1024, // 5MB
  
  // Data collection settings
  extractContentText: true,
  extractMetadata: true,
  extractLinks: true,
  extractImages: true,
  extractHeaders: true,
  
  // Structure analysis
  analyzeContentStructure: true,
  analyzeKeywordUsage: true,
  analyzeInternalLinking: true,
  
  // Performance metrics
  collectPerformanceMetrics: true,
  collectCoreWebVitals: true,
  
  // SEO-specific
  analyzeMetaTags: true,
  analyzeSchemaMarkup: true,
  analyzeSitemaps: true,
  analyzeRobotsTxt: true,
  
  // Respect website behavior
  respectRobotsTxt: true,
  followRedirects: true,
  ignoreUrlPatterns: [
    '.*\\.pdf$',
    '.*\\.zip$',
    '.*\\.rar$',
    '.*\\.exe$',
    '.*\\.dmg$',
    '.*\\.csv$',
    '.*\\.doc$',
    '.*\\.docx$',
    '.*\\.xls$',
    '.*\\.xlsx$',
    'logout',
    'signout',
    'cart',
    'basket',
    'checkout',
    'account',
    'login',
    'signin'
  ],
  
  // Recovery & resilience
  restartBrowserOnCrash: true,
  maxMemoryUsage: 2048, // 2GB
  
  // Rate limiting and ethical behavior
  minimumRequestInterval: 500, // milliseconds
  
  // Output settings
  detailedLogging: false,
  saveScreenshots: false
};

/**
 * Create a configuration object with custom overrides
 * @param {Object} customConfig Custom configuration options to override defaults
 * @returns {Object} The final configuration object
 */
function createConfig(customConfig = {}) {
  return {
    ...defaultConfig,
    ...customConfig
  };
}

module.exports = {
  defaultConfig,
  createConfig
};
