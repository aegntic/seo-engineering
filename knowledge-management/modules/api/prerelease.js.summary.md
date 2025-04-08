# Summary of prerelease.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/semver/functions/prerelease.js`

## Content Preview
```
const parse = require('./parse')
const prerelease = (version, options) => {
  const parsed = parse(version, options)
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}
module.exports = prerelease

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 220 characters
- Lines: 7
