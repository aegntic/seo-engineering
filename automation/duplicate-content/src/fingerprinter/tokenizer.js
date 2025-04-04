/**
 * Text tokenization module for content fingerprinting
 * 
 * Transforms text content into tokens for SimHash processing.
 * Implements intelligent tokenization with n-gram support.
 * 
 * @module duplicate-content/fingerprinter/tokenizer
 */

/**
 * Tokenize text into words and n-grams
 * @param {string} text - Input text to tokenize
 * @param {Object} options - Tokenization options
 * @param {boolean} options.lowercase - Convert to lowercase (default: true)
 * @param {boolean} options.includeNgrams - Include n-grams (default: true)
 * @param {number} options.maxNgramSize - Maximum n-gram size (default: 3)
 * @returns {Array<string>} Array of tokens
 */
function tokenize(text, options = {}) {
  const defaults = {
    lowercase: true,
    includeNgrams: true,
    maxNgramSize: 3
  };
  
  const config = { ...defaults, ...options };
  
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Normalize text: lowercase and remove special characters
  let normalizedText = text;
  if (config.lowercase) {
    normalizedText = normalizedText.toLowerCase();
  }
  
  // Remove special characters and excessive spaces
  normalizedText = normalizedText
    .replace(/[^\w\s]/g, ' ')  // Replace special chars with spaces
    .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
    .trim();
  
  // Split into words
  const words = normalizedText.split(' ').filter(word => word.length > 0);
  
  if (!config.includeNgrams) {
    return words;
  }
  
  // Generate n-grams
  const ngrams = [];
  const maxN = Math.min(config.maxNgramSize, words.length);
  
  for (let n = 2; n <= maxN; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      ngrams.push(ngram);
    }
  }
  
  // Combine words and n-grams
  return [...words, ...ngrams];
}

/**
 * Tokenize text using sliding window of shingles
 * @param {string} text - Input text to tokenize
 * @param {number} shingleSize - Size of each shingle (default: 4)
 * @returns {Array<string>} Array of shingle tokens
 */
function shingleTokenize(text, shingleSize = 4) {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Normalize text
  const normalizedText = text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  
  // Create character-level shingles
  const shingles = [];
  for (let i = 0; i <= normalizedText.length - shingleSize; i++) {
    const shingle = normalizedText.substring(i, i + shingleSize);
    shingles.push(shingle);
  }
  
  return shingles;
}

/**
 * Tokenize text for cross-language comparison
 * @param {string} text - Input text to tokenize
 * @returns {Array<string>} Array of tokens optimized for cross-language comparison
 */
function crossLanguageTokenize(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Focus on numbers, proper nouns, and non-language-specific patterns
  const normalizedText = text
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract patterns that are likely to be consistent across languages
  const patterns = [];
  
  // Numbers (likely consistent across translations)
  const numbers = normalizedText.match(/\d+(?:\.\d+)?/g) || [];
  patterns.push(...numbers);
  
  // Extract likely proper nouns (words starting with capital letters)
  const properNouns = normalizedText.match(/\b[A-Z][a-z]+\b/g) || [];
  patterns.push(...properNouns);
  
  // URLs, emails, etc.
  const urls = normalizedText.match(/https?:\/\/[^\s]+/g) || [];
  patterns.push(...urls);
  
  const emails = normalizedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  patterns.push(...emails);
  
  // Also include standard word tokenization
  const words = normalizedText.toLowerCase().split(/\W+/).filter(w => w.length > 0);
  
  return [...patterns, ...words];
}

// Export the primary tokenize function by default
// but also expose the specialized tokenization methods
module.exports = tokenize;
module.exports.shingleTokenize = shingleTokenize;
module.exports.crossLanguageTokenize = crossLanguageTokenize;
