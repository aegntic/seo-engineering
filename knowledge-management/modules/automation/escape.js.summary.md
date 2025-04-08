# Summary of escape.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cross-spawn/lib/util/escape.js`

## Content Preview
```
'use strict';

// See http://www.robvanderwoude.com/escapechars.php
const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;

function escapeCommand(arg) {
    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    return arg;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1383 characters
- Lines: 48
