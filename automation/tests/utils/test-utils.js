/**
 * Testing Utilities
 * 
 * Common utilities for testing the automation workflows.
 * 
 * Last updated: April 4, 2025
 */

const sinon = require('sinon');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('../../utils/logger');

/**
 * Creates a MongoDB memory server for testing
 * 
 * @returns {Promise<Object>} - MongoDB memory server instance
 */
async function setupTestDatabase() {
  let mongoUri;
  let mongoServer = null;

  if (process.env.MONGODB_URI) {
    mongoUri = process.env.MONGODB_URI;
    console.log('[Test Utils] Using existing MongoDB URI:', mongoUri);
  } else {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    console.log('[Test Utils] Started new in-memory MongoDB at', mongoUri);
  }

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  return mongoServer;
}

/**
 * Closes MongoDB connection and stops memory server
 * 
 * @param {Object} mongoServer - MongoDB memory server instance
 */
async function teardownTestDatabase(mongoServer) {
  await mongoose.disconnect();
  await mongoServer.stop();
}

/**
 * Mocks the logger for tests
 * 
 * @returns {Object} - Sinon stubs for logger methods
 */
function mockLogger() {
  return {
    info: sinon.stub(logger, 'info'),
    error: sinon.stub(logger, 'error'),
    warn: sinon.stub(logger, 'warn'),
    debug: sinon.stub(logger, 'debug')
  };
}

/**
 * Creates a mock site for testing
 * 
 * @returns {Object} - Mock site data
 */
function createMockSite() {
  return {
    id: 'site-' + Math.random().toString(36).substring(2, 9),
    url: 'https://example.com',
    name: 'Test Site',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Creates a mock scan result for testing
 * 
 * @param {string} siteId - ID of the site
 * @returns {Object} - Mock scan results
 */
function createMockScanResults(siteId) {
  return {
    id: 'scan-' + Math.random().toString(36).substring(2, 9),
    siteId,
    timestamp: new Date(),
    metrics: {
      pageSpeed: Math.floor(Math.random() * 100),
      mobileScore: Math.floor(Math.random() * 100),
      seoScore: Math.floor(Math.random() * 100),
      coreWebVitals: {
        lcp: Math.random() * 5,
        cls: Math.random() * 0.5,
        fid: Math.random() * 300,
        inp: Math.random() * 500
      }
    },
    issues: [
      {
        id: 'issue-1',
        type: 'meta_description',
        severity: 'high',
        url: 'https://example.com',
        message: 'Missing meta description',
        fixable: true
      },
      {
        id: 'issue-2',
        type: 'heading_structure',
        severity: 'medium',
        url: 'https://example.com',
        message: 'Improper heading structure',
        fixable: true
      },
      {
        id: 'issue-3',
        type: 'broken_link',
        severity: 'high',
        url: 'https://example.com/broken',
        message: 'Broken internal link',
        fixable: false
      }
    ]
  };
}

/**
 * Mocks the crawler module for testing
 * 
 * @param {Object} results - Optional custom results to return
 * @returns {Object} - Mocked crawler module with sinon stubs
 */
function mockCrawlerModule(results = {}) {
  const defaultResults = {
    siteId: 'site-123',
    pages: [
      { url: 'https://example.com', title: 'Home Page' },
      { url: 'https://example.com/about', title: 'About Us' },
      { url: 'https://example.com/contact', title: 'Contact Us' }
    ],
    metrics: {
      pageSpeed: 85,
      mobileScore: 78,
      seoScore: 82
    },
    issues: [
      { id: 'issue-1', type: 'meta_description', severity: 'high' },
      { id: 'issue-2', type: 'heading_structure', severity: 'medium' }
    ]
  };
  
  return {
    crawlSite: sinon.stub().resolves(results.crawlSite || defaultResults),
    analyzePage: sinon.stub().resolves(results.analyzePage || {
      url: 'https://example.com',
      metrics: defaultResults.metrics,
      issues: defaultResults.issues
    }),
    getIssues: sinon.stub().resolves(results.issues || defaultResults.issues)
  };
}

/**
 * Mocks the git integration module for testing
 * 
 * @returns {Object} - Mocked git integration module with sinon stubs
 */
function mockGitIntegration() {
  return {
    getFileContent: sinon.stub().resolves('<html><head><title>Example</title></head><body></body></html>'),
    implementChange: sinon.stub().resolves({ 
      success: true, 
      commitHash: '1234567890abcdef', 
      message: 'Updated file' 
    }),
    rollbackChange: sinon.stub().resolves({ 
      success: true, 
      commitHash: 'fedcba0987654321', 
      message: 'Reverted changes' 
    })
  };
}

/**
 * Mocks the verification module for testing
 * 
 * @returns {Object} - Mocked verification module with sinon stubs
 */
function mockVerificationModule() {
  return {
    verifySite: sinon.stub().resolves({
      success: true,
      siteId: 'site-123',
      metrics: {
        pageSpeed: 87,
        mobileScore: 82,
        seoScore: 90,
        coreWebVitals: {
          lcp: 2.1,
          cls: 0.09,
          fid: 85,
          inp: 120
        }
      },
      verifiedIssues: [
        { id: 'issue-1', fixed: true },
        { id: 'issue-2', fixed: true }
      ],
      details: 'All issues fixed successfully'
    }),
    verifyFix: sinon.stub().resolves({ success: true, fixed: true })
  };
}

module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
  mockLogger,
  createMockSite,
  createMockScanResults,
  mockCrawlerModule,
  mockGitIntegration,
  mockVerificationModule
};
