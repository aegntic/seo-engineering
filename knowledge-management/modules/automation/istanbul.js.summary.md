# Summary of istanbul.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/lib/instrumenters/istanbul.js`

## Content Preview
```
'use strict'

function InstrumenterIstanbul (options) {
  const { createInstrumenter } = require('istanbul-lib-instrument')
  const convertSourceMap = require('convert-source-map')

  const instrumenter = createInstrumenter({
    autoWrap: true,
    coverageVariable: '__coverage__',
    embedSource: true,
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1338 characters
- Lines: 45
