/**
 * Error Handling Integration Module
 * 
 * Integrates error handling capabilities with existing modules.
 * 
 * Last updated: April 4, 2025
 */

const { createError, ErrorTypes, SeverityLevels, createSafeModule } = require('./index');
const { retryWithBackoff, withRetry } = require('./retry');
const { CircuitBreaker, globalRegistry: circuitRegistry } = require('./circuit-breaker');
const { RateLimiter, globalRegistry: rateLimiterRegistry } = require('./rate-limiter');
const logger = require('../logger');

/**
 * Applies error handling to the crawler module
 * 
 * @param {Object} crawler - Crawler module
 * @returns {Object} - Enhanced crawler module
 */
function enhanceCrawler(crawler) {
  // Create circuit breakers for external operations
  const crawlerCircuit = circuitRegistry.get('crawler', {
    failureThreshold: 3,
    resetTimeout: 60000
  });
  
  // Create rate limiters for crawler operations
  const crawlerRateLimiter = rateLimiterRegistry.get('crawler', {
    maxTokens: 10,        // 10 concurrent crawls
    refillRate: 0.2,      // 1 new token every 5 seconds
    waitForTokens: true   // Wait for tokens to become available
  });
  
  // Enhanced versions of crawler functions
  const enhancedCrawler = {
    ...crawler,
    
    // Crawl site with retry, circuit breaker, and rate limiting
    crawlSite: async (url, options = {}) => {
      try {
        // Apply rate limiting
        return await crawlerRateLimiter.execute(
          // Apply circuit breaker
          () => crawlerCircuit.exec(
            // Apply retry
            () => retryWithBackoff(
              () => crawler.crawlSite(url, options),
              {
                maxRetries: 3,
                initialDelay: 2000,
                shouldRetry: (error) => {
                  // Only retry network/timeout errors
                  return error.type === ErrorTypes.NETWORK || 
                         error.type === ErrorTypes.TIMEOUT;
                }
              }
            )
          )
        );
      } catch (error) {
        // Transform generic errors into structured errors
        if (!error.type) {
          // Detect error type based on message
          if (error.message.includes('timeout') || error.code === 'TIMEOUT') {
            throw createError('Crawl operation timed out', {
              type: ErrorTypes.TIMEOUT,
              severity: SeverityLevels.MEDIUM,
              originalError: error,
              module: 'crawler',
              operation: 'crawlSite',
              data: { url, options }
            });
          } else if (error.message.includes('network') || error.code === 'ENOTFOUND') {
            throw createError('Network error during crawl', {
              type: ErrorTypes.NETWORK,
              severity: SeverityLevels.MEDIUM,
              originalError: error,
              module: 'crawler',
              operation: 'crawlSite',
              data: { url, options }
            });
          } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
            throw createError('Crawler rate limit exceeded', {
              type: ErrorTypes.RATE_LIMIT,
              severity: SeverityLevels.MEDIUM,
              originalError: error,
              module: 'crawler',
              operation: 'crawlSite',
              data: { url, options, waitTime: error.waitTime }
            });
          } else if (error.code === 'CIRCUIT_OPEN') {
            throw createError('Crawler circuit breaker open', {
              type: ErrorTypes.EXTERNAL_SERVICE,
              severity: SeverityLevels.HIGH,
              originalError: error,
              module: 'crawler',
              operation: 'crawlSite',
              data: { url, options, lastFailure: error.lastFailure }
            });
          } else {
            throw createError('Error during site crawl', {
              type: ErrorTypes.INTERNAL,
              severity: SeverityLevels.MEDIUM,
              originalError: error,
              module: 'crawler',
              operation: 'crawlSite',
              data: { url, options }
            });
          }
        } else {
          // Already a structured error, rethrow
          throw error;
        }
      }
    },
    
    // Analyze page with retry and circuit breaker
    analyzePage: async (url, options = {}) => {
      try {
        // Apply circuit breaker
        return await crawlerCircuit.exec(
          // Apply retry
          () => retryWithBackoff(
            () => crawler.analyzePage(url, options),
            {
              maxRetries: 2,
              initialDelay: 1000,
              shouldRetry: (error) => {
                return error.type === ErrorTypes.NETWORK || 
                       error.type === ErrorTypes.TIMEOUT;
              }
            }
          )
        );
      } catch (error) {
        if (!error.type) {
          // Transform based on error patterns
          if (error.message.includes('timeout')) {
            throw createError('Page analysis timed out', {
              type: ErrorTypes.TIMEOUT,
              severity: SeverityLevels.MEDIUM,
              originalError: error,
              module: 'crawler',
              operation: 'analyzePage',
              data: { url, options }
            });
          } else {
            throw createError('Error analyzing page', {
              type: ErrorTypes.INTERNAL,
              severity: SeverityLevels.MEDIUM,
              originalError: error,
              module: 'crawler',
              operation: 'analyzePage',
              data: { url, options }
            });
          }
        } else {
          throw error;
        }
      }
    }
  };
  
  // Apply general error handling to remaining methods
  const safeCrawler = createSafeModule(enhancedCrawler, {
    rethrow: true, // Always rethrow errors after handling
    recovery: async (error) => {
      logger.info(`Attempting recovery for crawler error: ${error.message}`);
      // Any recovery logic for the module can go here
    }
  });
  
  return safeCrawler;
}

