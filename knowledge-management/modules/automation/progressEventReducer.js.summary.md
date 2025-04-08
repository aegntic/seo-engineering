# Summary of progressEventReducer.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/axios/lib/helpers/progressEventReducer.js`

## Content Preview
```
import speedometer from "./speedometer.js";
import throttle from "./throttle.js";
import utils from "../utils.js";

export const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);

  return throttle(e => {
    const loaded = e.loaded;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1235 characters
- Lines: 45
