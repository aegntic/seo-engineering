# Summary of spawn.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/nodemon/lib/spawn.js`

## Content Preview
```
const path = require('path');
const utils = require('./utils');
const merge = utils.merge;
const bus = utils.bus;
const spawn = require('child_process').spawn;

module.exports = function spawnCommand(command, config, eventArgs) {
  var stdio = ['pipe', 'pipe', 'pipe'];

  if (config.options.stdout) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1930 characters
- Lines: 75
