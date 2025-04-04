/**
 * Main API Routes
 * 
 * Central routing configuration that aggregates all API routes.
 * Provides a unified entry point for the API.
 */

const express = require('express');
const router = express.Router();

// Import module routes
const authRoutes = require('./auth');
const agencyRoutes = require('./agency');
const seoRoutes = require('./seo');
const webhookRoutes = require('./webhooks');
// Add other route modules as needed

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// Register routes
router.use('/auth', authRoutes);
router.use('/agency', agencyRoutes);
router.use('/seo', seoRoutes);
router.use('/webhooks', webhookRoutes);
// Add other route modules as needed

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

module.exports = router;
