/**
 * URL Utilities for Canonical URL Suggestion
 * 
 * Helper functions for parsing and analyzing URLs to determine
 * the most appropriate canonical URLs.
 * 
 * @module duplicate-content/canonical/url-utils
 */

const url = require('url');

/**
 * Parse a URL path into segments for analysis
 * @param {string} urlPath - URL path to parse
 * @returns {Object} Parsed path information
 */
function parseUrlPath(urlPath) {
  if (!urlPath) {
    return {
      segments: [],
      depth: 0,
      hasExtension: false,
      extension: null,
      hasTrailingSlash: false,
      keywords: []
    };
  }
  
  // Normalize the path
  const normalizedPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  
  // Split into segments
  const segments = normalizedPath.split('/')
    .filter(segment => segment.length > 0);
  
  // Check for file extension
  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
  const extensionMatch = lastSegment.match(/\.([a-zA-Z0-9]{2,5})$/);
  const hasExtension = !!extensionMatch;
  const extension = hasExtension ? extensionMatch[1].toLowerCase() : null;
  
  // Check for trailing slash
  const hasTrailingSlash = normalizedPath.endsWith('/') && normalizedPath.length > 1;
  
  // Extract potential keywords
  const seoKeywords = [
    'product', 'category', 'article', 'blog', 'news',
    'page', 'about', 'contact', 'service', 'portfolio'
  ];
  
  const keywords = segments.filter(segment => 
    seoKeywords.some(keyword => segment.toLowerCase().includes(keyword))
  );
  
  return {
    segments,
    depth: segments.length,
    hasExtension,
    extension,
    hasTrailingSlash,
    keywords
  };
}

/**
 * Remove query parameters from URL
 * @param {string} urlString - URL to clean
 * @returns {string} URL without query parameters
 */
function removeQueryParameters(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    parsedUrl.search = '';
    return parsedUrl.toString();
  } catch (error) {
    console.error(`Error removing query parameters from URL ${urlString}:`, error);
    return urlString;
  }
}

/**
 * Remove URL fragments
 * @param {string} urlString - URL to clean
 * @returns {string} URL without fragments
 */
function removeFragment(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    parsedUrl.hash = '';
    return parsedUrl.toString();
  } catch (error) {
    console.error(`Error removing fragment from URL ${urlString}:`, error);
    return urlString;
  }
}

/**
 * Normalize URL to canonical form
 * @param {string} urlString - URL to normalize
 * @returns {string} Normalized URL
 */
function normalizeUrl(urlString) {
  try {
    // Parse the URL
    const parsedUrl = new URL(urlString);
    
    // Convert hostname to lowercase
    parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
    
    // Remove default ports
    if ((parsedUrl.protocol === 'http:' && parsedUrl.port === '80') ||
        (parsedUrl.protocol === 'https:' && parsedUrl.port === '443')) {
      parsedUrl.port = '';
    }
    
    // Remove trailing slash from path if it exists
    if (parsedUrl.pathname.length > 1 && parsedUrl.pathname.endsWith('/')) {
      parsedUrl.pathname = parsedUrl.pathname.slice(0, -1);
    }
    
    // Sort query parameters alphabetically
    if (parsedUrl.search) {
      const searchParams = new URLSearchParams(parsedUrl.search);
      const sortedParams = new URLSearchParams();
      
      Array.from(searchParams.keys())
        .sort()
        .forEach(key => {
          sortedParams.append(key, searchParams.get(key));
        });
      
      parsedUrl.search = sortedParams.toString() ? `?${sortedParams.toString()}` : '';
    }
    
    // Remove fragment
    parsedUrl.hash = '';
    
    return parsedUrl.toString();
  } catch (error) {
    console.error(`Error normalizing URL ${urlString}:`, error);
    return urlString;
  }
}

/**
 * Analyze URL quality for canonical selection
 * @param {string} urlString - URL to analyze
 * @returns {Object} URL quality metrics
 */
function analyzeUrlQuality(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    const pathInfo = parseUrlPath(parsedUrl.pathname);
    
    // Metrics for URL quality
    const metrics = {
      // Shorter paths are generally better
      pathLength: parsedUrl.pathname.length,
      
      // Fewer path segments are generally better
      pathDepth: pathInfo.depth,
      
      // URLs without query parameters are generally better
      hasQueryParams: parsedUrl.search.length > 0,
      
      // URLs without fragments are generally better
      hasFragment: parsedUrl.hash.length > 0,
      
      // URLs without file extensions are often preferred for SEO
      hasExtension: pathInfo.hasExtension,
      
      // URLs with SEO keywords might be preferred
      hasSeoKeywords: pathInfo.keywords.length > 0,
      
      // URLs with all lowercase are generally better
      isLowercase: urlString.toLowerCase() === urlString,
      
      // Overall quality score (higher is better)
      qualityScore: 0
    };
    
    // Calculate quality score
    metrics.qualityScore = calculateQualityScore(metrics);
    
    return metrics;
  } catch (error) {
    console.error(`Error analyzing URL quality for ${urlString}:`, error);
    return {
      qualityScore: -1,
      error: error.message
    };
  }
}

/**
 * Calculate URL quality score based on metrics
 * @param {Object} metrics - URL quality metrics
 * @returns {number} Quality score (higher is better)
 * @private
 */
function calculateQualityScore(metrics) {
  let score = 100;
  
  // Penalize for path length
  score -= Math.min(metrics.pathLength / 10, 30);
  
  // Penalize for path depth
  score -= metrics.pathDepth * 5;
  
  // Penalize for query parameters
  if (metrics.hasQueryParams) {
    score -= 20;
  }
  
  // Penalize for fragments
  if (metrics.hasFragment) {
    score -= 10;
  }
  
  // Penalize for file extensions
  if (metrics.hasExtension) {
    score -= 5;
  }
  
  // Bonus for SEO keywords
  if (metrics.hasSeoKeywords) {
    score += 10;
  }
  
  // Bonus for lowercase
  if (metrics.isLowercase) {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

module.exports = {
  parseUrlPath,
  removeQueryParameters,
  removeFragment,
  normalizeUrl,
  analyzeUrlQuality
};
