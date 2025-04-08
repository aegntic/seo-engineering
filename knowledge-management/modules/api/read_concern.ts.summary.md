# Summary of read_concern.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/read_concern.ts`

## Content Preview
```
import type { Document } from './bson';

/** @public */
export const ReadConcernLevel = Object.freeze({
  local: 'local',
  majority: 'majority',
  linearizable: 'linearizable',
  available: 'available',
  snapshot: 'snapshot'
} as const);
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2502 characters
- Lines: 89
