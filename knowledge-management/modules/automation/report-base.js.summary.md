# Summary of report-base.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/istanbul-lib-report/lib/report-base.js`

## Content Preview
```
'use strict';

// TODO: switch to class private field when targetting node.js 12
const _summarizer = Symbol('ReportBase.#summarizer');

class ReportBase {
    constructor(opts = {}) {
        this[_summarizer] = opts.summarizer;
    }

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 362 characters
- Lines: 17
