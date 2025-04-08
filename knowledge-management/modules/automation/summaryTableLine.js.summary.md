# Summary of summaryTableLine.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/istanbul-reports/lib/html-spa/src/summaryTableLine.js`

## Content Preview
```
const React = require('react');

function MetricCells({ metrics }) {
    const { classForPercent, pct, covered, missed, total } = metrics;

    return (
        <>
            <td className={'pct ' + classForPercent}>{Math.round(pct)}% </td>
            <td className={classForPercent}>
                <div className="bar">
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 5252 characters
- Lines: 160
