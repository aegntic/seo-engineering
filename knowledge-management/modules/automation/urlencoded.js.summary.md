# Summary of urlencoded.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/whatwg-url/lib/urlencoded.js`

## Content Preview
```
"use strict";
const { utf8Encode, utf8DecodeWithoutBOM } = require("./encoding");
const { percentDecodeBytes, utf8PercentEncodeString, isURLEncodedPercentEncode } = require("./percent-encoding");

function p(char) {
  return char.codePointAt(0);
}

// https://url.spec.whatwg.org/#concept-urlencoded-parser
function parseUrlencoded(input) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2760 characters
- Lines: 107
