# Summary of summaryHeader.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/istanbul-reports/lib/html-spa/src/summaryHeader.js`

## Content Preview
```
const React = require('react');

function Ignores({ metrics, metricsToShow }) {
    const metricKeys = Object.keys(metricsToShow);
    const result = [];

    for (let i = 0; i < metricKeys.length; i++) {
        const metricKey = metricKeys[i];
        if (metricsToShow[metricKey]) {
            const skipped = metrics[metricKey].skipped;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1950 characters
- Lines: 64
