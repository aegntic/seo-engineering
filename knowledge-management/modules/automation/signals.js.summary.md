# Summary of signals.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/signal-exit/signals.js`

## Content Preview
```
// This is not the set of all possible signals.
//
// It IS, however, the set of all signals that trigger
// an exit on either Linux or BSD systems.  Linux is a
// superset of the signal names supported on BSD, and
// the unknown signals just fail to register, so we can
// catch that easily enough.
//
// Don't bother with SIGKILL.  It's uncatchable, which
// means that we can't fire any callbacks anyway.
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1295 characters
- Lines: 54
