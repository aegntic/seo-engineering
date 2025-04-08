# Summary of run.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/nodemon/lib/monitor/run.js`

## Content Preview
```
var debug = require('debug')('nodemon:run');
const statSync = require('fs').statSync;
var utils = require('../utils');
var bus = utils.bus;
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var exec = childProcess.exec;
var execSync = childProcess.execSync;
var fork = childProcess.fork;
var watch = require('./watch').watch;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 16951 characters
- Lines: 563
