/**
 * Competitor Discovery Module Server
 * 
 * This server runs the competitor discovery module as a standalone application.
 */

const express = require('express');
const mongoose = require('mongoose');
const { initialize } = require('./index');
const { errorHandler, rateLimiter } = require('./utils/middleware');
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Initialize module
const competitorDiscovery = initialize(app);

// Error handling
app.use(errorHandler);

// Get MongoDB connection string from environment variables
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/seoautomate';

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => {
    logger.info('Connected to MongoDB');
    
    // Start server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logger.info(`Competitor Discovery Module server running on port ${port}`);
    });
  })
  .catch(error => {
    logger.error(`MongoDB connection error: ${error.message}`, { error });
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Close server and database connections
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error(`Uncaught exception: ${error.message}`, { error });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', { reason });
  process.exit(1);
});
