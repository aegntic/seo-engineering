# Summary of remapping.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@ampproject/remapping/dist/types/remapping.d.ts`

## Content Preview
```
import SourceMap from './source-map';
import type { SourceMapInput, SourceMapLoader, Options } from './types';
export type { SourceMapSegment, EncodedSourceMap, EncodedSourceMap as RawSourceMap, DecodedSourceMap, SourceMapInput, SourceMapLoader, LoaderContext, Options, } from './types';
export type { SourceMap };
/**
 * Traces through all the mappings in the root sourcemap, through the sources
 * (and their sourcemaps), all the way back to the original source location.
 *
 * `loader` will be called every time we encounter a source file. If it returns
 * a sourcemap, we will recurse into that sourcemap to continue the trace. If
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1094 characters
- Lines: 21
