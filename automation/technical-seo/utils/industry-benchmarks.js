/**
 * Industry Benchmarks Utility
 * 
 * Provides industry-specific SEO benchmarks for accurate scoring and recommendations.
 */

// In-memory cache for benchmarks to avoid repeated fetching
const benchmarkCache = new Map();

/**
 * Get industry benchmarks for a specific industry and vertical
 * @param {string} industry - Industry category
 * @param {string} vertical - Vertical within industry
 * @returns {Promise<Object>} - Benchmark data
 */
async function getIndustryBenchmarks(industry, vertical) {
  const cacheKey = `${industry}:${vertical}`;
  
  // Check cache first
  if (benchmarkCache.has(cacheKey)) {
    return benchmarkCache.get(cacheKey);
  }
  
  try {
    // In a real implementation, this might fetch from an API or database
    // For now, we'll use hard-coded benchmarks
    const benchmarks = getBenchmarksForIndustry(industry, vertical);
    
    // Cache the result
    benchmarkCache.set(cacheKey, benchmarks);
    
    return benchmarks;
  } catch (error) {
    console.error(`Error fetching benchmarks for ${industry}/${vertical}:`, error);
    
    // Return general benchmarks as fallback
    return getGeneralBenchmarks();
  }
}

/**
 * Get benchmarks for a specific industry
 * @param {string} industry - Industry category
 * @param {string} vertical - Vertical within industry
 * @returns {Object} - Industry-specific benchmarks
 */
function getBenchmarksForIndustry(industry, vertical) {
  // Map industries to their benchmark data
  const industryMap = {
    ecommerce: getEcommerceBenchmarks(vertical),
    healthcare: getHealthcareBenchmarks(vertical),
    finance: getFinanceBenchmarks(vertical),
    travel: getTravelBenchmarks(vertical),
    technology: getTechnologyBenchmarks(vertical)
  };
  
  return industryMap[industry] || getGeneralBenchmarks();
}

/**
 * Get general benchmarks (fallback for unknown industries)
 * @returns {Object} - General benchmarks
 */
