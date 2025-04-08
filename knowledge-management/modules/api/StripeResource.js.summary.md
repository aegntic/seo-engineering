# Summary of StripeResource.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/StripeResource.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeResource = void 0;
const utils_js_1 = require("./utils.js");
const StripeMethod_js_1 = require("./StripeMethod.js");
// Provide extension mechanism for Stripe Resource Sub-Classes
StripeResource.extend = utils_js_1.protoExtend;
// Expose method-creator
StripeResource.method = StripeMethod_js_1.stripeMethod;
StripeResource.MAX_BUFFERED_REQUEST_METRICS = 100;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 7994 characters
- Lines: 177
