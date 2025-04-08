# Summary of parse.spec.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cheerio/src/parse.spec.ts`

## Content Preview
```
import { describe, it, expect } from 'vitest';
import type { Document, Element } from 'domhandler';
import { getParse } from './parse.js';

import { parseDocument as parseWithHtmlparser2 } from 'htmlparser2';
import { parseWithParse5 } from './parsers/parse5-adapter.js';

const defaultOpts = { _useHtmlParser2: false };

const parse = getParse((content, options, isDocument, context) =>
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 15688 characters
- Lines: 453
