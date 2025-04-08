# Summary of test-setup.js
  
## File Path
`/home/tabs/seo-engineering/automation/tests/test-setup.js`

## Content Preview
```
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const util = require('util');

const sleep = util.promisify(setTimeout);
let mongoServer;

async function testConnection(uri, maxRetries = 10, delay = 2000) {
  console.log(`Attempting to connect to MongoDB at ${uri}`);
  console.log('Available environment variables:', {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2136 characters
- Lines: 75
