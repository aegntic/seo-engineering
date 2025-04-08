# Summary of forever_gen_salt.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/bcrypt/examples/forever_gen_salt.js`

## Content Preview
```
var bcrypt = require('../bcrypt');

(function printSalt() {
  bcrypt.genSalt(10, function(err, salt) {
    console.log('salt: ' + salt);
    printSalt();
  });
})()

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 165 characters
- Lines: 9
