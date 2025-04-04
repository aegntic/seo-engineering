/**
 * Configuration for the Duplicate Content Analysis module
 * 
 * This file defines the default configuration settings for the module.
 * These settings can be overridden when initializing the DuplicateContentAnalyzer.
 */

require('dotenv').config({ path: '../../.env' });

module.exports = {
  // Minimum similarity score to consider content as duplicate (0.0-1.0)
  similarityThreshold: process.env.DCA_SIMILARITY_THRESHOLD || 0.85,

  // Minimum content length to analyze (characters)
  minContentLength: process.env.DCA_MIN_CONTENT_LENGTH || 500,

  // Maximum number of parallel comparisons
  parallelComparisons: process.env.DCA_PARALLEL_COMPARISONS || 10,

  // URL patterns to exclude from analysis (regex strings)
  excludePatterns: (process.env.DCA_EXCLUDE_PATTERNS || '')
    .split(',')
    .filter(pattern => pattern.trim().length > 0),

  // HTML elements to exclude from content extraction (CSS selectors)
  excludeSelectors: [
    'header', 
    'footer', 
    'nav', 
    '.navigation', 
    '#menu', 
    '.sidebar', 
    '.menu', 
    '.comments',
    'script',
    'style'
  ],

  // SimHash bit length
  simhashBits: process.env.DCA_SIMHASH_BITS || 64,

  // Maximum number of fingerprints to store in memory
  maxCachedFingerprints: process.env.DCA_MAX_CACHED_FINGERPRINTS || 10000,

  // Canonical suggestion strategies in order of priority
  canonicalStrategies: [
    'shortest-url',
    'most-incoming-links',
    'oldest-published',
    'most-traffic'
  ],

  // Maximum number of pages to analyze per batch
  batchSize: process.env.DCA_BATCH_SIZE || 1000,

  // Debug mode
  debug: process.env.DCA_DEBUG === 'true',

  // Logging level
  logLevel: process.env.DCA_LOG_LEVEL || 'info',

  // API timeout (ms)
  apiTimeout: process.env.DCA_API_TIMEOUT || 30000,

  // Allow analysis of pages with canonical tags already set
  analyzeWithCanonicals: process.env.DCA_ANALYZE_WITH_CANONICALS === 'true',

  // Minimum content similarity for different languages (use language detection)
  crossLanguageSimilarityThreshold: 
    process.env.DCA_CROSS_LANGUAGE_SIMILARITY_THRESHOLD || 0.75,

  // Use machine translation for cross-language duplicate detection
  useTranslationForCrossLanguage: 
    process.env.DCA_USE_TRANSLATION_FOR_CROSS_LANGUAGE === 'true'
};
