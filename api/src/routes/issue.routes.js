/**
 * Issue Routes
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const issueController = require('../controllers/issue.controller');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/issues/:reportId - Get all issues for a report
router.get('/:reportId', issueController.getIssues);

// GET /api/issues/:reportId/:issueId - Get a specific issue by ID
router.get('/:reportId/:issueId', issueController.getIssue);

// POST /api/issues/:reportId/:issueId/fix - Apply a fix for an issue
router.post('/:reportId/:issueId/fix', issueController.fixIssue);

// POST /api/issues/:reportId/fixes/bulk - Approve fixes in bulk
router.post('/:reportId/fixes/bulk', issueController.approveFixesBulk);

// POST /api/issues/:reportId/:issueId/ignore - Ignore an issue
router.post('/:reportId/:issueId/ignore', issueController.ignoreIssue);

module.exports = router;