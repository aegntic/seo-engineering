# Summary of formDataToStream.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/axios/lib/helpers/formDataToStream.js`

## Content Preview
```
import util from 'util';
import {Readable} from 'stream';
import utils from "../utils.js";
import readBlob from "./readBlob.js";
import platform from "../platform/index.js";

const BOUNDARY_ALPHABET = platform.ALPHABET.ALPHA_DIGIT + '-_';

const textEncoder = typeof TextEncoder === 'function' ? new TextEncoder() : new util.TextEncoder();

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2972 characters
- Lines: 113
