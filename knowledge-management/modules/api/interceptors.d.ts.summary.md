# Summary of interceptors.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/undici-types/interceptors.d.ts`

## Content Preview
```
import Dispatcher from "./dispatcher";
import RetryHandler from "./retry-handler";

export default Interceptors;

declare namespace Interceptors {
  export type DumpInterceptorOpts = { maxSize?: number }
  export type RetryInterceptorOpts = RetryHandler.RetryOptions
  export type RedirectInterceptorOpts = { maxRedirections?: number }
  export type ResponseErrorInterceptorOpts = { throwOnError: boolean }
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 922 characters
- Lines: 18
