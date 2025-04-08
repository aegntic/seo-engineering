# Summary of compare-build.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/semver/functions/compare-build.js`

## Content Preview
```
const SemVer = require('../classes/semver')
const compareBuild = (a, b, loose) => {
  const versionA = new SemVer(a, loose)
  const versionB = new SemVer(b, loose)
  return versionA.compare(versionB) || versionA.compareBuild(versionB)
}
module.exports = compareBuild

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 267 characters
- Lines: 8
