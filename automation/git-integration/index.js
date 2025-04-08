/**
 * SEO.engineering - Git Integration Module Entry Point
 * 
 * This module exports the Git integration functionality for use in the SEO.engineering system.
 * It provides the main interface for tracking and managing changes to client websites.
 */

const { ChangeTracker, ChangeType } = require('./change-tracker');
const GitWrapper = require('./git-wrapper');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../../api/src/utils/logger');
const config = require('../../api/src/config');

// Default base path for site repositories
const DEFAULT_REPOS_PATH = path.join(process.cwd(), 'site-repos');

/**
 * Create a change tracker for a specific site
 * @param {string} siteId - Unique identifier for the site
 * @param {string} repoPath - Optional custom repository path
 * @param {object} options - Optional configuration options
 * @returns {Promise<ChangeTracker>} - Initialized change tracker
 */
async function createChangeTracker(siteId, repoPath = null, options = {}) {
  // Determine the repository path
  const basePath = config.REPOS_BASE_PATH || DEFAULT_REPOS_PATH;
  const sitePath = repoPath || path.join(basePath, siteId);
  
  // Ensure the directory exists
  await fs.mkdir(sitePath, { recursive: true });
  
  // Initialize the change tracker
  const tracker = new ChangeTracker(siteId, sitePath, options);
  
  // Check if this is a new site repository
  let isNewSite = false;
  try {
    const files = await fs.readdir(sitePath);
    isNewSite = files.length === 0;
  } catch (error) {
    // If we can't read the directory, assume it's a new site
    isNewSite = true;
  }
  
  // Initialize the repository
  await tracker.initialize(isNewSite);
  
  return tracker;
}

/**
 * Get a list of all site repositories
 * @returns {Promise<Array>} - Array of site IDs
 */
async function listSiteRepositories() {
  const basePath = config.REPOS_BASE_PATH || DEFAULT_REPOS_PATH;
  
  try {
    // Ensure the base directory exists
    await fs.mkdir(basePath, { recursive: true });
    
    // Get all subdirectories
    const entries = await fs.readdir(basePath, { withFileTypes: true });
    
    // Filter to only directories
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch (error) {
    logger.error('Failed to list site repositories', error);
    throw error;
  }
}

/**
 * Clone a site repository from a remote URL
 * @param {string} siteId - Site identifier
 * @param {string} repoUrl - Repository URL to clone
 * @param {object} options - Optional configuration options
 * @returns {Promise<ChangeTracker>} - Initialized change tracker
 */
async function cloneSiteRepository(siteId, repoUrl, options = {}) {
  const basePath = config.REPOS_BASE_PATH || DEFAULT_REPOS_PATH;
  const sitePath = path.join(basePath, siteId);
  
  try {
    // Create a temporary Git wrapper to handle the clone
    const git = new GitWrapper(sitePath, options.gitOptions);
    
    // Clone the repository
    await git.clone(repoUrl);
    logger.info(`Cloned repository for site ${siteId} from ${repoUrl}`);
    
    // Initialize and return a change tracker for the cloned repo
    const tracker = new ChangeTracker(siteId, sitePath, options);
    await tracker.initialize(false);
    
    return tracker;
  } catch (error) {
    logger.error(`Failed to clone repository for site ${siteId}`, error);
    throw error;
  }
}

/**
 * Test Git functionality to ensure the integration is working properly
 * @returns {Promise<object>} - Test results
 */
async function testGitIntegration() {
  const testSiteId = `test-site-${Date.now()}`;
  const basePath = config.REPOS_BASE_PATH || DEFAULT_REPOS_PATH;
  const testPath = path.join(basePath, testSiteId);
  
  try {
    // Create a test change tracker
    const tracker = await createChangeTracker(testSiteId);
    
    // Create a test file
    const testFilePath = path.join(testPath, 'test.html');
    await fs.writeFile(testFilePath, '<html><head><title>Test Page</title></head><body><h1>Test Page</h1></body></html>');
    
    // Start a change batch
    const batchId = `test-batch-${Date.now()}`;
    await tracker.startChangeBatch(batchId, 'Test change batch');
    
    // Record a change
    await tracker.recordChange(testFilePath, ChangeType.META_TAG, {
      tag: 'title',
      before: 'Test Page',
      after: 'Optimized Test Page'
    });
    
    // Update the file
    await fs.writeFile(testFilePath, '<html><head><title>Optimized Test Page</title></head><body><h1>Test Page</h1></body></html>');
    
    // Finalize the batch
    const result = await tracker.finalizeChangeBatch(batchId, true);
    
    // Get change history
    const history = await tracker.getChangeHistory(5);
    
    // Clean up - remove the test directory
    await fs.rm(testPath, { recursive: true, force: true });
    
    return {
      success: true,
      message: 'Git integration is working properly',
      testResults: {
        siteId: testSiteId,
        batchResult: result,
        changeHistory: history
      }
    };
  } catch (error) {
    logger.error('Git integration test failed', error);
    
    // Try to clean up
    try {
      await fs.rm(testPath, { recursive: true, force: true });
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    return {
      success: false,
      message: 'Git integration test failed',
      error: error.message
    };
  }
}

// Export the module's functionality
module.exports = {
  createChangeTracker,
  listSiteRepositories,
  cloneSiteRepository,
  testGitIntegration,
  ChangeType,
  GitWrapper
};
