# Summary of agent.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/agent.d.ts`

## Content Preview
```
import { URL } from 'url'
import Pool from './pool'
import Dispatcher from "./dispatcher";

export default Agent

declare class Agent extends Dispatcher{
  constructor(opts?: Agent.Options)
  /** `true` after `dispatcher.close()` has been called. */
  closed: boolean;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1065 characters
- Lines: 32
