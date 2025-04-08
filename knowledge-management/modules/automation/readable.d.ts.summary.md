# Summary of readable.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/readable.d.ts`

## Content Preview
```
import { Readable } from "stream";
import { Blob } from 'buffer'

export default BodyReadable

declare class BodyReadable extends Readable {
  constructor(
    resume?: (this: Readable, size: number) => void | null,
    abort?: () => void | null,
    contentType?: string
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1738 characters
- Lines: 66
