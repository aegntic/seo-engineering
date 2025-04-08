# Summary of foreign-content.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/parse5/dist/cjs/common/foreign-content.d.ts`

## Content Preview
```
import { TAG_ID as $, NS } from './html.js';
import type { TagToken, Attribute } from './token.js';
export declare const SVG_TAG_NAMES_ADJUSTMENT_MAP: Map<string, string>;
export declare function causesExit(startTagToken: TagToken): boolean;
export declare function adjustTokenMathMLAttrs(token: TagToken): void;
export declare function adjustTokenSVGAttrs(token: TagToken): void;
export declare function adjustTokenXMLAttrs(token: TagToken): void;
export declare function adjustTokenSVGTagName(token: TagToken): void;
export declare function isIntegrationPoint(tn: $, ns: NS, attrs: Attribute[], foreignNS?: NS): boolean;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 623 characters
- Lines: 10
