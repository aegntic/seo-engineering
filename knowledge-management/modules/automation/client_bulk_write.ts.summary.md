# Summary of client_bulk_write.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb/src/operations/client_bulk_write/client_bulk_write.ts`

## Content Preview
```
import { MongoClientBulkWriteExecutionError, ServerType } from '../../beta';
import { ClientBulkWriteCursorResponse } from '../../cmap/wire_protocol/responses';
import type { Server } from '../../sdam/server';
import type { ClientSession } from '../../sessions';
import { type TimeoutContext } from '../../timeout';
import { MongoDBNamespace } from '../../utils';
import { CommandOperation } from '../command';
import { Aspect, defineAspects } from '../operation';
import { type ClientBulkWriteCommandBuilder } from './command_builder';
import { type ClientBulkWriteOptions } from './common';
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 4032 characters
- Lines: 116
