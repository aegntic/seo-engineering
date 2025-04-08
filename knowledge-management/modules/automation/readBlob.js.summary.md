# Summary of readBlob.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/axios/lib/helpers/readBlob.js`

## Content Preview
```
const {asyncIterator} = Symbol;

const readBlob = async function* (blob) {
  if (blob.stream) {
    yield* blob.stream()
  } else if (blob.arrayBuffer) {
    yield await blob.arrayBuffer()
  } else if (blob[asyncIterator]) {
    yield* blob[asyncIterator]();
  } else {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 318 characters
- Lines: 16
