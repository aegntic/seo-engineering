# Summary of decode.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/entities/lib/esm/decode.js`

## Content Preview
```
import htmlDecodeTree from "./generated/decode-data-html.js";
import xmlDecodeTree from "./generated/decode-data-xml.js";
import decodeCodePoint, { replaceCodePoint, fromCodePoint, } from "./decode_codepoint.js";
// Re-export for use by eg. htmlparser2
export { htmlDecodeTree, xmlDecodeTree, decodeCodePoint };
export { replaceCodePoint, fromCodePoint } from "./decode_codepoint.js";
var CharCodes;
(function (CharCodes) {
    CharCodes[CharCodes["NUM"] = 35] = "NUM";
    CharCodes[CharCodes["SEMI"] = 59] = "SEMI";
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 19810 characters
- Lines: 496
