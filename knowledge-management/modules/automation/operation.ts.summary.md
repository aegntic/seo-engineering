# Summary of operation.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/operations/operation.ts`

## Content Preview
```
import { promisify } from 'util';

import { type BSONSerializeOptions, type Document, resolveBSONOptions } from '../bson';
import { ReadPreference, type ReadPreferenceLike } from '../read_preference';
import type { Server } from '../sdam/server';
import type { ClientSession } from '../sessions';
import type { Callback, MongoDBNamespace } from '../utils';

export const Aspect = {
  READ_OPERATION: Symbol('READ_OPERATION'),
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 4122 characters
- Lines: 142
