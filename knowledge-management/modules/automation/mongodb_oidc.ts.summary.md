# Summary of mongodb_oidc.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/cmap/auth/mongodb_oidc.ts`

## Content Preview
```
import type { Document } from 'bson';

import { MongoInvalidArgumentError, MongoMissingCredentialsError } from '../../error';
import type { HandshakeDocument } from '../connect';
import type { Connection } from '../connection';
import { type AuthContext, AuthProvider } from './auth_provider';
import type { MongoCredentials } from './mongo_credentials';
import { AwsServiceWorkflow } from './mongodb_oidc/aws_service_workflow';
import { AzureServiceWorkflow } from './mongodb_oidc/azure_service_workflow';
import { CallbackWorkflow } from './mongodb_oidc/callback_workflow';
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 3970 characters
- Lines: 150
