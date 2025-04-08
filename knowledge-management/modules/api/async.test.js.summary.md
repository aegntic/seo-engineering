# Summary of async.test.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/bcrypt/test/async.test.js`

## Content Preview
```
const bcrypt = require('../bcrypt');

test('salt_length', done => {
    expect.assertions(1);
    bcrypt.genSalt(10, function (err, salt) {
        expect(salt).toHaveLength(29);
        done();
    });
})

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 5893 characters
- Lines: 210
