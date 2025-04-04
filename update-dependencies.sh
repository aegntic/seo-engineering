#!/bin/bash

# This script updates the project dependencies for the SEOAutomate dashboard enhancement

echo "Updating SEOAutomate dependencies..."

# Navigate to the website directory
cd website

# Install new dependencies
npm install --save d3@7.8.5 react-force-graph@1.44.1 recharts@2.10.3 react-table@7.8.0 @visx/visx@3.8.0

echo "Dependencies successfully updated!"
echo "You can now start the development server with: npm run dev"

# Make the script executable 
chmod +x update-dependencies.sh
