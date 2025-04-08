# Summary of indexes.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/types/indexes.d.ts`

## Content Preview
```
declare module 'mongoose' {
  import mongodb = require('mongodb');

  /**
   * Makes the indexes in MongoDB match the indexes defined in every model's
   * schema. This function will drop any indexes that are not defined in
   * the model's schema except the `_id` index, and build any indexes that
   * are in your schema but not in MongoDB.
   */
  function syncIndexes(options?: SyncIndexesOptions): Promise<ConnectionSyncIndexesResult>;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 3676 characters
- Lines: 98
