# Summary of find_and_modify.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/operations/find_and_modify.ts`

## Content Preview
```
import type { Document } from '../bson';
import type { Collection } from '../collection';
import { MongoCompatibilityError, MongoInvalidArgumentError } from '../error';
import { ReadPreference } from '../read_preference';
import type { Server } from '../sdam/server';
import type { ClientSession } from '../sessions';
import { formatSort, type Sort, type SortForCmd } from '../sort';
import { type Callback, decorateWithCollation, hasAtomicOperators, maxWireVersion } from '../utils';
import type { WriteConcern, WriteConcernSettings } from '../write_concern';
import { CommandCallbackOperation, type CommandOperationOptions } from './command';
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 10256 characters
- Lines: 304
