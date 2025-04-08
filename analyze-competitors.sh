#!/bin/bash

# SEO.engineering Competitor Analysis Script
# This script runs the competitor analysis module with the specified parameters.

# Script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
COMPETITOR_ANALYSIS_DIR="$SCRIPT_DIR/automation/competitor-analysis"

# Echo with color
function echo_color() {
  local color=$1
  local message=$2
  
  if [ "$color" == "green" ]; then
    echo -e "\033[0;32m$message\033[0m"
  elif [ "$color" == "blue" ]; then
    echo -e "\033[0;34m$message\033[0m"
  elif [ "$color" == "yellow" ]; then
    echo -e "\033[0;33m$message\033[0m"
  elif [ "$color" == "red" ]; then
    echo -e "\033[0;31m$message\033[0m"
  else
    echo "$message"
  fi
}

# Header
echo_color "blue" "====================================================="
echo_color "blue" "  SEO.engineering Competitor Analysis"
echo_color "blue" "====================================================="
echo ""

# Check if competitor analysis directory exists
if [ ! -d "$COMPETITOR_ANALYSIS_DIR" ]; then
  echo_color "red" "Error: Competitor Analysis directory not found at $COMPETITOR_ANALYSIS_DIR"
  exit 1
fi

# Check if the CLI script exists
if [ ! -f "$COMPETITOR_ANALYSIS_DIR/cli.js" ]; then
  echo_color "red" "Error: Competitor Analysis CLI script not found at $COMPETITOR_ANALYSIS_DIR/cli.js"
  exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
  echo_color "red" "Error: Node.js is not installed"
  exit 1
fi

# Set the working directory
cd "$COMPETITOR_ANALYSIS_DIR"

# Check for dependencies
if [ ! -d "node_modules" ]; then
  echo_color "yellow" "Installing dependencies..."
  npm install
fi

# Run the CLI script with all arguments passed to this script
node cli.js "$@"

# Return to original directory
cd - > /dev/null
