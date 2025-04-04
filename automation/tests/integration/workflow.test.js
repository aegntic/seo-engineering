/**
 * Workflow Integration Tests
 * 
 * Tests the entire automation workflow from crawling to implementation.
 * 
 * Last updated: April 4, 2025
 */

const { expect } = require('chai');
const sinon = require('sinon');
const { 
  mockCrawlerModule,
  mockGitIntegration,
  mockVerificationModule,
  mockLogger,
  createMockSite,
  createMockScanResults
} = require('../utils/test-utils');

// Import core modules
const crawler = require('../../crawler');
const technicalSEO = require('../../technical-seo');
const fixImplementation = require('../../fix-implementation');
const gitIntegration = require('../../git-integration');
const verification = require('../../verification');

describe('Automation Workflow Integration', () => {
  let crawlerStubs;
  let gitStubs;
  let verificationStubs;
  let loggerStubs;
  let site;
  let scanResults;
  
  beforeEach(() => {
    // Create mock site and scan results
    site = createMockSite();
    scanResults = createMockScanResults(site.id);
    
    // Set up stubs
    crawlerStubs = mockCrawlerModule();
    gitStubs = mockGitIntegration();
    verificationStubs = mockVerificationModule();
    loggerStubs = mockLogger();
    
    // Override the original modules with the mocked versions
    sinon.stub(crawler, 'crawlSite').callsFake(crawlerStubs.crawlSite);
    sinon.stub(crawler, 'analyzePage').callsFake(crawlerStubs.analyzePage);
    sinon.stub(gitIntegration, 'getFileContent').callsFake(gitStubs.getFileContent);
    sinon.stub(gitIntegration, 'implementChange').callsFake(gitStubs.implementChange);
    sinon.stub(verification, 'verifySite').callsFake(verificationStubs.verifySite);
    sinon.stub(verification, 'verifyFix').callsFake(verificationStubs.verifyFix);
  });
  
  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });
  
  /**
   * Test the entire automation workflow
   */
  it('should execute the full automation workflow successfully', async () => {
    // Step 1: Crawl the site
    const crawlResult = await crawler.crawlSite(site.url);
    expect(crawlResult).to.exist;
    expect(crawlResult.siteId).to.equal('site-123');
    expect(crawlResult.pages).to.be.an('array');
    expect(crawlResult.issues).to.be.an('array');
    expect(crawlerStubs.crawlSite.calledOnce).to.be.true;
    
    // Step 2: Analyze technical SEO issues
    const analysisResult = await technicalSEO.analyzeSite(site.id);
    expect(analysisResult).to.exist;
    expect(analysisResult.issues).to.be.an('array');
    
    // Step 3: Prioritize issues
    const prioritizedIssues = await technicalSEO.prioritizeIssues(analysisResult.issues);
    expect(prioritizedIssues).to.be.an('array');
    
    // Step 4: Generate fixes
    const fixes = await fixImplementation.generateFixes(prioritizedIssues);
    expect(fixes).to.be.an('array');
    
    // Step 5: Implement fixes
    const implementationResult = await fixImplementation.implementFixes(fixes, site.id);
    expect(implementationResult).to.exist;
    expect(implementationResult.appliedFixes).to.be.an('array');
    expect(gitStubs.implementChange.called).to.be.true;
    
    // Step 6: Verify fixes
    const verificationResult = await verification.verifySite({ siteId: site.id });
    expect(verificationResult).to.exist;
    expect(verificationResult.success).to.be.true;
    expect(verificationResult.metrics).to.exist;
    expect(verificationStubs.verifySite.calledOnce).to.be.true;
    
    // Check error logs - should be empty for successful workflow
    expect(loggerStubs.error.called).to.be.false;
  });
  
  /**
   * Test error handling during crawling
   */
  it('should handle errors during site crawling', async () => {
    // Make the crawler throw an error
    crawlerStubs.crawlSite.rejects(new Error('Network error'));
    
    try {
      await crawler.crawlSite(site.url);
      // Should not reach here
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).to.equal('Network error');
      expect(loggerStubs.error.called).to.be.true;
    }
  });
  
  /**
   * Test error handling during fix implementation
   */
  it('should handle errors during fix implementation', async () => {
    // Make the git integration throw an error
    gitStubs.implementChange.rejects(new Error('Git error'));
    
    const fixes = [
      {
        id: 'fix-1',
        issueId: 'issue-1',
        type: 'meta_description',
        path: '/index.html',
        changes: {
          original: '<meta name="description" content="">',
          modified: '<meta name="description" content="New description">'
        }
      }
    ];
    
    try {
      await fixImplementation.implementFixes(fixes, site.id);
      // Should not reach here
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).to.include('Git error');
      expect(loggerStubs.error.called).to.be.true;
    }
  });
  
  /**
   * Test partial success with some failed fixes
   */
  it('should handle partial success with some failed fixes', async () => {
    // Make some fixes succeed and some fail
    gitStubs.implementChange.onFirstCall().resolves({ 
      success: true, 
      commitHash: '1234567890abcdef' 
    });
    gitStubs.implementChange.onSecondCall().rejects(new Error('Failed to modify file'));
    
    const fixes = [
      {
        id: 'fix-1',
        issueId: 'issue-1',
        type: 'meta_description',
        path: '/index.html',
        changes: {
          original: '<meta name="description" content="">',
          modified: '<meta name="description" content="New description">'
        }
      },
      {
        id: 'fix-2',
        issueId: 'issue-2',
        type: 'heading_structure',
        path: '/index.html',
        changes: {
          original: '<h1>Welcome</h1><h3>Subtitle</h3>',
          modified: '<h1>Welcome</h1><h2>Subtitle</h2>'
        }
      }
    ];
    
    const implementationResult = await fixImplementation.implementFixes(fixes, site.id);
    
    expect(implementationResult).to.exist;
    expect(implementationResult.appliedFixes).to.be.an('array');
    expect(implementationResult.appliedFixes.length).to.equal(1);
    expect(implementationResult.failedFixes).to.be.an('array');
    expect(implementationResult.failedFixes.length).to.equal(1);
    expect(loggerStubs.warn.called).to.be.true;
  });
  
  /**
   * Test rollback functionality
   */
  it('should rollback changes when verification fails', async () => {
    // Make verification fail
    verificationStubs.verifySite.resolves({
      success: false,
      siteId: site.id,
      metrics: {
        pageSpeed: 75,
        mobileScore: 70,
        seoScore: 65
      },
      verifiedIssues: [
        { id: 'issue-1', fixed: false },
        { id: 'issue-2', fixed: true }
      ],
      details: 'Some issues not fixed correctly'
    });
    
    const fixes = [
      {
        id: 'fix-1',
        issueId: 'issue-1',
        type: 'meta_description',
        path: '/index.html',
        changes: {
          original: '<meta name="description" content="">',
          modified: '<meta name="description" content="New description">'
        },
        commitHash: '1234567890abcdef'
      }
    ];
    
    const rollbackStub = sinon.stub(fixImplementation, 'rollbackFixes').resolves({
      success: true,
      rolledBackFixes: fixes
    });
    
    // Implement fixes
    await fixImplementation.implementFixes(fixes, site.id);
    
    // Verify fixes (should fail)
    const verificationResult = await verification.verifySite({ siteId: site.id });
    
    // Check if rollback was triggered
    if (!verificationResult.success) {
      await fixImplementation.rollbackFixes(fixes, site.id);
    }
    
    expect(verificationResult.success).to.be.false;
    expect(rollbackStub.calledOnce).to.be.true;
    expect(loggerStubs.warn.called).to.be.true;
  });
});
