# Summary of require-exactly-one.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/type-fest/source/require-exactly-one.d.ts`

## Content Preview
```
// TODO: Remove this when we target TypeScript >=3.5.
// eslint-disable-next-line @typescript-eslint/generic-type-naming
type _Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/**
Create a type that requires exactly one of the given keys and disallows more. The remaining keys are kept as is.

Use-cases:
- Creating interfaces for components that only need one of the keys to display properly.
- Declaring generic keys in a single place for a single use-case that gets narrowed down via `RequireExactlyOne`.
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1322 characters
- Lines: 37
