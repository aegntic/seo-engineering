# Summary of pack.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/tar/lib/pack.js`

## Content Preview
```
'use strict'

// A readable tar stream creator
// Technically, this is a transform stream that you write paths into,
// and tar format comes out of.
// The `add()` method is like `write()` but returns this,
// and end() return `this` as well, so you can
// do `new Pack(opt).add('files').add('dir').end().pipe(output)
// You could also do something like:
// streamOfPaths().pipe(new Pack()).pipe(new fs.WriteStream('out.tar'))
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 10021 characters
- Lines: 433
