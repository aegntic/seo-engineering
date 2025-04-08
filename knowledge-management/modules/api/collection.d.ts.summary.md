# Summary of collection.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/types/collection.d.ts`

## Content Preview
```
declare module 'mongoose' {
  import mongodb = require('mongodb');

  /*
   * section collection.js
   */
  interface CollectionBase<T extends mongodb.Document> extends mongodb.Collection<T> {
    /*
     * Abstract methods. Some of these are already defined on the
     * mongodb.Collection interface so they've been commented out.
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1519 characters
- Lines: 45
