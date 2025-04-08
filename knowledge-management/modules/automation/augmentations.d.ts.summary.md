# Summary of augmentations.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/types/augmentations.d.ts`

## Content Preview
```
// this import is required so that types get merged instead of completely overwritten
import 'bson';

declare module 'bson' {
  interface ObjectId {
    /** Mongoose automatically adds a conveniency "_id" getter on the base ObjectId class */
    _id: this;
  }
}

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 263 characters
- Lines: 10
