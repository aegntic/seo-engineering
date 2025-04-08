# Summary of arguments.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/loupe/lib/arguments.js`

## Content Preview
```
import { inspectList } from './helpers'

export default function inspectArguments(args, options) {
  if (args.length === 0) return 'Arguments[]'
  options.truncate -= 13
  return `Arguments[ ${inspectList(args, options)} ]`
}

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 226 characters
- Lines: 8
