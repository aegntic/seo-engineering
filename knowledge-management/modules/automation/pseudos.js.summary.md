# Summary of pseudos.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/css-select/lib/esm/pseudo-selectors/pseudos.js`

## Content Preview
```
// While filters are precompiled, pseudos get called when they are needed
export const pseudos = {
    empty(elem, { adapter }) {
        return !adapter.getChildren(elem).some((elem) => 
        // FIXME: `getText` call is potentially expensive.
        adapter.isTag(elem) || adapter.getText(elem) !== "");
    },
    "first-child"(elem, { adapter, equals }) {
        if (adapter.prevElementSibling) {
            return adapter.prevElementSibling(elem) == null;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2911 characters
- Lines: 79
