# Summary of whatwg-encoding.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/whatwg-encoding/lib/whatwg-encoding.js`

## Content Preview
```
"use strict";
const iconvLite = require("iconv-lite");
const supportedNames = require("./supported-names.json");
const labelsToNames = require("./labels-to-names.json");

const supportedNamesSet = new Set(supportedNames);

// https://encoding.spec.whatwg.org/#concept-encoding-get
exports.labelToName = label => {
  label = String(label).trim().toLowerCase();
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1872 characters
- Lines: 61
