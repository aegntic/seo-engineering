# Summary of source-map.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@ampproject/remapping/dist/types/source-map.d.ts`

## Content Preview
```
import type { GenMapping } from '@jridgewell/gen-mapping';
import type { DecodedSourceMap, EncodedSourceMap, Options } from './types';
/**
 * A SourceMap v3 compatible sourcemap, which only includes fields that were
 * provided to it.
 */
export default class SourceMap {
    file?: string | null;
    mappings: EncodedSourceMap['mappings'] | DecodedSourceMap['mappings'];
    sourceRoot?: string;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 623 characters
- Lines: 19
