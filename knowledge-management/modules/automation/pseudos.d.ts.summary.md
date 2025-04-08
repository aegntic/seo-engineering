# Summary of pseudos.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/css-select/lib/esm/pseudo-selectors/pseudos.d.ts`

## Content Preview
```
import type { PseudoSelector } from "css-what";
import type { InternalOptions } from "../types.js";
export declare type Pseudo = <Node, ElementNode extends Node>(elem: ElementNode, options: InternalOptions<Node, ElementNode>, subselect?: string | null) => boolean;
export declare const pseudos: Record<string, Pseudo>;
export declare function verifyPseudoArgs<T extends Array<unknown>>(func: (...args: T) => boolean, name: string, subselect: PseudoSelector["data"], argIndex: number): void;
//# sourceMappingURL=pseudos.d.ts.map
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 528 characters
- Lines: 6
