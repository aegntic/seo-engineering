# Summary of JsonWebTokenError.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/jsonwebtoken/lib/JsonWebTokenError.js`

## Content Preview
```
var JsonWebTokenError = function (message, error) {
  Error.call(this, message);
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
  this.name = 'JsonWebTokenError';
  this.message = message;
  if (error) this.inner = error;
};

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 428 characters
- Lines: 15
