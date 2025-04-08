# Summary of index-fetch.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/index-fetch.js`

## Content Preview
```
'use strict'

const { getGlobalDispatcher, setGlobalDispatcher } = require('./lib/global')
const EnvHttpProxyAgent = require('./lib/dispatcher/env-http-proxy-agent')
const fetchImpl = require('./lib/web/fetch').fetch

module.exports.fetch = function fetch (resource, init = undefined) {
  return fetchImpl(resource, init).catch((err) => {
    if (err && typeof err === 'object') {
      Error.captureStackTrace(err)
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1426 characters
- Lines: 33
