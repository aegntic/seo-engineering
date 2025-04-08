# Summary of web.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@types/node/stream/web.d.ts`

## Content Preview
```
type _ByteLengthQueuingStrategy = typeof globalThis extends { onmessage: any } ? {}
    : import("stream/web").ByteLengthQueuingStrategy;
type _CompressionStream = typeof globalThis extends { onmessage: any; ReportingObserver: any } ? {}
    : import("stream/web").CompressionStream;
type _CountQueuingStrategy = typeof globalThis extends { onmessage: any } ? {}
    : import("stream/web").CountQueuingStrategy;
type _DecompressionStream = typeof globalThis extends { onmessage: any; ReportingObserver: any } ? {}
    : import("stream/web").DecompressionStream;
type _ReadableByteStreamController = typeof globalThis extends { onmessage: any } ? {}
    : import("stream/web").ReadableByteStreamController;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 29584 characters
- Lines: 615
