# Summary of random.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@colors/colors/lib/maps/random.js`

## Content Preview
```
module['exports'] = function(colors) {
  var available = ['underline', 'inverse', 'grey', 'yellow', 'red', 'green',
    'blue', 'white', 'cyan', 'magenta', 'brightYellow', 'brightRed',
    'brightGreen', 'brightBlue', 'brightWhite', 'brightCyan', 'brightMagenta'];
  return function(letter, i, exploded) {
    return letter === ' ' ? letter :
      colors[
          available[Math.round(Math.random() * (available.length - 2))]
      ](letter);
  };
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 454 characters
- Lines: 12
