# Summary of fileBreadcrumbs.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/istanbul-reports/lib/html-spa/src/fileBreadcrumbs.js`

## Content Preview
```
const React = require('react');

module.exports = function FileBreadcrumbs({ fileFilter = '', setFileFilter }) {
    const parts = fileFilter.split('/');
    const breadcrumbs = [
        {
            path: '',
            name: 'all files'
        },
        ...parts.map((part, i) => ({
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 750 characters
- Lines: 32
