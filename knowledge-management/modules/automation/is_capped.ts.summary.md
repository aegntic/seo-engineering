# Summary of is_capped.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/operations/is_capped.ts`

## Content Preview
```
import type { Collection } from '../collection';
import { MongoAPIError } from '../error';
import type { Server } from '../sdam/server';
import type { ClientSession } from '../sessions';
import type { Callback } from '../utils';
import { AbstractCallbackOperation, type OperationOptions } from './operation';

/** @internal */
export class IsCappedOperation extends AbstractCallbackOperation<boolean> {
  override options: OperationOptions;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1320 characters
- Lines: 45
