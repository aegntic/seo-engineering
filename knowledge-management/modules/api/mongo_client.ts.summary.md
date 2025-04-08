# Summary of mongo_client.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/mongo_client.ts`

## Content Preview
```
import { promises as fs } from 'fs';
import type { TcpNetConnectOpts } from 'net';
import type { ConnectionOptions as TLSConnectionOptions, TLSSocketOptions } from 'tls';

import { type BSONSerializeOptions, type Document, resolveBSONOptions } from './bson';
import { ChangeStream, type ChangeStreamDocument, type ChangeStreamOptions } from './change_stream';
import type { AutoEncrypter, AutoEncryptionOptions } from './client-side-encryption/auto_encrypter';
import {
  type AuthMechanismProperties,
  DEFAULT_ALLOWED_HOSTS,
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 40941 characters
- Lines: 1063
