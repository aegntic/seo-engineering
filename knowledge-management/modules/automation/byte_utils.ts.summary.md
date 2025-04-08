# Summary of byte_utils.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/bson/src/utils/byte_utils.ts`

## Content Preview
```
import { nodeJsByteUtils } from './node_byte_utils';
import { webByteUtils } from './web_byte_utils';

/** @internal */
export type ByteUtils = {
  /** Transforms the input to an instance of Buffer if running on node, otherwise Uint8Array */
  toLocalBufferType(buffer: Uint8Array | ArrayBufferView | ArrayBuffer): Uint8Array;
  /** Create empty space of size */
  allocate: (size: number) => Uint8Array;
  /** Check if two Uint8Arrays are deep equal */
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2915 characters
- Lines: 62
