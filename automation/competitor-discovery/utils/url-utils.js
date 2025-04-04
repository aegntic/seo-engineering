/**
 * URL Utilities
 * 
 * Helper functions for URL processing and manipulation
 */

/**
 * Extract domain from URL
 * 
 * @param {String} url - URL to extract domain from
 * @returns {String} - Domain name
 */
function extractDomain(url) {
  if (!url) return '';
  
  try {
    // Handle URLs without protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;
    
    // Remove 'www.' prefix if present
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    return hostname;
  } catch (error) {
    // If URL parsing fails, try a simpler approach
    let domain = url.toLowerCase();
    
    // Remove protocol
    if (domain.startsWith('http://')) {
      domain = domain.substring(7);
    } else if (domain.startsWith('https://')) {
      domain = domain.substring(8);
    }
    
    // Remove path and query
    const pathIndex = domain.indexOf('/');
    if (pathIndex !== -1) {
      domain = domain.substring(0, pathIndex);
    }
    
    // Remove 'www.' prefix
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    return domain;
  }
}

/**
 * Normalize URL for consistent comparison
 * 
 * @param {String} url - URL to normalize
 * @returns {String} - Normalized URL
 */
function normalizeUrl(url) {
  if (!url) return '';
  
  try {
    // Handle URLs without protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    
    // Lowercase hostname
    let normalized = urlObj.protocol + '//' + urlObj.hostname.toLowerCase();
    
    // Add port if not default
    if (urlObj.port && 
        !((urlObj.protocol === 'http:' && urlObj.port === '80') || 
          (urlObj.protocol === 'https:' && urlObj.port === '443'))) {
      normalized += ':' + urlObj.port;
    }
    
    // Add path but remove trailing slash
    let path = urlObj.pathname;
    if (path.endsWith('/') && path.length > 1) {
      path = path.slice(0, -1);
    }
    normalized += path;
    
    // Add query parameters sorted alphabetically
    if (urlObj.search) {
      const params = new URLSearchParams(urlObj.search);
      const sortedParams = new URLSearchParams();
      
      // Sort parameters
      Array.from(params.keys())
        .sort()
        .forEach(key => {
          sortedParams.append(key, params.get(key));
        });
      
      const searchString = sortedParams.toString();
      if (searchString) {
        normalized += '?' + searchString;
      }
    }
    
    return normalized;
  } catch (error) {
    // If normalization fails, return the original URL
    return url;
  }
}

/**
 * Compare two URLs for equivalence
 * 
 * @param {String} url1 - First URL
 * @param {String} url2 - Second URL
 * @returns {Boolean} - True if URLs are equivalent
 */
function areEquivalentUrls(url1, url2) {
  if (!url1 || !url2) return false;
  
  const normalized1 = normalizeUrl(url1);
  const normalized2 = normalizeUrl(url2);
  
  return normalized1 === normalized2;
}

/**
 * Get URL path components
 * 
 * @param {String} url - URL to parse
 * @returns {Array<String>} - Path components
 */
function getPathComponents(url) {
  if (!url) return [];
  
  try {
    // Handle URLs without protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    
    // Remove leading and trailing slashes
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    if (path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    // Split by slash
    return path ? path.split('/') : [];
  } catch (error) {
    return [];
  }
}

/**
 * Check if URL is a direct subdomain of a domain
 * 
 * @param {String} url - URL to check
 * @param {String} domain - Parent domain
 * @returns {Boolean} - True if URL is a subdomain
 */
function isSubdomain(url, domain) {
  if (!url || !domain) return false;
  
  try {
    const urlDomain = extractDomain(url);
    
    // Check if urlDomain ends with domain
    if (!urlDomain.endsWith(domain)) {
      return false;
    }
    
    // If they're the same length, they're the same domain
    if (urlDomain.length === domain.length) {
      return false;
    }
    
    // Check if there's a dot before the main domain
    return urlDomain[urlDomain.length - domain.length - 1] === '.';
  } catch (error) {
    return false;
  }
}

/**
 * Get URL query parameters as an object
 * 
 * @param {String} url - URL to parse
 * @returns {Object} - Query parameters as key-value pairs
 */
function getQueryParams(url) {
  if (!url) return {};
  
  try {
    // Handle URLs without protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    const params = {};
    
    for (const [key, value] of urlObj.searchParams.entries()) {
      params[key] = value;
    }
    
    return params;
  } catch (error) {
    return {};
  }
}

module.exports = {
  extractDomain,
  normalizeUrl,
  areEquivalentUrls,
  getPathComponents,
  isSubdomain,
  getQueryParams
};
