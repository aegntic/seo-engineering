# Summary of check-napi.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/node-addon-api/tools/check-napi.js`

## Content Preview
```
'use strict';
// Descend into a directory structure and, for each file matching *.node, output
// based on the imports found in the file whether it's an N-API module or not.

const fs = require('fs');
const path = require('path');

// Read the output of the command, break it into lines, and use the reducer to
// decide whether the file is an N-API module or not.
function checkFile (file, command, argv, reducer) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3176 characters
- Lines: 100
