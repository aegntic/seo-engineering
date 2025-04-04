/**
 * Strategy Module
 * 
 * This module provides services for generating strategic SEO recommendations
 * based on benchmark comparison and gap analysis data.
 */

const StrategyService = require('./strategy-service');
const StrategyVisualizationService = require('./visualization-service');

module.exports = {
  StrategyService,
  StrategyVisualizationService,
  createStrategyService: (options = {}) => new StrategyService(options)
};
