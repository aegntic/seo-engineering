# Summary of plain.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/cmap/auth/plain.ts`

## Content Preview
```
import { Binary } from '../../bson';
import { MongoMissingCredentialsError } from '../../error';
import { ns } from '../../utils';
import { type AuthContext, AuthProvider } from './auth_provider';

export class Plain extends AuthProvider {
  override async auth(authContext: AuthContext): Promise<void> {
    const { connection, credentials } = authContext;
    if (!credentials) {
      throw new MongoMissingCredentialsError('AuthContext must provide credentials.');
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 810 characters
- Lines: 26
