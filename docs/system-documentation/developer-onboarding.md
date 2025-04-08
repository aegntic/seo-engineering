# SEO.engineering Developer Onboarding Guide

## Welcome to SEO.engineering

Welcome to the SEO.engineering development team! This guide will help you get set up with the project, understand our architecture, and learn our development workflows.

## Project Overview

SEO.engineering is a fully automated technical SEO platform that provides end-to-end automation for technical SEO audits, fixes, and performance optimization. The system bridges the gap between technical SEO knowledge and implementation, delivering enterprise-grade results at scale.

### Core Value Proposition

- **End-to-End Automation**: From initial audit to implementation and verification
- **Speed Advantage**: Complete in hours what typically takes weeks
- **Consistency**: Eliminate human error with systematized improvements
- **Scalability**: Handle unlimited clients without proportional staff increases
- **Data-Driven**: Make decisions based on comprehensive analytics

## Getting Started

### Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** (v16.x or higher)
- **Docker** and **Docker Compose**
- **Git**
- **MongoDB** (local or access to development instance)
- **Redis** (local or access to development instance)
- Code editor of your choice (VS Code recommended)

### First-Day Setup

1. **Request Access**
   - GitHub repository access
   - Development environment credentials
   - Team communication channels

2. **Clone the Repository**
   ```bash
   git clone https://github.com/organization/SEO.engineering.git
   cd SEO.engineering
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with the credentials provided to you
   ```

5. **Start Development Environment**
   ```bash
   npm run dev
   ```

6. **Verify Installation**
   - Open http://localhost:3000 in your browser
   - You should see the SEO.engineering dashboard
   - Run tests to verify everything is working: `npm test`

## Development Environment

### Component Structure

The SEO.engineering project follows a modular architecture with the following main components:

- `/workflows` - n8n workflow definitions
- `/automation` - Custom automation scripts
  - `/automation/crawler` - Crawler Module
  - `/automation/analysis` - Analysis Engine
  - `/automation/implementation` - Implementation Module
  - `/automation/verification` - Verification System
- `/website` - Client-facing website and dashboard
- `/api` - Backend API services
- `/docs` - Documentation

### Local Development

For local development, you have several options:

1. **Full Stack Development**
   ```bash
   npm run dev
   ```
   This starts all components including frontend, backend, and supporting services.

2. **Frontend Only**
   ```bash
   npm run dev:website
   ```
   This starts only the frontend with API calls proxied to the development environment.

3. **Backend Only**
   ```bash
   npm run dev:api
   ```
   This starts only the backend services.

4. **Specific Component**
   ```bash
   npm run dev:crawler
   npm run dev:analysis
   npm run dev:implementation
   npm run dev:verification
   ```
   These commands start specific components for focused development.

### Docker Development

You can also use Docker for a more isolated development environment:

```bash
docker-compose up -d
```

This will start all services in containers. You can view logs with:

```bash
docker-compose logs -f [service_name]
```

And stop the environment with:

```bash
docker-compose down
```

## Project Guidelines

### Golden Rules

Our project follows these golden rules:

1. **All files must be under 500 lines** - Maintain modularity for easier maintenance
2. **Use markdown for project management** - Keep planning and tasks in version-controlled markdown
3. **Focus on one task per message** - Ensure clarity in communication and development
4. **Start fresh conversations frequently** - Prevents context overload
5. **Be specific in requests** - Reduces ambiguity and implementation errors
6. **Test all code** - Ensure reliability through automated testing
7. **Write clear documentation and comments** - Maintain knowledge transfer
8. **Implement environment variables securely** - Protect sensitive configuration

### Coding Standards

1. **JavaScript/TypeScript**
   - Use ESLint for code linting
   - Follow the Airbnb JavaScript Style Guide
   - Use async/await for asynchronous code
   - Properly handle errors and edge cases

2. **React (Frontend)**
   - Use functional components and hooks
   - Follow the container/presentation component pattern
   - Use Tailwind CSS for styling
   - Implement responsive design for all components

3. **Node.js (Backend)**
   - Use Express for API endpoints
   - Follow RESTful API design principles
   - Implement proper validation for all inputs
   - Use middleware for cross-cutting concerns

### Git Workflow

We follow a Git workflow based on feature branches:

1. **Main Branches**
   - `main` - Production-ready code
   - `develop` - Integration branch for features

2. **Feature Development**
   - Create a new branch from `develop`: `feature/your-feature-name`
   - Make your changes, committing regularly
   - Push your branch to GitHub
   - Create a Pull Request to merge into `develop`
   - Request reviews from team members
   - Address review comments
   - Merge your PR once approved

3. **Commits**
   - Write clear commit messages
   - Use present tense ("Add feature" not "Added feature")
   - Reference issue numbers where applicable

4. **Pull Requests**
   - Provide a clear description of the changes
   - Include screenshots for UI changes
   - List any breaking changes
   - Update documentation as needed
   - Ensure all tests pass

## Development Workflow

