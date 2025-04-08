# Summary of redirect-interceptor.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/interceptor/redirect-interceptor.js`

## Content Preview
```
'use strict'

const RedirectHandler = require('../handler/redirect-handler')

function createRedirectInterceptor ({ maxRedirections: defaultMaxRedirections }) {
  return (dispatch) => {
    return function Intercept (opts, handler) {
      const { maxRedirections = defaultMaxRedirections } = opts

      if (!maxRedirections) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 661 characters
- Lines: 22
