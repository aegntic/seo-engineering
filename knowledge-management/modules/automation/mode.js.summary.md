# Summary of mode.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/isexe/mode.js`

## Content Preview
```
module.exports = isexe
isexe.sync = sync

var fs = require('fs')

function isexe (path, options, cb) {
  fs.stat(path, function (er, stat) {
    cb(er, er ? false : checkStat(stat, options))
  })
}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 909 characters
- Lines: 42
