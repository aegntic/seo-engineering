# Summary of build-source-map-tree.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@ampproject/remapping/dist/types/build-source-map-tree.d.ts`

## Content Preview
```
import type { MapSource as MapSourceType } from './source-map-tree';
import type { SourceMapInput, SourceMapLoader } from './types';
/**
 * Recursively builds a tree structure out of sourcemap files, with each node
 * being either an `OriginalSource` "leaf" or a `SourceMapTree` composed of
 * `OriginalSource`s and `SourceMapTree`s.
 *
 * Every sourcemap is composed of a collection of source files and mappings
 * into locations of those source files. When we generate a `SourceMapTree` for
 * the sourcemap, we attempt to load each source file's own sourcemap. If it
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 799 characters
- Lines: 15
