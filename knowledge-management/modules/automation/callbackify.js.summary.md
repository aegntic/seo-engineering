# Summary of callbackify.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/axios/lib/helpers/callbackify.js`

## Content Preview
```
import utils from "../utils.js";

const callbackify = (fn, reducer) => {
  return utils.isAsyncFn(fn) ? function (...args) {
    const cb = args.pop();
    fn.apply(this, args).then((value) => {
      try {
        reducer ? cb(null, ...reducer(value)) : cb(null, value);
      } catch (err) {
        cb(err);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 372 characters
- Lines: 17
