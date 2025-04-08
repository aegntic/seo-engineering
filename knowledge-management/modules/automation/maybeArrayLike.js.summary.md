# Summary of maybeArrayLike.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/maybeArrayLike.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _maybeArrayLike;
var _arrayLikeToArray = require("./arrayLikeToArray.js");
function _maybeArrayLike(orElse, arr, i) {
  if (arr && !Array.isArray(arr) && typeof arr.length === "number") {
    var len = arr.length;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 470 characters
- Lines: 17
