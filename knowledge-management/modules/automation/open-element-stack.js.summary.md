# Summary of open-element-stack.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/parse5/dist/cjs/parser/open-element-stack.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenElementStack = void 0;
const html_js_1 = require("../common/html.js");
//Element utils
const IMPLICIT_END_TAG_REQUIRED = new Set([html_js_1.TAG_ID.DD, html_js_1.TAG_ID.DT, html_js_1.TAG_ID.LI, html_js_1.TAG_ID.OPTGROUP, html_js_1.TAG_ID.OPTION, html_js_1.TAG_ID.P, html_js_1.TAG_ID.RB, html_js_1.TAG_ID.RP, html_js_1.TAG_ID.RT, html_js_1.TAG_ID.RTC]);
const IMPLICIT_END_TAG_REQUIRED_THOROUGHLY = new Set([
    ...IMPLICIT_END_TAG_REQUIRED,
    html_js_1.TAG_ID.CAPTION,
    html_js_1.TAG_ID.COLGROUP,
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 12003 characters
- Lines: 325
