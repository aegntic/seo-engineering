# Summary of subset.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/semver/ranges/subset.js`

## Content Preview
```
const Range = require('../classes/range.js')
const Comparator = require('../classes/comparator.js')
const { ANY } = Comparator
const satisfies = require('../functions/satisfies.js')
const compare = require('../functions/compare.js')

// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
// - Every simple range `r1, r2, ...` is a null set, OR
// - Every simple range `r1, r2, ...` which is not a null set is a subset of
//   some `R1, R2, ...`
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 7510 characters
- Lines: 248
