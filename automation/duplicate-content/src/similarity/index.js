/**
 * Similarity Detection Engine
 * 
 * Compares content fingerprints to find similar pages efficiently.
 * Optimized for processing large websites with minimal memory usage.
 * 
 * @module duplicate-content/similarity
 */

const simhash = require('../fingerprinter/simhash');

/**
 * Class for finding similarities between content fingerprints
 */
class SimilarityEngine {
  /**
   * Create a new SimilarityEngine
   * @param {Object} config - Configuration options
   */
  constructor(config) {
    this.config = config;
    this.similarityThreshold = config.similarityThreshold;
  }

  /**
   * Find similarities between content fingerprints
   * @param {Object} fingerprints - Map of URLs to fingerprints
   * @returns {Promise<Object>} Map of similar content relationships
   */
  async findSimilarities(fingerprints) {
    if (!fingerprints || Object.keys(fingerprints).length === 0) {
      return {};
    }

    const urls = Object.keys(fingerprints);
    const similarities = {};
    const urlsWithContent = urls.filter(url => 
      fingerprints[url] && 
      fingerprints[url].hash && 
      !fingerprints[url].isEmpty
    );

    // Process in batches to avoid memory issues with large sites
    const batchSize = this.config.parallelComparisons;
    
    for (let i = 0; i < urlsWithContent.length; i++) {
      const url1 = urlsWithContent[i];
      const batch = [];
      
      // Only compare with subsequent URLs (avoid redundant comparisons)
      for (let j = i + 1; j < urlsWithContent.length; j++) {
        const url2 = urlsWithContent[j];
        batch.push({ url1, url2 });
        
        if (batch.length >= batchSize) {
          await this.processBatch(batch, fingerprints, similarities);
          batch.length = 0;
        }
      }
      
      // Process any remaining comparisons
      if (batch.length > 0) {
        await this.processBatch(batch, fingerprints, similarities);
      }
    }

    return this.formatSimilarities(similarities);
  }

  /**
   * Process a batch of URL pairs for similarity
   * @param {Array<Object>} batch - Batch of URL pairs to compare
   * @param {Object} fingerprints - Map of URLs to fingerprints
   * @param {Object} similarities - Map to store similarity results
   * @returns {Promise<void>}
   * @private
   */
  async processBatch(batch, fingerprints, similarities) {
    await Promise.all(
      batch.map(async ({ url1, url2 }) => {
        try {
          const hash1 = fingerprints[url1].hash;
          const hash2 = fingerprints[url2].hash;
          
          const similarity = simhash.similarity(hash1, hash2);
          
          if (similarity >= this.similarityThreshold) {
            // Store the similarity score
            if (!similarities[url1]) {
              similarities[url1] = {};
            }
            similarities[url1][url2] = similarity;
            
            // Store the reverse relationship for easier lookup
            if (!similarities[url2]) {
              similarities[url2] = {};
            }
            similarities[url2][url1] = similarity;
          }
        } catch (error) {
          console.error(`Error comparing ${url1} and ${url2}:`, error);
        }
      })
    );
  }

  /**
   * Format similarities into a more structured result
   * @param {Object} rawSimilarities - Raw similarity relationships
   * @returns {Object} Formatted similarities
   * @private
   */
  formatSimilarities(rawSimilarities) {
    const result = {
      similarPages: {},
      similarityScores: {},
      totalComparisons: 0,
      totalSimilarPairs: 0
    };
    
    // Convert the raw similarities to a more usable format
    for (const [url, similarUrls] of Object.entries(rawSimilarities)) {
      const similarPages = Object.keys(similarUrls);
      
      if (similarPages.length > 0) {
        result.similarPages[url] = similarPages;
        result.similarityScores[url] = {};
        
        for (const similarUrl of similarPages) {
          result.similarityScores[url][similarUrl] = rawSimilarities[url][similarUrl];
        }
        
        result.totalSimilarPairs += similarPages.length;
      }
    }
    
    // Divide by 2 because each pair is counted twice (A-B and B-A)
    result.totalSimilarPairs = Math.floor(result.totalSimilarPairs / 2);
    
    return result;
  }

  /**
   * Find the most similar page to a given URL
   * @param {string} url - URL to find similar pages for
   * @param {Object} similarities - Similarity results from findSimilarities
   * @returns {Object|null} Most similar page info or null if none found
   */
  findMostSimilarPage(url, similarities) {
    if (!similarities.similarPages[url]) {
      return null;
    }
    
    const similarUrls = similarities.similarPages[url];
    let mostSimilarUrl = null;
    let highestScore = 0;
    
    for (const similarUrl of similarUrls) {
      const score = similarities.similarityScores[url][similarUrl];
      if (score > highestScore) {
        highestScore = score;
        mostSimilarUrl = similarUrl;
      }
    }
    
    if (!mostSimilarUrl) {
      return null;
    }
    
    return {
      url: mostSimilarUrl,
      similarityScore: highestScore
    };
  }
}

module.exports = SimilarityEngine;
