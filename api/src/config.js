/**
 * SEOAutomate - Configuration
 * 
 * Central configuration file for the SEOAutomate system.
 * Loads environment variables and provides defaults.
 */

const path = require('path');
require('dotenv').config();

// Define configuration with defaults and environment variable overrides
const config = {
  // Server settings
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database settings
  DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/seoautomate',
  
  // JWT settings
  JWT_SECRET: process.env.JWT_SECRET || 'development-secret-key',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
  
  // Git integration settings
  REPOS_BASE_PATH: process.env.REPOS_BASE_PATH || path.join(process.cwd(), 'site-repos'),
  GIT_DEFAULT_AUTHOR: process.env.GIT_DEFAULT_AUTHOR || 'SEOAutomate <automation@seoautomate.com>',
  GIT_DEFAULT_BRANCH: process.env.GIT_DEFAULT_BRANCH || 'main',
  
  // Automation settings
  N8N_BASE_URL: process.env.N8N_BASE_URL || 'http://localhost:5678',
  N8N_API_KEY: process.env.N8N_API_KEY,
  
  // Playwright settings
  PLAYWRIGHT_TIMEOUT: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '30000', 10),
  
  // Logging settings
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Feature flags
  ENABLE_AUTOMATED_FIXES: process.env.ENABLE_AUTOMATED_FIXES === 'true',
  ENABLE_SCHEDULED_SCANS: process.env.ENABLE_SCHEDULED_SCANS === 'true',
  
  // Client limits
  MAX_SITES_PER_CLIENT: parseInt(process.env.MAX_SITES_PER_CLIENT || '10', 10),
  MAX_PAGES_PER_SCAN: parseInt(process.env.MAX_PAGES_PER_SCAN || '1000', 10)
};

// Validate critical configuration
function validateConfig() {
  const requiredInProduction = ['JWT_SECRET', 'DB_URI'];
  
  if (config.NODE_ENV === 'production') {
    const missing = requiredInProduction.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
    }
  }
}

// Only validate in server context
if (require.main === module.parent) {
  validateConfig();
}

module.exports = config;
