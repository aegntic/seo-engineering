# Summary of Payouts.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/resources/Payouts.js`

## Content Preview
```
"use strict";
// File generated from our OpenAPI spec
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payouts = void 0;
const StripeResource_js_1 = require("../StripeResource.js");
const stripeMethod = StripeResource_js_1.StripeResource.method;
exports.Payouts = StripeResource_js_1.StripeResource.extend({
    create: stripeMethod({ method: 'POST', fullPath: '/v1/payouts' }),
    retrieve: stripeMethod({ method: 'GET', fullPath: '/v1/payouts/{payout}' }),
    update: stripeMethod({ method: 'POST', fullPath: '/v1/payouts/{payout}' }),
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 901 characters
- Lines: 25
