# Summary of azure_machine_workflow.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/cmap/auth/mongodb_oidc/azure_machine_workflow.ts`

## Content Preview
```
import { addAzureParams, AZURE_BASE_URL } from '../../../client-side-encryption/providers/azure';
import { MongoAzureError } from '../../../error';
import { get } from '../../../utils';
import type { MongoCredentials } from '../mongo_credentials';
import { type AccessToken, MachineWorkflow } from './machine_workflow';
import { type TokenCache } from './token_cache';

/** Azure request headers. */
const AZURE_HEADERS = Object.freeze({ Metadata: 'true', Accept: 'application/json' });

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2800 characters
- Lines: 86
