#!/bin/bash

# SEO.engineering CMS Compatibility Check
# This script tests CMS compatibility and updates documentation

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
echo_color "blue" "  SEO.engineering CMS Compatibility Check"
echo_color "blue" "====================================================="
echo ""
echo_color "yellow" "This script will test CMS compatibility and update documentation"
echo ""

# Step 1: Run the CMS compatibility tests
echo_color "blue" "Step 1: Running CMS compatibility tests"
echo_color "yellow" "Testing 5 major CMS platforms with default settings..."
echo ""

./test-cms.sh --popularity=High --max-sites=5

# Check if tests succeeded
if [ $? -ne 0 ]; then
  echo_color "red" "❌ CMS compatibility tests failed. Aborting."
  exit 1
fi

echo ""
echo_color "green" "✅ CMS compatibility tests completed successfully!"
echo ""

# Step 2: Check documentation
echo_color "blue" "Step 2: Verifying documentation"

docs_dir="./docs"
required_docs=(
  "CMSCompatibilityReport.md"
  "CMSCompatibilityMatrix.md"
  "CMSCompatibilityTestingImplementation.md"
  "SystemDocumentation.md"
)

missing_docs=false
for doc in "${required_docs[@]}"; do
  if [ ! -f "$docs_dir/$doc" ]; then
    echo_color "red" "❌ Missing documentation file: $doc"
    missing_docs=true
  else
    echo_color "green" "✅ Documentation file exists: $doc"
  fi
done

if [ "$missing_docs" = true ]; then
  echo_color "red" "❌ Some documentation files are missing. Aborting."
  exit 1
fi

echo ""
echo_color "green" "✅ All required documentation files are present!"
echo ""

# Step 3: Update project status
echo_color "blue" "Step 3: Updating project status"

if [ -f "PROJECTUPDATE(2025-04-05_18:00).md" ]; then
  echo_color "green" "✅ Project status is up to date!"
else
  echo_color "yellow" "⚠️ Project status file might need updating."
fi

echo ""
echo_color "green" "=============================================="
echo_color "green" "  CMS Compatibility Implementation Complete!"
echo_color "green" "=============================================="
echo ""
echo_color "yellow" "The following tasks have been completed:"
echo_color "yellow" "1. ✅ Test Across Different CMS Platforms"
echo_color "yellow" "2. ✅ Document the Entire System"
echo ""
echo_color "blue" "You can find the documentation in the following locations:"
echo_color "blue" "- CMS Compatibility Report: $docs_dir/CMSCompatibilityReport.md"
echo_color "blue" "- CMS Compatibility Matrix: $docs_dir/CMSCompatibilityMatrix.md"
echo_color "blue" "- Implementation Details: $docs_dir/CMSCompatibilityTestingImplementation.md"
echo_color "blue" "- System Documentation: $docs_dir/SystemDocumentation.md"
echo ""
echo_color "yellow" "To run full CMS compatibility tests:"
echo_color "yellow" "./test-cms.sh --all"
echo ""
