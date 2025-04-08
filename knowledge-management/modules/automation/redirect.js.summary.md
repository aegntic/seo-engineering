# Summary of redirect.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/interceptor/redirect.js`

## Content Preview
```
'use strict'
const RedirectHandler = require('../handler/redirect-handler')

module.exports = opts => {
  const globalMaxRedirections = opts?.maxRedirections
  return dispatch => {
    return function redirectInterceptor (opts, handler) {
      const { maxRedirections = globalMaxRedirections, ...baseOpts } = opts

      if (!maxRedirections) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 588 characters
- Lines: 25
