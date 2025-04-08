# Summary of literal-union.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/type-fest/source/literal-union.d.ts`

## Content Preview
```
import {Primitive} from './basic';

/**
Allows creating a union type by combining primitive types and literal types without sacrificing auto-completion in IDEs for the literal type part of the union.

Currently, when a union type of a primitive type is combined with literal types, TypeScript loses all information about the combined literals. Thus, when such type is used in an IDE with autocompletion, no suggestions are made for the declared literals.

This type is a workaround for [Microsoft/TypeScript#29729](https://github.com/Microsoft/TypeScript/issues/29729). It will be removed as soon as it's not needed anymore.

@example
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1152 characters
- Lines: 34
