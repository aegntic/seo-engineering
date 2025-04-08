# Summary of mongodb_oidc.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/cmap/auth/mongodb_oidc.ts`

## Content Preview
```
import type { Document } from '../../bson';
import { MongoInvalidArgumentError, MongoMissingCredentialsError } from '../../error';
import type { HandshakeDocument } from '../connect';
import type { Connection } from '../connection';
import { type AuthContext, AuthProvider } from './auth_provider';
import type { MongoCredentials } from './mongo_credentials';
import { AzureMachineWorkflow } from './mongodb_oidc/azure_machine_workflow';
import { GCPMachineWorkflow } from './mongodb_oidc/gcp_machine_workflow';
import { K8SMachineWorkflow } from './mongodb_oidc/k8s_machine_workflow';
import { TokenCache } from './mongodb_oidc/token_cache';
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 6060 characters
- Lines: 181
