# Summary of defineEnumerableProperties.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/helpers/lib/helpers/defineEnumerableProperties.js`

## Content Preview
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _defineEnumerableProperties;
function _defineEnumerableProperties(obj, descs) {
  for (var key in descs) {
    var desc = descs[key];
    desc.configurable = desc.enumerable = true;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 811 characters
- Lines: 28
