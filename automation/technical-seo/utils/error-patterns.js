/**
 * JavaScript Error Patterns
 * 
 * Common patterns of JavaScript errors for categorization and analysis.
 * These patterns help identify specific error types and provide targeted recommendations.
 */

const errorPatterns = [
  // Reference Errors
  {
    regex: /is not defined|Cannot read property .* of undefined|Cannot read property .* of null/i,
    category: 'referenceError',
    description: 'Accessing undefined variables or properties'
  },
  
  // Type Errors
  {
    regex: /is not a function|is not iterable|Cannot use .* operator|is not a constructor|doesn't have .* method/i,
    category: 'typeError',
    description: 'Operations on incompatible types'
  },
  
  // Syntax Errors
  {
    regex: /Unexpected token|Unexpected identifier|Unexpected end of input|Invalid or unexpected token|missing \)/i,
    category: 'syntaxError',
    description: 'Code with incorrect syntax'
  },
  
  // Resource Errors
  {
    regex: /Failed to load resource|404 \(Not Found\)|failed to load|CORS policy|blocked by CORS|No 'Access-Control-Allow-Origin'/i,
    category: 'resourceError',
    description: 'Issues loading external resources'
  },
  
  // Network Errors
  {
    regex: /Network Error|NetworkError|timeout|connection refused|socket|XMLHttpRequest/i,
    category: 'networkError',
    description: 'Network communication issues'
  },
  
  // Permission Errors
  {
    regex: /Permission denied|requires user gesture|blocked by client|security|access/i,
    category: 'permissionError',
    description: 'Browser permission or security issues'
  },
  
  // jQuery Errors
  {
    regex: /jQuery|jquery|\$\(/i,
    category: 'jqueryError',
    description: 'jQuery-specific issues'
  },
  
  // Promise/Async Errors
  {
    regex: /unhandled promise rejection|promise|async|await|then/i,
    category: 'asyncError',
    description: 'Issues with async code or promises'
  },
  
  // DOM Manipulation Errors
  {
    regex: /querySelector|getElementById|getElementsBy|appendChild|removeChild|insertBefore|DOMException/i,
    category: 'domError',
    description: 'Issues with DOM manipulation'
  },
  
  // Event Errors
  {
    regex: /addEventListener|removeEventListener|dispatchEvent|on\w+|event\./i,
    category: 'eventError',
    description: 'Issues with event handling'
  },
  
  // Mobile/Touch Errors
  {
    regex: /touch|gesture|swipe|orientation|mobile/i,
    category: 'touchError',
    description: 'Mobile-specific issues'
  },
  
  // Framework-specific errors
  {
    regex: /React|Vue|Angular|Ember|Backbone|Svelte/i,
    category: 'frameworkError',
    description: 'Framework-specific issues'
  }
];

module.exports = {
  errorPatterns
};
