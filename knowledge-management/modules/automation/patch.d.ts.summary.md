# Summary of patch.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/patch.d.ts`

## Content Preview
```
/// <reference types="node" />

// See https://github.com/nodejs/undici/issues/1740

export type DOMException = typeof globalThis extends { DOMException: infer T }
 ? T
 : any

export interface EventInit {
  bubbles?: boolean
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 691 characters
- Lines: 34
