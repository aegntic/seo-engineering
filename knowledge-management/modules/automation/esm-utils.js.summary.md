# Summary of esm-utils.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mocha/lib/nodejs/esm-utils.js`

## Content Preview
```
const path = require('path');
const url = require('url');

const forward = x => x;

const formattedImport = async (file, esmDecorator = forward) => {
  if (path.isAbsolute(file)) {
    try {
      return await exports.doImport(esmDecorator(url.pathToFileURL(file)));
    } catch (err) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3533 characters
- Lines: 107
