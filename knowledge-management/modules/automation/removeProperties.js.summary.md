# Summary of removeProperties.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/types/lib/modifications/removeProperties.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removeProperties;
var _index = require("../constants/index.js");
const CLEAR_KEYS = ["tokens", "start", "end", "loc", "raw", "rawValue"];
const CLEAR_KEYS_PLUS_COMMENTS = [..._index.COMMENT_KEYS, "comments", ...CLEAR_KEYS];
function removeProperties(node, opts = {}) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 797 characters
- Lines: 25
