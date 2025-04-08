# Summary of gcp_machine_workflow.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb/lib/cmap/auth/mongodb_oidc/gcp_machine_workflow.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCPMachineWorkflow = void 0;
const error_1 = require("../../../error");
const utils_1 = require("../../../utils");
const machine_workflow_1 = require("./machine_workflow");
/** GCP base URL. */
const GCP_BASE_URL = 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity';
/** GCP request headers. */
const GCP_HEADERS = Object.freeze({ 'Metadata-Flavor': 'Google' });
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1811 characters
- Lines: 46
