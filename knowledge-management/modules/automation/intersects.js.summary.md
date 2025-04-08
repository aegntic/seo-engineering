# Summary of intersects.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/semver/ranges/intersects.js`

## Content Preview
```
const Range = require('../classes/range')
const intersects = (r1, r2, options) => {
  r1 = new Range(r1, options)
  r2 = new Range(r2, options)
  return r1.intersects(r2, options)
}
module.exports = intersects

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 210 characters
- Lines: 8
