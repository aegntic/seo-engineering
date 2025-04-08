# Summary of copy-prototype-methods.test.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@sinonjs/commons/lib/prototypes/copy-prototype-methods.test.js`

## Content Preview
```
"use strict";

var refute = require("@sinonjs/referee-sinon").refute;
var copyPrototypeMethods = require("./copy-prototype-methods");

describe("copyPrototypeMethods", function () {
    it("does not throw for Map", function () {
        refute.exception(function () {
            copyPrototypeMethods(Map.prototype);
        });
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 341 characters
- Lines: 13
