# Summary of Quotes.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/resources/Quotes.js`

## Content Preview
```
"use strict";
// File generated from our OpenAPI spec
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quotes = void 0;
const StripeResource_js_1 = require("../StripeResource.js");
const stripeMethod = StripeResource_js_1.StripeResource.method;
exports.Quotes = StripeResource_js_1.StripeResource.extend({
    create: stripeMethod({ method: 'POST', fullPath: '/v1/quotes' }),
    retrieve: stripeMethod({ method: 'GET', fullPath: '/v1/quotes/{quote}' }),
    update: stripeMethod({ method: 'POST', fullPath: '/v1/quotes/{quote}' }),
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1438 characters
- Lines: 39
