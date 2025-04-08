# Summary of eslint-format.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/node-addon-api/tools/eslint-format.js`

## Content Preview
```
#!/usr/bin/env node

const spawn = require('child_process').spawnSync;

const filesToCheck = '*.js';
const FORMAT_START = process.env.FORMAT_START || 'main';
const IS_WIN = process.platform === 'win32';
const ESLINT_PATH = IS_WIN ? 'node_modules\\.bin\\eslint.cmd' : 'node_modules/.bin/eslint';

function main (args) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2033 characters
- Lines: 80
