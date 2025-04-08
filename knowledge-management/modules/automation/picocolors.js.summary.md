# Summary of picocolors.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/picocolors/picocolors.js`

## Content Preview
```
let p = process || {}, argv = p.argv || [], env = p.env || {}
let isColorSupported =
	!(!!env.NO_COLOR || argv.includes("--no-color")) &&
	(!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || ((p.stdout || {}).isTTY && env.TERM !== "dumb") || !!env.CI)

let formatter = (open, close, replace = open) =>
	input => {
		let string = "" + input, index = string.indexOf(close, open.length)
		return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close
	}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2663 characters
- Lines: 76
