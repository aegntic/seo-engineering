# Summary of ResourceNamespace.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/ResourceNamespace.js`

## Content Preview
```
"use strict";
// ResourceNamespace allows you to create nested resources, i.e. `stripe.issuing.cards`.
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourceNamespace = void 0;
// It also works recursively, so you could do i.e. `stripe.billing.invoicing.pay`.
function ResourceNamespace(stripe, resources) {
    for (const name in resources) {
        if (!Object.prototype.hasOwnProperty.call(resources, name)) {
            continue;
        }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 841 characters
- Lines: 22
