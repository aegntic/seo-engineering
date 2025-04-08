# Summary of deps.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/deps.ts`

## Content Preview
```
/* eslint-disable @typescript-eslint/no-var-requires */
import type { Document } from './bson';
import type { ProxyOptions } from './cmap/connection';
import { MongoMissingDependencyError } from './error';
import type { MongoClient } from './mongo_client';
import type { Callback } from './utils';

function makeErrorModule(error: any) {
  const props = error ? { kModuleError: error } : {};
  return new Proxy(props, {
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 14856 characters
- Lines: 429
