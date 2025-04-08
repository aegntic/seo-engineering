# Summary of azure_service_workflow.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/cmap/auth/mongodb_oidc/azure_service_workflow.ts`

## Content Preview
```
import { MongoAzureError } from '../../../error';
import { request } from '../../../utils';
import type { MongoCredentials } from '../mongo_credentials';
import { AzureTokenCache } from './azure_token_cache';
import { ServiceWorkflow } from './service_workflow';

/** Base URL for getting Azure tokens. */
const AZURE_BASE_URL =
  'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01';

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2718 characters
- Lines: 87
