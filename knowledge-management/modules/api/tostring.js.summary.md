# Summary of tostring.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/jws/lib/tostring.js`

## Content Preview
```
/*global module*/
var Buffer = require('buffer').Buffer;

module.exports = function toString(obj) {
  if (typeof obj === 'string')
    return obj;
  if (typeof obj === 'number' || Buffer.isBuffer(obj))
    return obj.toString();
  return JSON.stringify(obj);
};
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 262 characters
- Lines: 11
