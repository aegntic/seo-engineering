# Summary of slim.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cheerio/src/slim.ts`

## Content Preview
```
/**
 * @file Alternative entry point for Cheerio that always uses htmlparser2. This
 *   way, parse5 won't be loaded, saving some memory.
 */
import { type CheerioAPI, getLoad } from './load.js';
import { type CheerioOptions } from './options.js';
import { getParse } from './parse.js';
import type { AnyNode } from 'domhandler';
import render from 'dom-serializer';
import { parseDocument } from 'htmlparser2';
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1241 characters
- Lines: 34
