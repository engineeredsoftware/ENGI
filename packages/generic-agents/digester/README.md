# Digester Agent

Comprehensive codebase analysis agent for repository structure understanding and file discovery.

## Overview

The Digester Agent creates detailed analysis of codebases by examining repository structure, categorizing files, and generating comprehensive summaries. It produces digest documents that enable other agents to understand codebase architecture and locate relevant code efficiently.

## Core Capabilities

### 1. Repository Structure Analysis
- Complete directory tree traversal
- File type identification and categorization
- Technology stack detection
- Architecture pattern recognition
- Dependency relationship mapping

### 2. File Categorization
- Purpose-based classification (components, utilities, tests, etc.)
- Technology-based grouping (frontend, backend, infrastructure)
- Importance scoring for critical files
- Entry point identification
- Configuration file detection

### 3. Content Summarization
- File-level summary generation
- Function and class extraction
- API endpoint documentation
- Key logic identification
- Dependency relationship tracking

### 4. Performance Optimization
- Multi-worker parallel processing
- Intelligent caching mechanisms
- Incremental update support
- Configurable file limits
- Memory-efficient processing

## Technical Implementation

### Dependencies
- `generateDigest` function from core digest library
- File system access for repository traversal
- Worker pool for parallel processing
- Cache management for performance

### Digest Options
```typescript
{
 correlationId: string, // Unique identifier for tracking
 rootDir: string, // Repository root directory
 usePreClonedRepo: boolean, // Use existing repo clone
 owner?: string, // Repository owner (for remote)
 repo?: string, // Repository name (for remote)
 branch?: string, // Target branch
 commit?: string, // Specific commit hash
 maxFiles: number, // Maximum files to process
 maxWorkers: number, // Parallel worker count
 forceRegenerate: boolean // Bypass cache
}
```

### PTRR Implementation
- **Plan**: Analyzes repository structure and determines digest strategy
- **Try**: Executes digest generation with comprehensive analysis
- **Refine**: Assesses digest quality and coverage
- **Retry**: Optimizes digest and integrates with global context

## Output Structure

### Digest Summary
```typescript
{
 digestPath: string, // Path to generated digest
 digestSummary: string, // Overview of codebase
 fileCategories: { // Files grouped by category
 [category: string]: string[]
 },
 fileCount: number, // Total files processed
 importantFiles: string[] // Critical files for understanding
}
```

### Quality Metrics
```typescript
{
 coverage: number, // Repository coverage percentage
 depth: number, // Analysis depth score
 relevance: number, // Task relevance score
 overallScore: number // Combined quality metric
}
```

## Categorization System

### Standard Categories
- **Core**: Main application logic
- **Components**: UI/functional components
- **Utilities**: Helper functions and utilities
- **Tests**: Test files and specifications
- **Configuration**: Config and setup files
- **Documentation**: README and docs
- **Infrastructure**: Build and deployment
- **Dependencies**: Package definitions

## Performance Characteristics
- Execution pattern: CHUNKED_PROCESSING
- Supports parallel file processing
- Intelligent caching for repeated analyses
- Configurable worker count (default: CPU cores)
- Memory-efficient streaming for large files

## Integration Points
- Updates global context with digest results
- Provides file discovery for downstream agents
- Enables architectural understanding
- Supports incremental updates
- Cache sharing across pipeline executions

## Usage Guidelines
The Digester Agent should be run early in pipelines to establish codebase understanding. Its output serves as a foundation for code search, modification, and analysis tasks performed by other agents.
