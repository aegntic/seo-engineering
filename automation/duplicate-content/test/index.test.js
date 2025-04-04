/**
 * Test suite for Duplicate Content Analysis Module
 * 
 * Comprehensive tests covering all components of the module:
 * - Content Fingerprinting
 * - Similarity Detection
 * - Cross-Page Comparison
 * - Canonical URL Suggestion
 */

const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const { JSDOM } = require('jsdom');

// Module imports
const { DuplicateContentAnalyzer } = require('../index');
const ContentFingerprinter = require('../src/fingerprinter');
const SimilarityEngine = require('../src/similarity');
const ContentComparator = require('../src/comparator');
const CanonicalSuggestor = require('../src/canonical');
const simhash = require('../src/fingerprinter/simhash');
const tokenize = require('../src/fingerprinter/tokenizer');
const { removeStopwords } = require('../src/fingerprinter/stopwords');
const { UnionFind } = require('../src/comparator/union-find');
const urlUtils = require('../src/canonical/url-utils');

describe('Duplicate Content Analysis Module', () => {
  let analyzer;
  let mockPages;
  
  beforeEach(() => {
    // Create a test analyzer with default configuration
    analyzer = new DuplicateContentAnalyzer({
      similarityThreshold: 0.8,
      minContentLength: 100
    });
    
    // Mock pages for testing
    mockPages = [
      {
        url: 'https://example.com/page1',
        content: '<html><body><h1>Test Content</h1><p>This is some test content for page 1.</p></body></html>'
      },
      {
        url: 'https://example.com/page2',
        content: '<html><body><h1>Test Content</h1><p>This is some test content for page 2.</p></body></html>'
      },
      {
        url: 'https://example.com/page3',
        content: '<html><body><h1>Different Content</h1><p>This is completely different content.</p></body></html>'
      }
    ];
  });
  
  afterEach(() => {
    // Clean up any stubs or mocks
    sinon.restore();
  });
  
  describe('ContentFingerprinter', () => {
    it('should generate fingerprints for content', async () => {
      const fingerprinter = new ContentFingerprinter({
        minContentLength: 10,
        simhashBits: 64,
        excludeSelectors: ['script', 'style']
      });
      
      const result = await fingerprinter.generateFingerprint(mockPages[0]);
      
      expect(result).to.be.an('object');
      expect(result.hash).to.be.a('string');
      expect(result.tokens).to.be.an('array');
      expect(result.isEmpty).to.be.false;
    });
    
    it('should extract clean content from HTML', () => {
      const fingerprinter = new ContentFingerprinter({
        excludeSelectors: ['script', 'style']
      });
      
      const html = `
        <html>
          <head>
            <script>console.log('test');</script>
            <style>.test { color: red; }</style>
          </head>
          <body>
            <header>Header content</header>
            <div class="content">Main content</div>
            <footer>Footer content</footer>
          </body>
        </html>
      `;
      
      const cleanContent = fingerprinter.extractContent(html);
      
      expect(cleanContent).to.be.a('string');
      expect(cleanContent).to.include('Main content');
      expect(cleanContent).to.not.include('console.log');
      expect(cleanContent).to.not.include('color: red');
    });
  });
  
  describe('SimHash', () => {
    it('should compute a hash for a list of tokens', () => {
      const tokens = ['test', 'content', 'example'];
      const hash = simhash.compute(tokens, 64);
      
      expect(hash).to.be.a('string');
      expect(hash.length).to.equal(16); // 64 bits = 16 hex chars
    });
    
    it('should calculate similarity between two hashes', () => {
      const hash1 = simhash.compute(['test', 'content', 'example']);
      const hash2 = simhash.compute(['test', 'content', 'sample']);
      const hash3 = simhash.compute(['completely', 'different', 'text']);
      
      const similarity12 = simhash.similarity(hash1, hash2);
      const similarity13 = simhash.similarity(hash1, hash3);
      
      expect(similarity12).to.be.a('number');
      expect(similarity12).to.be.greaterThan(similarity13);
      expect(similarity12).to.be.greaterThan(0.5);
      expect(similarity13).to.be.lessThan(0.8);
    });
  });
  
  describe('Tokenizer', () => {
    it('should tokenize text into words', () => {
      const text = 'This is a test sentence with some words';
      const tokens = tokenize(text);
      
      expect(tokens).to.be.an('array');
      expect(tokens).to.include('test');
      expect(tokens).to.include('sentence');
    });
    
    it('should generate n-grams when specified', () => {
      const text = 'This is a test sentence';
      const tokens = tokenize(text, { includeNgrams: true, maxNgramSize: 2 });
      
      expect(tokens).to.include('this');
      expect(tokens).to.include('test');
      expect(tokens).to.include('this is');
      expect(tokens).to.include('is a');
      expect(tokens).to.include('a test');
      expect(tokens).to.include('test sentence');
    });
  });
  
  describe('SimilarityEngine', () => {
    it('should find similarities between content fingerprints', async () => {
      // Create mock fingerprints
      const fingerprints = {
        'https://example.com/page1': { hash: simhash.compute(['test', 'content']), isEmpty: false },
        'https://example.com/page2': { hash: simhash.compute(['test', 'content', 'similar']), isEmpty: false },
        'https://example.com/page3': { hash: simhash.compute(['completely', 'different']), isEmpty: false }
      };
      
      const similarityEngine = new SimilarityEngine({
        similarityThreshold: 0.7,
        parallelComparisons: 10
      });
      
      const similarities = await similarityEngine.findSimilarities(fingerprints);
      
      expect(similarities).to.be.an('object');
      expect(similarities.similarPages).to.be.an('object');
      expect(similarities.similarityScores).to.be.an('object');
      expect(Object.keys(similarities.similarPages)).to.include('https://example.com/page1');
      expect(similarities.similarPages['https://example.com/page1']).to.include('https://example.com/page2');
      expect(similarities.similarPages['https://example.com/page1']).to.not.include('https://example.com/page3');
    });
  });
  
  describe('ContentComparator', () => {
    it('should find groups of duplicate content', async () => {
      // Create mock similarities
      const similarities = {
        similarPages: {
          'https://example.com/page1': ['https://example.com/page2'],
          'https://example.com/page2': ['https://example.com/page1'],
          'https://example.com/page3': []
        },
        similarityScores: {
          'https://example.com/page1': { 'https://example.com/page2': 0.9 },
          'https://example.com/page2': { 'https://example.com/page1': 0.9 }
        }
      };
      
      const comparator = new ContentComparator({
        similarityThreshold: 0.7
      });
      
      const duplicateGroups = await comparator.findDuplicateGroups(similarities);
      
      expect(duplicateGroups).to.be.an('array');
      expect(duplicateGroups.length).to.equal(1);
      expect(duplicateGroups[0]).to.include('https://example.com/page1');
      expect(duplicateGroups[0]).to.include('https://example.com/page2');
      expect(duplicateGroups[0]).to.not.include('https://example.com/page3');
    });
  });
  
  describe('CanonicalSuggestor', () => {
    it('should suggest canonical URLs for duplicate groups', async () => {
      const duplicateGroups = [
        ['https://example.com/products/item', 'https://example.com/products/item?ref=123']
      ];
      
      const pages = [
        { url: 'https://example.com/products/item', incomingLinks: 10 },
        { url: 'https://example.com/products/item?ref=123', incomingLinks: 5 }
      ];
      
      const suggestor = new CanonicalSuggestor({
        canonicalStrategies: ['shortest-url', 'most-incoming-links']
      });
      
      const suggestions = await suggestor.suggestCanonicals(duplicateGroups, pages);
      
      expect(suggestions).to.be.an('object');
      expect(suggestions['https://example.com/products/item?ref=123']).to.equal('https://example.com/products/item');
    });
  });
  
  describe('URL Utils', () => {
    it('should parse URL paths correctly', () => {
      const path = '/products/category/item-name.html';
      const parsed = urlUtils.parseUrlPath(path);
      
      expect(parsed).to.be.an('object');
      expect(parsed.segments).to.deep.equal(['products', 'category', 'item-name.html']);
      expect(parsed.depth).to.equal(3);
      expect(parsed.hasExtension).to.be.true;
      expect(parsed.extension).to.equal('html');
    });
    
    it('should analyze URL quality for canonical selection', () => {
      const url1 = 'https://example.com/products/clean-url';
      const url2 = 'https://example.com/products/messy-url.php?id=123&ref=xyz#section';
      
      const quality1 = urlUtils.analyzeUrlQuality(url1);
      const quality2 = urlUtils.analyzeUrlQuality(url2);
      
      expect(quality1.qualityScore).to.be.greaterThan(quality2.qualityScore);
    });
  });
  
  describe('DuplicateContentAnalyzer', () => {
    it('should analyze pages for duplicate content', async () => {
      // Stub the fingerprinter to return controlled fingerprints
      sinon.stub(analyzer.fingerprinter, 'generateFingerprints').resolves({
        'https://example.com/page1': { 
          hash: simhash.compute(['test', 'content']), 
          isEmpty: false,
          length: 100
        },
        'https://example.com/page2': { 
          hash: simhash.compute(['test', 'content', 'similar']), 
          isEmpty: false,
          length: 120
        },
        'https://example.com/page3': { 
          hash: simhash.compute(['completely', 'different']), 
          isEmpty: false,
          length: 150
        }
      });
      
      const results = await analyzer.analyzePages(mockPages);
      
      expect(results).to.be.an('object');
      expect(results.getDuplicateGroups).to.be.a('function');
      expect(results.getCanonicalSuggestions).to.be.a('function');
      
      const duplicateGroups = results.getDuplicateGroups();
      expect(duplicateGroups).to.be.an('array');
    });
  });
});
