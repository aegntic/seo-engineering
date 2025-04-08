# Summary of kill_cursors.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/operations/kill_cursors.ts`

## Content Preview
```
import type { Long } from '../bson';
import { MongoRuntimeError } from '../error';
import type { Server } from '../sdam/server';
import type { ClientSession } from '../sessions';
import { type TimeoutContext } from '../timeout';
import { type MongoDBNamespace, squashError } from '../utils';
import { AbstractOperation, Aspect, defineAspects, type OperationOptions } from './operation';

/**
 * https://www.mongodb.com/docs/manual/reference/command/killCursors/
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1993 characters
- Lines: 66
