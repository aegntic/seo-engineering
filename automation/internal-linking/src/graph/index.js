/**
 * Link Graph Analyzer
 * 
 * This module builds and analyzes the internal linking structure of a website
 * using graph theory algorithms to identify patterns, strengths, and weaknesses.
 * 
 * Key features:
 * - Constructs a directed graph of all internal links
 * - Calculates PageRank and hub/authority scores
 * - Identifies critical paths and content silos
 * - Computes click distance for all pages
 * - Analyzes link distribution and balance
 */

const { performance } = require('perf_hooks');
const { Queue, PriorityQueue } = require('../../utils/data-structures');
const urlUtils = require('../../utils/url-utils');

/**
 * Analyzes internal link graph structure
 */
class LinkGraphAnalyzer {
  /**
   * Create a new LinkGraphAnalyzer
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = config;
    this.homePage = null;
    this.pageMap = new Map();
  }

  /**
   * Build a link graph from the provided pages
   * @param {Array<Object>} pages - Array of page objects with URLs and links
   * @returns {Object} The constructed link graph
   */
  async buildLinkGraph(pages) {
    console.log(`Building link graph for ${pages.length} pages...`);
    const startTime = performance.now();

    // Initialize the graph
    const graph = {
      nodes: new Map(),
      edges: [],
      homeNode: null,
      totalLinks: 0,
      internalLinks: 0,
      externalLinks: 0,
      nodesCount: 0
    };

    // Process in batches for better memory management
    const batchSize = this.config.batchSize || 50;
    const batches = Math.ceil(pages.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const batchStart = i * batchSize;
      const batchEnd = Math.min((i + 1) * batchSize, pages.length);
      const batch = pages.slice(batchStart, batchEnd);
      
      await this._processBatch(batch, graph);
      console.log(`Processed batch ${i + 1}/${batches}: ${batch.length} pages`);
    }

    // Identify home page if not explicitly marked
    if (!graph.homeNode && graph.nodes.size > 0) {
      graph.homeNode = this._identifyHomePage(graph);
    }

    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`Link graph built in ${duration}s. Nodes: ${graph.nodes.size}, Edges: ${graph.edges.length}`);
    
