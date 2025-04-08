# Summary of CreditNotes.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/resources/CreditNotes.js`

## Content Preview
```
"use strict";
// File generated from our OpenAPI spec
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditNotes = void 0;
const StripeResource_js_1 = require("../StripeResource.js");
const stripeMethod = StripeResource_js_1.StripeResource.method;
exports.CreditNotes = StripeResource_js_1.StripeResource.extend({
    create: stripeMethod({ method: 'POST', fullPath: '/v1/credit_notes' }),
    retrieve: stripeMethod({ method: 'GET', fullPath: '/v1/credit_notes/{id}' }),
    update: stripeMethod({ method: 'POST', fullPath: '/v1/credit_notes/{id}' }),
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1205 characters
- Lines: 32
