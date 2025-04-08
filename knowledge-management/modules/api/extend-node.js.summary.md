# Summary of extend-node.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/iconv-lite/lib/extend-node.js`

## Content Preview
```
"use strict";
var Buffer = require("buffer").Buffer;
// Note: not polyfilled with safer-buffer on a purpose, as overrides Buffer

// == Extend Node primitives to use iconv-lite =================================

module.exports = function (iconv) {
    var original = undefined; // Place to keep original methods.

    // Node authors rewrote Buffer internals to make it compatible with
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 8701 characters
- Lines: 218
