# Summary of run_command_cursor.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/cursor/run_command_cursor.ts`

## Content Preview
```
import type { BSONSerializeOptions, Document, Long } from '../bson';
import type { Db } from '../db';
import { MongoAPIError, MongoUnexpectedServerResponseError } from '../error';
import { executeOperation, type ExecutionResult } from '../operations/execute_operation';
import { GetMoreOperation } from '../operations/get_more';
import { RunCommandOperation } from '../operations/run_command';
import type { ReadConcernLike } from '../read_concern';
import type { ReadPreferenceLike } from '../read_preference';
import type { ClientSession } from '../sessions';
import { type Callback, ns } from '../utils';
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 4810 characters
- Lines: 141
