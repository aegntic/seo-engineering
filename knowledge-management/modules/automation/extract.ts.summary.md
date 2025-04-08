# Summary of extract.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cheerio/src/api/extract.ts`

## Content Preview
```
import type { AnyNode, Element } from 'domhandler';
import type { Cheerio } from '../cheerio.js';
import type { prop } from './attributes.js';

type ExtractDescriptorFn = (
  el: Element,
  key: string,
  // TODO: This could be typed with ExtractedMap
  obj: Record<string, unknown>,
) => unknown;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2652 characters
- Lines: 93
