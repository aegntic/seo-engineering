# Summary of mock-pool.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/undici-types/mock-pool.d.ts`

## Content Preview
```
import Pool from './pool'
import MockAgent from './mock-agent'
import { Interceptable, MockInterceptor } from './mock-interceptor'
import Dispatcher from './dispatcher'

export default MockPool

/** MockPool extends the Pool API and allows one to mock requests. */
declare class MockPool extends Pool implements Interceptable {
  constructor(origin: string, options: MockPool.Options);
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 974 characters
- Lines: 26
