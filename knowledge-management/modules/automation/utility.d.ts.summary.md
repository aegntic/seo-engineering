# Summary of utility.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/types/utility.d.ts`

## Content Preview
```
declare module 'mongoose' {
  type IfAny<IFTYPE, THENTYPE, ELSETYPE = IFTYPE> = 0 extends (1 & IFTYPE) ? THENTYPE : ELSETYPE;
  type IfUnknown<IFTYPE, THENTYPE> = unknown extends IFTYPE ? THENTYPE : IFTYPE;

  type WithLevel1NestedPaths<T, K extends keyof T = keyof T> = {
    [P in K | NestedPaths<Required<T>, K>]: P extends K
      ? T[P]
      : P extends `${infer Key}.${infer Rest}`
        ? Key extends keyof T
          ? Rest extends keyof NonNullable<T[Key]>
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 3987 characters
- Lines: 105
