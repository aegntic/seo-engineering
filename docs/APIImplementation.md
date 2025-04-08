# API Implementation for Multi-Client Management

## Architecture Overview

The SEO.engineering API implements a modular, RESTful architecture designed to support the agency portal and multi-client management system. The API follows domain-driven design principles with clear separation of concerns and comprehensive error handling.

## Core Components

### API Structure

The API follows a layered architecture pattern:

```
api/
├── controllers/       # Business logic and request handling
│   ├── agency/        # Agency-specific controllers
│   │   ├── AgencyController.js
│   │   ├── ClientController.js
│   │   ├── UserController.js
│   │   └── RoleController.js
│   └── [other domains]
│
├── middleware/        # Request processing middleware
│   ├── authenticate.js
│   ├── authorizeAgency.js
│   ├── validateSchema.js
│   └── errorHandler.js
│
├── routes/            # API endpoint definitions
│   ├── agency/
│   │   ├── agencyRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── userRoutes.js
│   │   └── roleRoutes.js
│   └── [other domains]
│
├── src/
│   ├── models/        # Database models
│   │   ├── Agency.js
│   │   ├── Client.js
│   │   ├── AgencyUser.js
│   │   └── Role.js
│   └── services/      # Domain services
│
├── utils/             # Utility functions and helpers
│   └── errors.js      # Custom error classes
│
├── validation/        # Request validation schemas
│   ├── agencySchemas.js
│   ├── clientSchemas.js
│   ├── userSchemas.js
│   └── roleSchemas.js
│
└── index.js           # Application entry point
```

### Key Design Patterns

1. **Controller-Service Pattern**
   - Controllers handle HTTP request/response lifecycle
   - Services encapsulate business logic and data access
   - Models define data structure and validation

2. **Middleware Pipeline**
   - Authentication verifies user identity
   - Authorization checks user permissions
   - Schema validation ensures data integrity
   - Error handling provides consistent responses

3. **Domain-Driven Design**
   - Clear boundaries between different domains (agency, SEO, auth)
   - Models represent business entities
   - Services implement domain-specific operations

## API Domains

### Agency Management

Endpoints for managing agency settings and white label configuration:

- `GET /api/agency/agencies/:id` - Get agency details
- `POST /api/agency/agencies` - Create new agency
- `PUT /api/agency/agencies/:id` - Update agency
- `PUT /api/agency/agencies/:id/white-label` - Update white label settings
- `GET /api/agency/agencies/:id/metrics` - Get agency dashboard metrics

### Client Management

Endpoints for managing clients within an agency:

- `GET /api/agency/clients` - Get all clients for agency
- `GET /api/agency/clients/:id` - Get client by ID
- `POST /api/agency/clients` - Create new client
- `PUT /api/agency/clients/:id` - Update client
- `DELETE /api/agency/clients/:id` - Delete client
- `POST /api/agency/clients/bulk` - Perform bulk actions on clients

### User Management

Endpoints for managing users and permissions:

- `GET /api/agency/users` - Get all users for agency
- `GET /api/agency/users/:id` - Get user by ID
- `POST /api/agency/users` - Create new user or send invitation
- `PUT /api/agency/users/:id` - Update user
- `DELETE /api/agency/users/:id` - Delete user
- `POST /api/agency/users/:id/resend-invitation` - Resend invitation

### Role Management

Endpoints for managing custom roles and permissions:

- `GET /api/agency/roles` - Get all roles for agency
- `GET /api/agency/roles/:id` - Get role by ID
- `POST /api/agency/roles` - Create new role
- `PUT /api/agency/roles/:id` - Update role
- `DELETE /api/agency/roles/:id` - Delete role
- `POST /api/agency/roles/default/:agencyId` - Create default system roles

## Authentication & Authorization

### Authentication Flow

1. User logs in with email/password and receives JWT token
2. Token is included in Authorization header for subsequent requests
3. `authenticate` middleware verifies token and attaches user to request

### Permission System

The API implements a role-based access control (RBAC) system with both system-defined and custom roles:

- **System Roles**: Admin, Manager, Specialist, Viewer, Client
- **Custom Roles**: Agency-defined roles with specific permission sets

Permissions are organized by resource categories:
- dashboard
- reports
- settings
- clients
- users
- billing

Each category supports specific actions:
- view
- edit
- create
- delete

The `authorizeAgency` middleware enforces these permissions for every API request.

## Validation Framework

Request validation is implemented using Joi schemas:

1. Each entity type has corresponding validation schemas
2. Schemas define field requirements, types, and constraints
3. The `validateSchema` middleware applies schemas to incoming requests
4. Validation errors are transformed into consistent response format

## Error Handling

The API implements a comprehensive error handling strategy:

1. Custom error classes for different error types
2. Centralized error handling middleware
3. Consistent error response format with appropriate HTTP status codes
4. Detailed error information in development mode

Error response format:
```json
{
  "success": false,
  "message": "Error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ],
  "stack": "Stack trace (development only)"
}
```

## Security Considerations

1. **Authentication**: JWT-based with proper expiration and secret key
2. **Authorization**: Fine-grained permission system with role-based access
3. **Input Validation**: Comprehensive schema validation for all requests
4. **Security Headers**: Helmet middleware for setting secure HTTP headers
5. **Data Isolation**: Agency-based partitioning of data
6. **Password Security**: Bcrypt hashing for user passwords

## Next Steps

1. **Implement Testing**: Add comprehensive unit and integration tests
2. **API Documentation**: Generate OpenAPI/Swagger documentation
3. **Rate Limiting**: Add rate limiting for API endpoints
4. **Caching Strategy**: Implement Redis caching for performance optimization
5. **Webhook System**: Create event-based webhook notification system
