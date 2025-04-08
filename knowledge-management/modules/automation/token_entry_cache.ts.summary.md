# Summary of token_entry_cache.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/cmap/auth/mongodb_oidc/token_entry_cache.ts`

## Content Preview
```
import type { IdPServerInfo, IdPServerResponse } from '../mongodb_oidc';
import { Cache, ExpiringCacheEntry } from './cache';

/* Default expiration is now for when no expiration provided */
const DEFAULT_EXPIRATION_SECS = 0;

/** @internal */
export class TokenEntry extends ExpiringCacheEntry {
  tokenResult: IdPServerResponse;
  serverInfo: IdPServerInfo;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2028 characters
- Lines: 78
