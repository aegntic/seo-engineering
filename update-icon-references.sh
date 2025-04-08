#!/bin/bash
# Script to update Heroicons references from old names to new names

echo "Updating icon references in all JSX files..."

# Define a function to perform the replacements in a file
update_file() {
  file=$1
  echo "Updating $file"
  
  # Replace old icon names with new ones
  sed -i 's/SearchIcon/MagnifyingGlassIcon/g' "$file"
  sed -i 's/FilterIcon/FunnelIcon/g' "$file"
  # Add more replacements as needed
}

# Find all JSX files with the old icon names
FILES=$(grep -l "SearchIcon\|FilterIcon" -r --include="*.jsx" --include="*.js" /home/tabs/seo-engineering/website/src/)

# Update each file
for file in $FILES
do
  update_file "$file"
done

echo "Update complete!"
