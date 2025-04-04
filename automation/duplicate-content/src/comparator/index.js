/**
 * Cross-Page Content Comparator Module
 * 
 * Analyzes similarity data to identify clusters of duplicate content across pages.
 * Uses efficient graph-based clustering algorithms to group similar content.
 * 
 * @module duplicate-content/comparator
 */

const { UnionFind } = require('./union-find');

/**
 * Class for finding groups of duplicate content
 */
class ContentComparator {
  /**
   * Create a new ContentComparator
   * @param {Object} config - Configuration options
   */
  constructor(config) {
    this.config = config;
    this.similarityThreshold = config.similarityThreshold;
  }

  /**
   * Find groups of duplicate content pages
   * @param {Object} similarities - Similarity data from SimilarityEngine
   * @returns {Promise<Array<Array<string>>>} Groups of duplicate URLs
   */
  async findDuplicateGroups(similarities) {
    try {
      if (!similarities || !similarities.similarPages) {
        return [];
      }

      // Get all unique URLs
      const allUrls = new Set();
      Object.keys(similarities.similarPages).forEach(url => {
        allUrls.add(url);
        similarities.similarPages[url].forEach(similarUrl => {
          allUrls.add(similarUrl);
        });
      });

      const urlArray = Array.from(allUrls);
      
      // Use Union-Find algorithm to efficiently group similar pages
      const unionFind = new UnionFind(urlArray);
      
      // Build the groups based on similarity
      Object.entries(similarities.similarPages).forEach(([url, similarUrls]) => {
        similarUrls.forEach(similarUrl => {
          const similarity = similarities.similarityScores[url][similarUrl];
          if (similarity >= this.similarityThreshold) {
            unionFind.union(url, similarUrl);
          }
        });
      });
      
      // Extract the connected components as duplicate groups
      const groups = unionFind.getGroups();
      
      // Filter out groups with only a single page (not duplicates)
      const duplicateGroups = groups.filter(group => group.length > 1);
      
      // Sort groups by size (largest first) for better reporting
      duplicateGroups.sort((a, b) => b.length - a.length);
      
      return duplicateGroups;
    } catch (error) {
      console.error('Error finding duplicate groups:', error);
      return [];
    }
  }

  /**
   * Calculate duplicate content statistics
   * @param {Array<Array<string>>} duplicateGroups - Groups of duplicate URLs
   * @param {Object} fingerprints - Content fingerprints
   * @returns {Object} Duplicate content statistics
   */
  calculateStatistics(duplicateGroups, fingerprints) {
    if (!duplicateGroups || duplicateGroups.length === 0) {
      return {
        totalGroups: 0,
        totalDuplicatePages: 0,
        averageGroupSize: 0,
        largestGroupSize: 0,
        duplicatesByLength: {}
      };
    }
    
    // Count total duplicate pages (excluding one page from each group as "original")
    let totalDuplicatePages = 0;
    duplicateGroups.forEach(group => {
      totalDuplicatePages += group.length - 1;
    });
    
    // Find largest group
    const largestGroupSize = Math.max(...duplicateGroups.map(group => group.length));
    
    // Calculate average group size
    const averageGroupSize = duplicateGroups.reduce(
      (sum, group) => sum + group.length, 
      0
    ) / duplicateGroups.length;
    
    // Group duplicates by content length ranges
    const duplicatesByLength = {};
    const lengthRanges = [
      { min: 0, max: 1000, label: '0-1KB' },
      { min: 1000, max: 5000, label: '1KB-5KB' },
      { min: 5000, max: 10000, label: '5KB-10KB' },
      { min: 10000, max: 50000, label: '10KB-50KB' },
      { min: 50000, max: Infinity, label: '50KB+' }
    ];
    
    // Initialize counters for each range
    lengthRanges.forEach(range => {
      duplicatesByLength[range.label] = 0;
    });
    
    // Count duplicates in each length range
    duplicateGroups.forEach(group => {
      group.forEach(url => {
        if (fingerprints && fingerprints[url]) {
          const length = fingerprints[url].length;
          const range = lengthRanges.find(r => length >= r.min && length < r.max);
          if (range) {
            duplicatesByLength[range.label]++;
          }
        }
      });
    });
    
    return {
      totalGroups: duplicateGroups.length,
      totalDuplicatePages,
      averageGroupSize,
      largestGroupSize,
      duplicatesByLength
    };
  }
}

module.exports = ContentComparator;
