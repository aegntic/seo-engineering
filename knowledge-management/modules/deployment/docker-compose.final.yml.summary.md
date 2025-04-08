# Summary of docker-compose.final.yml
  
## File Path
`/home/tabs/seo-engineering/deployment/docker-compose.final.yml`

## Content Preview
```
version: '3.8'

services:
  # API server
  api:
    build:
      context: ../api
      dockerfile: Dockerfile.prod.fixed
    container_name: seo-api
    volumes:
[...truncated...]
```

## Key Points
- File type: .yml
- Estimated size: 1403 characters
- Lines: 57
