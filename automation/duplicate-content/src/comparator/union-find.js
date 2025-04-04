/**
 * Union-Find (Disjoint Set) data structure implementation
 * 
 * Provides an efficient way to group connected elements.
 * Used for clustering similar pages into groups of duplicates.
 * 
 * @module duplicate-content/comparator/union-find
 */

/**
 * Union-Find (Disjoint Set) implementation for efficient grouping
 */
class UnionFind {
  /**
   * Create a new UnionFind data structure
   * @param {Array<any>} elements - Elements to initialize with
   */
  constructor(elements = []) {
    this.parent = new Map();
    this.rank = new Map();
    
    // Initialize each element as its own set
    elements.forEach(element => {
      this.makeSet(element);
    });
  }
  
  /**
   * Create a new set with a single element
   * @param {any} element - Element to create a set for
   */
  makeSet(element) {
    if (!this.parent.has(element)) {
      this.parent.set(element, element);
      this.rank.set(element, 0);
    }
  }
  
  /**
   * Find the representative element for a set
   * @param {any} element - Element to find the representative for
   * @returns {any} Representative element
   */
  find(element) {
    if (!this.parent.has(element)) {
      this.makeSet(element);
      return element;
    }
    
    // Path compression - make each element point directly to the root
    if (this.parent.get(element) !== element) {
      this.parent.set(
        element, 
        this.find(this.parent.get(element))
      );
    }
    
    return this.parent.get(element);
  }
  
  /**
   * Merge two sets
   * @param {any} element1 - Element from first set
   * @param {any} element2 - Element from second set
   */
  union(element1, element2) {
    const root1 = this.find(element1);
    const root2 = this.find(element2);
    
    if (root1 === root2) {
      return; // Already in the same set
    }
    
    // Union by rank - attach smaller tree under root of larger tree
    const rank1 = this.rank.get(root1);
    const rank2 = this.rank.get(root2);
    
    if (rank1 < rank2) {
      this.parent.set(root1, root2);
    } else if (rank1 > rank2) {
      this.parent.set(root2, root1);
    } else {
      // If ranks are the same, make one the parent and increment its rank
      this.parent.set(root2, root1);
      this.rank.set(root1, rank1 + 1);
    }
  }
  
  /**
   * Check if two elements belong to the same set
   * @param {any} element1 - First element
   * @param {any} element2 - Second element
   * @returns {boolean} True if in the same set
   */
  connected(element1, element2) {
    return this.find(element1) === this.find(element2);
  }
  
  /**
   * Get all groups (connected components)
   * @returns {Array<Array<any>>} Array of groups
   */
  getGroups() {
    const groups = new Map();
    
    // Group elements by their representative
    for (const element of this.parent.keys()) {
      const representative = this.find(element);
      
      if (!groups.has(representative)) {
        groups.set(representative, []);
      }
      
      groups.get(representative).push(element);
    }
    
    // Convert to array of arrays
    return Array.from(groups.values());
  }
  
  /**
   * Get the number of disjoint sets
   * @returns {number} Number of sets
   */
  count() {
    const representatives = new Set();
    
    for (const element of this.parent.keys()) {
      representatives.add(this.find(element));
    }
    
    return representatives.size;
  }
}

module.exports = {
  UnionFind
};
