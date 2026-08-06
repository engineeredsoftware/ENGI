# Tech Types Identifier Agent

## Overview

Specialized analysis agent for technology stack identification and classification within software projects. Performs static analysis of codebase artifacts to determine programming languages, frameworks, libraries, and architectural patterns.

## Core Capabilities

- **Language Detection**: Identifies programming language through file extension and content analysis
- **Framework Recognition**: Detects web frameworks, libraries, and development dependencies
- **Architecture Classification**: Categorizes project structure and architectural patterns
- **Dependency Analysis**: Analyzes package manifest files for technology stack mapping
- **Version Detection**: Identifies technology versions where available

## Technical Implementation

### Architecture
- Lightweight wrapper implementation around the canonical `@bitcode/generic-measurements-tech-types` package
- Minimal agent interface for integration with pipeline systems
- Focuses on deterministic analysis of static file content
- Provides structured output for downstream consumption that should align with the canonical `technologyProfile` emitted by Bitcode read-measurement
- Keeps the `technologyProfile` contract in a package-local contract module so downstream proofs can validate the canonical envelope without loading the full PTRR agent body
- Carries a direct package-local contract proof in `src/__tests__/technology-profile-contract.test.ts`

### Analysis Methods
- File extension pattern matching
- Package.json/requirements.txt/pom.xml parsing
- Directory structure analysis
- Import statement scanning
- Configuration file detection

### Technology Coverage
- Frontend: React, Vue, Angular, vanilla JavaScript/TypeScript
- Backend: Node.js, Python, Java, .NET, Go, Rust
- Databases: PostgreSQL, MySQL, MongoDB, Redis
- Infrastructure: Docker, Kubernetes, cloud configurations

## Output Structure

### Technology Stack Schema
```typescript
{
 technologyProfile: {
 stackHints: string[],
 languages: string[],
 technologies: string[],
 brands: string[],
 },
 databases: string[],
 tools: string[],
 confidence: number
}
```

## Performance Characteristics

- **Execution Time**: 1-5 seconds for typical project analysis
- **Memory Usage**: Minimal - processes files sequentially
- **Accuracy**: High for well-structured projects with standard conventions
- **Coverage**: Supports 50+ technology identifiers
- **Scalability**: Linear performance with codebase size
