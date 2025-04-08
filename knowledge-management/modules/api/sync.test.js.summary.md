# Summary of sync.test.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/bcrypt/test/sync.test.js`

## Content Preview
```
const bcrypt = require('../bcrypt')

test('salt_length', () => {
    const salt = bcrypt.genSaltSync(13);
    expect(salt).toHaveLength(29);
    const [_, version, rounds] = salt.split('$');
    expect(version).toStrictEqual('2b')
    expect(rounds).toStrictEqual('13')
})

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 4347 characters
- Lines: 126
