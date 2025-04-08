# Summary of satisfies.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/semver/functions/satisfies.js`

## Content Preview
```
const Range = require('../classes/range')
const satisfies = (version, range, options) => {
  try {
    range = new Range(range, options)
  } catch (er) {
    return false
  }
  return range.test(version)
}
module.exports = satisfies
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 233 characters
- Lines: 11
