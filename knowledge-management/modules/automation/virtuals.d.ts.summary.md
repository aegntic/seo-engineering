# Summary of virtuals.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/types/virtuals.d.ts`

## Content Preview
```
declare module 'mongoose' {
    type VirtualPathFunctions<DocType = {}, PathValueType = unknown, TInstanceMethods = {}> = {
      get?: TVirtualPathFN<DocType, PathValueType, TInstanceMethods, PathValueType>;
      set?: TVirtualPathFN<DocType, PathValueType, TInstanceMethods, void>;
      options?: VirtualTypeOptions<HydratedDocument<DocType, TInstanceMethods>, DocType>;
    };

  type TVirtualPathFN<DocType = {}, PathType = unknown, TInstanceMethods = {}, TReturn = unknown> =
    <T = HydratedDocument<DocType, TInstanceMethods>>(this: Document<any, any, DocType> & DocType, value: PathType, virtual: VirtualType<T>, doc: Document<any, any, DocType> & DocType) => TReturn;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 960 characters
- Lines: 15
