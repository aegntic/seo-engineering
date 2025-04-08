# Summary of mongo_client.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/mongo_client.ts`

## Content Preview
```
import type { TcpNetConnectOpts } from 'net';
import type { ConnectionOptions as TLSConnectionOptions, TLSSocketOptions } from 'tls';
import { promisify } from 'util';

import { type BSONSerializeOptions, type Document, resolveBSONOptions } from './bson';
import { ChangeStream, type ChangeStreamDocument, type ChangeStreamOptions } from './change_stream';
import {
  type AuthMechanismProperties,
  DEFAULT_ALLOWED_HOSTS,
  type MongoCredentials
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 31640 characters
- Lines: 840
