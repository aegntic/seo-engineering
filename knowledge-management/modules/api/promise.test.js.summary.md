# Summary of promise.test.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/bcrypt/test/promise.test.js`

## Content Preview
```
const bcrypt = require('../bcrypt');
const promises = require('../promises');

test('salt_returns_promise_on_no_args', () => {
    // make sure test passes with non-native implementations such as bluebird
    // http://stackoverflow.com/questions/27746304/how-do-i-tell-if-an-object-is-a-promise
    expect(typeof bcrypt.genSalt().then).toEqual('function')
})

test('salt_returns_promise_on_null_callback', () => {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 5187 characters
- Lines: 169
