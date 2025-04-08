# Summary of error-codes.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/parse5/dist/cjs/common/error-codes.d.ts`

## Content Preview
```
import type { Location } from './token.js';
export interface ParserError extends Location {
    code: ERR;
}
export type ParserErrorHandler = (error: ParserError) => void;
export declare enum ERR {
    controlCharacterInInputStream = "control-character-in-input-stream",
    noncharacterInInputStream = "noncharacter-in-input-stream",
    surrogateInInputStream = "surrogate-in-input-stream",
    nonVoidHtmlElementStartTagWithTrailingSolidus = "non-void-html-element-start-tag-with-trailing-solidus",
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 4468 characters
- Lines: 68
