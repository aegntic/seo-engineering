# Summary of populate.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/types/populate.d.ts`

## Content Preview
```
declare module 'mongoose' {

  /**
   * Reference another Model
   */
  type PopulatedDoc<
    PopulatedType,
    RawId extends RefType = (PopulatedType extends { _id?: RefType; } ? NonNullable<PopulatedType['_id']> : Types.ObjectId) | undefined
  > = PopulatedType | RawId;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2195 characters
- Lines: 54
