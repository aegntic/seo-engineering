/**
 * Stopwords handling for content fingerprinting
 * 
 * Provides functionality to remove common stopwords from token lists,
 * improving the quality of content fingerprints by focusing on meaningful terms.
 * 
 * @module duplicate-content/fingerprinter/stopwords
 */

// English stopwords
const ENGLISH_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 
  'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could', 'couldn\'t', 
  'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 
  'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 
  'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 
  'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 
  'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 
  'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 
  'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 
  'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 
  'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 
  'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 
  'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 
  'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 
  'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

// HTML-specific stopwords (common in web pages but not meaningful for content comparison)
const HTML_STOPWORDS = new Set([
  'copyright', 'rights', 'reserved', 'privacy', 'policy', 'terms', 'conditions',
  'menu', 'navigation', 'search', 'home', 'contact', 'about', 'us', 'login',
  'register', 'sign', 'subscribe', 'newsletter', 'follow', 'facebook', 'twitter',
  'instagram', 'linkedin', 'youtube', 'pinterest', 'share', 'comment', 'read',
  'more', 'click', 'here', 'next', 'previous', 'back', 'top', 'submit', 'send'
]);

// Combined stopwords set
const ALL_STOPWORDS = new Set([...ENGLISH_STOPWORDS, ...HTML_STOPWORDS]);

/**
 * Remove stopwords from a list of tokens
 * @param {Array<string>} tokens - List of tokens
 * @param {Object} options - Options
 * @param {boolean} options.includeHTMLStopwords - Whether to include HTML-specific stopwords
 * @returns {Array<string>} Filtered tokens without stopwords
 */
function removeStopwords(tokens, options = { includeHTMLStopwords: true }) {
  if (!Array.isArray(tokens)) {
    return [];
  }
  
  const stopwordsSet = options.includeHTMLStopwords 
    ? ALL_STOPWORDS 
    : ENGLISH_STOPWORDS;
  
  return tokens.filter(token => !stopwordsSet.has(token.toLowerCase()));
}

/**
 * Remove stopwords directly from text
 * @param {string} text - Input text
 * @param {Object} options - Options
 * @returns {string} Text with stopwords removed
 */
function removeStopwordsFromText(text, options = { includeHTMLStopwords: true }) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const words = text.split(/\s+/);
  const filteredWords = removeStopwords(words, options);
  
  return filteredWords.join(' ');
}

module.exports = {
  removeStopwords,
  removeStopwordsFromText,
  ENGLISH_STOPWORDS,
  HTML_STOPWORDS,
  ALL_STOPWORDS
};
