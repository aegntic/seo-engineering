# Summary of URLSearchParams-impl.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/@types/whatwg-url/lib/URLSearchParams-impl.d.ts`

## Content Preview
```
declare class URLSearchParamsImpl {
    constructor(
        globalObject: object,
        constructorArgs: readonly [
            init?: ReadonlyArray<readonly [name: string, value: string]> | { readonly [name: string]: string } | string,
        ],
        privateData: { readonly doNotStripQMark?: boolean | undefined },
    );

    append(name: string, value: string): void;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 706 characters
- Lines: 21
