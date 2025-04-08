# Summary of globals.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@types/node/globals.d.ts`

## Content Preview
```
export {}; // Make this a module

// #region Fetch and friends
// Conditional type aliases, used at the end of this file.
// Will either be empty if lib.dom (or lib.webworker) is included, or the undici version otherwise.
type _Request = typeof globalThis extends { onmessage: any } ? {} : import("undici-types").Request;
type _Response = typeof globalThis extends { onmessage: any } ? {} : import("undici-types").Response;
type _FormData = typeof globalThis extends { onmessage: any } ? {} : import("undici-types").FormData;
type _Headers = typeof globalThis extends { onmessage: any } ? {} : import("undici-types").Headers;
type _MessageEvent = typeof globalThis extends { onmessage: any } ? {} : import("undici-types").MessageEvent;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 19123 characters
- Lines: 512
