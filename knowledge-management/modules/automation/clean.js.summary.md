# Summary of clean.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/semver/functions/clean.js`

## Content Preview
```
const parse = require('./parse')
const clean = (version, options) => {
  const s = parse(version.trim().replace(/^[=v]+/, ''), options)
  return s ? s.version : null
}
module.exports = clean

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 191 characters
- Lines: 7
