# Summary of list_search_indexes_cursor.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/cursor/list_search_indexes_cursor.ts`

## Content Preview
```
import type { Collection } from '../collection';
import type { AggregateOptions } from '../operations/aggregate';
import { AggregationCursor } from './aggregation_cursor';

/** @public */
export type ListSearchIndexesOptions = Omit<AggregateOptions, 'readConcern' | 'writeConcern'>;

/** @public */
export class ListSearchIndexesCursor extends AggregationCursor<{ name: string }> {
  /** @internal */
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 694 characters
- Lines: 21
