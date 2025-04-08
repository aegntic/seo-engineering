# Summary of summaryTableHeader.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/istanbul-reports/lib/html-spa/src/summaryTableHeader.js`

## Content Preview
```
const React = require('react');

function getSortDetails(sortKey, activeSort) {
    let newSort = { sortKey, order: 'desc' };
    let sortClass = '';
    if (activeSort && activeSort.sortKey === sortKey) {
        sortClass = 'sorted';
        if (activeSort.order === 'desc') {
            sortClass += '-desc';
            newSort.order = 'asc';
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3915 characters
- Lines: 131
