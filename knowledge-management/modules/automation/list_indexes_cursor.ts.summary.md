# Summary of list_indexes_cursor.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/cursor/list_indexes_cursor.ts`

## Content Preview
```
import type { Collection } from '../collection';
import { executeOperation, type ExecutionResult } from '../operations/execute_operation';
import { ListIndexesOperation, type ListIndexesOptions } from '../operations/indexes';
import type { ClientSession } from '../sessions';
import type { Callback } from '../utils';
import { AbstractCursor } from './abstract_cursor';

/** @public */
export class ListIndexesCursor extends AbstractCursor {
  parent: Collection;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1333 characters
- Lines: 42
