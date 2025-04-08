# Summary of minimatch.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/minimatch/minimatch.js`

## Content Preview
```
module.exports = minimatch
minimatch.Minimatch = Minimatch

var path = (function () { try { return require('path') } catch (e) {}}()) || {
  sep: '/'
}
minimatch.sep = path.sep

var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
var expand = require('brace-expansion')
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 26266 characters
- Lines: 948
