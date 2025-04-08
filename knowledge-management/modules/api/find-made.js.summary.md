# Summary of find-made.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mkdirp/lib/find-made.js`

## Content Preview
```
const {dirname} = require('path')

const findMade = (opts, parent, path = undefined) => {
  // we never want the 'made' return value to be a root directory
  if (path === parent)
    return Promise.resolve()

  return opts.statAsync(parent).then(
    st => st.isDirectory() ? path : undefined, // will fail later
    er => er.code === 'ENOENT'
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 763 characters
- Lines: 30
