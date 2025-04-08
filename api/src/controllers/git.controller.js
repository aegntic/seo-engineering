/**
 * SEO.engineering - Git Controller
 * 
 * API controller for Git integration functionality.
 * Handles requests related to change tracking and management.
 */

const gitIntegration = require('../../../automation/git-integration');
const logger = require('../utils/logger');

/**
 * Initialize a site repository
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.initializeSite = async (req, res) => {
  try {
    const { siteId, repoUrl } = req.body;
    
    if (!siteId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Site ID is required' 
      });
    }
    
    // If repo URL is provided, clone it; otherwise create a new repository
    let tracker;
    if (repoUrl) {
      tracker = await gitIntegration.cloneSiteRepository(siteId, repoUrl);
    } else {
      tracker = await gitIntegration.createChangeTracker(siteId);
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully initialized Git repository for site ${siteId}`,
      siteId
    });
  } catch (error) {
    logger.error(`Git controller error in initializeSite: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize site repository',
      error: error.message
    });
  }
};

/**
 * Start a change batch for a site
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.startChangeBatch = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { description } = req.body;
    
    if (!siteId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Site ID is required' 
      });
    }
    
    if (!description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Description is required' 
      });
    }
    
    // Create a unique batch ID
    const batchId = `batch-${Date.now()}`;
    
    // Initialize the change tracker
    const tracker = await gitIntegration.createChangeTracker(siteId);
    
    // Start the change batch
    const branchName = await tracker.startChangeBatch(batchId, description);
    
    res.status(200).json({
      success: true,
      message: `Successfully started change batch for site ${siteId}`,
      siteId,
      batchId,
      branchName
    });
  } catch (error) {
    logger.error(`Git controller error in startChangeBatch: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to start change batch',
      error: error.message
    });
  }
};

/**
 * Record a change within a batch
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.recordChange = async (req, res) => {
  try {
    const { siteId, batchId } = req.params;
    const { filePath, changeType, metadata } = req.body;
    
    if (!siteId || !batchId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Site ID and batch ID are required' 
      });
    }
    
    if (!filePath || !changeType) {
      return res.status(400).json({ 
        success: false, 
        message: 'File path and change type are required' 
      });
    }
    
    // Validate change type
    const validChangeTypes = Object.values(gitIntegration.ChangeType);
    if (!validChangeTypes.includes(changeType)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid change type. Must be one of: ${validChangeTypes.join(', ')}` 
      });
    }
    
    // Initialize the change tracker
    const tracker = await gitIntegration.createChangeTracker(siteId);
    
    // Record the change
    await tracker.recordChange(filePath, changeType, metadata || {});
    
    res.status(200).json({
      success: true,
      message: `Successfully recorded change for site ${siteId}`,
      siteId,
      batchId,
      filePath,
      changeType
    });
  } catch (error) {
    logger.error(`Git controller error in recordChange: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to record change',
      error: error.message
    });
  }
};

/**
 * Finalize a change batch
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.finalizeChangeBatch = async (req, res) => {
  try {
    const { siteId, batchId } = req.params;
    const { approved = true } = req.body;
    
    if (!siteId || !batchId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Site ID and batch ID are required' 
      });
    }
    
    // Initialize the change tracker
    const tracker = await gitIntegration.createChangeTracker(siteId);
    
    // Finalize the change batch
    const result = await tracker.finalizeChangeBatch(batchId, approved);
    
    res.status(200).json({
      success: true,
      message: `Successfully finalized change batch for site ${siteId}`,
      siteId,
      batchId,
      approved,
      result
    });
  } catch (error) {
    logger.error(`Git controller error in finalizeChangeBatch: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to finalize change batch',
      error: error.message
    });
  }
};

/**
 * Get change history for a site
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.getChangeHistory = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { limit = 50 } = req.query;
    
    if (!siteId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Site ID is required' 
      });
    }
    
    // Initialize the change tracker
    const tracker = await gitIntegration.createChangeTracker(siteId);
    
    // Get change history
    const history = await tracker.getChangeHistory(parseInt(limit, 10));
    
    res.status(200).json({
      success: true,
      siteId,
      history
    });
  } catch (error) {
    logger.error(`Git controller error in getChangeHistory: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get change history',
      error: error.message
    });
  }
};

/**
 * Roll back a change batch
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.rollbackChangeBatch = async (req, res) => {
  try {
    const { siteId, batchId } = req.params;
    
    if (!siteId || !batchId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Site ID and batch ID are required' 
      });
    }
    
    // Initialize the change tracker
    const tracker = await gitIntegration.createChangeTracker(siteId);
    
    // Roll back the change batch
    const result = await tracker.rollbackChangeBatch(batchId);
    
    res.status(200).json({
      success: true,
      message: `Successfully rolled back change batch for site ${siteId}`,
      siteId,
      batchId,
      result
    });
  } catch (error) {
    logger.error(`Git controller error in rollbackChangeBatch: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to roll back change batch',
      error: error.message
    });
  }
};

/**
 * List all site repositories
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.listSiteRepositories = async (req, res) => {
  try {
    const sites = await gitIntegration.listSiteRepositories();
    
    res.status(200).json({
      success: true,
      sites
    });
  } catch (error) {
    logger.error(`Git controller error in listSiteRepositories: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to list site repositories',
      error: error.message
    });
  }
};

/**
 * Test Git integration
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.testIntegration = async (req, res) => {
  try {
    const result = await gitIntegration.testGitIntegration();
    
    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    logger.error(`Git controller error in testIntegration: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: 'Git integration test failed',
      error: error.message
    });
  }
};
