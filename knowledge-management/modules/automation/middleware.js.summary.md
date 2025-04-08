# Summary of middleware.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs/build/lib/middleware.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMiddleware = exports.commandMiddlewareFactory = exports.globalMiddlewareFactory = void 0;
const argsert_1 = require("./argsert");
const is_promise_1 = require("./is-promise");
function globalMiddlewareFactory(globalMiddleware, context) {
    return function (callback, applyBeforeValidation = false) {
        argsert_1.argsert('<array|function> [boolean]', [callback, applyBeforeValidation], arguments.length);
        if (Array.isArray(callback)) {
            for (let i = 0; i < callback.length; i++) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2518 characters
- Lines: 58
