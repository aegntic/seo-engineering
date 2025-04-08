# Summary of decimal128.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/bson/src/decimal128.ts`

## Content Preview
```
import { BSONValue } from './bson_value';
import { BSONError } from './error';
import { Long } from './long';
import { isUint8Array } from './parser/utils';
import { ByteUtils } from './utils/byte_utils';

const PARSE_STRING_REGEXP = /^(\+|-)?(\d+|(\d*\.\d*))?(E|e)?([-+])?(\d+)?$/;
const PARSE_INF_REGEXP = /^(\+|-)?(Infinity|inf)$/i;
const PARSE_NAN_REGEXP = /^(\+|-)?NaN$/i;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 27696 characters
- Lines: 859
