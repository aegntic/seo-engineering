/**
 * Agency Routes
 * 
 * Defines API endpoints for agency management operations.
 * Maps HTTP requests to controller methods.
 */

const express = require('express');
const router = express.Router();
const { AgencyController } = require('../../controllers/agency');
const { authenticate, authorizeAgency, validateSchema } = require('../../middleware');
const { agencySchema } = require('../../validation/agencySchemas');

/**
 * @route   GET /api/agency/agencies/:id
 * @desc    Get agency by ID
 * @access  Private (Admin)
 */
router.get(
  '/:id',
  authenticate,
  authorizeAgency('agencies', 'view'),
  AgencyController.getAgency
);

/**
 * @route   POST /api/agency/agencies
 * @desc    Create new agency
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  validateSchema(agencySchema.create),
  authorizeAgency('agencies', 'create'),
  AgencyController.createAgency
);

/**
 * @route   PUT /api/agency/agencies/:id
 * @desc    Update agency
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  validateSchema(agencySchema.update),
  authorizeAgency('agencies', 'edit'),
  AgencyController.updateAgency
);

/**
 * @route   PUT /api/agency/agencies/:id/white-label
 * @desc    Update agency white label settings
 * @access  Private (Admin)
 */
router.put(
  '/:id/white-label',
  authenticate,
  validateSchema(agencySchema.whiteLabelSettings),
  authorizeAgency('agencies', 'edit'),
  AgencyController.updateWhiteLabelSettings
);

/**
 * @route   GET /api/agency/agencies/:id/metrics
 * @desc    Get agency dashboard metrics
 * @access  Private (Agency users)
 */
router.get(
  '/:id/metrics',
  authenticate,
  authorizeAgency('dashboard', 'view'),
  AgencyController.getAgencyMetrics
);

module.exports = router;
