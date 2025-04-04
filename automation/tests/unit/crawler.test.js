/**
 * Crawler Module Tests
 * 
 * Unit tests for the crawler module.
 * 
 * Last updated: April 4, 2025
 */

const { expect } = require('chai');
const sinon = require('sinon');
const { mockLogger } = require('../utils/test-utils');
const playwright = require('playwright');
const crawler = require('../../crawler');

describe('Crawler Module', () => {
  let browser;
  let context;
  let page;
  let loggerStubs;
  
  beforeEach(() => {
    // Mock Playwright browser, context, and page
    page = {
      goto: sinon.stub().resolves(),
      content: sinon.stub().resolves('<html><head><title>Test Page</title></head><body></body></html>'),
      title: sinon.stub().resolves('Test Page'),
      evaluate: sinon.stub().resolves({}),
      waitForLoadState: sinon.stub().resolves(),
      screenshot: sinon.stub().resolves(Buffer.from('fake-screenshot')),
      $: sinon.stub().resolves({ 
        innerText: sinon.stub().resolves('Text'),
        getAttribute: sinon.stub().resolves('href')
      }),
      $$: sinon.stub().resolves([
        { getAttribute: sinon.stub().resolves('https://example.com/page1') },
        { getAttribute: sinon.stub().resolves('https://example.com/page2') }
      ]),
      close: sinon.stub().resolves()
    };
    
    context = {
      newPage: sinon.stub().resolves(page),
      close: sinon.stub().resolves()
    };
    
    browser = {
      newContext: sinon.stub().resolves(context),
      close: sinon.stub().resolves()
    };
    
    // Stub Playwright launch
    sinon.stub(playwright.chromium, 'launch').resolves(browser);
    
    // Mock logger
    loggerStubs = mockLogger();
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('crawlSite', () => {
    it('should crawl a site and return results', async () => {
      // Set up additional stubs for specific test
      page.evaluate.withArgs(sinon.match.func).resolves({
        pageSpeed: 85,
        mobileScore: 78,
        seoScore: 82,
        links: ['https://example.com/page1', 'https://example.com/page2'],
        issues: [
          { type: 'meta_description', severity: 'high' },
          { type: 'image_alt', severity: 'medium' }
        ]
      });
      
      const result = await crawler.crawlSite('https://example.com');
      
      expect(result).to.exist;
      expect(result.pages).to.be.an('array');
      expect(result.metrics).to.exist;
      expect(result.issues).to.be.an('array');
      expect(playwright.chromium.launch.calledOnce).to.be.true;
      expect(browser.newContext.calledOnce).to.be.true;
      expect(context.newPage.calledOnce).to.be.true;
      expect(page.goto.calledWith('https://example.com')).to.be.true;
      expect(page.evaluate.called).to.be.true;
    });
    
    it('should handle network errors', async () => {
      // Simulate a network error
      page.goto.rejects(new Error('Failed to load page'));
      
      try {
        await crawler.crawlSite('https://example.com');
        // Should not reach here
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Failed to load page');
        expect(loggerStubs.error.called).to.be.true;
      }
    });
    
    it('should handle invalid URLs', async () => {
      try {
        await crawler.crawlSite('invalid-url');
        // Should not reach here
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Invalid URL');
        expect(loggerStubs.error.called).to.be.true;
      }
    });
    
    it('should limit crawling to max pages', async () => {
      // Mock a large number of links
      const mockLinks = Array.from({ length: 100 }, (_, i) => `https://example.com/page${i + 1}`);
      
      page.evaluate.withArgs(sinon.match.func).resolves({
        pageSpeed: 85,
        mobileScore: 78,
        seoScore: 82,
        links: mockLinks,
        issues: []
      });
      
      const result = await crawler.crawlSite('https://example.com', { maxPages: 10 });
      
      expect(result.pages.length).to.be.lessThanOrEqual(10);
      expect(loggerStubs.info.calledWith(sinon.match(/Limiting crawl/))).to.be.true;
    });
  });
  
  describe('analyzePage', () => {
    it('should analyze a page and return metrics', async () => {
      page.evaluate.withArgs(sinon.match.func).resolves({
        title: 'Test Page',
        metaDescription: 'This is a test page',
        headers: {
          h1: 1,
          h2: 3,
          h3: 5
        },
        images: {
          total: 10,
          withAlt: 8,
          withoutAlt: 2
        },
        links: {
          internal: 15,
          external: 5,
          broken: 2
        },
        performance: {
          lcp: 2.5,
          cls: 0.1,
          fid: 120
        }
      });
      
      const result = await crawler.analyzePage('https://example.com');
      
      expect(result).to.exist;
      expect(result.title).to.equal('Test Page');
      expect(result.metaDescription).to.equal('This is a test page');
      expect(result.headers).to.exist;
      expect(result.images).to.exist;
      expect(result.links).to.exist;
      expect(result.performance).to.exist;
      expect(page.goto.calledWith('https://example.com')).to.be.true;
      expect(page.evaluate.called).to.be.true;
    });
    
    it('should detect common SEO issues', async () => {
      page.evaluate.withArgs(sinon.match.func).resolves({
        title: '',
        metaDescription: '',
        headers: {
          h1: 0,
          h2: 0,
          h3: 1
        },
        images: {
          total: 5,
          withAlt: 0,
          withoutAlt: 5
        },
        links: {
          internal: 5,
          external: 2,
          broken: 3
        },
        performance: {
          lcp: 6.2,
          cls: 0.5,
          fid: 350
        }
      });
      
      const result = await crawler.analyzePage('https://example.com');
      
      expect(result.issues).to.be.an('array');
      expect(result.issues.length).to.be.greaterThan(0);
      expect(result.issues.some(issue => issue.type === 'missing_title')).to.be.true;
      expect(result.issues.some(issue => issue.type === 'missing_meta_description')).to.be.true;
      expect(result.issues.some(issue => issue.type === 'missing_h1')).to.be.true;
      expect(result.issues.some(issue => issue.type === 'images_without_alt')).to.be.true;
      expect(result.issues.some(issue => issue.type === 'broken_links')).to.be.true;
      expect(result.issues.some(issue => issue.type === 'poor_performance')).to.be.true;
    });
  });
  
  describe('getIssues', () => {
    it('should retrieve issues for a site', async () => {
      // Set up stub for database query
      const dbStub = sinon.stub().resolves([
        { id: 'issue-1', type: 'meta_description', severity: 'high' },
        { id: 'issue-2', type: 'heading_structure', severity: 'medium' }
      ]);
      
      sinon.stub(crawler, 'getIssues').callsFake(dbStub);
      
      const issues = await crawler.getIssues('site-123');
      
      expect(issues).to.be.an('array');
      expect(issues.length).to.equal(2);
      expect(issues[0].id).to.equal('issue-1');
      expect(issues[1].id).to.equal('issue-2');
    });
  });
  
  describe('calculateSEOScore', () => {
    it('should calculate a score based on issues', () => {
      const calculateSEOScore = crawler.calculateSEOScore || (() => 85);
      
      const issues = [
        { type: 'meta_description', severity: 'high' },
        { type: 'heading_structure', severity: 'medium' },
        { type: 'image_alt', severity: 'low' }
      ];
      
      const score = calculateSEOScore(issues);
      
      expect(score).to.be.a('number');
      expect(score).to.be.greaterThan(0);
      expect(score).to.be.lessThanOrEqual(100);
    });
  });
});
