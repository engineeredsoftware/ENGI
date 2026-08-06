/**
 * Bitcode MCP Development Prompts
 * 
 * Development-focused prompts for common engineering tasks,
 * scaffolding, and project setup workflows.
 */

import { z } from 'zod';

/**
 * MCP Prompt interface
 */
interface MCPPrompt {
  name: string;
  description: string;
  arguments?: z.ZodType<any>;
  getMessages: (args: Record<string, any>) => Promise<any[]>;
}

/**
 * API development prompt
 */
const apiDevelopmentPrompt: MCPPrompt = {
  name: 'bitcode://prompts/development/api-development',
  description: `Comprehensive API development workflow with OpenAPI specification and best practices.

This prompt guides complete API implementation:
• RESTful API design and architecture
• OpenAPI specification generation
• Authentication and authorization setup
• Testing and documentation creation
• Security and performance optimization

Perfect for API development, microservices creation, and API modernization projects.`,

  arguments: z.object({
    apiName: z.string().describe('Name of the API to develop'),
    description: z.string().describe('Description of the API functionality'),
    repository: z.object({
      owner: z.string(),
      name: z.string(),
      branch: z.string().optional().default('main')
    }).describe('Target repository for API development'),
    apiType: z.enum(['rest', 'graphql', 'grpc', 'websocket']).default('rest')
      .describe('Type of API to develop'),
    framework: z.string().optional()
      .describe('Preferred framework (Express, FastAPI, Spring Boot, etc.)'),
    authentication: z.enum(['jwt', 'oauth2', 'api-key', 'basic', 'none']).default('jwt')
      .describe('Authentication method to implement'),
    database: z.string().optional()
      .describe('Database system to integrate (PostgreSQL, MongoDB, etc.)'),
    endpoints: z.array(z.object({
      path: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
      description: z.string()
    })).optional().default([]).describe('Specific endpoints to implement'),
    requirements: z.array(z.string()).optional().default([])
      .describe('Additional functional requirements')
  }),

  getMessages: async (args) => [
    {
      role: 'user',
      content: `I read to develop a comprehensive API with the following specifications:

## API Development Context
- **API Name**: ${args.apiName}
- **Description**: ${args.description}
- **Repository**: ${args.repository.owner}/${args.repository.name}
- **Branch**: ${args.repository.branch || 'main'}
- **API Type**: ${args.apiType.toUpperCase()}
${args.framework ? `- **Framework**: ${args.framework}` : ''}
- **Authentication**: ${args.authentication.toUpperCase()}
${args.database ? `- **Database**: ${args.database}` : ''}

${args.endpoints.length > 0 ? `## Required Endpoints
${args.endpoints.map((ep: { method: string; path: string; description: string }) => `- ${ep.method} ${ep.path} - ${ep.description}`).join('\n')}` : ''}

${args.requirements.length > 0 ? `## Additional Requirements
${args.requirements.map((req: string) => `- ${req}`).join('\n')}` : ''}

Please help me develop this API using Bitcode's asset-pack pipeline with the following comprehensive source-to-shares approach:

1. **API Design & Architecture** - Use the asset-pack pipeline with admitted subtype "api_spec":
   - Generate comprehensive OpenAPI 3.0 specification
   - Design RESTful resource structure and URL patterns
   - Define request/response schemas with proper validation
   - Plan error handling and status code conventions
   - Design API versioning strategy
   - Create authentication and authorization flow diagrams

2. **Implementation Planning** - Use the asset-pack pipeline with admitted subtype "implementation_plan":
   - Design project structure and architecture patterns
   - Plan database schema and data access layer
   - Design middleware stack and request processing flow
   - Plan testing strategy (unit, integration, end-to-end)
   - Design deployment and infrastructure requirements
   - Plan monitoring, logging, and observability setup

3. **Core API Implementation** - Use the asset-pack pipeline with admitted subtype "pull_request":

   **Foundation Setup**:
   - Set up project structure with proper separation of concerns
   - Implement configuration management and environment handling
   - Set up database connection and ORM/ODM integration
   - Implement logging, monitoring, and health check endpoints
   - Set up error handling middleware and global exception handling

   **Authentication & Security**:
   ${args.authentication === 'jwt' ? `
   - Implement JWT authentication with refresh token mechanism
   - Set up user registration, login, and password reset flows
   - Implement role-based access control (RBAC)
   - Add JWT middleware for protected routes
   - Implement password hashing and security best practices` : ''}
   ${args.authentication === 'oauth2' ? `
   - Set up OAuth 2.0 authorization server integration
   - Implement OAuth flows (authorization code, client credentials)
   - Set up scope-based access control
   - Implement token validation and refresh mechanisms
   - Add OAuth middleware for protected routes` : ''}
   ${args.authentication === 'api-key' ? `
   - Implement API key generation and management
   - Set up API key validation middleware
   - Implement rate limiting and quota management
   - Add API key rotation and expiration handling
   - Set up usage tracking and analytics` : ''}

   **Core Endpoints Implementation**:
   ${args.endpoints.length > 0 ? args.endpoints.map((ep: { method: string; path: string; description: string }) => `
   - **${ep.method} ${ep.path}**: ${ep.description}
     - Implement request validation and sanitization
     - Add proper error handling and response formatting
     - Implement business logic with proper separation
     - Add comprehensive logging and metrics
     - Include unit and integration tests`).join('\n') : `
   - Implement CRUD operations for main resources
   - Add pagination, sorting, and filtering capabilities
   - Implement bulk operations where appropriate
   - Add search and query functionality
   - Include proper data validation and sanitization`}

   **Database Integration**:
   ${args.database ? `
   - Design and implement database schema for ${args.database}
   - Set up database migrations and seeding
   - Implement repository pattern for data access
   - Add database connection pooling and optimization
   - Implement transaction handling and error recovery
   - Add database health checks and monitoring` : `
   - Design appropriate data storage solution
   - Implement data access patterns and abstractions
   - Add data validation and integrity constraints
   - Set up backup and recovery procedures`}

4. **API Documentation** - Use the asset-pack pipeline with admitted subtype "blog_post":
   - Generate interactive API documentation with Swagger/OpenAPI
   - Create comprehensive API usage guides and examples
   - Document authentication flows and error handling
   - Provide SDK/client library examples
   - Create postman collections and test suites
   - Add troubleshooting and FAQ sections

5. **Testing & Quality Assurance**:
   - Implement comprehensive unit tests (>90% coverage)
   - Add integration tests for all API endpoints
   - Create end-to-end test scenarios
   - Implement API contract testing
   - Add performance and load testing
   - Set up security testing and vulnerability scanning

6. **API Best Practices Implementation**:
   - **Performance**: Implement caching, compression, and optimization
   - **Security**: Add rate limiting, input validation, and security headers
   - **Reliability**: Implement circuit breakers, retries, and graceful degradation
   - **Observability**: Add comprehensive logging, metrics, and tracing
   - **Documentation**: Maintain up-to-date API documentation and examples
   - **Versioning**: Implement API versioning strategy and published-contract stability

7. **Deployment & Operations**:
   - Set up CI/CD pipeline for automated testing and deployment
   - Configure containerization with Docker
   - Set up monitoring, alerting, and log aggregation
   - Implement health checks and readiness probes
   - Configure auto-scaling and load balancing
   - Set up backup and disaster recovery procedures

Please execute the API development phases, providing a production-ready API with comprehensive documentation, testing, and operational excellence.`
    }
  ]
};

