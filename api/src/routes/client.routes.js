/**
 * Client Routes
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const clientController = require('../controllers/client.controller');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/clients - Get all clients for the authenticated user
router.get('/', clientController.getClients);

// GET /api/clients/:id - Get a single client by ID
router.get('/:id', clientController.getClient);

// POST /api/clients - Create a new client
router.post('/', clientController.createClient);

// PUT /api/clients/:id - Update a client
router.put('/:id', clientController.updateClient);

// DELETE /api/clients/:id - Delete a client
router.delete('/:id', clientController.deleteClient);

// GET /api/clients/:id/summary - Get client SEO score and summary
router.get('/:id/summary', clientController.getClientSummary);

// PUT /api/clients/:id/crawl-settings - Update client crawl settings
router.put('/:id/crawl-settings', clientController.updateCrawlSettings);

module.exports = router;