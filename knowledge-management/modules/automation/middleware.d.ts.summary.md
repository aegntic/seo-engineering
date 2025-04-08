# Summary of middleware.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs/build/lib/middleware.d.ts`

## Content Preview
```
import { YargsInstance, Arguments } from './yargs';
export declare function globalMiddlewareFactory<T>(globalMiddleware: Middleware[], context: T): (callback: MiddlewareCallback | MiddlewareCallback[], applyBeforeValidation?: boolean) => T;
export declare function commandMiddlewareFactory(commandMiddleware?: MiddlewareCallback[]): Middleware[];
export declare function applyMiddleware(argv: Arguments | Promise<Arguments>, yargs: YargsInstance, middlewares: Middleware[], beforeValidation: boolean): Arguments | Promise<Arguments>;
export interface MiddlewareCallback {
    (argv: Arguments, yargs: YargsInstance): Partial<Arguments> | Promise<Partial<Arguments>>;
}
export interface Middleware extends MiddlewareCallback {
    applyBeforeValidation: boolean;
}
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 764 characters
- Lines: 11
