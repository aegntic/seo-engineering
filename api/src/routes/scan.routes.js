/**
 * Scan Routes
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const scanController = require('../controllers/scan.controller');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// POST /api/scans/:clientId - Start a new SEO scan for a client
router.post('/:clientId', scanController.startScan);

// GET /api/scans/status/:reportId - Get scan status for a specific report
router.get('/status/:reportId', scanController.getScanStatus);

// GET /api/scans/history/:clientId - Get scan history for a client
router.get('/history/:clientId', scanController.getScanHistory);

// POST /api/scans/cancel/:reportId - Cancel an in-progress scan
router.post('/cancel/:reportId', scanController.cancelScan);

// POST /api/scans/schedule/:clientId - Schedule a recurring scan
router.post('/schedule/:clientId', scanController.scheduleScan);

module.exports = router;