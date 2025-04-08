# Summary of async_compare.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/bcrypt/examples/async_compare.js`

## Content Preview
```
var bcrypt = require('../bcrypt');

(async () => {
    const start = Date.now();

    // genSalt
    const salt = await bcrypt.genSalt(10)
    console.log('salt: ' + salt);
    console.log('salt cb end: ' + (Date.now() - start) + 'ms');

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 916 characters
- Lines: 29
