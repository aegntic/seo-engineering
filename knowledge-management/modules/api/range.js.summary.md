# Summary of range.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/semver/classes/range.js`

## Content Preview
```
const SPACE_CHARACTERS = /\s+/g

// hoisted class for cyclic dependency
class Range {
  constructor (range, options) {
    options = parseOptions(options)

    if (range instanceof Range) {
      if (
        range.loose === !!options.loose &&
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 14924 characters
- Lines: 555
