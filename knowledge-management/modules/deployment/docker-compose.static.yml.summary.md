# Summary of docker-compose.static.yml
  
## File Path
`/home/tabs/seo-engineering/deployment/docker-compose.static.yml`

## Content Preview
```
version: '3.8'

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
- Estimated size: 6506 characters
- Lines: 263
