# Summary of event.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nise/lib/event/event.js`

## Content Preview
```
"use strict";

function Event(type, bubbles, cancelable, target) {
    this.initEvent(type, bubbles, cancelable, target);
}

Event.prototype = {
    initEvent: function (type, bubbles, cancelable, target) {
        this.type = type;
        this.bubbles = bubbles;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 573 characters
- Lines: 25
