# MCPS.md - Model Context Protocol Tools

**Available Integrations and Capabilities**

## What MCPs Are

Model Context Protocol (MCP) tools extend AI capabilities by providing access to external systems, data sources, and services. Each MCP is a specialized integration that the AI can use during execution.

## Available MCPs (GA-1)

### Design & Collaboration

**Figma**
- Extract designs and components
- Analyze design systems
- Generate code from mockups
- **Usage:** Attach Figma URLs during Design phase

**Notion**
- Read documentation
- Extract requirements
- Sync specifications
- **Usage:** Reference Notion docs as context

**Linear**
- Read issues and projects
- Understand requirements
- Track implementation status
- **Usage:** Link Linear issues for context

### Development Tools

**GitHub**
- Repository operations (clone, branch, commit, push)
- PR/issue creation
- File browsing
- Code search
- **Usage:** Automatic integration via VCS connection

**GitLab**
- Repository operations
- Merge request creation
- CI/CD status checking
- **Usage:** Alternative to GitHub

### Data & Search

**Web Search**
- Research best practices
- Find documentation
- Discover patterns
- **Usage:** Automatic during Discovery phase

**Firecrawl**
- Extract content from URLs
- Parse documentation
- Process web pages
- **Usage:** When URLs attached as context

## MCP Configuration

MCPs are initialized during Setup phase of any execution. The system:
1. Reads available MCPs from user's connections
2. Registers tools with execution
3. Makes them available to agents

**File:** `/packages/asset-packs-pipelines/syntheses/domain/src/phases/setup.ts`
- Agent: `setup:asset-pack-initialize-mcps-tools-agent`

## Adding New MCPs

To add a new MCP integration:

1. Create MCP package in `/packages/mcp/`
2. Implement MCP server following protocol
3. Register in Orbitals > Connects
4. Add initialization in Setup phase
5. Document capabilities here in MCPS.md

## MCP Availability

MCPs are available during:
- **Design Phase:** Read-only (research, documentation)
- **Develop Phase:** Full access (code operations, data)
- **Digest Phase:** Read-only (reference for learning capture)

File gates ensure MCPs can only edit allowed files per meta-phase.

---

**This document tracks available tools and integrations.** As new MCPs are added, they're documented here for AI awareness.
