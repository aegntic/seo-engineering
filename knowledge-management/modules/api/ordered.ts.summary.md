# Summary of ordered.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/bulk/ordered.ts`

## Content Preview
```
import type { Document } from '../bson';
import * as BSON from '../bson';
import type { Collection } from '../collection';
import { MongoInvalidArgumentError } from '../error';
import type { DeleteStatement } from '../operations/delete';
import type { UpdateStatement } from '../operations/update';
import { Batch, BatchType, BulkOperationBase, type BulkWriteOptions } from './common';

/** @public */
export class OrderedBulkOperation extends BulkOperationBase {
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 3052 characters
- Lines: 84
