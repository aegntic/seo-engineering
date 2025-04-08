# Summary of normalize-windows-path.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/tar/lib/normalize-windows-path.js`

## Content Preview
```
// on windows, either \ or / are valid directory separators.
// on unix, \ is a valid character in filenames.
// so, on windows, and only on windows, we replace all \ chars with /,
// so that we can use / as our one and only directory separator char.

const platform = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform
module.exports = platform !== 'win32' ? p => p
  : p => p && p.replace(/\\/g, '/')

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 410 characters
- Lines: 9
