# Summary of sbcs-codec.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/iconv-lite/encodings/sbcs-codec.js`

## Content Preview
```
"use strict";
var Buffer = require("safer-buffer").Buffer;

// Single-byte codec. Needs a 'chars' string parameter that contains 256 or 128 chars that
// correspond to encoded bytes (if 128 - then lower half is ASCII). 

exports._sbcs = SBCSCodec;
function SBCSCodec(codecOptions, iconv) {
    if (!codecOptions)
        throw new Error("SBCS codec is called without the data.")
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2191 characters
- Lines: 73
