# Summary of webidl.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/undici-types/webidl.d.ts`

## Content Preview
```
// These types are not exported, and are only used internally

/**
 * Take in an unknown value and return one that is of type T
 */
type Converter<T> = (object: unknown) => T

type SequenceConverter<T> = (object: unknown, iterable?: IterableIterator<T>) => T[]

type RecordConverter<K extends string, V> = (object: unknown) => Record<K, V>
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 5767 characters
- Lines: 223
