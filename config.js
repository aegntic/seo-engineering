/**
 * Global Configuration
 * 
 * Central configuration for the SEO.engineering system
 * Uses environment variables with sensible defaults
 */

require('dotenv').config();

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/seo.engineering',
  
  // Authentication
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  
  // API keys
  N8N_API_KEY: process.env.N8N_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Automation configuration
  GIT_REPOS_PATH: process.env.GIT_REPOS_PATH || './repos',
  AUTO_PUSH_CHANGES: process.env.AUTO_PUSH_CHANGES === 'true',
  
  // Analytics and reporting
  ANALYTICS_ENABLED: process.env.ANALYTICS_ENABLED === 'true',
  REPORT_RETENTION_DAYS: parseInt(process.env.REPORT_RETENTION_DAYS || '90', 10),
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_TO_FILE: process.env.LOG_TO_FILE === 'true',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs/seo.engineering.log',
  
  // Performance
  MAX_CONCURRENT_SCANS: parseInt(process.env.MAX_CONCURRENT_SCANS || '5', 10),
  SCAN_TIMEOUT_MS: parseInt(process.env.SCAN_TIMEOUT_MS || '300000', 10), // 5 minutes
  
  // Feature flags
  ENABLE_IMAGE_OPTIMIZATION: process.env.ENABLE_IMAGE_OPTIMIZATION === 'true',
  ENABLE_AUTO_SCHEMA: process.env.ENABLE_AUTO_SCHEMA === 'true',
  ENABLE_CONTENT_OPTIMIZATION: process.env.ENABLE_CONTENT_OPTIMIZATION === 'true'
};