# Summary of is-object.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@sinonjs/samsam/types/is-object.d.ts`

## Content Preview
```
export = isObject;
/**
 * Returns `true` when the value is a regular Object and not a specialized Object
 *
 * This helps speed up deepEqual cyclic checks
 *
 * The premise is that only Objects are stored in the visited array.
 * So if this function returns false, we don't have to do the
 * expensive operation of searching for the value in the the array of already
 * visited objects
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 585 characters
- Lines: 17
