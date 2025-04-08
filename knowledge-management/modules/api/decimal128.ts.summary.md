# Summary of decimal128.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/bson/src/decimal128.ts`

## Content Preview
```
import { BSONValue } from './bson_value';
import { BSONError } from './error';
import { Long } from './long';
import { type InspectFn, defaultInspect, isUint8Array } from './parser/utils';
import { ByteUtils } from './utils/byte_utils';

const PARSE_STRING_REGEXP = /^(\+|-)?(\d+|(\d*\.\d*))?(E|e)?([-+])?(\d+)?$/;
const PARSE_INF_REGEXP = /^(\+|-)?(Infinity|inf)$/i;
const PARSE_NAN_REGEXP = /^(\+|-)?NaN$/i;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 27794 characters
- Lines: 856