/**
 * Frontend scaffolding prompt
 */
const frontendScaffoldingPrompt: MCPPrompt = {
  name: 'bitcode://prompts/development/frontend-scaffolding',
  description: `Modern frontend application scaffolding with component libraries and best practices.

This prompt provides complete frontend setup:
• Framework selection and project structure
• Component library and design system setup
• State management and routing configuration
• Testing framework and tool integration
• Build optimization and deployment setup

Ideal for new frontend projects, component libraries, and modernization efforts.`,

  arguments: z.object({
    projectName: z.string().describe('Name of the frontend project'),
    description: z.string().describe('Description of the frontend application'),
    repository: z.object({
      owner: z.string(),
      name: z.string(),
      branch: z.string().optional().default('main')
    }).describe('Target repository for frontend project'),
    framework: z.enum(['react', 'vue', 'angular', 'svelte', 'solid']).default('react')
      .describe('Frontend framework to use'),
    typescript: z.boolean().default(true)
      .describe('Use TypeScript for type safety'),
    styling: z.enum(['css-modules', 'styled-components', 'emotion', 'tailwind', 'scss']).default('tailwind')
      .describe('Styling approach to implement'),
    stateManagement: z.enum(['redux', 'zustand', 'mobx', 'context', 'recoil']).optional()
      .describe('State management solution'),
    testing: z.enum(['jest', 'vitest', 'cypress', 'playwright']).default('jest')
      .describe('Testing framework to set up'),
    features: z.array(z.enum([
      'authentication', 'routing', 'forms', 'charts', 'tables', 
      'internationalization', 'dark-mode', 'pwa', 'ssr'
    ])).optional().default([]).describe('Features to implement'),
    designSystem: z.string().optional()
      .describe('Design system or component library to integrate')
  }),

  getMessages: async (args) => [
    {
      role: 'user',
      content: `I read to scaffold a modern frontend application with the following specifications:

## Frontend Project Context
- **Project Name**: ${args.projectName}
- **Description**: ${args.description}
- **Repository**: ${args.repository.owner}/${args.repository.name}
- **Branch**: ${args.repository.branch || 'main'}
- **Framework**: ${args.framework.charAt(0).toUpperCase() + args.framework.slice(1)}
- **TypeScript**: ${args.typescript ? 'Enabled' : 'Disabled'}
- **Styling**: ${args.styling.toUpperCase()}
${args.stateManagement ? `- **State Management**: ${args.stateManagement}` : ''}
- **Testing**: ${args.testing}
${args.designSystem ? `- **Design System**: ${args.designSystem}` : ''}

${args.features.length > 0 ? `## Required Features
${args.features.map((feature: string) => `- ${feature.charAt(0).toUpperCase() + feature.slice(1)}`).join('\n')}` : ''}

Please help me scaffold this frontend application using Bitcode's asset-pack pipeline:

1. **Project Setup & Architecture** - Use the asset-pack pipeline with admitted subtype "frontend_scaffolder":

   **Foundation Setup**:
   - Initialize ${args.framework} project with ${args.typescript ? 'TypeScript' : 'JavaScript'} configuration
   - Set up modern build tooling (Vite/Webpack/Turbopack)
   - Configure ESLint, Prettier, and pre-commit hooks
   - Set up package.json with proper scripts and dependencies
   - Configure development and production environments
   - Set up environment variable management

   **Project Structure**:
   \`\`\`
   src/
   ├── components/          # Reusable UI components
   ├── pages/              # Page components and routing
   ├── hooks/              # Custom hooks and logic
   ├── utils/              # Utility functions and helpers
   ├── services/           # API services and data fetching
   ├── stores/             # State management (${args.stateManagement || 'context'})
   ├── styles/             # Global styles and themes
   ├── types/              # TypeScript type definitions
   ├── assets/             # Static assets and images
   └── __tests__/          # Test files and utilities
   \`\`\`

2. **Styling & Design System Setup**:
   ${args.styling === 'tailwind' ? `
   - Configure Tailwind CSS with custom design tokens
   - Set up responsive design utilities and breakpoints
   - Implement dark mode support with CSS variables
   - Create component variants and utility classes
   - Set up Tailwind plugins for animations and forms
   - Configure PurgeCSS for production optimization` : ''}
   ${args.styling === 'styled-components' ? `
   - Set up styled-components with theme provider
   - Create design tokens and theme configuration
   - Implement responsive design mixins and utilities
   - Set up component variants and styling patterns
   - Configure server-side rendering support
   - Add TypeScript definitions for theme` : ''}
   ${args.styling === 'css-modules' ? `
   - Configure CSS Modules with proper naming conventions
   - Set up global styles and CSS custom properties
   - Create responsive design mixins and utilities
   - Implement modular component styling approach
   - Set up PostCSS plugins for optimization
   - Configure CSS bundling and optimization` : ''}

   ${args.designSystem ? `
   **Design System Integration**:
   - Integrate ${args.designSystem} component library
   - Set up theme customization and branding
   - Create design system wrapper components
   - Implement consistent spacing and typography
   - Set up icon system and asset management
   - Configure accessibility and ARIA implementations` : ''}

3. **State Management & Data Flow**:
   ${args.stateManagement === 'redux' ? `
   - Set up Redux Toolkit with modern patterns
   - Configure store with proper middleware (Redux DevTools, thunk)
   - Implement typed reducers and action creators
   - Set up RTK Query for data fetching and caching
   - Create selector patterns for component connections
   - Add persistence and rehydration logic` : ''}
   ${args.stateManagement === 'zustand' ? `
   - Set up Zustand stores with TypeScript support
   - Implement store slicing and composition patterns
   - Configure persistence and middleware
   - Set up async actions and error handling
   - Create store hooks and selectors
   - Add devtools integration for debugging` : ''}
   ${args.stateManagement || 'context' === 'context' ? `
   - Set up React Context providers for global state
   - Implement useReducer patterns for complex state
   - Create custom hooks for state management
   - Set up context composition and provider patterns
   - Add state persistence and local storage integration
   - Implement optimistic updates and error handling` : ''}

4. **Feature Implementation**:
   ${args.features.includes('authentication') ? `
   **Authentication System**:
   - Implement login/logout functionality with JWT/OAuth
   - Set up protected route components and guards
   - Create authentication context and hooks
   - Add user profile management and settings
   - Implement password reset and email verification
   - Set up role-based access control (RBAC)` : ''}

   ${args.features.includes('routing') ? `
   **Routing Setup**:
   - Configure ${args.framework === 'react' ? 'React Router' : args.framework === 'vue' ? 'Vue Router' : 'framework router'}
   - Set up nested routing and route parameters
   - Implement route guards and middleware
   - Add lazy loading and code splitting
   - Configure 404 error handling and redirects
   - Set up breadcrumb navigation and route metadata` : ''}

   ${args.features.includes('forms') ? `
   **Form Management**:
   - Set up form library (React Hook Form/Formik for React)
   - Implement form validation with schema validation (Yup/Zod)
   - Create reusable form components and inputs
   - Add file upload and image handling
   - Implement form state persistence and auto-save
   - Set up form accessibility and error handling` : ''}

   ${args.features.includes('internationalization') ? `
   **Internationalization (i18n)**:
   - Set up i18n library with language detection
   - Create translation files and namespace organization
   - Implement language switching and persistence
   - Add date/time and number formatting
   - Set up RTL language support
   - Configure build-time translation optimization` : ''}

5. **Testing & Quality Assurance**:
   - **Unit Testing**: Set up ${args.testing} with component testing utilities
   - **Integration Testing**: Add testing library for user interaction testing
   - **E2E Testing**: Configure Cypress/Playwright for end-to-end testing
   - **Visual Testing**: Set up Storybook for component documentation
   - **Accessibility Testing**: Add axe-core and accessibility testing
   - **Performance Testing**: Configure Lighthouse CI and performance budgets

6. **Build Optimization & Performance**:
   - **Code Splitting**: Implement route-based and component-based splitting
   - **Bundle Analysis**: Set up bundle size monitoring and analysis
   - **Image Optimization**: Configure next-gen image formats and lazy loading
   - **Caching Strategy**: Implement service worker and HTTP caching
   - **Performance Monitoring**: Set up Core Web Vitals tracking
   - **SEO Optimization**: Configure meta tags, structured data, and sitemap

   ${args.features.includes('pwa') ? `
   **Progressive Web App (PWA)**:
   - Configure service worker for offline functionality
   - Set up app manifest and installation prompts
   - Implement background sync and push notifications
   - Add offline page and cache strategies
   - Configure app shell architecture
   - Set up PWA testing and validation` : ''}

7. **Development Experience & Tooling**:
   - **Hot Module Replacement**: Configure fast refresh for development
   - **DevTools**: Set up framework-specific browser extensions
   - **Linting & Formatting**: Configure ESLint, Prettier, and Stylelint
   - **Git Hooks**: Set up Husky for pre-commit validation
   - **Documentation**: Create component documentation with Storybook
   - **Environment Management**: Set up multiple environment configurations

8. **Deployment & CI/CD**:
   - Configure build scripts for different environments
   - Set up continuous integration with testing and linting
   - Configure deployment to modern hosting platforms
   - Set up preview deployments for pull requests
   - Add performance monitoring and error tracking
   - Configure CDN and asset optimization

Please implement this comprehensive frontend scaffolding with modern best practices, performance optimization, and developer experience excellence.`
    }
  ]
};

