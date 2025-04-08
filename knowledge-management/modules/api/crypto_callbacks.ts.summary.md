# Summary of crypto_callbacks.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/src/client-side-encryption/crypto_callbacks.ts`

## Content Preview
```
import * as crypto from 'crypto';

type AES256Callback = (key: Buffer, iv: Buffer, input: Buffer, output: Buffer) => number | Error;

export function makeAES256Hook(
  method: 'createCipheriv' | 'createDecipheriv',
  mode: 'aes-256-cbc' | 'aes-256-ctr'
): AES256Callback {
  return function (key: Buffer, iv: Buffer, input: Buffer, output: Buffer): number | Error {
    let result;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2512 characters
- Lines: 88
