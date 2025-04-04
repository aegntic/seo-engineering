#!/bin/bash

# SEOAutomate Strategy Testing Script
# This script demonstrates the Strategy Recommendation Engine

# Use sample data from test-benchmark.sh
echo "Setting up test data..."
./test-benchmark.sh > /dev/null 2>&1

# Create output directory
mkdir -p ./strategy-output

# Run the strategy CLI tool
echo "Generating strategic recommendations..."
cd ./automation/competitor-analysis && \
  node ./cli/strategy.js generate \
    -c ../../test-data/benchmark/client-data.json \
    -o ../../test-data/benchmark/competitors-data.json \
    -h ../../test-data/benchmark/historical-data.json \
    -d ../../strategy-output \
    -t 6 \
    -r true

# Check if the strategy generation was successful
if [ $? -eq 0 ]; then
  echo -e "\n\033[32mStrategy generation completed successfully!\033[0m"
  echo -e "\nOutput files are in the ./strategy-output directory"
  
  # Find the most recent report file
  REPORT_FILE=$(find ../../strategy-output -name "strategy-report-*.md" -type f -printf "%T@ %p\n" | sort -n | tail -1 | cut -d' ' -f2-)
  
  if [ -n "$REPORT_FILE" ]; then
    echo -e "\nExecutive Summary from the strategy report:"
    echo "-------------------------------------------"
    # Find the Executive Summary section and display it
    sed -n '/^## Executive Summary/,/^##/p' "$REPORT_FILE" | head -n -1
    
    echo -e "\nImplementation Timeline:"
    echo "----------------------"
    # Find the Implementation Timeline section and display it
    sed -n '/^## Implementation Timeline/,/^###/p' "$REPORT_FILE" | head -n -1
    
    echo -e "\n...(see full report in $REPORT_FILE)..."
  fi
else
  echo -e "\n\033[31mStrategy generation failed\033[0m"
fi

echo -e "\nTest completed."
