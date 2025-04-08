# Summary of removePropertiesDeep.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/modifications/removePropertiesDeep.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removePropertiesDeep;
var _traverseFast = require("../traverse/traverseFast.js");
var _removeProperties = require("./removeProperties.js");
function removePropertiesDeep(tree, opts) {
  (0, _traverseFast.default)(tree, _removeProperties.default, opts);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 418 characters
- Lines: 15
