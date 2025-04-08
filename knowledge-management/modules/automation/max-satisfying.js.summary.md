# Summary of max-satisfying.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/semver/ranges/max-satisfying.js`

## Content Preview
```
const SemVer = require('../classes/semver')
const Range = require('../classes/range')

const maxSatisfying = (versions, range, options) => {
  let max = null
  let maxSV = null
  let rangeObj = null
  try {
    rangeObj = new Range(range, options)
  } catch (er) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 579 characters
- Lines: 26
