# Summary of Settings.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/resources/Tax/Settings.js`

## Content Preview
```
"use strict";
// File generated from our OpenAPI spec
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const StripeResource_js_1 = require("../../StripeResource.js");
const stripeMethod = StripeResource_js_1.StripeResource.method;
exports.Settings = StripeResource_js_1.StripeResource.extend({
    retrieve: stripeMethod({ method: 'GET', fullPath: '/v1/tax/settings' }),
    update: stripeMethod({ method: 'POST', fullPath: '/v1/tax/settings' }),
});
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 492 characters
- Lines: 11
