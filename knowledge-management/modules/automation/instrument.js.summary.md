# Summary of instrument.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/lib/commands/instrument.js`

## Content Preview
```
'use strict'

const NYC = require('../../index.js')
const path = require('path')
const { promisify } = require('util')
const resolveFrom = require('resolve-from')
const rimraf = promisify(require('rimraf'))
const { cliWrapper, setupOptions } = require('./helpers.js')

exports.command = 'instrument <input> [output]'
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2118 characters
- Lines: 64
