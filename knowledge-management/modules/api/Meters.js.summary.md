# Summary of Meters.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/resources/Billing/Meters.js`

## Content Preview
```
"use strict";
// File generated from our OpenAPI spec
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meters = void 0;
const StripeResource_js_1 = require("../../StripeResource.js");
const stripeMethod = StripeResource_js_1.StripeResource.method;
exports.Meters = StripeResource_js_1.StripeResource.extend({
    create: stripeMethod({ method: 'POST', fullPath: '/v1/billing/meters' }),
    retrieve: stripeMethod({ method: 'GET', fullPath: '/v1/billing/meters/{id}' }),
    update: stripeMethod({ method: 'POST', fullPath: '/v1/billing/meters/{id}' }),
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1101 characters
- Lines: 30
