# Summary of transform-file-browser.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@babel/core/src/transform-file-browser.ts`

## Content Preview
```
// duplicated from transform-file so we do not have to import anything here
type TransformFile = {
  (filename: string, callback: (error: Error, file: null) => void): void;
  (
    filename: string,
    opts: any,
    callback: (error: Error, file: null) => void,
  ): void;
};

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 821 characters
- Lines: 32
