# Summary of browser-decoder.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/text-decoder/lib/browser-decoder.js`

## Content Preview
```
module.exports = class BrowserDecoder {
  constructor (encoding) {
    this.decoder = new TextDecoder(encoding === 'utf16le' ? 'utf16-le' : encoding)
  }

  get remaining () {
    return -1
  }

  decode (data) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 342 characters
- Lines: 18