    return graph;
  }

  /**
   * Process a batch of pages to add to the graph
   * @param {Array<Object>} batch - Batch of pages to process
   * @param {Object} graph - The link graph being constructed
   * @private
   */
  async _processBatch(batch, graph) {
    for (const page of batch) {
      // Create node if it doesn't exist
      if (!graph.nodes.has(page.url)) {
        const node = {
          id: page.url,
          title: page.title || '',
          inLinks: [],
          outLinks: [],
          internalOutLinks: 0,
          externalOutLinks: 0,
          metrics: {
            pageRank: 0,
            hubScore: 0,
            authorityScore: 0,
            clickDistance: Infinity
          },
          content: {
            length: page.content ? page.content.length : 0,
            keywords: page.keywords || []
          },
          isHome: page.isHome || false
        };

        if (node.isHome) {
          graph.homeNode = node.id;
        }

        graph.nodes.set(node.id, node);
        graph.nodesCount++;
      }

      // Process links
      if (Array.isArray(page.links)) {
        const sourceNode = graph.nodes.get(page.url);
        
        for (const link of page.links) {
          const targetUrl = urlUtils.normalizeUrl(link.url);
          const isExternal = !urlUtils.isSameDomain(page.url, targetUrl);
          
          if (isExternal) {
            sourceNode.externalOutLinks++;
            graph.externalLinks++;
            continue;
          }

          // Create target node if it doesn't exist yet
          if (!graph.nodes.has(targetUrl)) {
            graph.nodes.set(targetUrl, {
              id: targetUrl,
              title: link.text || '',
              inLinks: [],
              outLinks: [],
              internalOutLinks: 0,
              externalOutLinks: 0,
              metrics: {
                pageRank: 0,
                hubScore: 0,
                authorityScore: 0,
                clickDistance: Infinity
              },
              content: {
                length: 0,
                keywords: []
              },
              isHome: false
            });
            graph.nodesCount++;
          }

          const targetNode = graph.nodes.get(targetUrl);
          
          // Add the edge
          const edge = {
            source: sourceNode.id,
            target: targetNode.id,
            anchorText: link.text || '',
            weight: 1,
            position: link.position || 0
          };

          // Update source and target nodes
          sourceNode.outLinks.push(edge);
          sourceNode.internalOutLinks++;
          targetNode.inLinks.push(edge);
          
          // Add to edges list
          graph.edges.push(edge);
          graph.internalLinks++;
          graph.totalLinks++;
        }
      }
    }
  }

  /**
   * Identify the home page if not explicitly marked
   * @param {Object} graph - The link graph
   * @returns {string} The URL of the identified home page
   * @private
   */
  _identifyHomePage(graph) {
    let mostInlinks = 0;
    let homePage = null;

    for (const [url, node] of graph.nodes.entries()) {
      // Common home page patterns
      if (url.endsWith('/') || url.endsWith('/index.html')) {
        const pathParts = new URL(url).pathname.split('/').filter(Boolean);
        if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === 'index.html')) {
          homePage = url;
          break;
        }
      }

      // Use page with most inlinks as fallback
      if (node.inLinks.length > mostInlinks) {
        mostInlinks = node.inLinks.length;
        homePage = url;
      }
    }

    return homePage;
  }

  /**
   * Analyze the link graph to calculate key metrics
   * @param {Object} graph - The link graph to analyze
   * @returns {Object} Analysis results
   */
  async analyzeGraph(graph) {
    console.log('Analyzing link graph...');
    const startTime = performance.now();

    // Calculate core metrics
    const pageRanks = await this._calculatePageRank(graph);
    const { hubScores, authorityScores } = await this._calculateHITS(graph);
    const clickDistances = await this._calculateClickDistances(graph);
    const contentSilos = await this._identifyContentSilos(graph);
    
    // Update node metrics
    for (const [url, node] of graph.nodes.entries()) {
      node.metrics.pageRank = pageRanks.get(url) || 0;
      node.metrics.hubScore = hubScores.get(url) || 0;
      node.metrics.authorityScore = authorityScores.get(url) || 0;
      node.metrics.clickDistance = clickDistances.get(url) || Infinity;
    }

    // Calculate graph-level metrics
    const linkDistribution = this._analyzeDistribution(graph);
    const globalMetrics = this._calculateGlobalMetrics(graph);
    
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`Link graph analysis completed in ${duration}s`);

    return {
      globalMetrics,
      linkDistribution,
      contentSilos,
      clickDistances: Array.from(clickDistances.entries()).map(([url, distance]) => ({ url, distance })),
      pageRanks: Array.from(pageRanks.entries())
        .map(([url, score]) => ({ url, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 100),
      hubPages: Array.from(hubScores.entries())
        .map(([url, score]) => ({ url, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20),
      authorityPages: Array.from(authorityScores.entries())
        .map(([url, score]) => ({ url, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
    };
  }

  /**
   * Calculate PageRank for all nodes in the graph
   * @param {Object} graph - The link graph
   * @returns {Map<string, number>} Map of URLs to PageRank scores
   * @private
   */
  async _calculatePageRank(graph) {
    const dampingFactor = this.config.pageRankDampingFactor || 0.85;
    const iterations = this.config.pageRankIterations || 100;
    const numNodes = graph.nodes.size;
    const tolerance = 0.0001;
    
    // Initialize PageRank scores
    const pageRanks = new Map();
    const initialRank = 1 / numNodes;
    
    for (const url of graph.nodes.keys()) {
      pageRanks.set(url, initialRank);
    }
    
    // Iterative calculation
    for (let i = 0; i < iterations; i++) {
      const newRanks = new Map();
      let convergence = true;
      
      // Calculate new ranks
      for (const [url, node] of graph.nodes.entries()) {
        let sum = 0;
        
        // Contribution from incoming links
        for (const inLink of node.inLinks) {
          const sourceNode = graph.nodes.get(inLink.source);
          const sourceOutLinks = sourceNode.internalOutLinks;
          
          if (sourceOutLinks > 0) {
            sum += pageRanks.get(inLink.source) / sourceOutLinks;
          }
        }
        
        const newRank = (1 - dampingFactor) / numNodes + dampingFactor * sum;
        newRanks.set(url, newRank);
        
        // Check for convergence
        if (Math.abs(newRank - pageRanks.get(url)) > tolerance) {
          convergence = false;
        }
      }
      
      // Update ranks
      for (const [url, rank] of newRanks.entries()) {
        pageRanks.set(url, rank);
      }
      
      // Early termination if converged
      if (convergence) {
        console.log(`PageRank converged after ${i + 1} iterations`);
        break;
      }
    }
    
    // Normalize scores
    let sum = 0;
    for (const rank of pageRanks.values()) {
      sum += rank;
    }
    
    for (const [url, rank] of pageRanks.entries()) {
      pageRanks.set(url, rank / sum);
    }
    
    return pageRanks;
  }

  /**
   * Calculate HITS (Hyperlink-Induced Topic Search) algorithm scores
   * @param {Object} graph - The link graph
   * @returns {Object} Object with hubScores and authorityScores maps
   * @private
   */
  async _calculateHITS(graph) {
    const iterations = 50;
    const tolerance = 0.0001;
    
    // Initialize hub and authority scores
    const hubScores = new Map();
    const authorityScores = new Map();
    
    for (const url of graph.nodes.keys()) {
      hubScores.set(url, 1.0);
      authorityScores.set(url, 1.0);
    }
    
    // Iterative calculation
    for (let i = 0; i < iterations; i++) {
      let hubsConverged = true;
      let authoritiesConverged = true;
      
      // Update authority scores
      for (const [url, node] of graph.nodes.entries()) {
        let sum = 0;
        
        for (const inLink of node.inLinks) {
          sum += hubScores.get(inLink.source);
        }
        
        const newAuthority = sum;
        if (Math.abs(newAuthority - authorityScores.get(url)) > tolerance) {
          authoritiesConverged = false;
        }
        
        authorityScores.set(url, newAuthority);
      }
      
      // Normalize authority scores
      let authSum = 0;
      for (const score of authorityScores.values()) {
        authSum += score * score;
      }
      
      authSum = Math.sqrt(authSum);
      if (authSum > 0) {
        for (const [url, score] of authorityScores.entries()) {
          authorityScores.set(url, score / authSum);
        }
      }
      
      // Update hub scores
      for (const [url, node] of graph.nodes.entries()) {
        let sum = 0;
        
        for (const outLink of node.outLinks) {
          sum += authorityScores.get(outLink.target);
        }
        
        const newHub = sum;
        if (Math.abs(newHub - hubScores.get(url)) > tolerance) {
          hubsConverged = false;
        }
        
        hubScores.set(url, newHub);
      }
      
      // Normalize hub scores
      let hubSum = 0;
      for (const score of hubScores.values()) {
        hubSum += score * score;
      }
      
      hubSum = Math.sqrt(hubSum);
      if (hubSum > 0) {
        for (const [url, score] of hubScores.entries()) {
          hubScores.set(url, score / hubSum);
        }
      }
      
      // Early termination if converged
      if (hubsConverged && authoritiesConverged) {
        console.log(`HITS converged after ${i + 1} iterations`);
        break;
      }
    }
    
    return { hubScores, authorityScores };
  }

  /**
   * Calculate click distances from home page to all nodes
   * @param {Object} graph - The link graph
   * @returns {Map<string, number>} Map of URLs to click distances
   * @private
   */
  async _calculateClickDistances(graph) {
    const distances = new Map();
    const homeUrl = graph.homeNode;
    
    // If no home page identified, return empty map
    if (!homeUrl) {
      console.warn('No home page identified for click distance calculation');
      return distances;
    }
    
    // Initialize all distances to infinity
    for (const url of graph.nodes.keys()) {
      distances.set(url, Infinity);
    }
    
    // Set home page distance to 0
    distances.set(homeUrl, 0);
    
    // Breadth-first search from home page
    const queue = new Queue();
    queue.enqueue(homeUrl);
    
    const visited = new Set();
    visited.add(homeUrl);
    
    while (!queue.isEmpty()) {
      const currentUrl = queue.dequeue();
      const currentNode = graph.nodes.get(currentUrl);
      const currentDistance = distances.get(currentUrl);
      
      for (const outLink of currentNode.outLinks) {
        const targetUrl = outLink.target;
        
        if (!visited.has(targetUrl)) {
          visited.add(targetUrl);
          distances.set(targetUrl, currentDistance + 1);
          queue.enqueue(targetUrl);
        }
      }
    }
    
    return distances;
  }

  /**
   * Identify content silos within the site structure
   * @param {Object} graph - The link graph
   * @returns {Array<Object>} Array of identified content silos
   * @private
   */
  async _identifyContentSilos(graph) {
    const silos = [];
    const siloBias = this.config.siloBias || 0.6;
    
    // Use URL path structure to identify potential silos
    const urlPathGroups = new Map();
    
    for (const [url, node] of graph.nodes.entries()) {
      try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        
        // Skip if no path parts (home page or root-level pages)
        if (pathParts.length === 0) continue;
        
        // Use first path segment as potential silo
        const siloName = pathParts[0];
        
        if (!urlPathGroups.has(siloName)) {
          urlPathGroups.set(siloName, []);
        }
        
        urlPathGroups.get(siloName).push({ url, node });
      } catch (e) {
        console.warn(`Error parsing URL ${url}: ${e.message}`);
      }
    }
    
    // Analyze each potential silo
    for (const [siloName, pages] of urlPathGroups.entries()) {
      // Skip small groups (likely not actual silos)
      if (pages.length < 3) continue;
      
      const siloUrls = pages.map(p => p.url);
      const internalLinks = 0;
      const externalLinks = 0;
      
      // Count internal (within silo) and external (outside silo) links
      for (const page of pages) {
        for (const outLink of page.node.outLinks) {
          if (siloUrls.includes(outLink.target)) {
            internalLinks++;
          } else {
            externalLinks++;
          }
        }
      }
      
      const totalLinks = internalLinks + externalLinks;
      const internalRatio = totalLinks > 0 ? internalLinks / totalLinks : 0;
      
      // If internal linking ratio exceeds the bias threshold, consider it a silo
      if (internalRatio >= siloBias) {
        silos.push({
          name: siloName,
          pages: siloUrls,
          internalLinks,
          externalLinks,
          internalRatio
        });
      }
    }
    
    return silos;
  }

  /**
   * Analyze link distribution across the site
   * @param {Object} graph - The link graph
   * @returns {Object} Distribution metrics
   * @private
   */
  _analyzeDistribution(graph) {
    // Calculate various distribution metrics
    const inLinkCounts = [];
    const outLinkCounts = [];
    const inLinksByDepth = new Map();
    const outLinksByDepth = new Map();
    
    for (const [url, node] of graph.nodes.entries()) {
      const inLinks = node.inLinks.length;
      const outLinks = node.outLinks.length;
      const depth = node.metrics.clickDistance;
      
      // Store counts
      inLinkCounts.push(inLinks);
      outLinkCounts.push(outLinks);
      
      // Group by depth
      if (!inLinksByDepth.has(depth)) {
        inLinksByDepth.set(depth, []);
      }
      if (!outLinksByDepth.has(depth)) {
        outLinksByDepth.set(depth, []);
      }
      
      inLinksByDepth.get(depth).push(inLinks);
      outLinksByDepth.get(depth).push(outLinks);
    }
    
    // Calculate statistics
    const getStats = (arr) => {
      const sum = arr.reduce((a, b) => a + b, 0);
      const avg = sum / arr.length;
      const sorted = [...arr].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      const variance = arr.reduce((v, x) => v + Math.pow(x - avg, 2), 0) / arr.length;
      const stdDev = Math.sqrt(variance);
      
      return { avg, median, min, max, stdDev };
    };
    
    // Calculate depth-based statistics
    const inLinkStatsByDepth = {};
    const outLinkStatsByDepth = {};
    
    for (const [depth, counts] of inLinksByDepth.entries()) {
      inLinkStatsByDepth[depth] = getStats(counts);
    }
    
    for (const [depth, counts] of outLinksByDepth.entries()) {
      outLinkStatsByDepth[depth] = getStats(counts);
    }
    
    return {
      inLinks: getStats(inLinkCounts),
      outLinks: getStats(outLinkCounts),
      byDepth: {
        inLinks: inLinkStatsByDepth,
        outLinks: outLinkStatsByDepth
      }
    };
  }

  /**
   * Calculate global metrics for the entire graph
   * @param {Object} graph - The link graph
   * @returns {Object} Global metrics
   * @private
   */
  _calculateGlobalMetrics(graph) {
    // Count pages at different depths
    const depthCounts = new Map();
    let deepestPage = { url: null, depth: 0 };
    let orphanedCount = 0;
    
    for (const [url, node] of graph.nodes.entries()) {
      const depth = node.metrics.clickDistance;
      
      if (depth === Infinity) {
        orphanedCount++;
        continue;
      }
      
      if (!depthCounts.has(depth)) {
        depthCounts.set(depth, 0);
      }
      depthCounts.set(depth, depthCounts.get(depth) + 1);
      
      if (depth > deepestPage.depth) {
        deepestPage = { url, depth };
      }
    }
    
    // Calculate link density and balance
    const totalNodes = graph.nodes.size;
    const totalLinks = graph.internalLinks;
    const linkDensity = totalNodes > 0 ? totalLinks / totalNodes : 0;
    
    // Calculate reciprocal link ratio (pages that link to each other)
    let reciprocalLinks = 0;
    const processedPairs = new Set();
    
    for (const edge of graph.edges) {
      const pairKey = [edge.source, edge.target].sort().join('|');
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);
      
      const sourceNode = graph.nodes.get(edge.source);
      const targetNode = graph.nodes.get(edge.target);
      
      const sourceLinksToTarget = sourceNode.outLinks.some(l => l.target === edge.target);
      const targetLinksToSource = targetNode.outLinks.some(l => l.target === edge.source);
      
      if (sourceLinksToTarget && targetLinksToSource) {
        reciprocalLinks++;
      }
    }
    
    const reciprocalRatio = totalLinks > 0 ? (reciprocalLinks * 2) / totalLinks : 0;
    
    return {
      pageCount: totalNodes,
      linkCount: totalLinks,
      externalLinkCount: graph.externalLinks,
      orphanedCount,
      linkDensity,
      reciprocalRatio,
      averageClickDistance: [...depthCounts.entries()].reduce((sum, [depth, count]) => {
        return sum + (depth * count);
      }, 0) / (totalNodes - orphanedCount),
      depthDistribution: [...depthCounts.entries()]
        .map(([depth, count]) => ({ depth, count }))
        .sort((a, b) => a.depth - b.depth),
      deepestPage
    };
  }
}

module.exports = LinkGraphAnalyzer;
