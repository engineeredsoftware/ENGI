/**
 * Bitcode MCP Workflow Prompts
 * 
 * Pre-built workflow templates for common engineering tasks,
 * providing best-practice guidance and structured approaches.
 */

import { z } from 'zod';
import type { PromptTemplate } from '../types';

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
 * Feature creation workflow prompt
 */
const featureCreationPrompt: MCPPrompt = {
  name: 'bitcode://prompts/workflow/feature-creation',
  description: `Complete workflow for implementing new features with engineering best practices.

This prompt guides you through a comprehensive feature implementation process:
• Requirements analysis and scope definition
• Architecture planning and design decisions
• Implementation strategy with testing approach
• Security and performance considerations
• Documentation and deployment planning

Perfect for new feature development, enhancement requests, and product improvements.`,

  arguments: z.object({
    featureName: z.string().describe('Name of the feature to implement'),
    requirements: z.string().describe('Detailed feature requirements and acceptance criteria'),
    repository: z.object({
      owner: z.string(),
      name: z.string(),
      branch: z.string().optional().default('main')
    }).describe('Target repository information'),
    complexity: z.enum(['simple', 'medium', 'complex']).optional().default('medium')
      .describe('Expected complexity level of the feature'),
    stakeholders: z.array(z.string()).optional().default([])
      .describe('Key stakeholders and reviewers'),
    timeline: z.string().optional().describe('Target timeline or deadline'),
    constraints: z.array(z.string()).optional().default([])
      .describe('Technical or business constraints to consider')
  }),

  getMessages: async (args) => [
    {
      role: 'user',
      content: `I read to implement a new feature called "${args.featureName}" with the following requirements:

## Feature Requirements
${args.requirements}

## Project Context
- **Repository**: ${args.repository.owner}/${args.repository.name}
- **Branch**: ${args.repository.branch || 'main'}
- **Complexity**: ${args.complexity}
${args.timeline ? `- **Timeline**: ${args.timeline}` : ''}
${args.stakeholders.length > 0 ? `- **Stakeholders**: ${args.stakeholders.join(', ')}` : ''}

${args.constraints.length > 0 ? `## Constraints
${args.constraints.map((constraint: string) => `- ${constraint}`).join('\n')}` : ''}

Please help me implement this feature using Bitcode's asset-pack pipeline with the following source-to-shares approach:

1. **Use the asset-pack pipeline tool** with admitted subtype "pull_request" to synthesize the complete implementation as reviewable written assets
2. **Include comprehensive analysis** with scope analysis and implementation planning
3. **Follow engineering best practices**:
   - Type-safe implementation with comprehensive error handling
   - Performance optimization and security considerations
   - Accessibility compliance (for frontend features)
   - Test coverage targeting 80%+ with unit and integration tests
   - Clear documentation and code comments

4. **Ensure quality assurance**:
   - Code review readiness with clear PR description
   - Security vulnerability scanning
   - Performance impact assessment
   - Published-contract stability verification

5. **Delivery excellence**:
   - Clean, maintainable code following project conventions
   - Proper git history with meaningful commits
   - Migration scripts if database changes are needed
   - Deployment considerations and rollback strategy

Please execute the Bitcode asset-pack pipeline and provide real-time updates on the implementation progress, written assets, and delivery-mechanism readiness.`
    }
  ]
};

/**
 * Bug analysis and fix workflow prompt
 */
