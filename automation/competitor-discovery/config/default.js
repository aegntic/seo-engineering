/**
 * Default configuration for the Competitor Discovery Module
 */

module.exports = {
  // Discovery settings
  discovery: {
    maxCompetitors: 10,
    minRelevanceScore: 0.5,
    maxDiscoveryDepth: 2,
    concurrency: 5,
    timeout: 300000, // 5 minutes
    retryLimit: 3,
    retryDelay: 5000 // 5 seconds
  },
  
  // Keyword analysis settings
  keywords: {
    minOverlap: 0.3,
    maxKeywords: 100,
    prioritizeTopRanking: true,
    keywordImportanceWeights: {
      title: 1.5,
      headings: 1.2,
      content: 1.0,
      meta: 0.8
    },
    ignoredKeywords: [
      'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 
      'with', 'by', 'about', 'as', 'of', 'from'
    ]
  },
  
  // SERP analysis settings
  serp: {
    maxResults: 20,
    includeAds: false,
    regions: ['us', 'uk', 'ca'],
    engines: ['google', 'bing'],
    maxQueriesPerDay: 100,
    resultWeight: {
      position1_3: 1.0,
      position4_10: 0.8,
      position11_20: 0.5,
      position21_plus: 0.2
    },
    apiEndpoints: {
      google: process.env.GOOGLE_SERP_API_ENDPOINT || 'https://serpapi.com/search',
      bing: process.env.BING_SERP_API_ENDPOINT || 'https://api.bing.microsoft.com/v7.0/search'
    }
  },
  
  // Backlink analysis settings
  backlinks: {
    minSimilarity: 0.2,
    maxBacklinks: 1000,
    prioritizeAuthoritySites: true,
    backlinkMetrics: {
      domainAuthority: true,
      pageAuthority: true,
      trustFlow: true,
      citationFlow: true
    },
    apiEndpoints: {
      majestic: process.env.MAJESTIC_API_ENDPOINT || 'https://api.majestic.com/api/json',
      moz: process.env.MOZ_API_ENDPOINT || 'https://moz.com/api',
      ahrefs: process.env.AHREFS_API_ENDPOINT || 'https://api.ahrefs.com/v1'
    }
  },
  
  // Industry classification settings
  industry: {
    useAI: true,
    confidenceThreshold: 0.7,
    fallbackToSimilarKeywords: true,
    industries: [
      'E-commerce', 'Finance', 'Healthcare', 'Education', 'Technology', 
      'Travel', 'Real Estate', 'Food & Beverage', 'Manufacturing', 
      'Entertainment', 'Media', 'Professional Services', 'Non-profit'
    ],
    keywordMapping: {
      'E-commerce': ['shop', 'buy', 'product', 'store', 'purchase'],
      'Finance': ['bank', 'invest', 'finance', 'loan', 'credit'],
      // ... other industry keyword mappings
    }
  },
  
  // Competitor ranking settings
  ranking: {
    factors: {
      keywordOverlap: 0.4,
      serpOverlap: 0.3,
      backlinkSimilarity: 0.2,
      industryMatch: 0.1
    },
    boostFactors: {
      domainAuthority: 0.05,
      trafficEstimate: 0.05
    }
  },
  
  // Profile generation settings
  profile: {
    includeDomainMetrics: true,
    includeKeywordData: true,
    includeBacklinks: true,
    includeContentAnalysis: true,
    includeSocialMedia: true,
    includeTechnologies: true,
    maxTopKeywords: 20,
    maxBacklinksInProfile: 50
  },
  
  // Database settings
  database: {
    collectionPrefix: 'competitor_discovery_',
    collections: {
      jobs: 'jobs',
      competitors: 'competitors',
      profiles: 'profiles'
    },
    indexes: {
      jobs: [
        { key: { siteId: 1 }, name: 'siteId' },
        { key: { status: 1 }, name: 'status' },
        { key: { createdAt: 1 }, name: 'createdAt' }
      ],
      competitors: [
        { key: { siteId: 1 }, name: 'siteId' },
        { key: { 'competitors.domain': 1 }, name: 'domain' },
        { key: { 'competitors.relevanceScore': -1 }, name: 'relevanceScore' }
      ],
      profiles: [
        { key: { siteId: 1, competitorId: 1 }, name: 'siteId_competitorId', unique: true },
        { key: { domain: 1 }, name: 'domain' }
      ]
    }
  },
  
  // API keys and credentials (should be overridden by environment variables)
  apis: {
    serpApi: {
      key: process.env.SERP_API_KEY || '',
      endpoint: process.env.SERP_API_ENDPOINT || 'https://serpapi.com/search'
    },
    majestic: {
      key: process.env.MAJESTIC_API_KEY || '',
      endpoint: process.env.MAJESTIC_API_ENDPOINT || 'https://api.majestic.com/api/json'
    },
    moz: {
      accessId: process.env.MOZ_ACCESS_ID || '',
      secretKey: process.env.MOZ_SECRET_KEY || '',
      endpoint: process.env.MOZ_API_ENDPOINT || 'https://moz.com/api'
    },
    ahrefs: {
      token: process.env.AHREFS_API_TOKEN || '',
      endpoint: process.env.AHREFS_API_ENDPOINT || 'https://api.ahrefs.com/v1'
    }
  },
  
  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    includeMeta: true
  }
};
