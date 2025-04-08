# Summary of TokenExpiredError.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/jsonwebtoken/lib/TokenExpiredError.js`

## Content Preview
```
var JsonWebTokenError = require('./JsonWebTokenError');

var TokenExpiredError = function (message, expiredAt) {
  JsonWebTokenError.call(this, message);
  this.name = 'TokenExpiredError';
  this.expiredAt = expiredAt;
};

TokenExpiredError.prototype = Object.create(JsonWebTokenError.prototype);

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 395 characters
- Lines: 13
