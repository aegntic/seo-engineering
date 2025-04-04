/**
 * Data structures for internal linking optimization
 * 
 * This module provides efficient data structures used in the link analysis algorithms.
 */

/**
 * Queue implementation for breadth-first traversal
 */
class Queue {
  constructor() {
    this.items = [];
  }
  
  enqueue(item) {
    this.items.push(item);
  }
  
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift();
  }
  
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[0];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
  
  clear() {
    this.items = [];
  }
}

/**
 * Priority Queue implementation for optimized traversal
 */
class PriorityQueue {
  constructor() {
    this.items = [];
  }
  
  enqueue(item, priority) {
    const element = { item, priority };
    let added = false;
    
    for (let i = 0; i < this.items.length; i++) {
      if (element.priority < this.items[i].priority) {
        this.items.splice(i, 0, element);
        added = true;
        break;
      }
    }
    
    if (!added) {
      this.items.push(element);
    }
  }
  
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift().item;
  }
  
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[0].item;
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
  
  clear() {
    this.items = [];
  }
}

/**
 * Disjoint Set (Union-Find) implementation for clustering
 */
class DisjointSet {
  constructor() {
    this.parent = new Map();
    this.rank = new Map();
  }
  
  makeSet(element) {
    if (!this.parent.has(element)) {
      this.parent.set(element, element);
      this.rank.set(element, 0);
    }
  }
  
  find(element) {
    if (!this.parent.has(element)) {
      return null;
    }
    
    if (this.parent.get(element) !== element) {
      // Path compression
      this.parent.set(element, this.find(this.parent.get(element)));
    }
    
    return this.parent.get(element);
  }
  
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    
    if (rootX === rootY) {
      return;
    }
    
    // Union by rank
    if (this.rank.get(rootX) < this.rank.get(rootY)) {
      this.parent.set(rootX, rootY);
    } else if (this.rank.get(rootX) > this.rank.get(rootY)) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, this.rank.get(rootX) + 1);
    }
  }
  
  getSets() {
    const sets = new Map();
    
    for (const element of this.parent.keys()) {
      const root = this.find(element);
      
      if (!sets.has(root)) {
        sets.set(root, []);
      }
      
      sets.get(root).push(element);
    }
    
    return Array.from(sets.values());
  }
}

/**
 * Memoizer for caching expensive function calls
 */
class Memoizer {
  constructor() {
    this.cache = new Map();
  }
  
  memoize(fn) {
    return (...args) => {
      const key = JSON.stringify(args);
      
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }
      
      const result = fn(...args);
      this.cache.set(key, result);
      
      return result;
    };
  }
  
  clear() {
    this.cache.clear();
  }
}

module.exports = {
  Queue,
  PriorityQueue,
  DisjointSet,
  Memoizer
};
