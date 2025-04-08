# Summary of gruntfile.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/sprintf-js/gruntfile.js`

## Content Preview
```
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        uglify: {
            options: {
                banner: "/*! <%= pkg.name %> | <%= pkg.author %> | <%= pkg.license %> */\n",
                sourceMap: true
            },
            build: {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 970 characters
- Lines: 37
