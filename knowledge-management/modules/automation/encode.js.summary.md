# Summary of encode.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/entities/lib/esm/encode.js`

## Content Preview
```
import htmlTrie from "./generated/encode-html.js";
import { xmlReplacer, getCodePoint } from "./escape.js";
const htmlReplacer = /[\t\n!-,./:-@[-`\f{-}$\x80-\uFFFF]/g;
/**
 * Encodes all characters in the input using HTML entities. This includes
 * characters that are valid ASCII characters in HTML documents, such as `#`.
 *
 * To get a more compact output, consider using the `encodeNonAsciiHTML`
 * function, which will only encode characters that are not valid in HTML
 * documents, as well as non-ASCII characters.
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2569 characters
- Lines: 69
