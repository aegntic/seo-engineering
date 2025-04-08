# Summary of inspector-log.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/body-parser/node_modules/debug/src/inspector-log.js`

## Content Preview
```
module.exports = inspectorLog;

// black hole
const nullStream = new (require('stream').Writable)();
nullStream._write = () => {};

/**
 * Outputs a `console.log()` to the Node.js Inspector console *only*.
 */
function inspectorLog() {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 373 characters
- Lines: 16
