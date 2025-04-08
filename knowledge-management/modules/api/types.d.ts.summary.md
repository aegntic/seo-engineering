# Summary of types.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/types/types.d.ts`

## Content Preview
```

declare module 'mongoose' {
  import mongodb = require('mongodb');
  import bson = require('bson');

  class NativeBuffer extends Buffer {}

  namespace Types {
    class Array<T> extends global.Array<T> {
      /** Pops the array atomically at most one time per document `save()`. */
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 3913 characters
- Lines: 111
