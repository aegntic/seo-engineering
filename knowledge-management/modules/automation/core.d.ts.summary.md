# Summary of core.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sift/lib/core.d.ts`

## Content Preview
```
import { Key, Comparator } from "./utils";
export interface Operation<TItem> {
    readonly keep: boolean;
    readonly done: boolean;
    propop: boolean;
    reset(): any;
    next(item: TItem, key?: Key, owner?: any, root?: boolean, leaf?: boolean): any;
}
export type Tester = (item: any, key?: Key, owner?: any, root?: boolean, leaf?: boolean) => boolean;
export interface NamedOperation {
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 5068 characters
- Lines: 117
