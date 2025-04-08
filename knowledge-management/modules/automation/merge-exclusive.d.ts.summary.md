# Summary of merge-exclusive.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/type-fest/source/merge-exclusive.d.ts`

## Content Preview
```
// Helper type. Not useful on its own.
type Without<FirstType, SecondType> = {[KeyType in Exclude<keyof FirstType, keyof SecondType>]?: never};

/**
Create a type that has mutually exclusive keys.

This type was inspired by [this comment](https://github.com/Microsoft/TypeScript/issues/14094#issuecomment-373782604).

This type works with a helper type, called `Without`. `Without<FirstType, SecondType>` produces a type that has only keys from `FirstType` which are not present on `SecondType` and sets the value type for these keys to `never`. This helper type is then used in `MergeExclusive` to remove keys from either `FirstType` or `SecondType`.

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1340 characters
- Lines: 40
