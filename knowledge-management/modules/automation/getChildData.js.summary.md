# Summary of getChildData.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/istanbul-reports/lib/html-spa/src/getChildData.js`

## Content Preview
```
function addPath(node, parentPath) {
    if (!parentPath) {
        return node;
    }
    return { ...node, file: parentPath + '/' + node.file };
}

function flatten(nodes, parentPath) {
    let children = [];
    for (let i = 0; i < nodes.length; i++) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 4557 characters
- Lines: 156
