# Summary of list_indexes_cursor.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/cursor/list_indexes_cursor.ts`

## Content Preview
```
import type { Collection } from '../collection';
import { executeOperation } from '../operations/execute_operation';
import { ListIndexesOperation, type ListIndexesOptions } from '../operations/indexes';
import type { ClientSession } from '../sessions';
import { AbstractCursor, type InitialCursorResponse } from './abstract_cursor';

/** @public */
export class ListIndexesCursor extends AbstractCursor {
  parent: Collection;
  options?: ListIndexesOptions;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1210 characters
- Lines: 38
