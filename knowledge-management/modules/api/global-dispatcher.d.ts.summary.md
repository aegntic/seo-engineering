# Summary of global-dispatcher.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/undici-types/global-dispatcher.d.ts`

## Content Preview
```
import Dispatcher from "./dispatcher";

export {
  getGlobalDispatcher,
  setGlobalDispatcher
}

declare function setGlobalDispatcher<DispatcherImplementation extends Dispatcher>(dispatcher: DispatcherImplementation): void;
declare function getGlobalDispatcher(): Dispatcher;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 276 characters
- Lines: 10
