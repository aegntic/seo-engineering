# JavaScript Error Detector

## Overview

The JavaScript Error Detector module analyzes websites for JavaScript errors and issues that might affect user experience and search engine optimization. It provides comprehensive error detection, categorization, and actionable recommendations.

## Key Features

- Detection of JavaScript console errors
- Uncaught exception identification
- Failed resource request monitoring
- Error categorization and pattern matching
- Simulated user interaction to trigger potential errors
- Mobile-specific JavaScript error detection
- Detailed issue reporting with severity assessment
- Comprehensive recommendations for fixing issues

## How It Works

1. **Browser Initialization**: Launches a Playwright browser instance to analyze the target URL
2. **Error Collection**: Attaches listeners for console errors, uncaught exceptions, and failed requests
3. **Page Navigation**: Loads the page and monitors for errors during initial load
4. **Interaction Simulation**: Performs basic user interactions to trigger potential errors
5. **Mobile Testing**: Checks for JavaScript errors on mobile viewport
6. **Error Analysis**: Categorizes detected errors using pattern matching
7. **Issue Generation**: Converts raw errors into actionable SEO issues
8. **Scoring**: Calculates a score based on error severity and frequency

## Usage

```javascript
const JSErrorDetector = require('./analyzers/js-error-detector');

// Run the detector on a specific URL
const results = await JSErrorDetector.detect('https://example.com', {
  simulateInteraction: true,  // Optional: simulate user interactions
  checkMobile: true,          // Optional: check mobile-specific errors
  timeout: 30000              // Optional: navigation timeout in ms
});

// Access results
console.log(`Score: ${results.score}/100`);
console.log(`Total Errors: ${results.metrics.totalErrors}`);
console.log(`Issues: ${results.issues.length}`);
```

## Integration with SEO.engineering

The JavaScript Error Detector is fully integrated with the Technical SEO module in SEO.engineering. When enabled, it will:

1. Run as part of the comprehensive technical SEO audit
2. Contribute issues to the overall issue list
3. Add its score to the overall technical SEO score
4. Provide summary information for the report

To enable/disable it in a technical SEO audit, use:

```javascript
const { runTechnicalSeoAudit } = require('../technical-seo');

const results = await runTechnicalSeoAudit('https://example.com', {
  checks: {
    javascriptErrors: true  // Enable JavaScript error detection
  }
});
```

## Testing

A dedicated test script is available in the tests directory:

```bash
node tests/test-js-error-detector.js https://example.com
```

The test script will run the detector and save detailed results to the test-results directory.

## Error Categories

The detector identifies and categorizes these common JavaScript error types:

- **Reference Errors**: Undefined variables or properties
- **Type Errors**: Operations on incompatible types
- **Syntax Errors**: Code with incorrect syntax
- **Resource Errors**: Issues loading external resources
- **Network Errors**: Network communication issues
- **Permission Errors**: Browser permission or security issues
- **jQuery Errors**: jQuery-specific issues
- **Async Errors**: Issues with async code or promises
- **DOM Errors**: Issues with DOM manipulation
- **Event Errors**: Issues with event handling
- **Touch Errors**: Mobile-specific issues
- **Framework Errors**: Framework-specific issues

## Future Enhancements

- Integration with fix implementation system for automatic JavaScript error correction
- Enhanced error pattern recognition
- More sophisticated user interaction simulation
- Support for advanced framework-specific error detection
