# Summary of callback.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/types/callback.d.ts`

## Content Preview
```
declare module 'mongoose' {
  type CallbackError = NativeError | null;

  type Callback<T = any> = (error: CallbackError, result: T) => void;

  type CallbackWithoutResult = (error: CallbackError) => void;
  type CallbackWithoutResultAndOptionalError = (error?: CallbackError) => void;
}

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 288 characters
- Lines: 9
