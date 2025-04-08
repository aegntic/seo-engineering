# Summary of NotBeforeError.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/jsonwebtoken/lib/NotBeforeError.js`

## Content Preview
```
var JsonWebTokenError = require('./JsonWebTokenError');

var NotBeforeError = function (message, date) {
  JsonWebTokenError.call(this, message);
  this.name = 'NotBeforeError';
  this.date = date;
};

NotBeforeError.prototype = Object.create(JsonWebTokenError.prototype);

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 362 characters
- Lines: 13
