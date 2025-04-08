# Summary of cookies.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/axios/lib/helpers/cookies.js`

## Content Preview
```
import utils from './../utils.js';
import platform from '../platform/index.js';

export default platform.hasStandardBrowserEnv ?

  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure) {
      const cookie = [name + '=' + encodeURIComponent(value)];

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1045 characters
- Lines: 43
