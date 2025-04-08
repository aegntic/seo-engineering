# Summary of mutable.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/type-fest/source/mutable.d.ts`

## Content Preview
```
/**
Convert an object with `readonly` keys into a mutable object. Inverse of `Readonly<T>`.

This can be used to [store and mutate options within a class](https://github.com/sindresorhus/pageres/blob/4a5d05fca19a5fbd2f53842cbf3eb7b1b63bddd2/source/index.ts#L72), [edit `readonly` objects within tests](https://stackoverflow.com/questions/50703834), and [construct a `readonly` object within a function](https://github.com/Microsoft/TypeScript/issues/24509).

@example
```
import {Mutable} from 'type-fest';

type Foo = {
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 860 characters
- Lines: 23
