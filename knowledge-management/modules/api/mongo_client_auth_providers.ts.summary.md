# Summary of mongo_client_auth_providers.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/mongo_client_auth_providers.ts`

## Content Preview
```
import { type AuthProvider } from './cmap/auth/auth_provider';
import { GSSAPI } from './cmap/auth/gssapi';
import { type AuthMechanismProperties } from './cmap/auth/mongo_credentials';
import { MongoDBAWS } from './cmap/auth/mongodb_aws';
import { MongoDBOIDC, OIDC_WORKFLOWS, type Workflow } from './cmap/auth/mongodb_oidc';
import { AutomatedCallbackWorkflow } from './cmap/auth/mongodb_oidc/automated_callback_workflow';
import { HumanCallbackWorkflow } from './cmap/auth/mongodb_oidc/human_callback_workflow';
import { TokenCache } from './cmap/auth/mongodb_oidc/token_cache';
import { Plain } from './cmap/auth/plain';
import { AuthMechanism } from './cmap/auth/providers';
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 3652 characters
- Lines: 96
