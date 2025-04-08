# Summary of setDocumentTimestamps.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/timestamps/setDocumentTimestamps.js`

## Content Preview
```
'use strict';

module.exports = function setDocumentTimestamps(doc, timestampOption, currentTime, createdAt, updatedAt) {
  const skipUpdatedAt = timestampOption != null && timestampOption.updatedAt === false;
  const skipCreatedAt = timestampOption != null && timestampOption.createdAt === false;

  const defaultTimestamp = currentTime != null ?
    currentTime() :
    doc.ownerDocument().constructor.base.now();

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 894 characters
- Lines: 27
