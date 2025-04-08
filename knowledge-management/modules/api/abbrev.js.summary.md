# Summary of abbrev.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/abbrev/abbrev.js`

## Content Preview
```
module.exports = exports = abbrev.abbrev = abbrev

abbrev.monkeyPatch = monkeyPatch

function monkeyPatch () {
  Object.defineProperty(Array.prototype, 'abbrev', {
    value: function () { return abbrev(this) },
    enumerable: false, configurable: true, writable: true
  })

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1763 characters
- Lines: 62
