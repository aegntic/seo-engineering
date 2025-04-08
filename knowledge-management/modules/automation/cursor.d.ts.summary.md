# Summary of cursor.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/types/cursor.d.ts`

## Content Preview
```
declare module 'mongoose' {

  import stream = require('stream');

  type CursorFlag = 'tailable' | 'oplogReplay' | 'noCursorTimeout' | 'awaitData' | 'partial';

  interface EachAsyncOptions {
    parallel?: number;
    batchSize?: number;
    continueOnError?: boolean;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2399 characters
- Lines: 68
