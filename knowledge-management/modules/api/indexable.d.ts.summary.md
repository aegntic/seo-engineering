# Summary of indexable.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/@types/node/compatibility/indexable.d.ts`

## Content Preview
```
// Polyfill for ES2022's .at() method on string/array prototypes, added to TypeScript in 4.6.
// TODO: these methods are not used within @types/node, and should be removed at the next
// major @types/node version; users should include the es2022 TypeScript libraries
// if they need these features.

interface RelativeIndexable<T> {
    at(index: number): T | undefined;
}

interface String extends RelativeIndexable<string> {}
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1195 characters
- Lines: 24
