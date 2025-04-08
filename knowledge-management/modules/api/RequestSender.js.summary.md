# Summary of RequestSender.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/RequestSender.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestSender = void 0;
const Error_js_1 = require("./Error.js");
const HttpClient_js_1 = require("./net/HttpClient.js");
const utils_js_1 = require("./utils.js");
const MAX_RETRY_AFTER_WAIT = 60;
class RequestSender {
    constructor(stripe, maxBufferedRequestMetric) {
        this._stripe = stripe;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 22150 characters
- Lines: 458
