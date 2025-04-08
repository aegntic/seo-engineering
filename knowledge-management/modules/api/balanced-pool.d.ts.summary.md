# Summary of balanced-pool.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/undici-types/balanced-pool.d.ts`

## Content Preview
```
import Pool from './pool'
import Dispatcher from './dispatcher'
import { URL } from 'url'

export default BalancedPool

type BalancedPoolConnectOptions = Omit<Dispatcher.ConnectOptions, "origin">;

declare class BalancedPool extends Dispatcher {
  constructor(url: string | string[] | URL | URL[], options?: Pool.Options);
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 961 characters
- Lines: 30
