# Summary of prepare.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/bson/etc/prepare.js`

## Content Preview
```
#! /usr/bin/env node
var cp = require('child_process');
var fs = require('fs');

var nodeMajorVersion = +process.version.match(/^v(\d+)\.\d+/)[1];

if (fs.existsSync('src') && nodeMajorVersion >= 10) {
  cp.spawnSync('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
} else {
  if (!fs.existsSync('lib')) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 615 characters
- Lines: 20
