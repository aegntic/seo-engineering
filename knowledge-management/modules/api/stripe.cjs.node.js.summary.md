# Summary of stripe.cjs.node.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/cjs/stripe.cjs.node.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodePlatformFunctions_js_1 = require("./platform/NodePlatformFunctions.js");
const stripe_core_js_1 = require("./stripe.core.js");
const Stripe = (0, stripe_core_js_1.createStripe)(new NodePlatformFunctions_js_1.NodePlatformFunctions());
module.exports = Stripe;
// expose constructor as a named property to enable mocking with Sinon.JS
module.exports.Stripe = Stripe;
// Allow use with the TypeScript compiler without `esModuleInterop`.
// We may also want to add `Object.defineProperty(exports, "__esModule", {value: true});` in the future, so that Babel users will use the `default` version.
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 711 characters
- Lines: 12
