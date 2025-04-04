# CMS Compatibility Testing Framework

This directory contains the testing framework for verifying SEOAutomate's compatibility with various Content Management Systems (CMS).

## Overview

The CMS Compatibility Testing Framework is designed to verify that SEOAutomate works correctly across different CMS platforms. It tests various aspects of SEOAutomate's functionality including crawling, analysis, automated fixes, and verification on platforms like WordPress, Shopify, Wix, Squarespace, and Joomla.

## Framework Structure

- `config.js` - Configuration file defining test parameters, CMS platforms, and reporting options
- `test-runner.js` - Main script that orchestrates the testing process
- `tests/` - Directory containing test implementations
  - `crawling/` - Tests for basic crawling functionality
  - `analysis/` - Tests for SEO analysis features
  - `fixes/` - Tests for automated fix implementation
  - `verification/` - Tests for changes verification

## Supported CMS Platforms

The framework supports testing on the following CMS platforms:

1. **WordPress** - The most popular CMS platform
2. **Shopify** - Leading e-commerce platform
3. **Wix** - Website builder with drag-and-drop interface
4. **Squarespace** - Design-focused website builder
5. **Joomla** - Content management system with enterprise features

## Test Features

The framework tests the following features across all supported platforms:

1. **Crawling**
   - Page discovery
   - Link following
   - Robot.txt compliance
   - Sitemap parsing

2. **Analysis**
   - Meta tags extraction
   - Heading structure analysis
   - Content analysis
   - Image optimization
   - Schema detection

3. **Fixes**
   - Meta tag updates
   - Heading restructuring
   - Image optimization
   - Schema markup enhancement
   - Robots.txt optimization

4. **Verification**
   - Pre/post comparison
   - Performance impact measurement
   - Regression detection

## Running Tests

To run the CMS compatibility tests:

```bash
cd ./SEOAutomate
node tests/cms-compatibility/test-runner.js
```

## Test Results

Test results are saved in the `reports/cms-compatibility` directory in multiple formats:

- JSON file with detailed test results
- HTML report for human-readable analysis
- CSV file for data processing and integration

## Adding New Tests

To add a new test:

1. Create a new JavaScript file in the appropriate subdirectory under `tests/`
2. Implement the `run(page, url, env)` function that returns a result object:
   ```js
   {
     success: boolean,
     message: string
   }
   ```
3. Add the test to the appropriate feature in `config.js`

## Adding New CMS Platforms

To add a new CMS platform:

1. Add a new platform object in the `platforms` array in `config.js`
2. Define test URLs, identifiers, and special cases for the new platform
3. Run the tests to verify compatibility

## Success Criteria

A CMS platform is considered compatible if all must-have tests pass successfully. The framework allows for some flexibility in non-critical tests, recognizing that different CMS platforms have different capabilities and limitations.

## Reporting Issues

If you encounter issues with specific CMS platforms, please report them with the following information:

1. CMS platform and version
2. Test that failed
3. Error message or log
4. Screenshots (if available)
5. Steps to reproduce

## Maintenance

This testing framework should be updated whenever:

1. New CMS platforms need to be supported
2. New SEOAutomate features are added
3. Existing CMS platforms make significant changes to their architecture
4. New tests are needed to verify functionality

## Documentation

For more detailed information about the testing framework and its components, refer to the main system documentation at `docs/system-documentation.md`.
