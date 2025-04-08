# Summary of is-non-existent-property.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sinon/lib/sinon/util/core/is-non-existent-property.js`

## Content Preview
```
"use strict";

/**
 * @param {*} object
 * @param {string} property
 * @returns {boolean} whether a prop exists in the prototype chain
 */
function isNonExistentProperty(object, property) {
    return Boolean(
        object && typeof property !== "undefined" && !(property in object),
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 336 characters
- Lines: 15
