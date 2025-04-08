# Summary of parseHeaders.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/axios/lib/helpers/parseHeaders.js`

## Content Preview
```
'use strict';

import utils from './../utils.js';

// RawAxiosHeaders whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
const ignoreDuplicateOf = utils.toObjectSet([
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1382 characters
- Lines: 56
