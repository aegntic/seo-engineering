# Summary of noop.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/lib/instrumenters/noop.js`

## Content Preview
```
'use strict'

function NOOP () {
  const { readInitialCoverage } = require('istanbul-lib-instrument')

  return {
    instrumentSync (code, filename) {
      const extracted = readInitialCoverage(code)
      if (extracted) {
        this.fileCoverage = extracted.coverageData
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 449 characters
- Lines: 23
