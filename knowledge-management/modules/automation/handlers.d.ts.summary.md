# Summary of handlers.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/handlers.d.ts`

## Content Preview
```
import Dispatcher from "./dispatcher";

export declare class RedirectHandler implements Dispatcher.DispatchHandlers {
  constructor(
    dispatch: Dispatcher,
    maxRedirections: number,
    opts: Dispatcher.DispatchOptions,
    handler: Dispatcher.DispatchHandlers,
    redirectionLimitReached: boolean
  );
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 447 characters
- Lines: 16
