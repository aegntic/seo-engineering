# Summary of aws.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb/lib/client-side-encryption/providers/aws.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAWSCredentials = loadAWSCredentials;
const aws_temporary_credentials_1 = require("../../cmap/auth/aws_temporary_credentials");
/**
 * @internal
 */
async function loadAWSCredentials(kmsProviders, provider) {
    const credentialProvider = new aws_temporary_credentials_1.AWSSDKCredentialProvider(provider);
    // We shouldn't ever receive a response from the AWS SDK that doesn't have a `SecretAccessKey`
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1154 characters
- Lines: 23
