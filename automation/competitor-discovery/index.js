/**
 * Competitor Discovery Module Entry Point
 * 
 * This module is responsible for discovering and analyzing competitors for a given website.
 */

const express = require('express');
const { competitorDiscoveryController } = require('./controllers/competitor-discovery-controller');
const { validateRequest, authenticateRequest } = require('./utils/middleware');
const logger = require('./utils/logger');

// Create a router for the competitor discovery API
const router = express.Router();

// Initialize the module
function initialize(app, config) {
  logger.info('Initializing Competitor Discovery Module');
  
  // Register routes
  router.post('/discover', 
    authenticateRequest, 
    validateRequest, 
    competitorDiscoveryController.startDiscovery);
  
  router.get('/status/:id', 
    authenticateRequest, 
    competitorDiscoveryController.getDiscoveryStatus);
  
  router.get('/results/:id', 
    authenticateRequest, 
    competitorDiscoveryController.getDiscoveryResults);
  
  router.get('/competitors/:siteId', 
    authenticateRequest, 
    competitorDiscoveryController.getCompetitors);
  
  router.get('/profile/:siteId/:competitorId', 
    authenticateRequest, 
    competitorDiscoveryController.getCompetitorProfile);

  // Register the router with the app
  app.use('/api/competitor-discovery', router);
  
  logger.info('Competitor Discovery Module initialized');
  
  // Return the module's public API
  return {
    router,
    discover: competitorDiscoveryController.startDiscoveryProgrammatic
  };
}

module.exports = {
  initialize
};
