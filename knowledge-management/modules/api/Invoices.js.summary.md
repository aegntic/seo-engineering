# Summary of Invoices.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/resources/Invoices.js`

## Content Preview
```
"use strict";
// File generated from our OpenAPI spec
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoices = void 0;
const StripeResource_js_1 = require("../StripeResource.js");
const stripeMethod = StripeResource_js_1.StripeResource.method;
exports.Invoices = StripeResource_js_1.StripeResource.extend({
    create: stripeMethod({ method: 'POST', fullPath: '/v1/invoices' }),
    retrieve: stripeMethod({ method: 'GET', fullPath: '/v1/invoices/{invoice}' }),
    update: stripeMethod({ method: 'POST', fullPath: '/v1/invoices/{invoice}' }),
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2211 characters
- Lines: 65
