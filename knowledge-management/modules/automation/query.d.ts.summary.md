# Summary of query.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/types/query.d.ts`

## Content Preview
```
declare module 'mongoose' {
  import mongodb = require('mongodb');

  export type Condition<T> = T | QuerySelector<T | any> | any;

  /**
   * Filter query to select the documents that match the query
   * @example
   * ```js
   * { age: { $gte: 30 } }
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 35190 characters
- Lines: 896
