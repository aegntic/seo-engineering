# Summary of global.test.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@sinonjs/commons/lib/global.test.js`

## Content Preview
```
"use strict";

var assert = require("@sinonjs/referee-sinon").assert;
var globalObject = require("./global");

describe("global", function () {
    before(function () {
        if (typeof global === "undefined") {
            this.skip();
        }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 355 characters
- Lines: 17
