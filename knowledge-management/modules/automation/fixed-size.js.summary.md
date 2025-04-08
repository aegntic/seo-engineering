# Summary of fixed-size.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/fast-fifo/fixed-size.js`

## Content Preview
```
module.exports = class FixedFIFO {
  constructor (hwm) {
    if (!(hwm > 0) || ((hwm - 1) & hwm) !== 0) throw new Error('Max size for a FixedFIFO should be a power of two')
    this.buffer = new Array(hwm)
    this.mask = hwm - 1
    this.top = 0
    this.btm = 0
    this.next = null
  }

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 875 characters
- Lines: 40
