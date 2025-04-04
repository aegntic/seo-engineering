/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by stopping repeated calls to failing services.
 * 
 * Last updated: April 4, 2025
 */

const logger = require('../logger');

/**
 * Circuit breaker states
 */
const CircuitState = {
  CLOSED: 'closed',        // Normal operation, requests pass through
  OPEN: 'open',            // Circuit is open, requests fail fast
  HALF_OPEN: 'half-open'   // Testing if the service has recovered
};

/**
 * Circuit Breaker implementation
 */
class CircuitBreaker {
  /**
   * Creates a new circuit breaker
   * 
   * @param {Object} options - Circuit breaker options
   * @param {number} options.failureThreshold - Number of failures before opening (default: 5)
   * @param {number} options.resetTimeout - Time in ms before attempting reset (default: 30000)
   * @param {number} options.halfOpenSuccessThreshold - Successes needed to close circuit (default: 2)
   * @param {function} options.onStateChange - Callback for state changes
   */
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.halfOpenSuccessThreshold = options.halfOpenSuccessThreshold || 2;
    this.onStateChange = options.onStateChange;
    
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    this.lastFailure = null;
  }
  
  /**
   * Executes a function with circuit breaker protection
   * 
   * @param {function} fn - Function to execute
   * @param {Object} options - Execution options
   * @param {Array} options.args - Arguments to pass to the function
   * @returns {Promise<*>} - Result of the function
   * @throws {Error} - If circuit is open or function fails
   */
  async exec(fn, options = {}) {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        const error = new Error('Circuit is open, failing fast');
        error.code = 'CIRCUIT_OPEN';
        error.lastFailure = this.lastFailure;
        throw error;
      }
      
      this.setState(CircuitState.HALF_OPEN);
    }
    
    try {
      const result = await fn(...(options.args || []));
      
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }
  
  /**
   * Handles successful execution
   */
  onSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.halfOpenSuccessThreshold) {
        this.setState(CircuitState.CLOSED);
      }
    }
    
    if (this.state === CircuitState.CLOSED) {
      // Reset failure count after some continuous successes
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }
  
  /**
   * Handles failed execution
   * 
   * @param {Error} error - Error that occurred
   */
  onFailure(error) {
    this.lastFailure = {
      timestamp: Date.now(),
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    };
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.setState(CircuitState.OPEN);
      return;
    }
    
    if (this.state === CircuitState.CLOSED) {
      this.failureCount++;
      
      if (this.failureCount >= this.failureThreshold) {
        this.setState(CircuitState.OPEN);
      }
    }
  }
  
  /**
   * Changes the circuit state
   * 
   * @param {string} newState - New state from CircuitState
   */
  setState(newState) {
    if (this.state === newState) {
      return;
    }
    
    const oldState = this.state;
    this.state = newState;
    
    if (newState === CircuitState.OPEN) {
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
    
    if (newState === CircuitState.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
    }
    
    if (newState === CircuitState.HALF_OPEN) {
      this.successCount = 0;
    }
    
    logger.info(`Circuit state changed from ${oldState} to ${newState}`);
    
    if (typeof this.onStateChange === 'function') {
      this.onStateChange({
        oldState,
        newState,
        failureCount: this.failureCount,
        successCount: this.successCount,
        nextAttempt: this.nextAttempt,
        lastFailure: this.lastFailure
      });
    }
  }
  
  /**
   * Gets current circuit breaker status
   * 
   * @returns {Object} - Current status
   */
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt,
      lastFailure: this.lastFailure
    };
  }
  
  /**
   * Forces the circuit to a specific state
   * 
   * @param {string} state - State to force from CircuitState
   */
  forceState(state) {
    if (Object.values(CircuitState).includes(state)) {
      this.setState(state);
    } else {
      throw new Error(`Invalid circuit state: ${state}`);
    }
  }
}

/**
 * Circuit breaker registry to manage multiple circuit breakers
 */
class CircuitBreakerRegistry {
  constructor() {
    this.breakers = new Map();
  }
  
  /**
   * Gets or creates a circuit breaker by name
   * 
   * @param {string} name - Circuit breaker name
   * @param {Object} options - Circuit breaker options
   * @returns {CircuitBreaker} - Circuit breaker instance
   */
  get(name, options = {}) {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(options));
    }
    
    return this.breakers.get(name);
  }
  
  /**
   * Gets all circuit breaker statuses
   * 
   * @returns {Object} - Map of circuit breaker statuses
   */
  getStatuses() {
    const statuses = {};
    
    for (const [name, breaker] of this.breakers.entries()) {
      statuses[name] = breaker.getStatus();
    }
    
    return statuses;
  }
  
  /**
   * Resets all circuit breakers to closed state
   */
  resetAll() {
    for (const breaker of this.breakers.values()) {
      breaker.forceState(CircuitState.CLOSED);
    }
  }
}

// Create a global registry
const globalRegistry = new CircuitBreakerRegistry();

module.exports = {
  CircuitState,
  CircuitBreaker,
  CircuitBreakerRegistry,
  globalRegistry
};
