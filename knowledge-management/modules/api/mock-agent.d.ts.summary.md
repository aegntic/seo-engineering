# Summary of mock-agent.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/undici-types/mock-agent.d.ts`

## Content Preview
```
import Agent from './agent'
import Dispatcher from './dispatcher'
import { Interceptable, MockInterceptor } from './mock-interceptor'
import MockDispatch = MockInterceptor.MockDispatch;

export default MockAgent

interface PendingInterceptor extends MockDispatch {
  origin: string;
}
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2535 characters
- Lines: 51
