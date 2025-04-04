/**
 * Error Handling Example
 * 
 * Demonstrates how to use the error handling system.
 * 
 * Last updated: April 4, 2025
 */

const automation = require('../index');
const errorHandler = automation.errorHandler;
const { ErrorTypes, SeverityLevels } = errorHandler;

/**
 * Example function that may fail
 */
async function riskyOperation() {
  // Simulate a 50% chance of failure
  if (Math.random() < 0.5) {
    throw new Error('Something went wrong');
  }
  
  return 'Operation succeeded';
}

/**
 * Example with retry mechanism
 */
async function withRetryExample() {
  console.log('Example 1: Using retry with backoff');
  
  try {
    // Retry the risky operation up to 3 times
    const result = await errorHandler.retry(riskyOperation, {
      maxRetries: 3,
      initialDelay: 1000,
      factor: 2,
      jitter: true
    });
    
    console.log('Result:', result);
  } catch (error) {
    console.error('All retries failed:', error.message);
  }
}

/**
 * Example with circuit breaker
 */
async function withCircuitBreakerExample() {
  console.log('\nExample 2: Using circuit breaker');
  
  // Create a circuit breaker
  const { CircuitBreaker } = require('../utils/error-handling/circuit-breaker');
  const breaker = new CircuitBreaker({
    failureThreshold: 2,
    resetTimeout: 5000
  });
  
  // Try multiple operations
  for (let i = 0; i < 5; i++) {
    try {
      const result = await breaker.exec(riskyOperation);
      console.log(`Attempt ${i + 1}: Success -`, result);
    } catch (error) {
      if (error.code === 'CIRCUIT_OPEN') {
        console.error(`Attempt ${i + 1}: Circuit open, failing fast`);
      } else {
        console.error(`Attempt ${i + 1}: Failed -`, error.message);
      }
    }
    
    // Wait a bit between attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Example with rate limiting
 */
async function withRateLimiterExample() {
  console.log('\nExample 3: Using rate limiter');
  
  // Create a rate limiter
  const { RateLimiter } = require('../utils/error-handling/rate-limiter');
  const limiter = new RateLimiter({
    maxTokens: 3,           // Only 3 operations allowed
    refillRate: 0.5,         // 1 token every 2 seconds
    waitForTokens: false     // Don't wait for tokens
  });
  
  // Try multiple operations in quick succession
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push((async () => {
      try {
        const result = await limiter.execute(() => {
          console.log(`Operation ${i + 1} executing at ${new Date().toISOString()}`);
          return `Operation ${i + 1} completed`;
        });
        console.log(`Result ${i + 1}:`, result);
      } catch (error) {
        if (error.code === 'RATE_LIMIT_EXCEEDED') {
          console.error(`Operation ${i + 1}: Rate limited - try again in ${error.waitTime}ms`);
        } else {
          console.error(`Operation ${i + 1}: Failed -`, error.message);
        }
      }
    })());
  }
  
  await Promise.all(promises);
}

/**
 * Example of creating and handling structured errors
 */
async function structuredErrorExample() {
  console.log('\nExample 4: Structured error handling');
  
  try {
    // Simulate an API call that fails
    throw new Error('API returned 404 for user profile');
  } catch (originalError) {
    // Create a structured error
    const structuredError = errorHandler.createError(
      'Failed to fetch user profile',
      {
        type: ErrorTypes.RESOURCE_NOT_FOUND,
        severity: SeverityLevels.MEDIUM,
        originalError,
        module: 'userService',
        operation: 'getProfile',
        data: { userId: '12345' }
      }
    );
    
    // Handle the error
    await errorHandler.handleError(structuredError, {
      notify: false,
      rethrow: false,
      recovery: async (error) => {
        console.log('Attempting recovery for:', error.message);
        console.log('Recovery would happen here...');
      }
    });
  }
}

/**
 * Example of error handling in the automation workflow
 */
async function automationWorkflowExample() {
  console.log('\nExample 5: Error handling in automation workflow');
  
  try {
    // Run the workflow with a URL that will likely fail
    const result = await automation.runAutomationWorkflow(
      'https://non-existent-site-123456789.com',
      { analysisOnly: true }
    );
    
    console.log('Workflow completed:', result);
  } catch (error) {
    console.error('Workflow failed:', error.message);
    
    if (error.type) {
      console.error('Error type:', error.type);
      console.error('Severity:', error.severity);
      console.error('Module:', error.module);
      console.error('Operation:', error.operation);
    }
    
    if (error.originalError) {
      console.error('Original error:', error.originalError.message);
    }
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  try {
    // Configure environment for examples
    process.env.NODE_ENV = 'development';
    
    console.log('===== ERROR HANDLING EXAMPLES =====');
    
    await withRetryExample();
    await withCircuitBreakerExample();
    await withRateLimiterExample();
    await structuredErrorExample();
    await automationWorkflowExample();
    
    console.log('\n===== ALL EXAMPLES COMPLETED =====');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples
runExamples();
