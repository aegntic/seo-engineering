#!/bin/bash
# Script to update Heroicons imports from @heroicons/react/outline to @heroicons/react/24/outline

echo "Updating Heroicons imports in all files..."

# Use grep to find all files with the old import pattern
FILES=$(grep -l "@heroicons/react/outline" -r --include="*.jsx" --include="*.js" /home/tabs/seo-engineering/website/src/)

# Loop through each file and update the import
for file in $FILES
do
  echo "Updating $file"
  # Use sed to replace the import pattern
  sed -i 's/@heroicons\/react\/outline/@heroicons\/react\/24\/outline/g' "$file"
done

echo "Update complete!"
