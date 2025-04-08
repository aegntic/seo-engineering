# Summary of docker-compose.prod.yml
  
## File Path
`/home/tabs/seo-engineering/deployment/docker-compose.prod.yml`

## Content Preview
```
version: '3.3'

services:
  # MongoDB
  mongodb:
    image: mongo:latest
    container_name: seo-mongodb
    volumes:
      - mongodb_data:/data/db
    environment:
[...truncated...]
```

## Key Points
- File type: .yml
- Estimated size: 6604 characters
- Lines: 268
