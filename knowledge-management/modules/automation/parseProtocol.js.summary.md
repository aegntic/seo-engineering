# Summary of parseProtocol.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/axios/lib/helpers/parseProtocol.js`

## Content Preview
```
'use strict';

export default function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || '';
}

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 151 characters
- Lines: 7
