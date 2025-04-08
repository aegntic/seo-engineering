# Summary of trackStream.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/axios/lib/helpers/trackStream.js`

## Content Preview
```

export const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;

  if (!chunkSize || len < chunkSize) {
    yield chunk;
    return;
  }

  let pos = 0;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1686 characters
- Lines: 88
