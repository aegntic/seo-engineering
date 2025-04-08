# Summary of receivebuffer.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/socks/typings/common/receivebuffer.d.ts`

## Content Preview
```
/// <reference types="node" />
declare class ReceiveBuffer {
    private buffer;
    private offset;
    private originalSize;
    constructor(size?: number);
    get length(): number;
    append(data: Buffer): number;
    peek(length: number): Buffer;
    get(length: number): Buffer;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 314 characters
- Lines: 13
