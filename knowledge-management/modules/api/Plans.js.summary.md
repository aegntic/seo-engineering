# Summary of Plans.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/resources/Plans.js`

## Content Preview
```
"use strict";
// File generated from our OpenAPI spec
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plans = void 0;
const StripeResource_js_1 = require("../StripeResource.js");
const stripeMethod = StripeResource_js_1.StripeResource.method;
exports.Plans = StripeResource_js_1.StripeResource.extend({
    create: stripeMethod({ method: 'POST', fullPath: '/v1/plans' }),
    retrieve: stripeMethod({ method: 'GET', fullPath: '/v1/plans/{plan}' }),
    update: stripeMethod({ method: 'POST', fullPath: '/v1/plans/{plan}' }),
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 742 characters
- Lines: 18
