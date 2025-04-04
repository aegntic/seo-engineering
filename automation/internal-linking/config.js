/**
 * Internal Linking Optimization Module Configuration
 * 
 * Default configuration values for the Internal Linking Optimization module.
 * These values can be overridden with options passed to the constructor.
 */

module.exports = {
  // Analysis configuration
  minLinkableContent: 200,        // Minimum content length for a page to be considered for linking
  maxOutboundLinks: 100,          // Maximum outbound links per page
  minInboundLinks: 2,             // Minimum recommended inbound links per page
  distributionFactor: 0.7,        // Factor for balancing link distribution (0-1)
  
  // Graph analysis configuration
  maxDistanceFromHome: 3,         // Maximum recommended click distance from home
  orphanThreshold: 1,             // Max inbound links to consider a page orphaned
  siloBias: 0.6,                  // Bias toward linking within same content silo
  pageRankDampingFactor: 0.85,    // PageRank damping factor
  pageRankIterations: 100,        // Max PageRank calculation iterations
  
  // Text analysis configuration
  anchorTextMinLength: 3,         // Minimum words in anchor text
  anchorTextMaxLength: 8,         // Maximum words in anchor text
  anchorTextRelevanceThreshold: 0.6, // Minimum relevance score for anchor text
  keywordBias: 0.7,               // Bias toward using keywords in anchor text
  naturalLanguageBias: 0.5,       // Bias toward natural language in anchor text
  
  // Optimization configuration
  maxSuggestedLinks: 15,          // Maximum suggested new links per page
  maxPrioritizedPages: 20,        // Maximum pages to prioritize for improvement
  minPathStrength: 0.3,           // Minimum link path strength to consider
  linkRatioTarget: 0.02,          // Target ratio of links to content length
  
  // Performance configuration
  batchSize: 50,                  // Pages to process in each batch
  parallelProcessing: 4,          // Number of parallel processing tasks
  cacheResults: true,             // Whether to cache results
  
  // Integration configuration
  integrateCrawler: true,         // Whether to integrate with crawler module
  integrateAnalysis: true,        // Whether to integrate with analysis engine
  integrateFixes: true,           // Whether to integrate with fix implementation
  
  // Module-specific exclusions
  excludePatterns: [
    '/tag/',
    '/category/',
    '/author/',
    '/page/',
    '/wp-admin/',
    '/wp-includes/',
    '/feed/',
    '/comments/'
  ]
};
