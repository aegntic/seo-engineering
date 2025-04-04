/**
 * Agency Routes Index
 * 
 * Aggregates and exports all agency-related routes.
 * Acts as the central routing hub for the agency module.
 */

const express = require('express');
const router = express.Router();

// Import route modules
const agencyRoutes = require('./agencyRoutes');
const clientRoutes = require('./clientRoutes');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');

// Register routes
router.use('/agencies', agencyRoutes);
router.use('/clients', clientRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);

module.exports = router;
