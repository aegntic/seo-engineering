# Summary of compression.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/cmap/wire_protocol/compression.ts`

## Content Preview
```
import { promisify } from 'util';
import * as zlib from 'zlib';

import { LEGACY_HELLO_COMMAND } from '../../constants';
import { getSnappy, getZstdLibrary, type SnappyLib, type ZStandard } from '../../deps';
import { MongoDecompressionError, MongoInvalidArgumentError } from '../../error';

/** @public */
export const Compressor = Object.freeze({
  none: 0,
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 3259 characters
- Lines: 127
