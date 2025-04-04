/**
 * Report Routes
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const reportController = require('../controllers/report.controller');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/reports/:id - Get a specific report by ID
router.get('/:id', reportController.getReport);

// GET /api/reports/client/:clientId - Get all reports for a client
router.get('/client/:clientId', reportController.getClientReports);

// POST /api/reports/:id/pdf - Generate a PDF report
router.post('/:id/pdf', reportController.generatePdfReport);

// GET /api/reports/compare - Compare two reports
router.get('/compare', reportController.compareReports);

// GET /api/reports/:id/insights - Get insights and recommendations from the report
router.get('/:id/insights', reportController.getInsights);

module.exports = router;