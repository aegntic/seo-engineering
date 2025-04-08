# Summary of document.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/types/document.d.ts`

## Content Preview
```
declare module 'mongoose' {
  import mongodb = require('mongodb');

  /** A list of paths to skip. If set, Mongoose will validate every modified path that is not in this list. */
  type pathsToSkip = string[] | string;

  interface DocumentSetOptions {
    merge?: boolean;

    [key: string]: any;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 13273 characters
- Lines: 293
