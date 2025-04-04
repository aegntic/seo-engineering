#!/bin/bash

# Test Gap Analysis Module
# This script runs a test of the gap analysis module with sample data.

# Set script to exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Testing Gap Analysis Module =====${NC}"

# Create test directories
TEMP_DIR="./test-data"
OUTPUT_DIR="./test-output"

echo -e "${YELLOW}Creating test directories...${NC}"
mkdir -p $TEMP_DIR
mkdir -p $OUTPUT_DIR

# Create sample test data
echo -e "${YELLOW}Creating sample test data...${NC}"
cat > $TEMP_DIR/sample-data.json << EOL
{
  "clientData": {
    "summary": {
      "pagesAnalyzed": 50,
      "averagePerformance": {
        "domContentLoaded": 1500,
        "load": 3000,
        "firstPaint": 1000
      },
      "contentStats": {
        "averageTitleLength": 45,
        "averageDescriptionLength": 120,
        "headingsDistribution": {
          "h1": 45,
          "h2": 120,
          "h3": 200
        }
      },
      "seoHealth": {
        "missingTitlesPercent": 10,
        "missingDescriptionsPercent": 15,
        "hasSchemaMarkupPercent": 30,
        "hasCanonicalPercent": 80,
        "hasMobileViewportPercent": 90
      }
    },
    "seo": {
      "images": {
        "withAlt": 120,
        "withoutAlt": 40
      },
      "links": {
        "internal": 450,
        "external": 100
      }
    }
  },
  "competitorsData": {
    "https://competitor1.com": {
      "summary": {
        "pagesAnalyzed": 60,
        "averagePerformance": {
          "domContentLoaded": 1200,
          "load": 2500,
          "firstPaint": 800
        },
        "contentStats": {
          "averageTitleLength": 55,
          "averageDescriptionLength": 145,
          "headingsDistribution": {
            "h1": 58,
            "h2": 150,
            "h3": 250
          }
        },
        "seoHealth": {
          "missingTitlesPercent": 5,
          "missingDescriptionsPercent": 8,
          "hasSchemaMarkupPercent": 60,
          "hasCanonicalPercent": 90,
          "hasMobileViewportPercent": 95
        }
      },
      "seo": {
        "images": {
          "withAlt": 180,
          "withoutAlt": 20
        },
        "links": {
          "internal": 600,
          "external": 120
        }
      }
    },
    "https://competitor2.com": {
      "summary": {
        "pagesAnalyzed": 45,
        "averagePerformance": {
          "domContentLoaded": 1100,
          "load": 2300,
          "firstPaint": 750
        },
        "contentStats": {
          "averageTitleLength": 52,
          "averageDescriptionLength": 150,
          "headingsDistribution": {
            "h1": 43,
            "h2": 130,
            "h3": 220
          }
        },
        "seoHealth": {
          "missingTitlesPercent": 3,
          "missingDescriptionsPercent": 7,
          "hasSchemaMarkupPercent": 50,
          "hasCanonicalPercent": 85,
          "hasMobileViewportPercent": 100
        }
      },
      "seo": {
        "images": {
          "withAlt": 150,
          "withoutAlt": 10
        },
        "links": {
          "internal": 550,
          "external": 90
        }
      }
    }
  },
  "keywords": ["seo", "technical seo", "seo automation", "seo tools"]
}
EOL

# Run gap analysis
echo -e "${YELLOW}Running gap analysis...${NC}"
./analyze-gaps.sh --input $TEMP_DIR/sample-data.json --output $OUTPUT_DIR --visualizations --job-id test-run

# Check if analysis was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Gap analysis completed successfully!${NC}"
  
  # Display generated files
  echo -e "${YELLOW}Generated files:${NC}"
  find $OUTPUT_DIR -type f -name "*test-run*" | sort
  
  # Display report summary
  echo -e "${YELLOW}Report summary:${NC}"
  
  # Check if report exists
  REPORT_FILE=$(find $OUTPUT_DIR -name "gap-analysis-report-test-run.md")
  if [ -n "$REPORT_FILE" ]; then
    # Extract and display top sections of the report
    echo -e "${GREEN}Top opportunities found:${NC}"
    grep -A 2 "^### [0-9]\." $REPORT_FILE | grep -v "^--" | head -n 9
    
    echo -e "${GREEN}Gap Analysis completed successfully.${NC}"
  else
    echo -e "${RED}Report file not found.${NC}"
    exit 1
  fi
else
  echo -e "${RED}Gap analysis failed.${NC}"
  exit 1
fi

# Clean up (uncomment to enable cleanup)
# echo -e "${YELLOW}Cleaning up...${NC}"
# rm -rf $TEMP_DIR
# rm -rf $OUTPUT_DIR

echo -e "${GREEN}Test completed successfully!${NC}"
