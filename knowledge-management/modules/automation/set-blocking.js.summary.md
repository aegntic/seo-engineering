# Summary of set-blocking.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/yargs/build/lib/utils/set-blocking.js`

## Content Preview
```
export default function setBlocking(blocking) {
    if (typeof process === 'undefined')
        return;
    [process.stdout, process.stderr].forEach(_stream => {
        const stream = _stream;
        if (stream._handle &&
            stream.isTTY &&
            typeof stream._handle.setBlocking === 'function') {
            stream._handle.setBlocking(blocking);
        }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 386 characters
- Lines: 13
