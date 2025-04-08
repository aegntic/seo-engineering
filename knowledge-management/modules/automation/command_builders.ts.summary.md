# Summary of command_builders.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb/src/cmap/auth/mongodb_oidc/command_builders.ts`

## Content Preview
```
import { Binary, BSON, type Document } from '../../../bson';
import { type MongoCredentials } from '../mongo_credentials';
import { AuthMechanism } from '../providers';

/** @internal */
export interface OIDCCommand {
  saslStart?: number;
  saslContinue?: number;
  conversationId?: number;
  mechanism?: string;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1608 characters
- Lines: 54
