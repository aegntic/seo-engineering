# Summary of legacy.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/domutils/lib/esm/legacy.js`

## Content Preview
```
import { isTag, isText } from "domhandler";
import { filter, findOne } from "./querying.js";
/**
 * A map of functions to check nodes against.
 */
const Checks = {
    tag_name(name) {
        if (typeof name === "function") {
            return (elem) => isTag(elem) && name(elem.name);
        }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 5209 characters
- Lines: 152
