# Summary of utf8.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/b4a/lib/utf8.js`

## Content Preview
```
function byteLength (string) {
  let length = 0

  for (let i = 0, n = string.length; i < n; i++) {
    const code = string.charCodeAt(i)

    if (code >= 0xd800 && code <= 0xdbff && i + 1 < n) {
      const code = string.charCodeAt(i + 1)

      if (code >= 0xdc00 && code <= 0xdfff) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2919 characters
- Lines: 146
