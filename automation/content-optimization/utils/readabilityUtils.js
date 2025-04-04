/**
 * readabilityUtils.js
 * 
 * Utility functions for assessing and improving content readability.
 * These functions implement standard readability metrics and identify
 * common readability issues in content.
 */

/**
 * Calculates Flesch Reading Ease score
 * A higher score indicates easier readability (0-100 scale)
 * 
 * @param {string} text - Text to analyze
 * @returns {number} Flesch Reading Ease score
 */
function calculateFleschReadingEase(text) {
  // Clean text for analysis
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Count sentences
  const sentences = cleanText.match(/[.!?]+\s/g) || [cleanText];
  const sentenceCount = sentences.length;
  
  // Count words
  const words = cleanText.split(/\s+/);
  const wordCount = words.length;
  
  // Count syllables
  let syllableCount = 0;
  words.forEach(word => {
    syllableCount += countSyllables(word);
  });
  
  // Apply Flesch Reading Ease formula
  // 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
  if (sentenceCount === 0 || wordCount === 0) {
    return 0; // Avoid division by zero
  }
  
  const asl = wordCount / sentenceCount; // Average sentence length
  const asw = syllableCount / wordCount; // Average syllables per word
  
  const score = 206.835 - (1.015 * asl) - (84.6 * asw);
  
  // Clamp score to 0-100 range
  return Math.min(100, Math.max(0, score));
}

/**
 * Counts syllables in a word using a heuristic approach
 * 
 * @private
 * @param {string} word - Word to count syllables for
 * @returns {number} Estimated syllable count
 */
function countSyllables(word) {
  word = word.toLowerCase().trim();
  
  // Remove punctuation
  word = word.replace(/[^\w\s]|_/g, '');
  
  if (word.length <= 3) {
    return 1; // Short words have at least one syllable
  }
  
  // Remove trailing 'e'
  word = word.replace(/e$/, '');
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  
  if (!vowelGroups) {
    return 1; // No vowels, but still one syllable
  }
  
  // Count vowel groups
  return vowelGroups.length;
}

/**
 * Identifies sentences that exceed length threshold
 * 
 * @param {string} text - Text to analyze
 * @param {number} threshold - Maximum words per sentence
 * @returns {Array} Array of long sentences
 */
function identifyLongSentences(text, threshold = 25) {
  // Split text into sentences
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  const sentences = text.match(sentenceRegex) || [];
  
  // Check each sentence length
  const longSentences = sentences.filter(sentence => {
    const wordCount = sentence.split(/\s+/).length;
    return wordCount > threshold;
  });
  
  return longSentences;
}

/**
 * Identifies paragraphs that exceed length threshold
 * 
 * @param {string} text - Text to analyze
 * @param {number} threshold - Maximum sentences per paragraph
 * @returns {Array} Array of long paragraphs
 */
function identifyLongParagraphs(text, threshold = 5) {
  // Split text into paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  
  // Check each paragraph length
  const longParagraphs = paragraphs.filter(paragraph => {
    // Count sentences in paragraph
    const sentenceCount = (paragraph.match(/[.!?]+\s/g) || []).length;
    return sentenceCount > threshold;
  });
  
  return longParagraphs;
}

/**
 * Identifies passive voice usage in text
 * 
 * @param {string} text - Text to analyze
 * @returns {Array} Array of passive voice sentences
 */
function identifyPassiveVoice(text) {
  // Split text into sentences
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  const sentences = text.match(sentenceRegex) || [];
  
  // Common passive voice patterns
  const passivePatterns = [
    /\b(?:am|is|are|was|were|be|being|been)\s+(\w+ed)\b/i,
    /\b(?:am|is|are|was|were|be|being|been)\s+(\w+en)\b/i,
    /\b(?:am|is|are|was|were|be|being|been)\s+(\w+t)\b/i,
    /\b(?:has|have|had)\s+been\s+(\w+ed)\b/i,
    /\b(?:has|have|had)\s+been\s+(\w+en)\b/i,
    /\b(?:has|have|had)\s+been\s+(\w+t)\b/i
  ];
  
  // Check each sentence for passive voice
  const passiveSentences = sentences.filter(sentence => {
    return passivePatterns.some(pattern => pattern.test(sentence));
  });
  
  return passiveSentences;
}

