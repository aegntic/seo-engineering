# Summary of mock-client.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/mock-client.d.ts`

## Content Preview
```
import Client from './client'
import Dispatcher from './dispatcher'
import MockAgent from './mock-agent'
import { MockInterceptor, Interceptable } from './mock-interceptor'

export default MockClient

/** MockClient extends the Client API and allows one to mock requests. */
declare class MockClient extends Client implements Interceptable {
  constructor(origin: string, options: MockClient.Options);
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1002 characters
- Lines: 26
