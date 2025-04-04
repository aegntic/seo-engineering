#!/bin/bash

# Gap Analysis Runner
# This script runs the gap analysis CLI tool with the specified options.

# Default values
INPUT_FILE=""
OUTPUT_DIR="./gap-analysis-results"
VISUALIZATIONS=false
JOB_ID=""
DETAILED=false

# Parse command-line options
while [[ $# -gt 0 ]]; do
  case $1 in
    --input)
      INPUT_FILE="$2"
      shift 2
      ;;
    --output)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --visualizations)
      VISUALIZATIONS=true
      shift
      ;;
    --job-id)
      JOB_ID="$2"
      shift 2
      ;;
    --detailed)
      DETAILED=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate required options
if [ -z "$INPUT_FILE" ]; then
  echo "Error: --input option is required"
  echo "Usage: $0 --input <path> [--output <dir>] [--visualizations] [--job-id <id>] [--detailed]"
  exit 1
fi

# Build command
CMD="node automation/competitor-analysis/cli/gap-analysis-cli.js --input $INPUT_FILE --output $OUTPUT_DIR"

if [ "$VISUALIZATIONS" = true ]; then
  CMD="$CMD --visualizations"
fi

if [ ! -z "$JOB_ID" ]; then
  CMD="$CMD --job-id $JOB_ID"
fi

if [ "$DETAILED" = true ]; then
  CMD="$CMD --detailed"
fi

# Run command
echo "Running gap analysis with command:"
echo "$CMD"
eval "$CMD"

# Display results location
echo
echo "Gap analysis completed."
echo "Results are available in: $OUTPUT_DIR"
