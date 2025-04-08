# Summary of list_collections.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/operations/list_collections.ts`

## Content Preview
```
import type { Binary, Document } from '../bson';
import type { Db } from '../db';
import type { Server } from '../sdam/server';
import type { ClientSession } from '../sessions';
import { type Callback, maxWireVersion } from '../utils';
import { CommandCallbackOperation, type CommandOperationOptions } from './command';
import { Aspect, defineAspects } from './operation';

/** @public */
export interface ListCollectionsOptions extends Omit<CommandOperationOptions, 'writeConcern'> {
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 3284 characters
- Lines: 100
