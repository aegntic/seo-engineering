# Summary of token_cache.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb/src/cmap/auth/mongodb_oidc/token_cache.ts`

## Content Preview
```
import { MongoDriverError } from '../../../error';
import type { IdPInfo, OIDCResponse } from '../mongodb_oidc';

class MongoOIDCError extends MongoDriverError {}

/** @internal */
export class TokenCache {
  private accessToken?: string;
  private refreshToken?: string;
  private idpInfo?: IdPInfo;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1474 characters
- Lines: 63
