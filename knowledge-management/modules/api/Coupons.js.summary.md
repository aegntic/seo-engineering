# Summary of Coupons.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/resources/Coupons.js`

## Content Preview
```
"use strict";
// File generated from our OpenAPI spec
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coupons = void 0;
const StripeResource_js_1 = require("../StripeResource.js");
const stripeMethod = StripeResource_js_1.StripeResource.method;
exports.Coupons = StripeResource_js_1.StripeResource.extend({
    create: stripeMethod({ method: 'POST', fullPath: '/v1/coupons' }),
    retrieve: stripeMethod({ method: 'GET', fullPath: '/v1/coupons/{coupon}' }),
    update: stripeMethod({ method: 'POST', fullPath: '/v1/coupons/{coupon}' }),
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 762 characters
- Lines: 18
