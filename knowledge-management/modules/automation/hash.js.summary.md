# Summary of hash.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@dabh/diagnostics/adapters/hash.js`

## Content Preview
```
var adapter = require('./');

/**
 * Extracts the values from process.env.
 *
 * @type {Function}
 * @public
 */
module.exports = adapter(function hash() {
  return /(debug|diagnostics)=([^&]+)/i.exec(window.location.hash)[2];
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 231 characters
- Lines: 12