function getGeneralBenchmarks() {
  return {
    industry: 'general',
    vertical: 'general',
    lastUpdated: '2025-04-01',
    overallScoreWeights: {
      technical: 0.25,
      content: 0.25,
      onPage: 0.25,
      performance: 0.25
    },
    metrics: {
      // Technical SEO metrics
      pageSpeed: {
        value: 80,
        importance: 'high',
        weight: 1.0,
        lowerIsBetter: false,
        distribution: { p10: 50, p25: 65, p50: 75, p75: 85, p90: 90 },
        recommendation: 'Improve page speed by optimizing images, minifying CSS/JS, and reducing server response time.'
      },
      mobileResponsiveness: {
        value: 85,
        importance: 'high',
        weight: 1.0,
        lowerIsBetter: false,
        distribution: { p10: 60, p25: 70, p50: 80, p75: 90, p90: 95 },
        recommendation: 'Enhance mobile responsiveness with responsive design, proper viewport settings, and optimized touch targets.'
      },
      crawlability: {
        value: 90,
        importance: 'high',
        weight: 1.0,
        lowerIsBetter: false,
        distribution: { p10: 65, p25: 75, p50: 85, p75: 95, p90: 98 },
        recommendation: 'Improve crawlability by optimizing robots.txt, XML sitemaps, and internal linking structure.'
      },
      ssl: {
        value: 100,
        importance: 'critical',
        weight: 1.0,
        lowerIsBetter: false,
        distribution: { p10: 75, p25: 95, p50: 100, p75: 100, p90: 100 },
        recommendation: 'Ensure proper SSL implementation and fix any mixed content issues.'
      },
      brokenLinks: {
        value: 95,
        importance: 'high',
        weight: 1.0,
        lowerIsBetter: false,
        distribution: { p10: 70, p25: 80, p50: 90, p75: 98, p90: 100 },
        recommendation: 'Fix broken internal links and update or remove broken external links.'
      },
      javascriptErrors: {
        value: 90,
        importance: 'medium',
        weight: 0.8,
        lowerIsBetter: false,
        distribution: { p10: 60, p25: 75, p50: 85, p75: 95, p90: 100 },
        recommendation: 'Address JavaScript errors to improve user experience and functionality.'
      },
      
      // Content metrics
      contentQuality: {
        value: 80,
        importance: 'high',
        weight: 1.0,
        lowerIsBetter: false,
        distribution: { p10: 50, p25: 65, p50: 75, p75: 85, p90: 90 },
        recommendation: 'Enhance content quality with comprehensive, well-structured content addressing user intent.'
      },
      wordCount: {
        value: 1500,
        importance: 'medium',
        weight: 0.7,
        lowerIsBetter: false,
        distribution: { p10: 500, p25: 800, p50: 1200, p75: 1800, p90: 2500 },
        recommendation: 'Increase content length to provide more comprehensive information on the topic.'
      },
      readabilityScore: {
        value: 65,
        importance: 'medium',
        weight: 0.8,
        lowerIsBetter: false,
        distribution: { p10: 40, p25: 50, p50: 60, p75: 70, p90: 80 },
        recommendation: 'Improve readability with shorter sentences, simpler language, and better content structure.'
      },
      keywordDensity: {
        value: 2,
        importance: 'medium',
        weight: 0.6,
        lowerIsBetter: false,
        distribution: { p10: 0.5, p25: 1, p50: 1.5, p75: 2.5, p90: 3.5 },
        recommendation: 'Optimize keyword usage with natural incorporation of target keywords throughout content.'
      },
      
      // On-page metrics
      metaTags: {
        value: 85,
        importance: 'high',
        weight: 0.9,
        lowerIsBetter: false,
        distribution: { p10: 60, p25: 70, p50: 80, p75: 90, p90: 95 },
        recommendation: 'Optimize meta titles and descriptions with compelling, keyword-rich content within character limits.'
      },
      headingStructure: {
        value: 80,
        importance: 'medium',
        weight: 0.8,
        lowerIsBetter: false,
        distribution: { p10: 50, p25: 65, p50: 75, p75: 85, p90: 90 },
        recommendation: 'Improve heading structure with clear H1-H6 hierarchy and keyword inclusion.'
      },
      urlStructure: {
        value: 85,
        importance: 'medium',
        weight: 0.7,
        lowerIsBetter: false,
        distribution: { p10: 60, p25: 70, p50: 80, p75: 90, p90: 95 },
        recommendation: 'Optimize URL structure for clarity, brevity, and keyword inclusion.'
      },
      internalLinking: {
        value: 75,
        importance: 'medium',
        weight: 0.8,
        lowerIsBetter: false,
        distribution: { p10: 50, p25: 60, p50: 70, p75: 80, p90: 90 },
        recommendation: 'Enhance internal linking with strategic connections between related content.'
      },
      
      // Schema & structured data
      schemaMarkup: {
        value: 70,
        importance: 'medium',
        weight: 0.7,
        lowerIsBetter: false,
        distribution: { p10: 40, p25: 50, p50: 65, p75: 80, p90: 90 },
        recommendation: 'Implement relevant schema markup to enhance search visibility and rich results.'
      },
      structuredDataCount: {
        value: 3,
        importance: 'low',
        weight: 0.6,
        lowerIsBetter: false,
        distribution: { p10: 0, p25: 1, p50: 2, p75: 4, p90: 6 },
        recommendation: 'Add more structured data types relevant to your content.'
      },
      
      // Performance metrics
      ttfb: {
        value: 300,
        importance: 'medium',
        weight: 0.8,
        lowerIsBetter: true,
        distribution: { p10: 600, p25: 450, p50: 350, p75: 250, p90: 150 },
        recommendation: 'Improve Time to First Byte by optimizing server configuration, using CDN, and implementing caching.'
      },
      lcp: {
        value: 2500,
        importance: 'high',
        weight: 0.9,
        lowerIsBetter: true,
        distribution: { p10: 4000, p25: 3500, p50: 3000, p75: 2200, p90: 1800 },
        recommendation: 'Optimize Largest Contentful Paint by improving image loading and reducing render-blocking resources.'
      },
      cls: {
        value: 0.1,
        importance: 'medium',
        weight: 0.8,
        lowerIsBetter: true,
        distribution: { p10: 0.25, p25: 0.2, p50: 0.15, p75: 0.1, p90: 0.05 },
        recommendation: 'Reduce Cumulative Layout Shift by specifying image dimensions and avoiding dynamically injected content.'
      },
      fid: {
        value: 100,
        importance: 'medium',
        weight: 0.8,
        lowerIsBetter: true,
        distribution: { p10: 200, p25: 150, p50: 120, p75: 90, p90: 70 },
        recommendation: 'Improve First Input Delay by minimizing main thread work and breaking up long tasks.'
      }
    }
  };
}

/**
 * Get E-commerce industry benchmarks
 * @param {string} vertical - E-commerce vertical
 * @returns {Object} - E-commerce benchmarks
 */
