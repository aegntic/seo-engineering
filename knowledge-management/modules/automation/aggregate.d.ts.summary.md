# Summary of aggregate.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/types/aggregate.d.ts`

## Content Preview
```
declare module 'mongoose' {
  import mongodb = require('mongodb');

  /** Extract generic type from Aggregate class */
  type AggregateExtract<P> = P extends Aggregate<infer T> ? T : never;

  interface AggregateOptions extends Omit<mongodb.AggregateOptions, 'session'>, SessionOption {
    [key: string]: any;
  }

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 6678 characters
- Lines: 181
