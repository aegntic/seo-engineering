# Summary of validation.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/types/validation.d.ts`

## Content Preview
```
declare module 'mongoose' {

  type SchemaValidator<T, EnforcedDocType, THydratedDocumentType> = RegExp
    | [RegExp, string]
    | Function
    | [Function, string]
    | ValidateOpts<T, THydratedDocumentType>
    | ValidateOpts<T, THydratedDocumentType>[];

  interface ValidatorProps {
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 990 characters
- Lines: 36
