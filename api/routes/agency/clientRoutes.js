/**
 * Client Routes
 * 
 * Defines API endpoints for client management within an agency.
 * Maps HTTP requests to controller methods.
 */

const express = require('express');
const router = express.Router();
const { ClientController } = require('../../controllers/agency');
const { authenticate, authorizeAgency, validateSchema } = require('../../middleware');
const { clientSchema } = require('../../validation/clientSchemas');

/**
 * @route   GET /api/agency/clients
 * @desc    Get all clients for agency
 * @access  Private (Agency users)
 */
router.get(
  '/',
  authenticate,
  authorizeAgency('clients', 'view'),
  ClientController.getClients
);

/**
 * @route   GET /api/agency/clients/:id
 * @desc    Get client by ID
 * @access  Private (Agency users)
 */
router.get(
  '/:id',
  authenticate,
  authorizeAgency('clients', 'view'),
  ClientController.getClient
);

/**
 * @route   POST /api/agency/clients
 * @desc    Create new client
 * @access  Private (Agency users with create permission)
 */
router.post(
  '/',
  authenticate,
  validateSchema(clientSchema.create),
  authorizeAgency('clients', 'create'),
  ClientController.createClient
);

/**
 * @route   PUT /api/agency/clients/:id
 * @desc    Update client
 * @access  Private (Agency users with edit permission)
 */
router.put(
  '/:id',
  authenticate,
  validateSchema(clientSchema.update),
  authorizeAgency('clients', 'edit'),
  ClientController.updateClient
);

/**
 * @route   DELETE /api/agency/clients/:id
 * @desc    Delete client
 * @access  Private (Agency users with delete permission)
 */
router.delete(
  '/:id',
  authenticate,
  authorizeAgency('clients', 'delete'),
  ClientController.deleteClient
);

/**
 * @route   POST /api/agency/clients/bulk
 * @desc    Perform bulk action on clients
 * @access  Private (Agency users with appropriate permissions)
 */
router.post(
  '/bulk',
  authenticate,
  validateSchema(clientSchema.bulkAction),
  authorizeAgency('clients', 'edit'),
  ClientController.bulkAction
);

module.exports = router;
