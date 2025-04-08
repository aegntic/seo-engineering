# Summary of positionals.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cheerio-select/lib/esm/positionals.d.ts`

## Content Preview
```
import type { Selector, PseudoSelector } from "css-what";
export declare type Filter = "first" | "last" | "eq" | "nth" | "gt" | "lt" | "even" | "odd" | "not";
export declare const filterNames: Set<string>;
export interface CheerioSelector extends PseudoSelector {
    name: Filter;
    data: string | null;
}
export declare function isFilter(s: Selector): s is CheerioSelector;
export declare function getLimit(filter: Filter, data: string | null, partLimit: number): number;
//# sourceMappingURL=positionals.d.ts.map
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 517 characters
- Lines: 10
