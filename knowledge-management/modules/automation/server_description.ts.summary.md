# Summary of server_description.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/sdam/server_description.ts`

## Content Preview
```
import { type Document, Long, type ObjectId } from '../bson';
import { type MongoError, MongoRuntimeError, type MongoServerError } from '../error';
import { arrayStrictEqual, compareObjectId, errorStrictEqual, HostAddress, now } from '../utils';
import type { ClusterTime } from './common';
import { ServerType } from './common';

const WRITABLE_SERVER_TYPES = new Set<ServerType>([
  ServerType.RSPrimary,
  ServerType.Standalone,
  ServerType.Mongos,
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 8337 characters
- Lines: 263
