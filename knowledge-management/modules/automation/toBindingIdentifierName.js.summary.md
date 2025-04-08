# Summary of toBindingIdentifierName.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/converters/toBindingIdentifierName.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toBindingIdentifierName;
var _toIdentifier = require("./toIdentifier.js");
function toBindingIdentifierName(name) {
  name = (0, _toIdentifier.default)(name);
  if (name === "eval" || name === "arguments") name = "_" + name;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 393 characters
- Lines: 15
