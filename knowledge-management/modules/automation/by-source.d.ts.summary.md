# Summary of by-source.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@jridgewell/trace-mapping/dist/types/by-source.d.ts`

## Content Preview
```
import type { ReverseSegment, SourceMapSegment } from './sourcemap-segment';
import type { MemoState } from './binary-search';
export type Source = {
    __proto__: null;
    [line: number]: Exclude<ReverseSegment, [number]>[];
};
export default function buildBySources(decoded: readonly SourceMapSegment[][], memos: MemoState[]): Source[];

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 341 characters
- Lines: 8
