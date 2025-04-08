# Summary of subselects.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/css-select/lib/esm/pseudo-selectors/subselects.js`

## Content Preview
```
import boolbase from "boolbase";
import { isTraversal } from "../sort.js";
/** Used as a placeholder for :has. Will be replaced with the actual element. */
export const PLACEHOLDER_ELEMENT = {};
export function ensureIsTag(next, adapter) {
    if (next === boolbase.falseFunc)
        return boolbase.falseFunc;
    return (elem) => adapter.isTag(elem) && next(elem);
}
export function getNextSiblings(elem, adapter) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3663 characters
- Lines: 94
