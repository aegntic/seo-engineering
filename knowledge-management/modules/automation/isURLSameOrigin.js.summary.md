# Summary of isURLSameOrigin.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/axios/lib/helpers/isURLSameOrigin.js`

## Content Preview
```
import platform from '../platform/index.js';

export default platform.hasStandardBrowserEnv ? ((origin, isMSIE) => (url) => {
  url = new URL(url, platform.origin);

  return (
    origin.protocol === url.protocol &&
    origin.host === url.host &&
    (isMSIE || origin.port === url.port)
  );
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 420 characters
- Lines: 15