/**
 * Applies error handling to the fix implementation module
 * 
 * @param {Object} fixImplementation - Fix implementation module
 * @returns {Object} - Enhanced fix implementation module
 */
function enhanceFixImplementation(fixImplementation) {
  // Create circuit breaker for implementation operations
  const implementationCircuit = circuitRegistry.get('fixImplementation', {
    failureThreshold: 3,
    resetTimeout: 30000
  });
  
  // Enhanced functions
  const enhancedImplementation = {
    ...fixImplementation,
    
    // Implement fixes with circuit breaker and retry
    implementFixes: async (fixes, siteId, options = {}) => {
      try {
        return await implementationCircuit.exec(
          () => retryWithBackoff(
            () => fixImplementation.implementFixes(fixes, siteId, options),
            {
              maxRetries: 2,
              initialDelay: 2000,
              shouldRetry: (error) => {
                // Only retry certain types of errors
                return !error.message.includes('permission') && 
                       !error.message.includes('invalid');
              }
            }
          )
        );
      } catch (error) {
        if (!error.type) {
          if (error.message.includes('permission')) {
            throw createError('Permission denied during fix implementation', {
              type: ErrorTypes.AUTHORIZATION,
              severity: SeverityLevels.HIGH,
              originalError: error,
              module: 'fixImplementation',
              operation: 'implementFixes',
              data: { siteId, fixCount: fixes.length }
            });
          } else if (error.code === 'CIRCUIT_OPEN') {
            throw createError('Fix implementation circuit breaker open', {
              type: ErrorTypes.EXTERNAL_SERVICE,
              severity: SeverityLevels.HIGH,
              originalError: error,
              module: 'fixImplementation',
              operation: 'implementFixes',
              data: { siteId, fixCount: fixes.length, lastFailure: error.lastFailure }
            });
          } else {
            throw createError('Error implementing fixes', {
              type: ErrorTypes.INTERNAL,
              severity: SeverityLevels.HIGH,
              originalError: error,
              module: 'fixImplementation',
              operation: 'implementFixes',
              data: { siteId, fixCount: fixes.length }
            });
          }
        } else {
          throw error;
        }
      }
    },
    
    // Generate fixes with retry
    generateFixes: withRetry(
      fixImplementation.generateFixes,
      {
        maxRetries: 2,
        initialDelay: 1000
      }
    )
  };
  
  // Apply general error handling
  const safeImplementation = createSafeModule(enhancedImplementation, {
    rethrow: true,
    recovery: async (error) => {
      logger.info(`Attempting recovery for fix implementation error: ${error.message}`);
      // Recovery logic
    }
  });
  
  return safeImplementation;
}

/**
 * Applies error handling to the verification module
 * 
 * @param {Object} verification - Verification module
 * @returns {Object} - Enhanced verification module
 */
function enhanceVerification(verification) {
  // Create circuit breaker
  const verificationCircuit = circuitRegistry.get('verification', {
    failureThreshold: 3,
    resetTimeout: 30000
  });
  
  // Enhanced functions
  const enhancedVerification = {
    ...verification,
    
    // Verify site with circuit breaker and retry
    verifySite: async (options = {}) => {
      try {
        return await verificationCircuit.exec(
          () => retryWithBackoff(
            () => verification.verifySite(options),
            {
              maxRetries: 2,
              initialDelay: 2000,
              shouldRetry: (error) => {
                return error.type === ErrorTypes.NETWORK || 
                       error.type === ErrorTypes.TIMEOUT;
              }
            }
          )
        );
      } catch (error) {
        if (!error.type) {
          if (error.message.includes('timeout')) {
            throw createError('Verification timed out', {
              type: ErrorTypes.TIMEOUT,
              severity: SeverityLevels.MEDIUM,
              originalError: error,
              module: 'verification',
              operation: 'verifySite',
              data: { options }
            });
          } else if (error.code === 'CIRCUIT_OPEN') {
            throw createError('Verification circuit breaker open', {
              type: ErrorTypes.EXTERNAL_SERVICE,
              severity: SeverityLevels.HIGH,
              originalError: error,
              module: 'verification',
              operation: 'verifySite',
              data: { options, lastFailure: error.lastFailure }
            });
          } else {
            throw createError('Error during site verification', {
              type: ErrorTypes.INTERNAL,
              severity: SeverityLevels.MEDIUM,
              originalError: error,
              module: 'verification',
              operation: 'verifySite',
              data: { options }
            });
          }
        } else {
          throw error;
        }
      }
    }
  };
  
  // Apply general error handling
  const safeVerification = createSafeModule(enhancedVerification, {
    rethrow: true,
    recovery: async (error) => {
      logger.info(`Attempting recovery for verification error: ${error.message}`);
      // Recovery logic
    }
  });
  
  return safeVerification;
}

/**
 * Gets status information for all error handling components
 * 
 * @returns {Object} - Status information
 */
function getErrorHandlingStatus() {
  return {
    circuitBreakers: circuitRegistry.getStatuses(),
    rateLimiters: rateLimiterRegistry.getStatuses()
  };
}

module.exports = {
  enhanceCrawler,
  enhanceFixImplementation,
  enhanceVerification,
  getErrorHandlingStatus
};
