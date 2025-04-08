# Summary of set_profiling_level.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/operations/set_profiling_level.ts`

## Content Preview
```
import type { Db } from '../db';
import { MongoInvalidArgumentError, MongoRuntimeError } from '../error';
import type { Server } from '../sdam/server';
import type { ClientSession } from '../sessions';
import type { Callback } from '../utils';
import { enumToString } from '../utils';
import { CommandCallbackOperation, type CommandOperationOptions } from './command';

const levelValues = new Set(['off', 'slow_only', 'all']);

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2130 characters
- Lines: 75
