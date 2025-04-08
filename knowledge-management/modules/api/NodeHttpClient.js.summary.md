# Summary of NodeHttpClient.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/net/NodeHttpClient.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeHttpClientResponse = exports.NodeHttpClient = void 0;
const http_ = require("http");
const https_ = require("https");
const HttpClient_js_1 = require("./HttpClient.js");
// `import * as http_ from 'http'` creates a "Module Namespace Exotic Object"
// which is immune to monkey-patching, whereas http_.default (in an ES Module context)
// will resolve to the same thing as require('http'), which is
// monkey-patchable. We care about this because users in their test
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3968 characters
- Lines: 109
