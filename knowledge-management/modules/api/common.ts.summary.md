# Summary of common.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/operations/client_bulk_write/common.ts`

## Content Preview
```
import { type Document } from '../../bson';
import type { Filter, OptionalId, UpdateFilter, WithoutId } from '../../mongo_types';
import type { CollationOptions, CommandOperationOptions } from '../../operations/command';
import type { Hint } from '../../operations/operation';

/** @public */
export interface ClientBulkWriteOptions extends CommandOperationOptions {
  /**
   * If true, when an insert fails, don't execute the remaining writes.
   * If false, continue with remaining inserts when one fails.
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 8562 characters
- Lines: 272
