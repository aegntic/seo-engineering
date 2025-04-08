#!/bin/bash

# Script to run tests for the SEO.engineering dashboard components

echo "Running tests for SEO.engineering dashboard components..."

# Navigate to the website directory
cd website

# Install testing dependencies if needed
if ! npm list @testing-library/react &>/dev/null; then
  echo "Installing testing dependencies..."
  npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest
fi

# Run tests
echo "Running dashboard component tests..."
npx jest src/components/dashboard/__tests__/dashboard-components.test.js

echo "Tests completed!"
