# Gap Analysis CLI Tool

## Overview

The Gap Analysis CLI tool is a powerful command-line utility for analyzing gaps between a client site and its competitors. It identifies areas where the client site is underperforming, detects missed opportunities, and generates actionable recommendations for improvement.

## Installation

The tool is part of the SEOAutomate platform and comes pre-installed when you set up the competitor analysis module. No additional installation is required beyond the dependencies in the main package.json file.

## Prerequisites

- Node.js v18+
- Input data file with client and competitor analysis data (JSON format)

## Usage

```bash
node gap-analysis-cli.js --input /path/to/data.json --output ./results --visualizations
```

Or use the convenience script from the project root:

```bash
./analyze-gaps.sh --input /path/to/data.json --output ./results --visualizations
```

## Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input <path>` | `-i` | Path to input JSON file with crawl data | (Required) |
| `--output <dir>` | `-o` | Output directory for results | `./gap-analysis-results` |
| `--visualizations` | `-v` | Generate visualization data | `false` |
| `--job-id <id>` | | Unique job ID | Timestamp-based ID |
| `--detailed` | | Generate detailed analysis | `false` |
| `--keywords <keywords...>` | `-k` | Keywords to analyze | `[]` |
| `--keywords-file <path>` | `-w` | File containing keywords (one per line) | |

## Input Data Format

The tool expects an input JSON file with the following structure:

```json
{
  "clientData": {
    "summary": {
      "pagesAnalyzed": 50,
      "averagePerformance": {
        "domContentLoaded": 1245.67,
        "load": 2456.78
      },
      "contentStats": {
        "averageTitleLength": 52.3,
        "averageDescriptionLength": 142.8
      },
      "seoHealth": {
        "missingTitlesPercent": 5.2,
        "missingDescriptionsPercent": 8.6,
        "hasSchemaMarkupPercent": 45.3
      }
    },
    "seo": {
      "images": {
        "withAlt": 125,
        "withoutAlt": 30
      },
      "links": {
        "internal": 480,
        "external": 120
      }
    }
  },
  "competitorsData": {
    "https://competitor1.com": {
      "summary": {
        // Similar structure to clientData
      },
      "seo": {
        // Similar structure to clientData
      }
    },
    "https://competitor2.com": {
      // Similar structure
    }
  },
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
```

## Output

The tool generates the following outputs:

1. **Gap Analysis Report** - A comprehensive Markdown report with identified gaps and recommendations
2. **Results JSON** - A structured JSON file with all analysis results
3. **Visualization Data** (if `--visualizations` flag is used) - JSON files for various chart types

### Output File Structure

```
output-directory/
├── gap-analysis-report-{jobId}.md    # Comprehensive report
├── gap-analysis-results-{jobId}.json # Complete results data
└── visualizations/                   # Only if --visualizations flag is used
    ├── radar-{jobId}.json            # Radar chart data
    ├── comparison-{jobId}.json       # Comparison chart data
    ├── opportunities-{jobId}.json    # Opportunities chart data
    └── impact-{jobId}.json           # Impact bubble chart data
```

## Examples

### Basic Usage

```bash
node gap-analysis-cli.js --input ./data/analysis.json --output ./results
```

### With Visualizations

```bash
node gap-analysis-cli.js --input ./data/analysis.json --output ./results --visualizations
```

### With Custom Job ID

```bash
node gap-analysis-cli.js --input ./data/analysis.json --output ./results --job-id client123
```

### With Detailed Analysis

```bash
node gap-analysis-cli.js --input ./data/analysis.json --output ./results --detailed
```

### With Keywords

```bash
node gap-analysis-cli.js --input ./data/analysis.json --keywords "seo tools" "technical seo" "seo automation"
```

### With Keywords File

```bash
node gap-analysis-cli.js --input ./data/analysis.json --keywords-file ./data/keywords.txt
```

## Using the Convenience Script

The `analyze-gaps.sh` script in the project root provides a more user-friendly interface:

```bash
./analyze-gaps.sh --input ./data/analysis.json --output ./results --visualizations
```

## Integration

The Gap Analysis CLI can be integrated into automated workflows and scripts:

```bash
# Example: Run gap analysis and then process the results
./analyze-gaps.sh --input ./data/analysis.json --output ./results
node process-results.js --input ./results/gap-analysis-results-*.json
```

## Troubleshooting

If you encounter issues with the Gap Analysis CLI tool, check the following:

1. Ensure your input JSON file has the correct structure
2. Verify that you have permission to write to the output directory
3. Check the Node.js version (should be v18+)
4. Look for error messages in the console output

## License

This tool is part of the SEOAutomate platform and is subject to the same license terms.
