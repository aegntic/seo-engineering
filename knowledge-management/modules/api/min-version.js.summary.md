# Summary of min-version.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/semver/ranges/min-version.js`

## Content Preview
```
const SemVer = require('../classes/semver')
const Range = require('../classes/range')
const gt = require('../functions/gt')

const minVersion = (range, loose) => {
  range = new Range(range, loose)

  let minver = new SemVer('0.0.0')
  if (range.test(minver)) {
    return minver
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1500 characters
- Lines: 62
