# Summary of escape.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/entities/lib/esm/escape.d.ts`

## Content Preview
```
export declare const xmlReplacer: RegExp;
export declare const getCodePoint: (str: string, index: number) => number;
/**
 * Encodes all non-ASCII characters, as well as characters not valid in XML
 * documents using XML entities.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */
export declare function encodeXML(str: string): string;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1543 characters
- Lines: 43
