/**
 * Bitcode MCP Analysis Prompts
 * 
 * Specialized prompts for technical analysis, code investigation,
 * and technical knowledge gathering.
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
 * Security audit analysis prompt
 */
const securityAuditPrompt: MCPPrompt = {
  name: 'bitcode://prompts/analysis/security-audit',
  description: `Comprehensive security audit prompt for vulnerability assessment and security posture analysis.

This prompt provides systematic security evaluation:
• OWASP Top 10 vulnerability assessment
• Authentication and authorization review
• Data protection and privacy analysis
• Infrastructure security evaluation
• Compliance and regulatory assessment

Perfect for security audits, penetration testing preparation, and compliance reviews.`,

  arguments: z.object({
    repository: z.object({
      owner: z.string(),
      name: z.string()
    }).describe('Repository to audit'),
    auditScope: z.enum(['web-application', 'api', 'infrastructure', 'full-stack']).default('full-stack')
      .describe('Scope of the security audit'),
    complianceStandards: z.array(z.enum(['OWASP', 'GDPR', 'HIPAA', 'SOX', 'PCI-DSS', 'ISO-27001']))
      .optional().default(['OWASP']).describe('Compliance standards to evaluate against'),
    criticalAssets: z.array(z.string()).optional().default([])
      .describe('Critical assets or data that read special attention'),
    threatModel: z.string().optional()
      .describe('Specific threat model or attack scenarios to consider'),
    environment: z.enum(['development', 'staging', 'production', 'all']).default('production')
      .describe('Environment(s) to audit')
  }),

  getMessages: async (args) => [
    {
      role: 'user',
      content: `I read a comprehensive security audit for the following application:

## Security Audit Context
- **Repository**: ${args.repository.owner}/${args.repository.name}
- **Audit Scope**: ${args.auditScope}
- **Environment**: ${args.environment}

## Compliance Requirements
${args.complianceStandards.map((std: string) => `- ${std}`).join('\n')}

${args.criticalAssets.length > 0 ? `## Critical Assets
${args.criticalAssets.map((asset: string) => `- ${asset}`).join('\n')}` : ''}

${args.threatModel ? `## Threat Model
${args.threatModel}` : ''}

Please conduct a thorough security audit using Bitcode's analysis capabilities:

1. **Use the analysis tools** for comprehensive security assessment

2. **OWASP Top 10 Assessment**:
   - **A01: Broken Access Control** - Review authentication, authorization, and access control mechanisms
   - **A02: Cryptographic Failures** - Analyze encryption, hashing, and cryptographic implementations
   - **A03: Injection** - Scan for SQL injection, XSS, command injection, and other injection vulnerabilities
   - **A04: Insecure Design** - Evaluate security architecture and design patterns
   - **A05: Security Misconfiguration** - Review configuration security across all layers
   - **A06: Vulnerable Components** - Audit dependencies and third-party components for known vulnerabilities
   - **A07: Authentication Failures** - Assess authentication mechanisms and session management
   - **A08: Software Integrity Failures** - Review supply chain security and integrity verification
   - **A09: Logging Failures** - Evaluate security logging, monitoring, and incident response
   - **A10: Server-Side Request Forgery** - Check for SSRF vulnerabilities and input validation

3. **Authentication & Authorization Deep Dive**:
   - Review authentication flows and credential management
   - Analyze session management and token security
   - Evaluate multi-factor authentication implementation
   - Assess role-based access control (RBAC) and permissions
   - Review password policies and credential storage
   - Analyze OAuth/SAML/JWT implementations

4. **Data Protection Analysis**:
   - Evaluate data classification and handling procedures
   - Review encryption at rest and in transit
   - Analyze personal data processing (GDPR compliance)
   - Assess data backup and recovery security
   - Review data retention and deletion policies
   - Evaluate API data exposure and filtering

5. **Infrastructure Security**:
   - Review cloud security configurations (AWS/Azure/GCP)
   - Analyze network security and segmentation
   - Evaluate container and orchestration security
   - Review CI/CD pipeline security
   - Assess infrastructure as code security
   - Analyze secrets management and key rotation

6. **Application Security**:
   - Review input validation and sanitization
   - Analyze output encoding and XSS prevention
   - Evaluate CSRF protection mechanisms
   - Review error handling and information disclosure
   - Assess business logic vulnerabilities
   - Analyze file upload and processing security

7. **API Security (if applicable)**:
   - Review API authentication and rate limiting
   - Analyze API input validation and output filtering
   - Evaluate API versioning and retirement security
   - Review API documentation security exposure
   - Assess GraphQL security (if used)
   - Analyze webhook and callback security

8. **Mobile Security (if applicable)**:
   - Review mobile app security implementation
   - Analyze certificate pinning and transport security
   - Evaluate local data storage security
   - Review mobile authentication flows
   - Assess mobile-specific vulnerability patterns

9. **Compliance Assessment**:
   ${args.complianceStandards.includes('GDPR') ? `- **GDPR Compliance**: Data processing lawfulness, consent mechanisms, data subject rights, privacy by design` : ''}
   ${args.complianceStandards.includes('HIPAA') ? `- **HIPAA Compliance**: PHI protection, access controls, audit logs, encryption requirements` : ''}
   ${args.complianceStandards.includes('PCI-DSS') ? `- **PCI-DSS Compliance**: Cardholder data protection, secure coding, vulnerability management` : ''}
   ${args.complianceStandards.includes('SOX') ? `- **SOX Compliance**: Financial reporting controls, audit trails, change management` : ''}
   ${args.complianceStandards.includes('ISO-27001') ? `- **ISO 27001 Compliance**: Information security management system requirements` : ''}

10. **Security Testing Recommendations**:
    - Provide specific security test cases and scenarios
    - Recommend penetration testing focus areas
    - Suggest security scanning tools and configurations
    - Outline security regression testing strategies
    - Recommend security monitoring and alerting setup

Please provide a detailed security assessment report with:
- Executive summary of security posture
- Prioritized vulnerability findings with CVSS scores
- Specific remediation steps and code examples
- Compliance gap analysis and recommendations
- Security architecture improvement suggestions
- Implementation timeline and effort estimates`
    }
  ]
};

