# Summary of set_profiling_level.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/operations/set_profiling_level.ts`

## Content Preview
```
import type { Db } from '../db';
import { MongoInvalidArgumentError } from '../error';
import type { Server } from '../sdam/server';
import type { ClientSession } from '../sessions';
import { type TimeoutContext } from '../timeout';
import { enumToString } from '../utils';
import { CommandOperation, type CommandOperationOptions } from './command';

const levelValues = new Set(['off', 'slow_only', 'all']);

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1965 characters
- Lines: 73
