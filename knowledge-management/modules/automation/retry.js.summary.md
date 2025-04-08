# Summary of retry.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/lib/interceptor/retry.js`

## Content Preview
```
'use strict'
const RetryHandler = require('../handler/retry-handler')

module.exports = globalOpts => {
  return dispatch => {
    return function retryInterceptor (opts, handler) {
      return dispatch(
        opts,
        new RetryHandler(
          { ...opts, retryOptions: { ...globalOpts, ...opts.retryOptions } },
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 419 characters
- Lines: 20
