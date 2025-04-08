# Summary of Mutex.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/async-mutex/lib/Mutex.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Semaphore_1 = require("./Semaphore");
var Mutex = /** @class */ (function () {
    function Mutex(cancelError) {
        this._semaphore = new Semaphore_1.default(1, cancelError);
    }
    Mutex.prototype.acquire = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1427 characters
- Lines: 41
