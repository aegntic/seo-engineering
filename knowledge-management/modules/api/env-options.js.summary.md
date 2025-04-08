# Summary of env-options.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/dotenv/lib/env-options.js`

## Content Preview
```
// ../config.js accepts options via environment variables
const options = {}

if (process.env.DOTENV_CONFIG_ENCODING != null) {
  options.encoding = process.env.DOTENV_CONFIG_ENCODING
}

if (process.env.DOTENV_CONFIG_PATH != null) {
  options.path = process.env.DOTENV_CONFIG_PATH
}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 633 characters
- Lines: 25
