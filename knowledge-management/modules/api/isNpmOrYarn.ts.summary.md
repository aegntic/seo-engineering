# Summary of isNpmOrYarn.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/simple-update-notifier/src/isNpmOrYarn.ts`

## Content Preview
```
import process from 'process';

const packageJson = process.env.npm_package_json;
const userAgent = process.env.npm_config_user_agent;
const isNpm6 = Boolean(userAgent && userAgent.startsWith('npm'));
const isNpm7 = Boolean(packageJson && packageJson.endsWith('package.json'));

const isNpm = isNpm6 || isNpm7;
const isYarn = Boolean(userAgent && userAgent.startsWith('yarn'));
const isNpmOrYarn = isNpm || isYarn;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 444 characters
- Lines: 13
