# Summary of Semaphore.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/async-mutex/lib/Semaphore.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("./errors");
var Semaphore = /** @class */ (function () {
    function Semaphore(_value, _cancelError) {
        if (_cancelError === void 0) { _cancelError = errors_1.E_CANCELED; }
        this._value = _value;
        this._cancelError = _cancelError;
        this._weightedQueues = [];
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 4581 characters
- Lines: 116
