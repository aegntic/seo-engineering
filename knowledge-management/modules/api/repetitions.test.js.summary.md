# Summary of repetitions.test.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/bcrypt/test/repetitions.test.js`

## Content Preview
```
const bcrypt = require('../bcrypt');

const EXPECTED = 2500; //number of times to iterate these tests.)

test('salt_length', () => {
    expect.assertions(EXPECTED);

    return Promise.all(Array.from({length: EXPECTED},
        () => bcrypt.genSalt(10)
            .then(salt => expect(salt).toHaveLength(29))));
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1608 characters
- Lines: 47
