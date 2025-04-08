# Summary of is_capped.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/operations/is_capped.ts`

## Content Preview
```
import type { Collection } from '../collection';
import { MongoAPIError } from '../error';
import type { Server } from '../sdam/server';
import type { ClientSession } from '../sessions';
import { AbstractOperation, type OperationOptions } from './operation';

/** @internal */
export class IsCappedOperation extends AbstractOperation<boolean> {
  override options: OperationOptions;
  collection: Collection;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1177 characters
- Lines: 36
