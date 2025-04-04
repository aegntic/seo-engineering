/**
 * Verification System API Routes
 * 
 * RESTful endpoints for interacting with the verification system,
 * including triggering verifications and retrieving results.
 */

const express = require('express');
const router = express.Router();
const VerificationSystem = require('../../automation/verification');
const verificationController = require('../controllers/verificationController');
const authMiddleware = require('../middleware/auth');

// Initialize verification system
const verificationSystem = new VerificationSystem();

/**
 * @route   GET /api/verification/:siteId
 * @desc    Get verification results for a site
 * @access  Private
 */
router.get('/:siteId', authMiddleware, verificationController.getVerificationResults);

/**
 * @route   GET /api/verification/:siteId/history
 * @desc    Get verification history for a site
 * @access  Private
 */
router.get('/:siteId/history', authMiddleware, verificationController.getVerificationHistory);

/**
 * @route   POST /api/verification/:siteId
 * @desc    Trigger verification for a site
 * @access  Private
 */
router.post('/:siteId', authMiddleware, verificationController.triggerVerification);

/**
 * @route   GET /api/verification/:siteId/fix/:fixId
 * @desc    Get verification results for a specific fix
 * @access  Private
 */
router.get('/:siteId/fix/:fixId', authMiddleware, verificationController.getFixVerificationResults);

/**
 * @route   POST /api/verification/:siteId/fix/:fixId
 * @desc    Trigger verification for a specific fix
 * @access  Private
 */
router.post('/:siteId/fix/:fixId', authMiddleware, verificationController.triggerFixVerification);

/**
 * @route   GET /api/verification/screenshots/:verificationId
 * @desc    Get screenshots from a verification
 * @access  Private
 */
router.get('/screenshots/:verificationId', authMiddleware, verificationController.getVerificationScreenshots);

module.exports = router;
