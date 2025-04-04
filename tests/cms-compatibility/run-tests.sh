#!/bin/bash

# CMS Compatibility Test Runner Script
# This script runs the CMS compatibility tests and displays the results

# Create reports directory if it doesn't exist
mkdir -p ./reports/cms-compatibility

# Display banner
echo "==============================================="
echo "  SEOAutomate CMS Compatibility Test Runner   "
echo "==============================================="
echo ""
echo "Starting tests at $(date)"
echo ""

# Run the tests
node ./tests/cms-compatibility/test-runner.js

# Check exit code
if [ $? -eq 0 ]; then
  echo ""
  echo "All tests completed successfully!"
else
  echo ""
  echo "Tests completed with errors. Please check the logs."
fi

# Display report location
echo ""
echo "Test reports are available at:"
echo "- ./reports/cms-compatibility/cms-compatibility-report.html (HTML)"
echo "- ./reports/cms-compatibility/cms-compatibility-report.json (JSON)"
echo "- ./reports/cms-compatibility/cms-compatibility-report.csv (CSV)"
echo ""
echo "Test completed at $(date)"
echo "==============================================="
