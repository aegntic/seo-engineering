# Summary of sourcemap-codec.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@jridgewell/sourcemap-codec/dist/types/sourcemap-codec.d.ts`

## Content Preview
```
export { decodeOriginalScopes, encodeOriginalScopes, decodeGeneratedRanges, encodeGeneratedRanges, } from './scopes';
export type { OriginalScope, GeneratedRange, CallSite, BindingExpressionRange } from './scopes';
export declare type SourceMapSegment = [number] | [number, number, number, number] | [number, number, number, number, number];
export declare type SourceMapLine = SourceMapSegment[];
export declare type SourceMapMappings = SourceMapLine[];
export declare function decode(mappings: string): SourceMapMappings;
export declare function encode(decoded: SourceMapMappings): string;
export declare function encode(decoded: Readonly<SourceMapMappings>): string;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 670 characters
- Lines: 9
