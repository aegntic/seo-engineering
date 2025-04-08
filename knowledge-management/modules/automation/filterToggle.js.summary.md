# Summary of filterToggle.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/istanbul-reports/lib/html-spa/src/filterToggle.js`

## Content Preview
```
const React = require('react');

function ToggleOption({ children, filter, activeFilters, setFilters }) {
    return (
        <button
            className={
                'toggle__option ' + (activeFilters[filter] ? 'is-toggled' : '')
            }
            onClick={() =>
                setFilters({
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1460 characters
- Lines: 51