/**
 * Technical debt analysis prompt
 */
const technicalDebtAnalysisPrompt: MCPPrompt = {
  name: 'bitcode://prompts/analysis/technical-debt',
  description: `Comprehensive technical debt analysis for code quality assessment and improvement planning.

This prompt provides systematic debt evaluation:
• Code quality and maintainability assessment
• Architecture and design debt identification
• Testing and documentation debt analysis
• Performance and security debt evaluation
• Refactoring prioritization and planning

Ideal for technical debt audits, refactoring planning, and code quality initiatives.`,

  arguments: z.object({
    repository: z.object({
      owner: z.string(),
      name: z.string()
    }).describe('Repository to analyze'),
    analysisDepth: z.enum(['surface', 'comprehensive', 'deep']).default('comprehensive')
      .describe('Depth of technical debt analysis'),
    focusAreas: z.array(z.enum([
      'code-quality', 'architecture', 'testing', 'documentation', 
      'performance', 'security', 'dependencies'
    ])).optional().default(['code-quality', 'architecture', 'testing'])
      .describe('Specific areas to focus the debt analysis on'),
    businessImpact: z.string().optional()
      .describe('Business context and impact considerations'),
    timeframe: z.string().optional()
      .describe('Timeline for debt reduction efforts'),
    constraints: z.array(z.string()).optional().default([])
      .describe('Constraints for debt reduction (budget, resources, etc.)')
  }),

  getMessages: async (args) => [
    {
      role: 'user',
      content: `I read a comprehensive technical debt analysis for the following codebase:

## Analysis Context
- **Repository**: ${args.repository.owner}/${args.repository.name}
- **Analysis Depth**: ${args.analysisDepth}

## Focus Areas
${args.focusAreas.map((area: string) => `- ${area.charAt(0).toUpperCase() + area.slice(1)}`).join('\n')}

${args.businessImpact ? `## Business Context
${args.businessImpact}` : ''}

${args.timeframe ? `## Timeline
${args.timeframe}` : ''}

${args.constraints.length > 0 ? `## Constraints
${args.constraints.map((constraint: string) => `- ${constraint}`).join('\n')}` : ''}

Please conduct a thorough technical debt analysis using Bitcode's analysis capabilities:

1. **Use the analysis tools** for comprehensive debt assessment

2. **Code Quality Debt Analysis**:
   - **Code Complexity**: Identify high cyclomatic complexity methods and classes
   - **Code Duplication**: Find duplicated code blocks and extract common patterns
   - **Code Smells**: Detect long methods, large classes, feature envy, and other smells
   - **Naming Conventions**: Review consistency and clarity of naming across codebase
   - **Error Handling**: Evaluate error handling patterns and exception management
   - **Magic Numbers/Strings**: Identify hardcoded values that should be constants

3. **Architecture Debt Assessment**:
   - **Design Patterns**: Evaluate inappropriate or missing design patterns
   - **Separation of Concerns**: Analyze mixing of responsibilities and tight coupling
   - **Dependency Management**: Review circular dependencies and dependency violations
   - **Layer Violations**: Identify architectural layer boundary violations
   - **Interface Design**: Evaluate API and interface design quality
   - **Modularity**: Assess module boundaries and cohesion

4. **Testing Debt Evaluation**:
   - **Test Coverage**: Analyze code coverage and identify untested critical paths
   - **Test Quality**: Review test reliability, maintainability, and clarity
   - **Test Organization**: Evaluate test structure and test data management
   - **Integration Testing**: Assess integration test coverage and quality
   - **Test Performance**: Identify slow tests and testing bottlenecks
   - **Test Documentation**: Review test documentation and test case clarity

5. **Documentation Debt Analysis**:
   - **Code Documentation**: Evaluate inline comments and code documentation
   - **API Documentation**: Review API documentation completeness and accuracy
   - **Architecture Documentation**: Assess system design and architecture docs
   - **User Documentation**: Evaluate end-user and developer documentation
   - **Process Documentation**: Review development and deployment process docs
   - **Knowledge Transfer**: Identify knowledge silos and documentation gaps

6. **Performance Debt Assessment**:
   - **Algorithmic Complexity**: Identify inefficient algorithms and data structures
   - **Database Performance**: Analyze query performance and indexing strategies
   - **Memory Management**: Evaluate memory leaks and excessive memory usage
   - **Caching Strategy**: Review caching implementation and effectiveness
   - **Resource Utilization**: Assess CPU, memory, and I/O efficiency
   - **Scalability Concerns**: Identify scaling bottlenecks and limitations

7. **Security Debt Analysis**:
   - **Vulnerability Patterns**: Identify common security anti-patterns
   - **Input Validation**: Review input sanitization and validation gaps
   - **Authentication/Authorization**: Evaluate security implementation debt
   - **Dependency Vulnerabilities**: Analyze vulnerable dependencies and libraries
   - **Configuration Security**: Review security configuration and hardening
   - **Logging and Monitoring**: Assess security logging and monitoring gaps

8. **Dependency Debt Evaluation**:
   - **Outdated Dependencies**: Identify outdated packages and libraries
   - **Dependency Conflicts**: Analyze version conflicts and dependency hell
   - **License Compatibility**: Review license compatibility and compliance
   - **Unused Dependencies**: Identify and remove unused dependencies
   - **Security Vulnerabilities**: Assess known vulnerabilities in dependencies
   - **Maintenance Status**: Evaluate dependency maintenance and support status

9. **Debt Quantification & Prioritization**:
   - **Technical Debt Ratio**: Calculate overall technical debt percentage
   - **Maintainability Index**: Assess code maintainability scores
   - **Debt Principal**: Estimate effort required to fix identified issues
   - **Debt Interest**: Calculate ongoing cost of not addressing debt
   - **Risk Assessment**: Evaluate business risk of technical debt
   - **ROI Analysis**: Prioritize debt reduction by return on investment

10. **Refactoring Strategy & Roadmap**:
    - **Quick Wins**: Identify low-effort, high-impact improvements
    - **Strategic Refactoring**: Plan major architectural improvements
    - **Incremental Approach**: Design step-by-step debt reduction plan
    - **Resource Allocation**: Estimate time and effort for debt reduction
    - **Risk Mitigation**: Plan risk mitigation for refactoring activities
    - **Success Metrics**: Define measurable goals for debt reduction

Please provide a comprehensive technical debt report including:
- Executive summary with debt overview and business impact
- Detailed findings categorized by debt type and severity
- Quantified debt metrics and trends analysis
- Prioritized action plan with effort estimates
- Refactoring strategies and implementation approaches
- Monitoring and prevention recommendations for future debt`
    }
  ]
};

