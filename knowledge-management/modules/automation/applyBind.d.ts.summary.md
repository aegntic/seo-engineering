# Summary of applyBind.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/call-bind-apply-helpers/applyBind.d.ts`

## Content Preview
```
import actualApply from './actualApply';

type TupleSplitHead<T extends any[], N extends number> = T['length'] extends N
  ? T
  : T extends [...infer R, any]
  ? TupleSplitHead<R, N>
  : never

type TupleSplitTail<T, N extends number, O extends any[] = []> = O['length'] extends N
  ? T
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 614 characters
- Lines: 19
