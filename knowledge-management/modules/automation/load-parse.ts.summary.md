# Summary of load-parse.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cheerio/src/load-parse.ts`

## Content Preview
```
import { type CheerioAPI, getLoad } from './load.js';
import { getParse } from './parse.js';
import { renderWithParse5, parseWithParse5 } from './parsers/parse5-adapter.js';
import type { CheerioOptions } from './options.js';
import renderWithHtmlparser2 from 'dom-serializer';
import { parseDocument as parseWithHtmlparser2 } from 'htmlparser2';
import type { AnyNode } from 'domhandler';

const parse = getParse((content, options, isDocument, context) =>
  options._useHtmlParser2
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1549 characters
- Lines: 40
