# Summary of pool-stats.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/undici-types/pool-stats.d.ts`

## Content Preview
```
import Pool from "./pool"

export default PoolStats

declare class PoolStats {
  constructor(pool: Pool);
  /** Number of open socket connections in this pool. */
  connected: number;
  /** Number of open socket connections in this pool that do not have an active request. */
  free: number;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 669 characters
- Lines: 20
