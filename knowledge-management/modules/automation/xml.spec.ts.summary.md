# Summary of xml.spec.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cheerio/src/__tests__/xml.spec.ts`

## Content Preview
```
import { describe, it, expect } from 'vitest';
import { load } from '../index.js';
import type { CheerioOptions } from '../options.js';

function xml(str: string, options?: CheerioOptions) {
  options = { xml: true, ...options };
  const $ = load(str, options);
  return $.xml();
}

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2174 characters
- Lines: 67
