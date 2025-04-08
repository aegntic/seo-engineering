# Summary of parse.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cheerio/dist/commonjs/parse.d.ts`

## Content Preview
```
import { type AnyNode, Document, type ParentNode } from 'domhandler';
import type { InternalOptions } from './options.js';
/**
 * Get the parse function with options.
 *
 * @param parser - The parser function.
 * @returns The parse function with options.
 */
export declare function getParse(parser: (content: string, options: InternalOptions, isDocument: boolean, context: ParentNode | null) => Document): (content: string | Document | AnyNode | AnyNode[] | Buffer, options: InternalOptions, isDocument: boolean, context: ParentNode | null) => Document;
/**
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 867 characters
- Lines: 18
