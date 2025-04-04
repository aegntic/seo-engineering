/**
 * Tests for Keyword Analyzer
 */

const KeywordAnalyzer = require('../services/keyword-analyzer');

describe('KeywordAnalyzer', () => {
  let keywordAnalyzer;
  
  beforeEach(() => {
    // Initialize with test configuration
    keywordAnalyzer = new KeywordAnalyzer({
      minOverlap: 0.3,
      maxKeywords: 10,
      prioritizeTopRanking: true,
      keywordImportanceWeights: {
        title: 1.5,
        headings: 1.2,
        content: 1.0,
        meta: 0.8
      },
      ignoredKeywords: ['and', 'or', 'the', 'a', 'an']
    });
  });
  
  describe('findCompetitors', () => {
    it('should find competitors based on keyword overlap', async () => {
      // Mock site data
      const siteData = {
        _id: 'test-site-id',
        domain: 'example.com',
        keywords: [
          { keyword: 'test keyword 1', importance: 0.9 },
          { keyword: 'test keyword 2', importance: 0.8 },
          { keyword: 'test keyword 3', importance: 0.7 }
        ]
      };
      
      // Call the method
      const competitors = await keywordAnalyzer.findCompetitors(siteData);
      
      // Expectations
      expect(Array.isArray(competitors)).toBe(true);
      
      // We should have at least one competitor
      expect(competitors.length).toBeGreaterThan(0);
      
      // Check competitor properties
      competitors.forEach(competitor => {
        expect(competitor).toHaveProperty('url');
        expect(competitor).toHaveProperty('domain');
        expect(competitor).toHaveProperty('relevanceScore');
        expect(competitor.discoveryMethod).toBe('keyword');
        expect(competitor.keywordOverlap).toBeGreaterThanOrEqual(0);
        expect(competitor.domain).not.toBe(siteData.domain);
      });
    });
    
    it('should return empty array if no keywords provided', async () => {
      // Mock site data with no keywords
      const siteData = {
        _id: 'test-site-id',
        domain: 'example.com',
        keywords: []
      };
      
      // Call the method
      const competitors = await keywordAnalyzer.findCompetitors(siteData);
      
      // Expectations
      expect(Array.isArray(competitors)).toBe(true);
      expect(competitors.length).toBe(0);
    });
    
    it('should filter out the site\'s own domain', async () => {
      // Mock site data with keywords
      const siteData = {
        _id: 'test-site-id',
        domain: 'competitor1.com', // Intentionally use a domain that would be in simulated results
        keywords: [
          { keyword: 'test keyword 1', importance: 0.9 }
        ]
      };
      
      // Call the method
      const competitors = await keywordAnalyzer.findCompetitors(siteData);
      
      // Expectations
      expect(Array.isArray(competitors)).toBe(true);
      
      // Check that site's own domain is not in results
      competitors.forEach(competitor => {
        expect(competitor.domain).not.toBe(siteData.domain);
      });
    });
  });
  
  describe('_extractKeywords', () => {
    it('should extract keywords from site data', () => {
      // Mock site data
      const siteData = {
        keywords: [
          { keyword: 'test keyword 1', importance: 0.9 },
          { keyword: 'test keyword 2', importance: 0.8 },
          { keyword: 'and', importance: 0.7 }, // Should be filtered out
          { keyword: 'test keyword 3', importance: 0.6 }
        ]
      };
      
      // Call the method (using reflection to access private method)
      const keywords = keywordAnalyzer._extractKeywords(siteData);
      
      // Expectations
      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBe(3); // 'and' should be filtered out
      expect(keywords[0].keyword).toBe('test keyword 1');
      expect(keywords[1].keyword).toBe('test keyword 2');
      expect(keywords[2].keyword).toBe('test keyword 3');
    });
    
    it('should limit keywords to maxKeywords', () => {
      // Mock site data with many keywords
      const siteData = {
        keywords: Array(20).fill().map((_, i) => ({ 
          keyword: `test keyword ${i + 1}`, 
          importance: 0.9 - (i * 0.01) 
        }))
      };
      
      // Call the method
      const keywords = keywordAnalyzer._extractKeywords(siteData);
      
      // Expectations
      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBe(10); // Limited by maxKeywords
    });
  });
  
  describe('_simulateKeywordResults', () => {
    it('should generate simulated SERP results', () => {
      // Call the method
      const results = keywordAnalyzer._simulateKeywordResults('test keyword');
      
      // Expectations
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Check result properties
      results.forEach(result => {
        expect(result).toHaveProperty('domain');
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('position');
        expect(result).toHaveProperty('snippet');
      });
    });
    
    it('should generate different results for different keywords', () => {
      // Call the method with different keywords
      const results1 = keywordAnalyzer._simulateKeywordResults('test keyword 1');
      const results2 = keywordAnalyzer._simulateKeywordResults('test keyword 2');
      
      // Extract domains for comparison
      const domains1 = results1.map(r => r.domain);
      const domains2 = results2.map(r => r.domain);
      
      // Expectations - results should be different
      expect(domains1).not.toEqual(domains2);
    });
  });
  
  describe('_calculateCompetitorRelevance', () => {
    it('should calculate relevance scores correctly', () => {
      // Mock data
      const competitorsByKeyword = {
        'keyword1': [
          { domain: 'competitor1.com', position: 1 },
          { domain: 'competitor2.com', position: 2 }
        ],
        'keyword2': [
          { domain: 'competitor1.com', position: 3 },
          { domain: 'competitor3.com', position: 1 }
        ],
        'keyword3': [
          { domain: 'competitor2.com', position: 1 },
          { domain: 'competitor3.com', position: 2 }
        ]
      };
      
      const siteKeywords = [
        { keyword: 'keyword1', importance: 1.0 },
        { keyword: 'keyword2', importance: 0.8 },
        { keyword: 'keyword3', importance: 0.6 }
      ];
      
      // Call the method
      const competitors = keywordAnalyzer._calculateCompetitorRelevance(
        competitorsByKeyword, 
        siteKeywords
      );
      
      // Expectations
      expect(Array.isArray(competitors)).toBe(true);
      expect(competitors.length).toBe(3);
      
      // Check properties
      competitors.forEach(competitor => {
        expect(competitor).toHaveProperty('domain');
        expect(competitor).toHaveProperty('relevanceScore');
        expect(competitor).toHaveProperty('keywordOverlap');
        expect(competitor).toHaveProperty('matchedKeywords');
        expect(competitor).toHaveProperty('bestPosition');
        expect(competitor).toHaveProperty('bestKeyword');
        expect(competitor).toHaveProperty('discoveryMethod', 'keyword');
      });
      
      // Check sorting by relevance
      expect(competitors[0].relevanceScore).toBeGreaterThanOrEqual(competitors[1].relevanceScore);
      expect(competitors[1].relevanceScore).toBeGreaterThanOrEqual(competitors[2].relevanceScore);
    });
    
    it('should filter out competitors below minOverlap', () => {
      // Mock data with low overlap
      const competitorsByKeyword = {
        'keyword1': [
          { domain: 'competitor1.com', position: 1 }, // Only appears for 1/3 keywords
          { domain: 'competitor2.com', position: 2 }
        ],
        'keyword2': [
          { domain: 'competitor2.com', position: 1 },
          { domain: 'competitor3.com', position: 2 }
        ],
        'keyword3': [
          { domain: 'competitor2.com', position: 3 },
          { domain: 'competitor3.com', position: 4 }
        ]
      };
      
      const siteKeywords = [
        { keyword: 'keyword1', importance: 1.0 },
        { keyword: 'keyword2', importance: 0.8 },
        { keyword: 'keyword3', importance: 0.6 }
      ];
      
      // Call the method
      const competitors = keywordAnalyzer._calculateCompetitorRelevance(
        competitorsByKeyword, 
        siteKeywords
      );
      
      // Expectations - competitor1 should be filtered out as it only appears for 1/3 keywords
      expect(competitors.map(c => c.domain)).not.toContain('competitor1.com');
      
      // But competitor2 and competitor3 should be included
      expect(competitors.map(c => c.domain)).toContain('competitor2.com');
      expect(competitors.map(c => c.domain)).toContain('competitor3.com');
    });
  });
  
  describe('_formatCompetitors', () => {
    it('should format competitors for output', () => {
      // Mock competitors
      const competitors = [
        {
          domain: 'example.com', // Should be filtered out
          relevanceScore: 0.8,
          matchedKeywords: ['keyword1', 'keyword2'],
          bestPosition: 1,
          bestKeyword: 'keyword1',
          discoveryMethod: 'keyword',
          urls: ['https://example.com/page1']
        },
        {
          domain: 'competitor1.com',
          relevanceScore: 0.7,
          matchedKeywords: ['keyword1', 'keyword3'],
          bestPosition: 2,
          bestKeyword: 'keyword1',
          discoveryMethod: 'keyword',
          urls: ['https://competitor1.com/page1']
        }
      ];
      
      // Call the method
      const formatted = keywordAnalyzer._formatCompetitors(competitors, 'example.com');
      
      // Expectations
      expect(Array.isArray(formatted)).toBe(true);
      expect(formatted.length).toBe(1); // example.com should be filtered out
      
      // Check properties
      const competitor = formatted[0];
      expect(competitor.domain).toBe('competitor1.com');
      expect(competitor.url).toBe('https://competitor1.com/page1');
      expect(competitor.relevanceScore).toBe(0.7);
      expect(competitor.discoveryMethod).toBe('keyword');
      expect(competitor.keywordOverlap).toBe(2); // From matchedKeywords.length
      expect(competitor.backlinksInCommon).toBe(0);
      expect(competitor.serpOverlap).toBe(0);
      expect(competitor.industryMatch).toBe(false);
    });
  });
});