const bugFixWorkflowPrompt: MCPPrompt = {
  name: 'bitcode://prompts/workflow/bug-analysis',
  description: `Systematic workflow for analyzing and fixing bugs with root cause investigation.

This prompt provides a structured approach to bug resolution:
• Root cause analysis and issue reproduction
• Impact assessment and priority evaluation
• Solution design with testing strategy
• Fix implementation with regression prevention
• Validation and monitoring setup

Ideal for bug reports, production issues, and quality improvements.`,

  arguments: z.object({
    bugDescription: z.string().describe('Detailed description of the bug'),
    repository: z.object({
      owner: z.string(),
      name: z.string(),
      branch: z.string().optional().default('main')
    }).describe('Repository where the bug exists'),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium')
      .describe('Bug severity level'),
    reproductionSteps: z.array(z.string()).optional().default([])
      .describe('Steps to reproduce the bug'),
    affectedUsers: z.string().optional().describe('Description of affected users or systems'),
    errorLogs: z.string().optional().describe('Relevant error logs or stack traces'),
    expectedBehavior: z.string().optional().describe('What should happen instead'),
    environment: z.string().optional().describe('Environment where bug occurs (prod, staging, etc.)')
  }),

  getMessages: async (args) => [
    {
      role: 'user',
      content: `I read to analyze and fix a bug in the following repository:

## Bug Report
**Repository**: ${args.repository.owner}/${args.repository.name}
**Branch**: ${args.repository.branch || 'main'}
**Severity**: ${args.severity.toUpperCase()}
${args.environment ? `**Environment**: ${args.environment}` : ''}

### Problem Description
${args.bugDescription}

${args.expectedBehavior ? `### Expected Behavior
${args.expectedBehavior}` : ''}

${args.reproductionSteps.length > 0 ? `### Reproduction Steps
${args.reproductionSteps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}` : ''}

${args.errorLogs ? `### Error Logs
\`\`\`
${args.errorLogs}
\`\`\`` : ''}

${args.affectedUsers ? `### Affected Users
${args.affectedUsers}` : ''}

Please help me analyze and fix this bug using Bitcode's asset-pack pipeline with the following systematic source-to-shares approach:

1. **Use the asset-pack pipeline tool** with admitted subtype "issue" for comprehensive bug resolution as reviewable written assets

2. **Root Cause Analysis**:
   - Investigate the codebase to identify the root cause
   - Analyze related code paths and dependencies
   - Review recent changes that might have introduced the issue
   - Examine error patterns and failure scenarios

3. **Impact Assessment**:
   - Evaluate the scope and impact of the bug
   - Identify potential security or data integrity concerns
   - Assess performance implications
   - Determine urgency based on affected functionality

4. **Solution Design**:
   - Design a minimal, targeted fix that addresses the root cause
   - Consider edge cases and potential side effects
   - Plan comprehensive testing strategy
   - Design regression prevention measures

5. **Implementation & Validation**:
   - Implement the fix with proper error handling
   - Add comprehensive tests covering the bug scenario
   - Verify fix doesn't break existing functionality
   - Include monitoring or logging improvements if needed

6. **Quality Assurance**:
   - Test the fix in multiple scenarios
   - Verify error messages are user-friendly
   - Ensure performance impact is minimal
   - Document the fix and prevention measures

Please execute the Bitcode asset-pack pipeline and provide detailed analysis of the root cause, fix implementation, written assets, and delivery-mechanism readiness.`
    }
  ]
};

/**
 * Code review workflow prompt
 */
const codeReviewWorkflowPrompt: MCPPrompt = {
  name: 'bitcode://prompts/workflow/code-review',
  description: `Comprehensive code review workflow with security, performance, and maintainability analysis.

This prompt provides thorough code review guidance:
• Security vulnerability assessment
• Performance and efficiency analysis
• Code quality and maintainability review
• Best practices and convention compliance
• Documentation and testing evaluation

Perfect for PR reviews, code audits, and quality assurance.`,

  arguments: z.object({
    repository: z.object({
      owner: z.string(),
      name: z.string(),
      branch: z.string().optional().default('main')
    }).describe('Repository to review'),
    pullRequestNumber: z.number().optional().describe('Specific PR number to review'),
    commitHash: z.string().optional().describe('Specific commit to review'),
    focusAreas: z.array(z.enum([
      'security', 'performance', 'maintainability', 'testing', 
      'documentation', 'conventions', 'architecture'
    ])).optional().default(['security', 'performance', 'maintainability'])
      .describe('Specific areas to focus the review on'),
    reviewDepth: z.enum(['surface', 'standard', 'comprehensive']).optional().default('standard')
      .describe('Depth of the code review'),
    compliance: z.array(z.string()).optional().default([])
      .describe('Specific compliance standards to check (OWASP, GDPR, etc.)')
  }),

  getMessages: async (args) => [
    {
      role: 'user',
      content: `I read a comprehensive code review for the following repository:

## Review Context
- **Repository**: ${args.repository.owner}/${args.repository.name}
- **Branch**: ${args.repository.branch || 'main'}
${args.pullRequestNumber ? `- **Pull Request**: #${args.pullRequestNumber}` : ''}
${args.commitHash ? `- **Commit**: ${args.commitHash}` : ''}
- **Review Depth**: ${args.reviewDepth}

## Focus Areas
${args.focusAreas.map((area: string) => `- ${area.charAt(0).toUpperCase() + area.slice(1)}`).join('\n')}

${args.compliance.length > 0 ? `## Compliance Standards
${args.compliance.map((std: string) => `- ${std}`).join('\n')}` : ''}

Please conduct a thorough code review using Bitcode's asset-pack pipeline with the following source-to-shares approach:

1. **Use the asset-pack pipeline tool** with admitted subtype "pr_review" for comprehensive code analysis and reviewable written assets

2. **Security Analysis**:
   - Scan for common vulnerabilities (XSS, SQL injection, CSRF, etc.)
   - Review authentication and authorization logic
   - Check for sensitive data exposure
   - Validate input sanitization and output encoding
   - Assess dependency security and known vulnerabilities

3. **Performance Review**:
   - Identify performance bottlenecks and inefficiencies
   - Review database queries and API calls
   - Analyze memory usage and potential leaks
   - Check for unnecessary computations or redundant operations
   - Evaluate caching strategies and optimization opportunities

4. **Code Quality Assessment**:
   - Review code organization and structure
   - Check adherence to coding standards and conventions
   - Assess code readability and maintainability
   - Evaluate error handling and edge case coverage
   - Review logging and debugging capabilities

5. **Architecture & Design**:
   - Evaluate design patterns and architectural decisions
   - Check for proper separation of concerns
   - Review API design and interface contracts
   - Assess scalability and extensibility considerations
   - Validate integration patterns and dependencies

6. **Testing & Documentation**:
   - Review test coverage and quality
   - Assess test strategy (unit, integration, e2e)
   - Evaluate documentation completeness and accuracy
   - Check for code comments and inline documentation
   - Verify examples and usage documentation

7. **Compliance & Standards**:
   - Verify adherence to specified compliance standards
   - Check for accessibility requirements (WCAG)
   - Validate data privacy and protection measures
   - Review license compatibility and legal considerations

Please provide detailed findings, prioritized recommendations, and specific code examples for improvements.`
    }
  ]
};

/**
 * Architecture review workflow prompt
 */
const architectureReviewPrompt: MCPPrompt = {
  name: 'bitcode://prompts/workflow/architecture-review',
  description: `Comprehensive architecture review workflow for system design evaluation.

This prompt guides architectural assessment:
• System design pattern analysis
• Scalability and performance evaluation
• Security architecture review
• Technology stack assessment
• Integration and dependency analysis

Perfect for architecture decisions, modernization planning, and design reviews.`,

  arguments: z.object({
    repository: z.object({
      owner: z.string(),
      name: z.string()
    }).describe('Repository to analyze'),
    scope: z.enum(['full-system', 'component', 'integration']).optional().default('full-system')
      .describe('Scope of the architecture review'),
    concerns: z.array(z.enum([
      'scalability', 'performance', 'security', 'maintainability',
      'reliability', 'cost', 'compliance', 'integration'
    ])).optional().default(['scalability', 'security', 'maintainability'])
      .describe('Primary architectural concerns to address'),
    futureRequirements: z.string().optional()
      .describe('Future requirements or expected changes'),
    constraints: z.array(z.string()).optional().default([])
      .describe('Current constraints or limitations')
  }),

  getMessages: async (args) => [
    {
      role: 'user',
      content: `I read a comprehensive architecture review for the following system:

## System Context
- **Repository**: ${args.repository.owner}/${args.repository.name}
- **Review Scope**: ${args.scope}

## Primary Concerns
${args.concerns.map((concern: string) => `- ${concern.charAt(0).toUpperCase() + concern.slice(1)}`).join('\n')}

${args.futureRequirements ? `## Future Requirements
${args.futureRequirements}` : ''}

${args.constraints.length > 0 ? `## Current Constraints
${args.constraints.map((constraint: string) => `- ${constraint}`).join('\n')}` : ''}

Please conduct a thorough architecture review using Bitcode's analysis tools and asset-pack pipeline with the following comprehensive analysis:

1. **Use the analysis tools** for deep architectural insights (architecture analysis)

2. **System Design Analysis**:
   - Map the overall system architecture and component relationships
   - Identify architectural patterns and design principles used
   - Evaluate separation of concerns and modularity
   - Assess data flow and processing patterns
   - Review service boundaries and interface definitions

3. **Scalability Assessment**:
   - Analyze horizontal and vertical scaling capabilities
   - Identify potential bottlenecks and scaling limitations
   - Review load balancing and distribution strategies
   - Evaluate database scaling approaches
   - Assess caching and performance optimization strategies

4. **Security Architecture**:
   - Review authentication and authorization architecture
   - Analyze data protection and encryption strategies
   - Evaluate network security and access controls
   - Assess API security and threat surface
   - Review compliance with security frameworks

5. **Technology Stack Evaluation**:
   - Assess technology choices and their suitability
   - Review framework and library decisions
   - Evaluate infrastructure and deployment architecture
   - Analyze monitoring and observability setup
   - Review development and deployment pipelines

6. **Integration & Dependencies**:
   - Map external dependencies and third-party integrations
   - Evaluate API design and integration patterns
   - Assess data consistency and transaction handling
   - Review event-driven architecture patterns
   - Analyze microservices or monolithic trade-offs

7. **Quality Attributes**:
   - Evaluate reliability and fault tolerance mechanisms
   - Assess maintainability and technical debt
   - Review performance characteristics and optimization
   - Analyze cost implications of architectural decisions
   - Evaluate operational complexity and management overhead

8. **Recommendations & Roadmap**:
   - Provide prioritized architectural improvements
   - Suggest migration strategies for identified issues
   - Recommend technology modernizations or replacements
   - Outline implementation roadmap with phases
   - Identify quick wins and long-term strategic changes

Please provide detailed architectural insights, visual representations where helpful, and actionable recommendations for improvement.`
    }
  ]
};

/**
 * Performance optimization workflow prompt
 */
const performanceOptimizationPrompt: MCPPrompt = {
  name: 'bitcode://prompts/workflow/performance-optimization',
  description: `Systematic performance optimization workflow with profiling and improvement strategies.

This prompt guides performance improvement:
• Performance profiling and bottleneck identification
• Database query optimization
• Frontend performance tuning
• Caching strategy implementation
• Resource optimization and monitoring

Ideal for performance issues, optimization requests, and efficiency improvements.`,

  arguments: z.object({
    repository: z.object({
      owner: z.string(),
      name: z.string()
    }).describe('Repository to optimize'),
    performanceIssues: z.array(z.string()).optional().default([])
      .describe('Known performance issues or symptoms'),
    targetMetrics: z.record(z.string()).optional().default({})
      .describe('Target performance metrics (e.g., load time, throughput)'),
    scope: z.enum(['frontend', 'backend', 'database', 'full-stack']).optional().default('full-stack')
      .describe('Scope of performance optimization'),
    environment: z.string().optional().default('production')
      .describe('Environment context for optimization'),
    constraints: z.array(z.string()).optional().default([])
      .describe('Performance optimization constraints')
  }),

  getMessages: async (args) => [
    {
      role: 'user',
      content: `I read to optimize the performance of the following application:

## Application Context
- **Repository**: ${args.repository.owner}/${args.repository.name}
- **Optimization Scope**: ${args.scope}
- **Environment**: ${args.environment}

${args.performanceIssues.length > 0 ? `## Known Performance Issues
${args.performanceIssues.map((issue: string) => `- ${issue}`).join('\n')}` : ''}

${Object.keys(args.targetMetrics).length > 0 ? `## Target Metrics
${Object.entries(args.targetMetrics).map(([metric, target]) => `- ${metric}: ${target}`).join('\n')}` : ''}

${args.constraints.length > 0 ? `## Constraints
${args.constraints.map((constraint: string) => `- ${constraint}`).join('\n')}` : ''}

Please help me optimize the application performance using Bitcode's analysis and implementation capabilities:

1. **Performance Analysis** - Use analysis tools to identify bottlenecks:
   - Profile application performance across all layers
   - Identify CPU, memory, and I/O bottlenecks
   - Analyze database query performance and indexing
   - Review network latency and data transfer efficiency
   - Evaluate frontend rendering and JavaScript performance

2. **Optimization Strategy** - Use the asset-pack pipeline with admitted subtype "implementation_plan" to create an optimization roadmap:
   - Prioritize optimizations by impact and effort
   - Design caching strategies (Redis, CDN, application-level)
   - Plan database optimizations (indexing, query tuning, connection pooling)
   - Outline frontend optimizations (code splitting, lazy loading, bundling)
   - Design monitoring and alerting for performance metrics

3. **Implementation** - Use the asset-pack pipeline with admitted subtype "pull_request" to implement optimizations:
   - Implement high-impact performance improvements
   - Add performance monitoring and profiling tools
   - Optimize critical path operations and hot code paths
   - Implement efficient caching and data access patterns
   - Add performance tests and benchmarks

4. **Specific Optimization Areas**:

   **Backend Performance**:
   - Database query optimization and indexing
   - API response time improvements
   - Memory usage optimization
   - Connection pooling and resource management
   - Asynchronous processing and background jobs

   **Frontend Performance**:
   - Bundle size optimization and code splitting
   - Image optimization and lazy loading
   - Critical rendering path optimization
   - JavaScript execution efficiency
   - Browser caching and service workers

   **Infrastructure Performance**:
   - CDN configuration and optimization
   - Load balancing and auto-scaling
   - Database read replicas and sharding
   - Caching layer implementation
   - Monitoring and alerting setup

5. **Validation & Monitoring**:
   - Implement comprehensive performance testing
   - Set up continuous performance monitoring
   - Create performance budgets and alerts
   - Establish performance regression testing
   - Document optimization results and learnings

Please execute the analysis and implementation phases, providing detailed performance insights and measurable improvements.`
    }
  ]
};

/**
 * Register workflow prompts
 */
export function registerWorkflowPrompts(): MCPPrompt[] {
  return [
    featureCreationPrompt,
    bugFixWorkflowPrompt,
    codeReviewWorkflowPrompt,
    architectureReviewPrompt,
    performanceOptimizationPrompt
  ];
}
