# Summary of web_byte_utils.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/bson/src/utils/web_byte_utils.ts`

## Content Preview
```
import { BSONError } from '../error';

type TextDecoder = {
  readonly encoding: string;
  readonly fatal: boolean;
  readonly ignoreBOM: boolean;
  decode(input?: Uint8Array): string;
};
type TextDecoderConstructor = {
  new (label: 'utf8', options: { fatal: boolean; ignoreBOM?: boolean }): TextDecoder;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 5817 characters
- Lines: 191
