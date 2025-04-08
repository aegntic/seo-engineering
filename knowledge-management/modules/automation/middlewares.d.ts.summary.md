# Summary of middlewares.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/types/middlewares.d.ts`

## Content Preview
```
declare module 'mongoose' {
  import Kareem = require('kareem');

  type MongooseQueryAndDocumentMiddleware = 'updateOne' | 'deleteOne';

  type MongooseDistinctDocumentMiddleware = 'save' | 'init' | 'validate';
  type MongooseDocumentMiddleware = MongooseDistinctDocumentMiddleware | MongooseQueryAndDocumentMiddleware;

  type MongooseRawResultQueryMiddleware = 'findOneAndUpdate' | 'findOneAndReplace' | 'findOneAndDelete';
  type MongooseDistinctQueryMiddleware = 'estimatedDocumentCount' | 'countDocuments' | 'deleteMany' | 'distinct' | 'find' | 'findOne' | 'findOneAndDelete' | 'findOneAndReplace' | 'findOneAndUpdate' | 'replaceOne' | 'updateMany';
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2549 characters
- Lines: 51
