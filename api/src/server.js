/**
 * SEO.engineering API Server
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models and initialization functions
const { initializeModels } = require('./models');

// Import routes
const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const scanRoutes = require('./routes/scan.routes');
const issueRoutes = require('./routes/issue.routes');
const reportRoutes = require('./routes/report.routes');
const paymentRoutes = require('./routes/paymentRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS

// Special handling for Stripe webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    // Raw body needed for Stripe signature verification
    req.rawBody = '';
    req.on('data', chunk => {
      req.rawBody += chunk.toString();
    });
    req.on('end', () => {
      next();
    });
  } else {
    express.json()(req, res, next);
  }
});

app.use(morgan('dev')); // Request logging

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Initialize models with default data
    await initializeModels();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    apiVersion: '1.0.0',
    endpoints: [
      { path: '/api/auth', methods: ['POST'], description: 'Authentication endpoints' },
      { path: '/api/clients', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Client management' },
      { path: '/api/scans', methods: ['GET', 'POST'], description: 'SEO scan operations' },
      { path: '/api/issues', methods: ['GET', 'PUT'], description: 'SEO issue management' },
      { path: '/api/reports', methods: ['GET'], description: 'Report generation and retrieval' },
      { path: '/api/payments', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Payment processing and subscription management' }
    ],
    documentation: 'https://docs.seo.engineering.com/api'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Not Found',
      status: 404
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export for testing