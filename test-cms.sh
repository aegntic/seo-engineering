#!/bin/bash

# SEO.engineering CMS Testing Script
# This script runs the CMS compatibility tests with configurable options

# Default values
MAX_SITES=5
DEPTH=2
CONCURRENCY=2
CATEGORY=""
POPULARITY="High"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --help|-h)
      echo "SEO.engineering CMS Testing Script"
      echo "==============================="
      echo ""
      echo "Usage: ./test-cms.sh [options]"
      echo ""
      echo "Options:"
      echo "  --help, -h                 Show this help"
      echo "  --all                      Test all CMS platforms"
      echo "  --category=VALUE           Filter by category (comma-separated)"
      echo "  --popularity=VALUE         Filter by popularity (comma-separated)"
      echo "  --max-sites=NUMBER         Limit the number of sites tested"
      echo "  --depth=NUMBER             Set crawl depth (default: 2)"
      echo "  --concurrency=NUMBER       Set concurrency level (default: 2)"
      echo "  --list-categories          List available categories"
      echo "  --list-sites               List all available test sites"
      echo ""
      echo "Examples:"
      echo "  ./test-cms.sh --category=\"E-commerce,Major CMS\" --depth=3"
      echo "  ./test-cms.sh --popularity=High --max-sites=5"
      echo "  ./test-cms.sh --all"
      exit 0
      ;;
    --all)
      MAX_SITES=20
      CATEGORY=""
      POPULARITY=""
      shift
      ;;
    --category=*)
      CATEGORY="${1#*=}"
      shift
      ;;
    --popularity=*)
      POPULARITY="${1#*=}"
      shift
      ;;
    --max-sites=*)
      MAX_SITES="${1#*=}"
      shift
      ;;
    --depth=*)
      DEPTH="${1#*=}"
      shift
      ;;
    --concurrency=*)
      CONCURRENCY="${1#*=}"
      shift
      ;;
    --list-categories)
      echo "Listing available categories..."
      node ./automation/crawler/cms-test.js --list-categories
      exit 0
      ;;
    --list-sites)
      echo "Listing available test sites..."
      node ./automation/crawler/cms-test.js --list-sites
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help to see available options"
      exit 1
      ;;
  esac
done

# Build command arguments
CMD_ARGS=""

if [ ! -z "$CATEGORY" ]; then
  CMD_ARGS="$CMD_ARGS --category \"$CATEGORY\""
fi

if [ ! -z "$POPULARITY" ]; then
  CMD_ARGS="$CMD_ARGS --popularity \"$POPULARITY\""
fi

if [ ! -z "$MAX_SITES" ]; then
  CMD_ARGS="$CMD_ARGS --max-sites $MAX_SITES"
fi

CMD_ARGS="$CMD_ARGS --depth $DEPTH --concurrency $CONCURRENCY"

# Print configuration
echo "SEO.engineering CMS Testing"
echo "======================="
echo ""
echo "Configuration:"
echo "- Max sites: $MAX_SITES"
echo "- Test depth: $DEPTH"
echo "- Concurrency: $CONCURRENCY"
if [ ! -z "$CATEGORY" ]; then
  echo "- Categories: $CATEGORY"
fi
if [ ! -z "$POPULARITY" ]; then
  echo "- Popularity: $POPULARITY"
fi
echo ""

# Execute tests
echo "Starting CMS tests..."
eval "node ./automation/crawler/cms-test.js $CMD_ARGS"

# Check if tests were successful
if [ $? -eq 0 ]; then
  echo ""
  echo "CMS tests completed successfully!"
  echo "Check the documentation in ./docs/ for test reports"
else
  echo ""
  echo "CMS tests failed. Please check the error messages above."
  exit 1
fi
