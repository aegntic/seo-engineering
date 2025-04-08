# Summary of Prices.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/resources/Prices.js`

## Content Preview
```
"use strict";
// File generated from our OpenAPI spec
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prices = void 0;
const StripeResource_js_1 = require("../StripeResource.js");
const stripeMethod = StripeResource_js_1.StripeResource.method;
exports.Prices = StripeResource_js_1.StripeResource.extend({
    create: stripeMethod({ method: 'POST', fullPath: '/v1/prices' }),
    retrieve: stripeMethod({ method: 'GET', fullPath: '/v1/prices/{price}' }),
    update: stripeMethod({ method: 'POST', fullPath: '/v1/prices/{price}' }),
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 802 characters
- Lines: 22
