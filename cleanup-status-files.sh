#!/bin/bash

# Cleanup script for SEOAutomate project
# Creates an archive of historical status files and removes redundant files

echo "SEOAutomate Project Documentation Cleanup"
echo "========================================"

# Create archive directory
mkdir -p ./project-tracking/historical-status

# Move all timestamped files to archive
echo "Moving historical status files to archive..."
mv PRIORITYTASKS_*.md ./project-tracking/historical-status/
mv PROJECTUPDATE*.md ./project-tracking/historical-status/
mv PLANNING_*.md ./project-tracking/historical-status/
mv TASKS_*.md ./project-tracking/historical-status/

# Move obsolete status files to archive
echo "Moving obsolete status files to archive..."
mv PROJECT_STATUS.md ./project-tracking/historical-status/
mv TASKS.md ./project-tracking/historical-status/

echo "All redundant status files have been archived in ./project-tracking/historical-status/"
echo "The consolidated project completion report is available in PROJECT_COMPLETE.md"
echo "The original project planning is available in PLANNING.md"
echo ""
echo "Cleanup complete!"
