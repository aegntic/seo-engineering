# Summary of bson_value.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/bson/src/bson_value.ts`

## Content Preview
```
import { BSON_MAJOR_VERSION } from './constants';

/** @public */
export abstract class BSONValue {
  /** @public */
  public abstract get _bsontype(): string;

  /** @internal */
  get [Symbol.for('@@mdb.bson.version')](): typeof BSON_MAJOR_VERSION {
    return BSON_MAJOR_VERSION;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 402 characters
- Lines: 19
