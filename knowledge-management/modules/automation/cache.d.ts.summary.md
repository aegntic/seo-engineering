# Summary of cache.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/cache.d.ts`

## Content Preview
```
import type { RequestInfo, Response, Request } from './fetch'

export interface CacheStorage {
  match (request: RequestInfo, options?: MultiCacheQueryOptions): Promise<Response | undefined>,
  has (cacheName: string): Promise<boolean>,
  open (cacheName: string): Promise<Cache>,
  delete (cacheName: string): Promise<boolean>,
  keys (): Promise<string[]>
}

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1251 characters
- Lines: 37
