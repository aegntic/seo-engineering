# Summary of command_builder.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb/src/operations/client_bulk_write/command_builder.ts`

## Content Preview
```
import { BSON, type Document } from '../../bson';
import { DocumentSequence } from '../../cmap/commands';
import { MongoAPIError, MongoInvalidArgumentError } from '../../error';
import { type PkFactory } from '../../mongo_client';
import type { Filter, OptionalId, UpdateFilter, WithoutId } from '../../mongo_types';
import { DEFAULT_PK_FACTORY, hasAtomicOperators } from '../../utils';
import { type CollationOptions } from '../command';
import { type Hint } from '../operation';
import type {
  AnyClientBulkWriteModel,
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 14582 characters
- Lines: 470
