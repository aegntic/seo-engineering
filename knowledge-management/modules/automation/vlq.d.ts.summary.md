# Summary of vlq.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@jridgewell/sourcemap-codec/dist/types/vlq.d.ts`

## Content Preview
```
import type { StringReader, StringWriter } from './strings';
export declare const comma: number;
export declare const semicolon: number;
export declare function decodeInteger(reader: StringReader, relative: number): number;
export declare function encodeInteger(builder: StringWriter, num: number, relative: number): number;
export declare function hasMoreVlq(reader: StringReader, max: number): boolean;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 405 characters
- Lines: 7
