/**
 * SEOAutomate - Git Routes
 * 
 * API routes for Git integration functionality.
 */

const express = require('express');
const gitController = require('../controllers/git.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/git/sites
 * @desc    Initialize a site repository
 * @access  Private
 */
router.post('/sites', authenticate, gitController.initializeSite);

/**
 * @route   GET /api/git/sites
 * @desc    List all site repositories
 * @access  Private
 */
router.get('/sites', authenticate, gitController.listSiteRepositories);

/**
 * @route   POST /api/git/sites/:siteId/batches
 * @desc    Start a change batch for a site
 * @access  Private
 */
router.post('/sites/:siteId/batches', authenticate, gitController.startChangeBatch);

/**
 * @route   POST /api/git/sites/:siteId/batches/:batchId/changes
 * @desc    Record a change within a batch
 * @access  Private
 */
router.post('/sites/:siteId/batches/:batchId/changes', authenticate, gitController.recordChange);

/**
 * @route   POST /api/git/sites/:siteId/batches/:batchId/finalize
 * @desc    Finalize a change batch
 * @access  Private
 */
router.post('/sites/:siteId/batches/:batchId/finalize', authenticate, gitController.finalizeChangeBatch);

/**
 * @route   GET /api/git/sites/:siteId/history
 * @desc    Get change history for a site
 * @access  Private
 */
router.get('/sites/:siteId/history', authenticate, gitController.getChangeHistory);

/**
 * @route   POST /api/git/sites/:siteId/batches/:batchId/rollback
 * @desc    Roll back a change batch
 * @access  Private
 */
router.post('/sites/:siteId/batches/:batchId/rollback', authenticate, gitController.rollbackChangeBatch);

/**
 * @route   GET /api/git/test
 * @desc    Test Git integration
 * @access  Private
 */
router.get('/test', authenticate, gitController.testIntegration);

module.exports = router;
