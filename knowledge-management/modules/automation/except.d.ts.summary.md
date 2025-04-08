# Summary of except.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/type-fest/source/except.d.ts`

## Content Preview
```
/**
Create a type from an object type without certain keys.

This type is a stricter version of [`Omit`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-5.html#the-omit-helper-type). The `Omit` type does not restrict the omitted keys to be keys present on the given type, while `Except` does. The benefits of a stricter type are avoiding typos and allowing the compiler to pick up on rename refactors automatically.

Please upvote [this issue](https://github.com/microsoft/TypeScript/issues/30825) if you want to have the stricter version as a built-in in TypeScript.

@example
```
import {Except} from 'type-fest';
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 886 characters
- Lines: 23
