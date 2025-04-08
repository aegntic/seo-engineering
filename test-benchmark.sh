#!/bin/bash

# SEO.engineering Benchmark Testing Script
# This script demonstrates the Benchmark Comparison Framework

# Create sample data directory
mkdir -p ./test-data/benchmark

# Generate sample client data
cat > ./test-data/benchmark/client-data.json << EOL
{
  "summary": {
    "url": "https://example.com",
    "pagesAnalyzed": 100,
    "seoHealth": {
      "missingTitlesPercent": 15,
      "missingDescriptionsPercent": 25,
      "hasSchemaMarkupPercent": 35,
      "hasCanonicalPercent": 60,
      "hasMobileViewportPercent": 85
    },
    "contentStats": {
      "averageTitleLength": 48,
      "averageDescriptionLength": 120,
      "averageContentLength": 1200,
      "headingsDistribution": {
        "h1": 80,
        "h2": 240,
        "h3": 320
      }
    },
    "averagePerformance": {
      "domContentLoaded": 1500,
      "load": 3200,
      "firstPaint": 1200,
      "firstContentfulPaint": 1400,
      "largestContentfulPaint": 3500
    }
  },
  "seo": {
    "images": {
      "withAlt": 250,
      "withoutAlt": 150
    },
    "links": {
      "internal": 800,
      "external": 200
    }
  },
  "structure": {
    "averageDepth": 4.2,
    "categories": 15,
    "orphanedPages": 12,
    "categoryRatio": 0.4,
    "orphanedPagesPercent": 12
  }
}
EOL

# Generate sample competitors data
cat > ./test-data/benchmark/competitors-data.json << EOL
{
  "https://competitor1.com": {
    "summary": {
      "url": "https://competitor1.com",
      "pagesAnalyzed": 120,
      "seoHealth": {
        "missingTitlesPercent": 5,
        "missingDescriptionsPercent": 10,
        "hasSchemaMarkupPercent": 70,
        "hasCanonicalPercent": 90,
        "hasMobileViewportPercent": 95
      },
      "contentStats": {
        "averageTitleLength": 55,
        "averageDescriptionLength": 150,
        "averageContentLength": 1800,
        "headingsDistribution": {
          "h1": 115,
          "h2": 350,
          "h3": 480
        }
      },
      "averagePerformance": {
        "domContentLoaded": 1000,
        "load": 2500,
        "firstPaint": 800,
        "firstContentfulPaint": 1000,
        "largestContentfulPaint": 2800
      }
    },
    "seo": {
      "images": {
        "withAlt": 400,
        "withoutAlt": 50
      },
      "links": {
        "internal": 1200,
        "external": 300
      }
    },
    "structure": {
      "averageDepth": 3.2,
      "categories": 28,
      "orphanedPages": 6,
      "categoryRatio": 0.7,
      "orphanedPagesPercent": 5
    }
  },
  "https://competitor2.com": {
    "summary": {
      "url": "https://competitor2.com",
      "pagesAnalyzed": 90,
      "seoHealth": {
        "missingTitlesPercent": 8,
        "missingDescriptionsPercent": 15,
        "hasSchemaMarkupPercent": 60,
        "hasCanonicalPercent": 85,
        "hasMobileViewportPercent": 90
      },
      "contentStats": {
        "averageTitleLength": 52,
        "averageDescriptionLength": 145,
        "averageContentLength": 1600,
        "headingsDistribution": {
          "h1": 85,
          "h2": 210,
          "h3": 290
        }
      },
      "averagePerformance": {
        "domContentLoaded": 1200,
        "load": 2800,
        "firstPaint": 900,
        "firstContentfulPaint": 1100,
        "largestContentfulPaint": 3000
      }
    },
    "seo": {
      "images": {
        "withAlt": 320,
        "withoutAlt": 80
      },
      "links": {
        "internal": 950,
        "external": 180
      }
    },
    "structure": {
      "averageDepth": 3.5,
      "categories": 22,
      "orphanedPages": 8,
      "categoryRatio": 0.6,
      "orphanedPagesPercent": 9
    }
  }
}
EOL

# Generate sample historical data
cat > ./test-data/benchmark/historical-data.json << EOL
{
  "client": {
    "technical": [
      {"date": "2025-01-01", "score": 45},
      {"date": "2025-02-01", "score": 50},
      {"date": "2025-03-01", "score": 55}
    ],
    "content": [
      {"date": "2025-01-01", "score": 60},
      {"date": "2025-02-01", "score": 58},
      {"date": "2025-03-01", "score": 62}
    ],
    "performance": [
      {"date": "2025-01-01", "score": 40},
      {"date": "2025-02-01", "score": 45},
      {"date": "2025-03-01", "score": 48}
    ]
  },
  "competitors": {
    "technical": [
      {"date": "2025-01-01", "averageScore": 65},
      {"date": "2025-02-01", "averageScore": 68},
      {"date": "2025-03-01", "averageScore": 70}
    ],
    "content": [
      {"date": "2025-01-01", "averageScore": 72},
      {"date": "2025-02-01", "averageScore": 75},
      {"date": "2025-03-01", "averageScore": 74}
    ],
    "performance": [
      {"date": "2025-01-01", "averageScore": 68},
      {"date": "2025-02-01", "averageScore": 70},
      {"date": "2025-03-01", "averageScore": 72}
    ]
  }
}
EOL

# Make output directory
mkdir -p ./benchmark-output

# Run the benchmark CLI tool
echo "Running benchmark analysis..."
cd ./automation/competitor-analysis && \
  node ./cli/benchmark.js analyze \
    -c ../../test-data/benchmark/client-data.json \
    -o ../../test-data/benchmark/competitors-data.json \
    -h ../../test-data/benchmark/historical-data.json \
    -d ../../benchmark-output \
    --forecast true \
    --periods 3 \
    --categories technical,content,keywords,performance,onPage,structure

# Check if the benchmark analysis was successful
if [ $? -eq 0 ]; then
  echo -e "\n\033[32mBenchmark analysis completed successfully!\033[0m"
  echo -e "\nOutput files are in the ./benchmark-output directory"
  
  # Find the most recent report file
  REPORT_FILE=$(find ../../benchmark-output -name "benchmark-report-*.md" -type f -printf "%T@ %p\n" | sort -n | tail -1 | cut -d' ' -f2-)
  
  if [ -n "$REPORT_FILE" ]; then
    echo -e "\nSummary from the benchmark report:"
    echo "----------------------------------------"
    # Display the first 20 lines of the report
    head -n 20 "$REPORT_FILE"
    echo -e "\n...(see full report in $REPORT_FILE)..."
  fi
else
  echo -e "\n\033[31mBenchmark analysis failed\033[0m"
fi

echo -e "\nTest completed."
