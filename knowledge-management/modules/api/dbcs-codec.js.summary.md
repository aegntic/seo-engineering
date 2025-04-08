# Summary of dbcs-codec.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/iconv-lite/encodings/dbcs-codec.js`

## Content Preview
```
"use strict";
var Buffer = require("safer-buffer").Buffer;

// Multibyte codec. In this scheme, a character is represented by 1 or more bytes.
// Our codec supports UTF-16 surrogates, extensions for GB18030 and unicode sequences.
// To save memory and loading time, we read table files only when requested.

exports._dbcs = DBCSCodec;

var UNASSIGNED = -1,
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 21415 characters
- Lines: 556