/**
 * Identifies complex words in text
 * 
 * @param {string} text - Text to analyze
 * @returns {Array} Array of complex words
 */
function identifyComplexWords(text) {
  // Split text into words
  const words = text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  // Define complex words (simplified approach)
  const complexWords = [];
  
  words.forEach(word => {
    // Words with 3+ syllables are considered complex
    // Exclude common suffixes that don't add reading difficulty
    if (countSyllables(word) >= 3 && 
        !word.match(/(fully|ing|ed|es|ly)$/) && 
        word.length > 6) {
      complexWords.push(word);
    }
  });
  
  // Remove duplicates
  return [...new Set(complexWords)];
}

/**
 * Maps reading ease score to education level
 * 
 * @param {number} score - Flesch Reading Ease score
 * @returns {Object} Reading level information
 */
function mapScoreToReadingLevel(score) {
  if (score >= 90) {
    return {
      level: '5th grade',
      description: 'Very easy to read. Easily understood by an average 11-year-old student.'
    };
  } else if (score >= 80) {
    return {
      level: '6th grade',
      description: 'Easy to read. Conversational English for consumers.'
    };
  } else if (score >= 70) {
    return {
      level: '7th grade',
      description: 'Fairly easy to read.'
    };
  } else if (score >= 60) {
    return {
      level: '8th & 9th grade',
      description: 'Plain English. Easily understood by 13- to 15-year-old students.'
    };
  } else if (score >= 50) {
    return {
      level: '10th to 12th grade',
      description: 'Fairly difficult to read.'
    };
  } else if (score >= 30) {
    return {
      level: 'College',
      description: 'Difficult to read.'
    };
  } else {
    return {
      level: 'College graduate',
      description: 'Very difficult to read. Best understood by university graduates.'
    };
  }
}

/**
 * Gets recommended reading level based on content type
 * 
 * @param {string} contentType - Type of content
 * @returns {Object} Recommended reading level range
 */
function getRecommendedReadingLevel(contentType) {
  const recommendations = {
    'blog': { min: 60, max: 70 },       // 8th-9th grade
    'article': { min: 50, max: 70 },    // 9th-12th grade
    'technical': { min: 30, max: 50 },  // College
    'academic': { min: 30, max: 40 },   // College graduate
    'marketing': { min: 70, max: 80 },  // 6th-7th grade
    'product': { min: 70, max: 80 },    // 6th-7th grade
    'general': { min: 60, max: 70 }     // 8th-9th grade
  };
  
  return recommendations[contentType] || recommendations.general;
}

/**
 * Provides simplification suggestions for complex sentences
 * 
 * @param {string} sentence - Sentence to simplify
 * @returns {Object} Simplification suggestions
 */
function getSentenceSimplificationSuggestions(sentence) {
  // In a production implementation, this would use NLP techniques
  // to analyze sentence structure and suggest specific rewrites.
  
  // For demonstration, we'll return basic suggestions
  const wordCount = sentence.split(/\s+/).length;
  
  if (wordCount > 30) {
    return {
      issue: 'Very long sentence',
      suggestion: 'Break into 2-3 shorter sentences focusing on one idea each'
    };
  } else if (wordCount > 20) {
    return {
      issue: 'Long sentence',
      suggestion: 'Consider shortening or splitting this sentence'
    };
  }
  
  if (identifyPassiveVoice([sentence]).length > 0) {
    return {
      issue: 'Passive voice',
      suggestion: 'Rewrite using active voice for clarity and directness'
    };
  }
  
  return null;
}

module.exports = {
  calculateFleschReadingEase,
  identifyLongSentences,
  identifyLongParagraphs,
  identifyPassiveVoice,
  identifyComplexWords,
  mapScoreToReadingLevel,
  getRecommendedReadingLevel,
  getSentenceSimplificationSuggestions
};
