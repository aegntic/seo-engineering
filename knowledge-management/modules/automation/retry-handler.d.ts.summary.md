# Summary of retry-handler.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/retry-handler.d.ts`

## Content Preview
```
import Dispatcher from "./dispatcher";

export default RetryHandler;

declare class RetryHandler implements Dispatcher.DispatchHandlers {
  constructor(
    options: Dispatcher.DispatchOptions & {
      retryOptions?: RetryHandler.RetryOptions;
    },
    retryHandlers: RetryHandler.RetryHandlers
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2973 characters
- Lines: 117
