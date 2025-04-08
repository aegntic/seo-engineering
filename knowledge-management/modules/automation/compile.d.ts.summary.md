# Summary of compile.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/css-select/lib/esm/compile.d.ts`

## Content Preview
```
import { Selector } from "css-what";
import type { CompiledQuery, InternalOptions, InternalSelector } from "./types.js";
/**
 * Compiles a selector to an executable function.
 *
 * @param selector Selector to compile.
 * @param options Compilation options.
 * @param context Optional context for the selector.
 */
export declare function compile<Node, ElementNode extends Node>(selector: string | Selector[][], options: InternalOptions<Node, ElementNode>, context?: Node[] | Node): CompiledQuery<Node>;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 939 characters
- Lines: 13
