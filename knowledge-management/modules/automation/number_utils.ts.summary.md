# Summary of number_utils.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/bson/src/utils/number_utils.ts`

## Content Preview
```
const FLOAT = new Float64Array(1);
const FLOAT_BYTES = new Uint8Array(FLOAT.buffer, 0, 8);

FLOAT[0] = -1;
// Little endian [0, 0, 0, 0, 0, 0,  240, 191]
// Big endian    [191, 240, 0, 0, 0, 0, 0, 0]
const isBigEndian = FLOAT_BYTES[7] === 0;

/**
 * @experimental
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 7011 characters
- Lines: 214
