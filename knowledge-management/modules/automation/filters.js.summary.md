# Summary of filters.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/css-select/lib/esm/pseudo-selectors/filters.js`

## Content Preview
```
import getNCheck from "nth-check";
import boolbase from "boolbase";
function getChildFunc(next, adapter) {
    return (elem) => {
        const parent = adapter.getParent(elem);
        return parent != null && adapter.isTag(parent) && next(elem);
    };
}
export const filters = {
    contains(next, text, { adapter }) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 5189 characters
- Lines: 143
