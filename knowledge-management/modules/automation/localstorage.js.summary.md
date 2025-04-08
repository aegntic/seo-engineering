# Summary of localstorage.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@dabh/diagnostics/adapters/localstorage.js`

## Content Preview
```
var adapter = require('./');

/**
 * Extracts the values from process.env.
 *
 * @type {Function}
 * @public
 */
module.exports = adapter(function storage() {
  return localStorage.getItem('debug') || localStorage.getItem('diagnostics');
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 242 characters
- Lines: 12
