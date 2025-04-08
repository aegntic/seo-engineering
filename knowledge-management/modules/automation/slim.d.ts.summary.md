# Summary of slim.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cheerio/dist/commonjs/slim.d.ts`

## Content Preview
```
/**
 * @file Alternative entry point for Cheerio that always uses htmlparser2. This
 *   way, parse5 won't be loaded, saving some memory.
 */
import { type CheerioAPI } from './load.js';
import { type CheerioOptions } from './options.js';
import type { AnyNode } from 'domhandler';
export { contains, merge } from './static.js';
export type * from './types.js';
export type { Cheerio } from './cheerio.js';
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1099 characters
- Lines: 25
