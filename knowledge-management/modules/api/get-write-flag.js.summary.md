# Summary of get-write-flag.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/tar/lib/get-write-flag.js`

## Content Preview
```
// Get the appropriate flag to use for creating files
// We use fmap on Windows platforms for files less than
// 512kb.  This is a fairly low limit, but avoids making
// things slower in some cases.  Since most of what this
// library is used for is extracting tarballs of many
// relatively small files in npm packages and the like,
// it can be a big boost on Windows platforms.
// Only supported in Node v12.9.0 and above.
const platform = process.env.__FAKE_PLATFORM__ || process.platform
const isWindows = platform === 'win32'
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 921 characters
- Lines: 21
