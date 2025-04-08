# Summary of azure.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/client-side-encryption/providers/azure.ts`

## Content Preview
```
import { type Document } from '../../bson';
import { MongoNetworkTimeoutError } from '../../error';
import { get } from '../../utils';
import { MongoCryptAzureKMSRequestError } from '../errors';
import { type KMSProviders } from './index';

const MINIMUM_TOKEN_REFRESH_IN_MILLISECONDS = 6000;
/** Base URL for getting Azure tokens. */
export const AZURE_BASE_URL = 'http://169.254.169.254/metadata/identity/oauth2/token?';

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 5051 characters
- Lines: 182
