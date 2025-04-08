# Summary of extract.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cheerio/dist/commonjs/api/extract.d.ts`

## Content Preview
```
import type { AnyNode, Element } from 'domhandler';
import type { Cheerio } from '../cheerio.js';
import type { prop } from './attributes.js';
type ExtractDescriptorFn = (el: Element, key: string, obj: Record<string, unknown>) => unknown;
interface ExtractDescriptor {
    selector: string;
    value?: string | ExtractDescriptorFn | ExtractMap;
}
type ExtractValue = string | ExtractDescriptor | [string | ExtractDescriptor];
export interface ExtractMap {
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1520 characters
- Lines: 29
