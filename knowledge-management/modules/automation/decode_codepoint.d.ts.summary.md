# Summary of decode_codepoint.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/entities/lib/esm/decode_codepoint.d.ts`

## Content Preview
```
/**
 * Polyfill for `String.fromCodePoint`. It is used to create a string from a Unicode code point.
 */
export declare const fromCodePoint: (...codePoints: number[]) => string;
/**
 * Replace the given code point with a replacement character if it is a
 * surrogate or is outside the valid range. Otherwise return the code
 * point unchanged.
 */
export declare function replaceCodePoint(codePoint: number): number;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 765 characters
- Lines: 19
