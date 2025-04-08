# Summary of tokenize-arg-string.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs-parser/lib/tokenize-arg-string.js`

## Content Preview
```
// take an un-split argv string and tokenize it.
module.exports = function (argString) {
  if (Array.isArray(argString)) {
    return argString.map(e => typeof e !== 'string' ? e + '' : e)
  }

  argString = argString.trim()

  let i = 0
  let prevC = null
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 856 characters
- Lines: 41
