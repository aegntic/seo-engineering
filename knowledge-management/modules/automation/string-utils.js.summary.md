# Summary of string-utils.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cliui/build/lib/string-utils.js`

## Content Preview
```
// Minimal replacement for ansi string helpers "wrap-ansi" and "strip-ansi".
// to facilitate ESM and Deno modules.
// TODO: look at porting https://www.npmjs.com/package/wrap-ansi to ESM.
// The npm application
// Copyright (c) npm, Inc. and Contributors
// Licensed on the terms of The Artistic License 2.0
// See: https://github.com/npm/cli/blob/4c65cd952bc8627811735bea76b9b110cc4fc80e/lib/utils/ansi-trim.js
const ansi = new RegExp('\x1b(?:\\[(?:\\d+[ABCDEFGJKSTm]|\\d+;\\d+[Hfm]|' +
    '\\d+;\\d+;\\d+m|6n|s|u|\\?25[lh])|\\w)', 'g');
export function stripAnsi(str) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1011 characters
- Lines: 28
