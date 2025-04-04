/**
 * keywordUtils.js
 * 
 * Utility functions for keyword analysis, extraction, and optimization.
 * These functions provide keyword-specific functionality used by analyzers
 * and enhancers.
 */

/**
 * Extracts potential keywords from content
 * 
 * @param {string} content - Content to analyze
 * @param {Object} options - Extraction options
 * @param {number} options.limit - Maximum keywords to extract
 * @returns {Array} Extracted keywords
 */
function extractKeywords(content, options = {}) {
  const { limit = 5 } = options;
  
  // In a production implementation, this would use NLP techniques
  // like TF-IDF, TextRank, or other algorithms for extraction.
  // For demonstration, we'll use a simplified approach.
  
  // Remove common words and stopwords
  const stopwords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'to', 'from', 'in',
    'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will',
    'just', 'should', 'now'
  ];
  
  // Split content into words and clean
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Remove punctuation
    .split(/\s+/)              // Split on whitespace
    .filter(word =>            // Filter words
      word.length > 3 &&       // Ignore short words
      !stopwords.includes(word) // Ignore stopwords
    );
  
  // Count word frequency
  const wordFrequency = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Convert to array and sort by frequency
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Extract phrases (bigrams and trigrams)
  const phrases = extractPhrases(content, stopwords);
  
  // Combine individual keywords and phrases, prioritizing phrases
  const combinedKeywords = [...phrases, ...sortedWords];
  
  // Remove duplicates and limit results
  const uniqueKeywords = [...new Set(combinedKeywords)];
  return uniqueKeywords.slice(0, limit);
}

/**
 * Extracts phrases (bigrams and trigrams) from content
 * 
 * @private
 * @param {string} content - Content to analyze
 * @param {Array} stopwords - List of stopwords to filter out
 * @returns {Array} Extracted phrases
 */
function extractPhrases(content, stopwords) {
  // Clean and tokenize content
  const tokens = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
  
  // Extract bigrams and trigrams
  const bigrams = [];
  const trigrams = [];
  
  for (let i = 0; i < tokens.length - 1; i++) {
    // Skip if either word is a stopword
    if (stopwords.includes(tokens[i]) && stopwords.includes(tokens[i+1])) {
      continue;
    }
    
    bigrams.push(`${tokens[i]} ${tokens[i+1]}`);
    
    if (i < tokens.length - 2) {
      // Skip if all three words are stopwords
      if (stopwords.includes(tokens[i]) && 
          stopwords.includes(tokens[i+1]) && 
          stopwords.includes(tokens[i+2])) {
        continue;
      }
      
      trigrams.push(`${tokens[i]} ${tokens[i+1]} ${tokens[i+2]}`);
    }
  }
  
  // Count phrase frequency
  const phraseCount = {};
  
  [...bigrams, ...trigrams].forEach(phrase => {
    phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
  });
  
  // Sort phrases by frequency
  return Object.entries(phraseCount)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
}

/**
 * Calculates keyword density for specific terms
 * 
 * @param {string} content - Content to analyze
 * @param {Array} keywords - Keywords to check
 * @returns {Object} Keyword densities
 */
function calculateKeywordDensity(content, keywords) {
  const contentLower = content.toLowerCase();
  const wordCount = content.split(/\s+/).length;
  const densities = {};
  
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const keywordRegex = new RegExp(`\\b${keywordLower}\\b`, 'gi');
    const matches = contentLower.match(keywordRegex) || [];
    const keywordWordCount = keyword.split(/\s+/).length;
    
    // Calculate density as percentage of content
    densities[keyword] = (matches.length * keywordWordCount * 100) / wordCount;
  });
  
  return densities;
}

/**
 * Gets recommended keyword density range
 * 
 * @param {string} keyword - Keyword to check
 * @returns {Object} Min and max recommended density
 */
function getRecommendedDensity(keyword) {
  // Recommended density varies by keyword length
  const wordCount = keyword.split(/\s+/).length;
  
  if (wordCount === 1) {
    return { min: 0.5, max: 2.5 };  // Single words
  } else if (wordCount === 2) {
    return { min: 0.3, max: 2.0 };  // Two-word phrases
  } else {
    return { min: 0.2, max: 1.5 };  // Longer phrases
  }
}

/**
 * Analyzes keyword placement effectiveness
 * 
 * @param {string} keyword - Keyword to analyze
 * @param {Object} content - Content elements to check
 * @returns {Object} Placement analysis
 */
function analyzeKeywordPlacement(keyword, content) {
  const keywordLower = keyword.toLowerCase();
  const keywordRegex = new RegExp(`\\b${keywordLower}\\b`, 'i');
  
  return {
    title: keywordRegex.test(content.title || ''),
    metaDescription: keywordRegex.test(content.metaDescription || ''),
    headings: (content.headings || []).some(h => keywordRegex.test(h.text)),
    firstParagraph: keywordRegex.test(content.firstParagraph || ''),
    url: keywordRegex.test(content.url || '')
  };
}

/**
 * Generates semantically related keywords
 * 
 * @param {string} keyword - Base keyword
 * @param {Object} options - Generation options
 * @returns {Array} Related keywords
 */
function generateRelatedKeywords(keyword, options = {}) {
  // In a production implementation, this would use:
  // - API calls to services like SEMrush, Ahrefs, etc.
  // - NLP techniques for semantic analysis
  // - Corpus analysis for co-occurrence patterns
  
  // For demonstration, we'll return mock data based on keyword themes
  const mockRelatedTerms = {
    'seo': ['search engine optimization', 'google ranking', 'serp', 'organic traffic', 'meta tags'],
    'content': ['articles', 'blog posts', 'copywriting', 'content strategy', 'content marketing'],
    'marketing': ['digital marketing', 'promotion', 'audience targeting', 'campaign', 'branding'],
    'social': ['social media', 'facebook', 'twitter', 'instagram', 'engagement'],
    'business': ['company', 'startup', 'entrepreneur', 'small business', 'enterprise'],
    'website': ['web design', 'web development', 'site speed', 'hosting', 'cms'],
    'ecommerce': ['online store', 'product pages', 'shopping cart', 'checkout', 'conversion rate']
  };
  
  // Look for keyword matches in our mock data
  const relatedTerms = [];
  const keywordLower = keyword.toLowerCase();
  
  // Check if keyword matches any of our categories
  for (const [category, terms] of Object.entries(mockRelatedTerms)) {
    if (keywordLower.includes(category) || category.includes(keywordLower)) {
      relatedTerms.push(...terms);
    }
  }
  
  // If no direct matches, return general SEO terms
  return relatedTerms.length > 0 ? 
    relatedTerms : 
    mockRelatedTerms.seo;
}

module.exports = {
  extractKeywords,
  calculateKeywordDensity,
  getRecommendedDensity,
  analyzeKeywordPlacement,
  generateRelatedKeywords
};
