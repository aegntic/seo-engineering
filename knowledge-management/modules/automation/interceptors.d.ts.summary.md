# Summary of interceptors.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/interceptors.d.ts`

## Content Preview
```
import { LookupOptions } from 'node:dns'

import Dispatcher from "./dispatcher";
import RetryHandler from "./retry-handler";

export default Interceptors;

declare namespace Interceptors {
  export type DumpInterceptorOpts = { maxSize?: number }
  export type RetryInterceptorOpts = RetryHandler.RetryOptions
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1681 characters
- Lines: 33
