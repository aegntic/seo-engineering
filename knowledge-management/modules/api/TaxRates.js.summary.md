# Summary of TaxRates.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/resources/TaxRates.js`

## Content Preview
```
"use strict";
// File generated from our OpenAPI spec
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxRates = void 0;
const StripeResource_js_1 = require("../StripeResource.js");
const stripeMethod = StripeResource_js_1.StripeResource.method;
exports.TaxRates = StripeResource_js_1.StripeResource.extend({
    create: stripeMethod({ method: 'POST', fullPath: '/v1/tax_rates' }),
    retrieve: stripeMethod({ method: 'GET', fullPath: '/v1/tax_rates/{tax_rate}' }),
    update: stripeMethod({ method: 'POST', fullPath: '/v1/tax_rates/{tax_rate}' }),
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 697 characters
- Lines: 17
