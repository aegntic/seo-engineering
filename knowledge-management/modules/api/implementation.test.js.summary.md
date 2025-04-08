# Summary of implementation.test.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/bcrypt/test/implementation.test.js`

## Content Preview
```
const bcrypt = require('../bcrypt');

// some tests were adapted from https://github.com/riverrun/bcrypt_elixir/blob/master/test/base_test.exs
// which are under the BSD LICENSE

test('openwall', () => {
    expect(bcrypt.hashSync("U*U", "$2a$05$CCCCCCCCCCCCCCCCCCCCC.")).toStrictEqual("$2a$05$CCCCCCCCCCCCCCCCCCCCC.E5YPO9kmyuRGyh0XouQYb4YMJKvyOeW");
    expect(bcrypt.hashSync("U*U*", "$2a$05$CCCCCCCCCCCCCCCCCCCCC.")).toStrictEqual("$2a$05$CCCCCCCCCCCCCCCCCCCCC.VGOzA784oUp/Z0DY336zx7pLYAy0lwK");
    expect(bcrypt.hashSync("U*U*U", "$2a$05$XXXXXXXXXXXXXXXXXXXXXO")).toStrictEqual("$2a$05$XXXXXXXXXXXXXXXXXXXXXOAcXxm9kjPGEMsLznoKqmqw7tc8WCx4a");
    expect(bcrypt.hashSync("", "$2a$05$CCCCCCCCCCCCCCCCCCCCC.")).toStrictEqual("$2a$05$CCCCCCCCCCCCCCCCCCCCC.7uG0VCzI2bS7j6ymqJi9CdcdxiRTWNy");
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 5275 characters
- Lines: 49
