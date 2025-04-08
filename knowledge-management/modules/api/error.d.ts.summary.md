# Summary of error.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/types/error.d.ts`

## Content Preview
```
declare class NativeError extends global.Error { }

declare module 'mongoose' {
  import mongodb = require('mongodb');

  type CastError = Error.CastError;
  type SyncIndexesError = Error.SyncIndexesError;

  export class MongooseError extends global.Error {
    constructor(msg: string);
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 3396 characters
- Lines: 134
