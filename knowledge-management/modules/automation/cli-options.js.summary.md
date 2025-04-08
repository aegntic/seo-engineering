# Summary of cli-options.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/dotenv/lib/cli-options.js`

## Content Preview
```
const re = /^dotenv_config_(encoding|path|debug|override|DOTENV_KEY)=(.+)$/

module.exports = function optionMatcher (args) {
  return args.reduce(function (acc, cur) {
    const matches = cur.match(re)
    if (matches) {
      acc[matches[1]] = matches[2]
    }
    return acc
  }, {})
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 289 characters
- Lines: 12
