# Summary of gcp.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/client-side-encryption/providers/gcp.ts`

## Content Preview
```
import { getGcpMetadata } from '../../deps';
import { type KMSProviders } from '.';

/** @internal */
export async function loadGCPCredentials(kmsProviders: KMSProviders): Promise<KMSProviders> {
  const gcpMetadata = getGcpMetadata();

  if ('kModuleError' in gcpMetadata) {
    return kmsProviders;
  }
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 508 characters
- Lines: 17