/**
 * Database integration prompt
 */
const databaseIntegrationPrompt: MCPPrompt = {
  name: 'bitcode://prompts/development/database-integration',
  description: `Comprehensive database integration with ORM setup, migrations, and best practices.

This prompt provides complete database setup:
• Database schema design and modeling
• ORM/ODM configuration and setup
• Migration system and data seeding
• Query optimization and indexing
• Security and backup configuration

Perfect for database integration, data modeling, and persistence layer development.`,

  arguments: z.object({
    databaseType: z.enum(['postgresql', 'mysql', 'mongodb', 'sqlite', 'redis']).default('postgresql')
      .describe('Type of database to integrate'),
    repository: z.object({
      owner: z.string(),
      name: z.string(),
      branch: z.string().optional().default('main')
    }).describe('Target repository for database integration'),
    orm: z.enum(['prisma', 'typeorm', 'sequelize', 'mongoose', 'drizzle']).optional()
      .describe('ORM/ODM to use for database integration'),
    entities: z.array(z.object({
      name: z.string(),
      description: z.string(),
      fields: z.array(z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean().default(false)
      }))
    })).optional().default([]).describe('Database entities to create'),
    features: z.array(z.enum([
      'migrations', 'seeding', 'indexing', 'fulltext-search', 
      'caching', 'replication', 'backup', 'monitoring'
    ])).optional().default(['migrations', 'seeding']).describe('Database features to implement'),
    environment: z.enum(['development', 'staging', 'production', 'all']).default('all')
      .describe('Environment configuration scope')
  }),

  getMessages: async (args) => [
    {
      role: 'user',
      content: `I read to integrate a database with comprehensive setup and best practices:

## Database Integration Context
- **Database Type**: ${args.databaseType.toUpperCase()}
- **Repository**: ${args.repository.owner}/${args.repository.name}
- **Branch**: ${args.repository.branch || 'main'}
${args.orm ? `- **ORM/ODM**: ${args.orm}` : ''}
- **Environment**: ${args.environment}

${args.entities.length > 0 ? `## Database Entities
${args.entities.map((entity: { name: string; description: string; fields: Array<{ name: string; type: string; required?: boolean }> }) => `
### ${entity.name}
${entity.description}
Fields:
${entity.fields.map((field: { name: string; type: string; required?: boolean }) => `- ${field.name}: ${field.type}${field.required ? ' (required)' : ''}`).join('\n')}`).join('\n')}` : ''}

## Required Features
${args.features.map((feature: string) => `- ${feature.charAt(0).toUpperCase() + feature.slice(1)}`).join('\n')}

Please help me implement comprehensive database integration using Bitcode's asset-pack pipeline:

1. **Database Setup & Configuration** - Use the asset-pack pipeline with admitted subtype "pull_request":

   **Database Installation & Setup**:
   ${args.databaseType === 'postgresql' ? `
   - Set up PostgreSQL with proper configuration
   - Configure connection pooling and performance tuning
   - Set up database clustering and replication (if needed)
   - Configure SSL/TLS for secure connections
   - Set up database monitoring and alerting
   - Configure backup and point-in-time recovery` : ''}
   ${args.databaseType === 'mongodb' ? `
   - Set up MongoDB with replica set configuration
   - Configure sharding for horizontal scaling
   - Set up authentication and authorization
   - Configure SSL/TLS and network security
   - Set up monitoring with MongoDB Atlas or self-hosted
   - Configure backup and disaster recovery` : ''}
   ${args.databaseType === 'mysql' ? `
   - Set up MySQL with optimized configuration
   - Configure master-slave replication
   - Set up connection pooling and query caching
   - Configure SSL/TLS for secure connections
   - Set up monitoring and performance tuning
   - Configure automated backup and recovery` : ''}

   **Environment Configuration**:
   - Set up database connections for all environments
   - Configure environment-specific settings
   - Set up connection string management
   - Configure SSL certificates and security
   - Set up database health checks
   - Configure connection retry and fallback logic

2. **ORM/ODM Integration**:
   ${args.orm === 'prisma' ? `
   **Prisma Setup**:
   - Install and configure Prisma with database provider
   - Set up Prisma schema with proper data modeling
   - Configure Prisma Client with type generation
   - Set up database introspection and schema sync
   - Configure Prisma Studio for database management
   - Set up query optimization and middleware` : ''}
   ${args.orm === 'typeorm' ? `
   **TypeORM Setup**:
   - Configure TypeORM with database connection
   - Set up entity definitions with decorators
   - Configure repository pattern and custom repositories
   - Set up query builder and advanced querying
   - Configure caching and performance optimization
   - Set up TypeORM CLI for database operations` : ''}
   ${args.orm === 'mongoose' ? `
   **Mongoose Setup**:
   - Configure Mongoose with MongoDB connection
   - Set up schema definitions with validation
   - Configure middleware and pre/post hooks
   - Set up virtual fields and computed properties
   - Configure population and reference handling
   - Set up aggregation pipelines and indexing` : ''}

3. **Schema Design & Data Modeling**:
   ${args.entities.length > 0 ? args.entities.map((entity: { name: string; description: string }) => `
   **${entity.name} Entity**:
   - Design table/collection structure for ${entity.description}
   - Implement proper field types and constraints
   - Set up relationships and foreign keys
   - Add validation rules and business logic
   - Configure indexing for query optimization
   - Set up audit fields (created_at, updated_at, etc.)`).join('\n') : `
   **Generic Entity Setup**:
   - Design normalized database schema
   - Set up proper relationships and constraints
   - Implement audit trails and versioning
   - Configure soft delete patterns
   - Set up full-text search capabilities
   - Design for scalability and performance`}

4. **Migration System Implementation**:
   ${args.features.includes('migrations') ? `
   **Migration Framework**:
   - Set up database migration system
   - Create initial schema migration
   - Implement versioned migration strategy
   - Set up rollback and forward migration
   - Configure migration automation in CI/CD
   - Add migration testing and validation
   - Set up schema drift detection` : ''}

5. **Data Seeding & Initial Data**:
   ${args.features.includes('seeding') ? `
   **Data Seeding System**:
   - Create seed data for development and testing
   - Set up factory patterns for test data generation
   - Implement environment-specific seeding
   - Configure data anonymization for production seeds
   - Set up seeding automation and scripts
   - Add seed data validation and consistency checks` : ''}

6. **Performance Optimization**:
   ${args.features.includes('indexing') ? `
   **Indexing Strategy**:
   - Analyze query patterns and create optimal indexes
   - Set up compound indexes for complex queries
   - Configure partial and conditional indexes
   - Implement full-text search indexes
   - Set up index monitoring and maintenance
   - Configure automatic index optimization` : ''}

   **Query Optimization**:
   - Implement query analysis and optimization
   - Set up query caching strategies
   - Configure connection pooling optimization
   - Add query performance monitoring
   - Implement database query logging
   - Set up slow query detection and alerting

7. **Caching & Performance**:
   ${args.features.includes('caching') ? `
   **Caching Implementation**:
   - Set up Redis for application-level caching
   - Implement query result caching
   - Configure cache invalidation strategies
   - Set up distributed caching for scaling
   - Add cache monitoring and metrics
   - Implement cache warming and preloading` : ''}

8. **Security & Access Control**:
   - Configure database user management and roles
   - Set up row-level security and access controls
   - Implement data encryption at rest and in transit
   - Configure audit logging and compliance
   - Set up database firewall and network security
   - Implement SQL injection prevention

9. **Backup & Disaster Recovery**:
   ${args.features.includes('backup') ? `
   **Backup Strategy**:
   - Set up automated daily/weekly backups
   - Configure point-in-time recovery
   - Implement backup encryption and security
   - Set up cross-region backup replication
   - Configure backup monitoring and alerting
   - Create disaster recovery procedures and testing` : ''}

10. **Monitoring & Observability**:
    ${args.features.includes('monitoring') ? `
    **Database Monitoring**:
    - Set up database performance monitoring
    - Configure connection and query monitoring
    - Implement database health checks
    - Set up alerting for critical metrics
    - Configure log aggregation and analysis
    - Add custom metrics and dashboards` : ''}

11. **Development Tools & Utilities**:
    - Create database management CLI tools
    - Set up database seeding and reset scripts
    - Configure database testing utilities
    - Add database documentation generation
    - Set up schema validation and linting
    - Create data export/import utilities

Please implement this comprehensive database integration with production-ready configuration, security, performance optimization, and operational excellence.`
    }
  ]
};

/**
 * Register development prompts
 */
export function registerDevelopmentPrompts(): MCPPrompt[] {
  return [
    apiDevelopmentPrompt,
    frontendScaffoldingPrompt,
    databaseIntegrationPrompt
  ];
}
