# Summary of wrappy.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/wrappy/wrappy.js`

## Content Preview
```
// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 905 characters
- Lines: 34
