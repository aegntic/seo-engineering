# Summary of errors.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/cmap/errors.ts`

## Content Preview
```
import { MongoDriverError, MongoErrorLabel, MongoNetworkError } from '../error';
import type { ConnectionPool } from './connection_pool';

/**
 * An error indicating a connection pool is closed
 * @category Error
 */
export class PoolClosedError extends MongoDriverError {
  /** The address of the connection pool */
  address: string;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2029 characters
- Lines: 76
