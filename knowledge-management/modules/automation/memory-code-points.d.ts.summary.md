# Summary of memory-code-points.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@mongodb-js/saslprep/dist/memory-code-points.d.ts`

## Content Preview
```
/// <reference types="node" />
import bitfield from 'sparse-bitfield';
export declare function createMemoryCodePoints(data: Buffer): {
    unassigned_code_points: bitfield.BitFieldInstance;
    commonly_mapped_to_nothing: bitfield.BitFieldInstance;
    non_ASCII_space_characters: bitfield.BitFieldInstance;
    prohibited_characters: bitfield.BitFieldInstance;
    bidirectional_r_al: bitfield.BitFieldInstance;
    bidirectional_l: bitfield.BitFieldInstance;
};
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 512 characters
- Lines: 11
