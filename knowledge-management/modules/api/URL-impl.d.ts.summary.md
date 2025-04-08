# Summary of URL-impl.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/@types/whatwg-url/lib/URL-impl.d.ts`

## Content Preview
```
import { Globals } from "webidl-conversions";
import { implementation as URLSearchParamsImpl } from "./URLSearchParams-impl";

declare class URLImpl {
    constructor(globalObject: Globals, constructorArgs: readonly [url: string, base?: string]);

    href: string;
    readonly origin: string;
    protocol: string;
    username: string;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 590 characters
- Lines: 23
