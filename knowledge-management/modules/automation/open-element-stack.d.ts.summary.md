# Summary of open-element-stack.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/parse5/dist/cjs/parser/open-element-stack.d.ts`

## Content Preview
```
import { TAG_ID as $ } from '../common/html.js';
import type { TreeAdapter, TreeAdapterTypeMap } from '../tree-adapters/interface.js';
export interface StackHandler<T extends TreeAdapterTypeMap> {
    onItemPush: (node: T['parentNode'], tid: number, isTop: boolean) => void;
    onItemPop: (node: T['parentNode'], isTop: boolean) => void;
}
export declare class OpenElementStack<T extends TreeAdapterTypeMap> {
    private treeAdapter;
    private handler;
    items: T['parentNode'][];
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2258 characters
- Lines: 54