function getEcommerceBenchmarks(vertical) {
  // Start with general benchmarks
  const benchmarks = getGeneralBenchmarks();
  
  // Update with e-commerce specific values
  benchmarks.industry = 'ecommerce';
  benchmarks.vertical = vertical || 'general';
  
  // Adjust overall weights
  benchmarks.overallScoreWeights = {
    technical: 0.3,    // Higher weight for technical
    content: 0.2,      // Less emphasis on content
    onPage: 0.25,      // Standard weight for on-page
    performance: 0.25  // Standard weight for performance
  };
  
  // Update specific metrics
  Object.assign(benchmarks.metrics, {
    // Higher expectations for page speed
    pageSpeed: {
      ...benchmarks.metrics.pageSpeed,
      value: 85,
      importance: 'critical',
      weight: 1.2,
      distribution: { p10: 55, p25: 70, p50: 80, p75: 90, p90: 95 }
    },
    // Mobile is critical for e-commerce
    mobileResponsiveness: {
      ...benchmarks.metrics.mobileResponsiveness,
      value: 90,
      importance: 'critical',
      weight: 1.2
    },
    // Schema markup is more important for products
    schemaMarkup: {
      ...benchmarks.metrics.schemaMarkup,
      value: 85,
      importance: 'high',
      weight: 1.0,
      recommendation: 'Implement product, price, availability, and review schema markup for better search results.'
    },
    // More structured data expected
    structuredDataCount: {
      ...benchmarks.metrics.structuredDataCount,
      value: 5,
      importance: 'medium',
      weight: 0.8
    },
    // Performance matters more for conversion
    lcp: {
      ...benchmarks.metrics.lcp,
      value: 2200,
      importance: 'critical',
      weight: 1.1
    },
    cls: {
      ...benchmarks.metrics.cls,
      value: 0.08,
      importance: 'high'
    }
  });
  
  return benchmarks;
}

/**
 * Get Healthcare industry benchmarks
 * @param {string} vertical - Healthcare vertical
 * @returns {Object} - Healthcare benchmarks
 */
function getHealthcareBenchmarks(vertical) {
  // Start with general benchmarks
  const benchmarks = getGeneralBenchmarks();
  
  // Update with healthcare specific values
  benchmarks.industry = 'healthcare';
  benchmarks.vertical = vertical || 'general';
  
  // Adjust overall weights
  benchmarks.overallScoreWeights = {
    technical: 0.2,    // Standard weight for technical
    content: 0.35,     // Higher weight for content quality
    onPage: 0.25,      // Standard weight for on-page
    performance: 0.2   // Less emphasis on performance
  };
  
  // Update specific metrics
  Object.assign(benchmarks.metrics, {
    // Content quality is critical for healthcare
    contentQuality: {
      ...benchmarks.metrics.contentQuality,
      value: 90,
      importance: 'critical',
      weight: 1.3,
      recommendation: 'Enhance content quality with accurate, authoritative medical information citing reputable sources.'
    },
    // Readability is very important
    readabilityScore: {
      ...benchmarks.metrics.readabilityScore,
      value: 70,
      importance: 'high',
      weight: 1.1,
      recommendation: 'Improve readability with clear explanations of medical terms and concepts for general audiences.'
    },
    // Trust signals matter
    ssl: {
      ...benchmarks.metrics.ssl,
      weight: 1.2,
      recommendation: 'Ensure secure connection for all medical and patient information.'
    },
    // Clear metadata
    metaTags: {
      ...benchmarks.metrics.metaTags,
      weight: 1.1,
      recommendation: 'Optimize meta titles and descriptions with clear medical terminology and user-friendly explanations.'
    }
  });
  
  return benchmarks;
}

/**
 * Get Finance industry benchmarks
 * @param {string} vertical - Finance vertical
 * @returns {Object} - Finance benchmarks
 */
