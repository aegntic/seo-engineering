# Summary of list_search_indexes_cursor.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/cursor/list_search_indexes_cursor.ts`

## Content Preview
```
import type { Collection } from '../collection';
import type { AggregateOptions } from '../operations/aggregate';
import { AggregationCursor } from './aggregation_cursor';

/** @public */
export type ListSearchIndexesOptions = AggregateOptions;

/** @public */
export class ListSearchIndexesCursor extends AggregationCursor<{ name: string }> {
  /** @internal */
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 656 characters
- Lines: 21
