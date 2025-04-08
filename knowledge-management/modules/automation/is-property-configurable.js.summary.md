# Summary of is-property-configurable.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sinon/lib/sinon/util/core/is-property-configurable.js`

## Content Preview
```
"use strict";

const getPropertyDescriptor = require("./get-property-descriptor");

function isPropertyConfigurable(obj, propName) {
    const propertyDescriptor = getPropertyDescriptor(obj, propName);

    return propertyDescriptor ? propertyDescriptor.configurable : true;
}

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 319 characters
- Lines: 12
