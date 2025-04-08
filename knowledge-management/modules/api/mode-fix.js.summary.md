# Summary of mode-fix.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/tar/lib/mode-fix.js`

## Content Preview
```
'use strict'
module.exports = (mode, isDir, portable) => {
  mode &= 0o7777

  // in portable mode, use the minimum reasonable umask
  // if this system creates files with 0o664 by default
  // (as some linux distros do), then we'll write the
  // archive with 0o644 instead.  Also, don't ever create
  // a file that is not readable/writable by the owner.
  if (portable) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 649 characters
- Lines: 28