### Task Management

1. **Issue Tracking**
   - All work should be associated with an issue in GitHub
   - Issues are prioritized during planning meetings
   - Issues should have clear acceptance criteria

2. **Project Boards**
   - We use GitHub Projects for tracking work
   - Columns: Backlog, To Do, In Progress, Review, Done
   - Update issue status as you work

### Development Cycle

1. **Planning**
   - Participate in planning sessions
   - Help estimate and scope work
   - Ask questions to clarify requirements

2. **Development**
   - Follow the Git workflow described above
   - Write tests for new functionality
   - Update documentation as needed
   - Regularly sync with the team

3. **Review**
   - Review PRs from other team members
   - Provide constructive feedback
   - Focus on code quality, functionality, and maintainability

4. **Testing**
   - Ensure all tests pass before submitting PR
   - Add tests for new functionality
   - Consider edge cases and error scenarios

5. **Deployment**
   - Code is automatically deployed to staging after merging to `develop`
   - Verify your changes in the staging environment
   - Production deployments are done manually after QA

## Testing

### Types of Tests

1. **Unit Tests**
   - Test individual functions and components
   - Located in `__tests__` directories alongside code
   - Run with `npm test`

2. **Integration Tests**
   - Test interactions between components
   - Located in `/tests/integration`
   - Run with `npm run test:integration`

3. **End-to-End Tests**
   - Test complete user workflows
   - Use Playwright for browser automation
   - Located in `/tests/e2e`
   - Run with `npm run test:e2e`

### Writing Tests

- Write tests as you develop, not after
- Aim for high test coverage, especially for critical paths
- Mock external dependencies
- Test both success and failure scenarios
- Test edge cases

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testPathPattern=crawler

# Run tests in watch mode
npm test -- --watch

# Run with coverage report
npm test -- --coverage
```

## Documentation

### Types of Documentation

1. **Code Documentation**
   - Use JSDoc comments for functions and classes
   - Document parameters, return values, and exceptions
   - Explain complex logic or business rules

2. **API Documentation**
   - All APIs should be documented with OpenAPI/Swagger
   - Located in `/api/swagger.yaml`
   - Generated API docs available at `/api-docs` endpoint

3. **Component Documentation**
   - Located in `/docs/system-documentation/components`
   - Describes architecture, data flow, and interfaces
   - Update when making significant changes

4. **README Files**
   - Each directory should have a README.md
   - Explain the purpose of the directory
   - Provide usage examples where applicable

### Updating Documentation

- Documentation is treated as code
- Submit documentation updates as part of your PRs
- Use markdown for all documentation
- Include diagrams for complex systems (using Mermaid syntax)

## Troubleshooting

### Common Issues

1. **Environment Setup Issues**
   - Verify all prerequisites are installed
   - Check environment variables in `.env`
   - Ensure Docker is running (if using Docker)
   - Clear node_modules and reinstall if needed

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network connectivity
   - Ensure database user has correct permissions

3. **API Issues**
   - Check API logs for errors
   - Verify request format and parameters
   - Check authentication tokens

4. **Frontend Issues**
   - Check browser console for errors
   - Verify API endpoints in network tab
   - Clear browser cache if needed

### Getting Help

1. **Documentation**
   - Check the documentation in `/docs`
   - Review component-specific documentation

2. **Team Communication**
   - Ask questions in the team Slack channel
   - Tag specific team members for component-specific questions

3. **Mentorship**
   - Each new developer is assigned a mentor
   - Schedule regular 1:1 meetings with your mentor

## Component-Specific Guides

For detailed information about specific components, refer to the following guides:

1. [Crawler Module Guide](./components/crawler.md)
2. [Analysis Engine Guide](./components/analysis-engine.md)
3. [Implementation Module Guide](./components/implementation.md)
4. [Verification System Guide](./components/verification.md)
5. [Client Dashboard Guide](./components/client-dashboard.md)

## Additional Resources

- [Project Architecture Overview](./architecture.md)
- [API Reference](./api/README.md)
- [Integration Points](./integration-points.md)
- [Deployment Guide](./operations/deployment.md)
- [Monitoring Guide](./operations/monitoring.md)
- [Troubleshooting Guide](./operations/troubleshooting.md)

## First Week Tasks

Here are some suggested tasks for your first week:

1. **Setup and Exploration (Day 1)**
   - Complete all setup steps
   - Explore the codebase
   - Run the application locally
   - Review documentation

2. **Simple Bug Fix (Day 2)**
   - Pick a simple bug to fix
   - Follow the Git workflow
   - Submit your first PR

3. **Feature Enhancement (Days 3-4)**
   - Work on a small feature enhancement
   - Write tests for your changes
   - Update documentation

4. **Code Review (Day 5)**
   - Review PRs from other team members
   - Provide constructive feedback
   - Learn from other developers' code

## Welcome Aboard!

We're excited to have you on the team! If you have any questions or need help, don't hesitate to reach out to your mentor or any team member.

Happy coding!
