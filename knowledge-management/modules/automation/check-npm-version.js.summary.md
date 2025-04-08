# Summary of check-npm-version.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/update-browserslist-db/check-npm-version.js`

## Content Preview
```
let { execSync } = require('child_process')
let pico = require('picocolors')

try {
  let version = parseInt(execSync('npm -v'))
  if (version <= 6) {
    process.stderr.write(
      pico.red(
        'Update npm or call ' +
          pico.yellow('npx browserslist@latest --update-db') +
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 401 characters
- Lines: 18
