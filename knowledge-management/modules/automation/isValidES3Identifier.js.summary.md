# Summary of isValidES3Identifier.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/validators/isValidES3Identifier.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isValidES3Identifier;
var _isValidIdentifier = require("./isValidIdentifier.js");
const RESERVED_WORDS_ES3_ONLY = new Set(["abstract", "boolean", "byte", "char", "double", "enum", "final", "float", "goto", "implements", "int", "interface", "long", "native", "package", "private", "protected", "public", "short", "static", "synchronized", "throws", "transient", "volatile"]);
function isValidES3Identifier(name) {
  return (0, _isValidIdentifier.default)(name) && !RESERVED_WORDS_ES3_ONLY.has(name);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 649 characters
- Lines: 14