function getFinanceBenchmarks(vertical) {
  // Start with general benchmarks
  const benchmarks = getGeneralBenchmarks();
  
  // Update with finance specific values
  benchmarks.industry = 'finance';
  benchmarks.vertical = vertical || 'general';
  
  // Adjust overall weights
  benchmarks.overallScoreWeights = {
    technical: 0.3,    // Higher weight for technical (trust)
    content: 0.3,      // Higher weight for content (accuracy)
    onPage: 0.25,      // Standard weight for on-page
    performance: 0.15  // Less emphasis on performance
  };
  
  // Update specific metrics
  Object.assign(benchmarks.metrics, {
    // Security is paramount
    ssl: {
      ...benchmarks.metrics.ssl,
      weight: 1.3,
      recommendation: 'Implement highest-grade SSL security for financial information.'
    },
    // Content accuracy and quality
    contentQuality: {
      ...benchmarks.metrics.contentQuality,
      value: 90,
      importance: 'critical',
      weight: 1.2,
      recommendation: 'Ensure financial content is accurate, compliance-checked, and properly disclaimered.'
    },
    // Page speed still matters
    pageSpeed: {
      ...benchmarks.metrics.pageSpeed,
      weight: 1.1
    },
    // Readability is important for complex topics
    readabilityScore: {
      ...benchmarks.metrics.readabilityScore,
      value: 65,
      importance: 'high',
      weight: 1.1,
      recommendation: 'Make complex financial concepts accessible with clear explanations and definitions.'
    }
  });
  
  return benchmarks;
}

/**
 * Get Travel industry benchmarks
 * @param {string} vertical - Travel vertical
 * @returns {Object} - Travel benchmarks
 */
function getTravelBenchmarks(vertical) {
  // Start with general benchmarks
  const benchmarks = getGeneralBenchmarks();
  
  // Update with travel specific values
  benchmarks.industry = 'travel';
  benchmarks.vertical = vertical || 'general';
  
  // Adjust overall weights
  benchmarks.overallScoreWeights = {
    technical: 0.25,   // Standard weight for technical
    content: 0.25,     // Standard weight for content
    onPage: 0.2,       // Slightly lower for on-page
    performance: 0.3   // Higher for performance (mobile users)
  };
  
  // Update specific metrics
  Object.assign(benchmarks.metrics, {
    // Mobile is critical for travel
    mobileResponsiveness: {
      ...benchmarks.metrics.mobileResponsiveness,
      value: 95,
      importance: 'critical',
      weight: 1.3,
      recommendation: 'Optimize for mobile travelers with responsive design and touch-friendly interfaces.'
    },
    // Page speed for on-the-go users
    pageSpeed: {
      ...benchmarks.metrics.pageSpeed,
      value: 85,
      importance: 'critical',
      weight: 1.2
    },
    // Schema for locations, events, etc.
    schemaMarkup: {
      ...benchmarks.metrics.schemaMarkup,
      value: 85,
      importance: 'high',
      weight: 1.0,
      recommendation: 'Implement location, event, and offer schema markup for travel content.'
    },
    // Meta information for destinations
    metaTags: {
      ...benchmarks.metrics.metaTags,
      value: 90,
      importance: 'high',
      weight: 1.1,
      recommendation: 'Include location names and features in meta titles and descriptions.'
    }
  });
  
  return benchmarks;
}

/**
 * Get Technology industry benchmarks
 * @param {string} vertical - Technology vertical
 * @returns {Object} - Technology benchmarks
 */
function getTechnologyBenchmarks(vertical) {
  // Start with general benchmarks
  const benchmarks = getGeneralBenchmarks();
  
  // Update with technology specific values
  benchmarks.industry = 'technology';
  benchmarks.vertical = vertical || 'general';
  
  // Adjust overall weights
  benchmarks.overallScoreWeights = {
    technical: 0.35,   // Higher weight for technical (tech audience)
    content: 0.25,     // Standard weight for content
    onPage: 0.2,       // Slightly lower for on-page
    performance: 0.2   // Standard weight for performance
  };
  
  // Update specific metrics
  Object.assign(benchmarks.metrics, {
    // JavaScript errors matter more for tech sites
    javascriptErrors: {
      ...benchmarks.metrics.javascriptErrors,
      value: 95,
      importance: 'high',
      weight: 1.2,
      recommendation: 'Eliminate JavaScript errors for a seamless technical user experience.'
    },
    // Page speed expectations are higher
    pageSpeed: {
      ...benchmarks.metrics.pageSpeed,
      value: 90,
      importance: 'high',
      weight: 1.1
    },
    // Crawlability for complex sites
    crawlability: {
      ...benchmarks.metrics.crawlability,
      value: 95,
      importance: 'high',
      weight: 1.1,
      recommendation: 'Ensure complex technical content is fully crawlable and indexed.'
    },
    // Internal linking for documentation
    internalLinking: {
      ...benchmarks.metrics.internalLinking,
      value: 85,
      importance: 'high',
      weight: 1.1,
      recommendation: 'Create comprehensive internal linking for technical documentation and resources.'
    }
  });
  
  return benchmarks;
}

module.exports = {
  getIndustryBenchmarks
};