/**
 * Dependency analysis prompt
 */
const dependencyAnalysisPrompt: MCPPrompt = {
  name: 'bitcode://prompts/analysis/dependency-analysis',
  description: `Comprehensive dependency analysis for security, licensing, and maintenance assessment.

This prompt provides thorough dependency evaluation:
• Security vulnerability scanning
• License compatibility analysis
• Maintenance and support assessment
• Update strategy planning
• Dependency optimization recommendations

Perfect for security audits, compliance reviews, and dependency management.`,

  arguments: z.object({
    repository: z.object({
      owner: z.string(),
      name: z.string()
    }).describe('Repository to analyze'),
    analysisScope: z.enum(['direct', 'transitive', 'full']).default('full')
      .describe('Scope of dependency analysis'),
    securityFocus: z.boolean().default(true)
      .describe('Include comprehensive security vulnerability analysis'),
    licensingFocus: z.boolean().default(true)
      .describe('Include license compatibility and compliance analysis'),
    updateStrategy: z.boolean().default(true)
      .describe('Include update recommendations and migration planning'),
    ecosystem: z.array(z.enum(['npm', 'pypi', 'maven', 'nuget', 'rubygems', 'cargo']))
      .optional().describe('Specific package ecosystems to focus on')
  }),

  getMessages: async (args) => [
    {
      role: 'user',
      content: `I read a comprehensive dependency analysis for the following repository:

## Dependency Analysis Context
- **Repository**: ${args.repository.owner}/${args.repository.name}
- **Analysis Scope**: ${args.analysisScope} dependencies
- **Security Focus**: ${args.securityFocus ? 'Enabled' : 'Disabled'}
- **Licensing Focus**: ${args.licensingFocus ? 'Enabled' : 'Disabled'}
- **Update Strategy**: ${args.updateStrategy ? 'Enabled' : 'Disabled'}
${args.ecosystem ? `- **Ecosystems**: ${args.ecosystem.join(', ')}` : ''}

Please conduct a thorough dependency analysis using Bitcode's analysis capabilities:

1. **Use the dependency analysis tool** for comprehensive dependency assessment

2. **Dependency Mapping & Inventory**:
   - Map complete dependency tree (direct and transitive)
   - Identify critical dependencies and their usage patterns
   - Analyze dependency sizes and their impact on bundle/package size
   - Review dependency loading and initialization patterns
   - Assess dependency graph complexity and potential conflicts

3. **Security Vulnerability Assessment**:
   ${args.securityFocus ? `
   - **CVE Analysis**: Scan for known vulnerabilities using CVE database
   - **CVSS Scoring**: Evaluate vulnerability severity and exploitability
   - **Attack Vector Analysis**: Assess potential attack vectors through dependencies
   - **Patch Availability**: Check for available security patches and fixes
   - **Vulnerability Trends**: Analyze historical vulnerability patterns
   - **Supply Chain Security**: Evaluate dependency integrity and provenance
   - **Transitive Vulnerabilities**: Identify vulnerabilities in nested dependencies
   - **Runtime Impact**: Assess actual security impact based on usage patterns` : '- Security analysis disabled per request'}

4. **License Compatibility Analysis**:
   ${args.licensingFocus ? `
   - **License Inventory**: Catalog all dependency licenses and their terms
   - **Compatibility Matrix**: Analyze license compatibility with project license
   - **Copyleft Analysis**: Identify copyleft licenses and their requirements
   - **Commercial Restrictions**: Evaluate commercial use restrictions
   - **Attribution Requirements**: Review attribution and notice requirements
   - **Redistribution Terms**: Analyze redistribution and modification terms
   - **Compliance Gaps**: Identify potential license compliance issues
   - **Legal Risk Assessment**: Evaluate legal risks and mitigation strategies` : '- License analysis disabled per request'}

5. **Maintenance & Support Assessment**:
   - **Activity Analysis**: Evaluate dependency maintenance activity and frequency
   - **Community Health**: Assess community size, contributions, and support
   - **Release Patterns**: Analyze release frequency and version stability
   - **Issue Response**: Evaluate issue resolution times and responsiveness
   - **Long-term Viability**: Assess long-term sustainability and support
   - **Bus Factor**: Evaluate maintainer diversity and sustainability
   - **Retirement Status**: Identify retired or end-of-life dependencies

6. **Update Strategy & Planning**:
   ${args.updateStrategy ? `
   - **Update Availability**: Identify available updates and new versions
   - **Breaking Changes**: Analyze breaking changes in potential updates
   - **Migration Complexity**: Assess effort required for major version updates
   - **Update Prioritization**: Prioritize updates by security, stability, and features
   - **Rollback Strategy**: Plan rollback procedures for failed updates
   - **Testing Strategy**: Design testing approach for dependency updates
   - **Staging Approach**: Plan incremental update and validation process` : '- Update strategy analysis disabled per request'}

7. **Performance & Size Analysis**:
   - **Bundle Size Impact**: Analyze dependency contribution to final bundle size
   - **Loading Performance**: Evaluate dependency loading and initialization time
   - **Runtime Performance**: Assess dependency performance characteristics
   - **Tree Shaking**: Evaluate dead code elimination effectiveness
   - **Lazy Loading**: Identify opportunities for lazy loading dependencies
   - **Alternative Analysis**: Compare with lighter or more efficient alternatives

8. **Quality & Reliability Assessment**:
   - **Code Quality**: Evaluate dependency code quality and maintainability
   - **Test Coverage**: Assess dependency test coverage and quality
   - **Documentation Quality**: Review dependency documentation and examples
   - **API Stability**: Evaluate API design and published-contract stability
   - **Error Handling**: Assess dependency error handling and resilience
   - **Configuration Complexity**: Evaluate setup and configuration requirements

9. **Ecosystem & Integration Analysis**:
   - **Ecosystem Health**: Assess overall ecosystem health and trends
   - **Integration Patterns**: Evaluate integration complexity and patterns
   - **Peer Dependencies**: Analyze peer dependency requirements and conflicts
   - **Build Tool Compatibility**: Assess compatibility with build tools and workflows
   - **Development Experience**: Evaluate developer experience and tooling support
   - **Framework Compatibility**: Assess compatibility with frameworks and platforms

10. **Risk Assessment & Mitigation**:
    - **Dependency Risk Scoring**: Calculate overall risk scores for each dependency
    - **Single Points of Failure**: Identify critical dependencies with high risk
    - **Vendor Lock-in**: Assess vendor dependency and lock-in risks
    - **Compliance Risks**: Evaluate regulatory and compliance risks
    - **Business Continuity**: Assess impact on business operations and continuity
    - **Mitigation Strategies**: Recommend risk mitigation approaches
    - **Contingency Planning**: Plan alternatives and fallback strategies

Please provide a comprehensive dependency analysis report including:
- Executive summary with key findings and risk assessment
- Detailed dependency inventory with metadata and analysis
- Security vulnerability report with remediation priorities
- License compliance assessment and recommendations
- Update roadmap with prioritized actions and timelines
- Risk mitigation strategies and best practices
- Monitoring and maintenance recommendations for ongoing dependency management`
    }
  ]
};

/**
 * Register analysis prompts
 */
export function registerAnalysisPrompts(): MCPPrompt[] {
  return [
    securityAuditPrompt,
    technicalDebtAnalysisPrompt,
    dependencyAnalysisPrompt
  ];
}
