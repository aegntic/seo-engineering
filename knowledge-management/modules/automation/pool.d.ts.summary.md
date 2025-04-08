# Summary of pool.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/pool.d.ts`

## Content Preview
```
import Client from './client'
import TPoolStats from './pool-stats'
import { URL } from 'url'
import Dispatcher from "./dispatcher";

export default Pool

type PoolConnectOptions = Omit<Dispatcher.ConnectOptions, "origin">;

declare class Pool extends Dispatcher {
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1336 characters
- Lines: 40
