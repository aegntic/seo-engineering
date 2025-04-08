# Summary of strip-absolute-path.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/tar/lib/strip-absolute-path.js`

## Content Preview
```
// unix absolute paths are also absolute on win32, so we use this for both
const { isAbsolute, parse } = require('path').win32

// returns [root, stripped]
// Note that windows will think that //x/y/z/a has a "root" of //x/y, and in
// those cases, we want to sanitize it to x/y/z/a, not z/a, so we strip /
// explicitly if it's the first character.
// drive-specific relative paths on Windows get their root stripped off even
// though they are not absolute, so `c:../foo` becomes ['c:', '../foo']
module.exports = path => {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 917 characters
- Lines: 25
