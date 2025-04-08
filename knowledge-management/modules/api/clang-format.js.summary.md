# Summary of clang-format.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/node-addon-api/tools/clang-format.js`

## Content Preview
```
#!/usr/bin/env node

const spawn = require('child_process').spawnSync;
const path = require('path');

const filesToCheck = ['*.h', '*.cc'];
const FORMAT_START = process.env.FORMAT_START || 'main';

function main (args) {
  let fix = false;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2002 characters
- Lines: 72
