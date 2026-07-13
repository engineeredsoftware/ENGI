# Bitcode MCP API Reference

> **Complete reference for integrating with Bitcode's Model Context Protocol server**

## Overview

The Bitcode MCP API provides programmatic access to Bitcode technical-knowledge exchange infrastructure through the standardized Model Context Protocol. This reference covers all available tools, resources, and integration patterns.

## Authentication

### API Key Authentication
```javascript
// Set your API key in environment variables
process.env.BITCODE_API_KEY = "your-api-key-here";

// Or pass directly in requests
const client = new BitcodeMCPClient({
  apiKey: "your-api-key-here",
  organizationId: "your-org-id"
});
```

### Session-Based Authentication
```javascript
// For web applications
const session = await client.authenticate({
  email: "user@company.com",
  password: "secure-password"
});
```

## Core Concepts

### Tool Execution Pattern
All Bitcode MCP tools follow a consistent execution pattern:

```typescript
interface ToolExecution {
  // Input
  task: string;                    // Natural language task description
  repository: RepositoryContext;   // Target repository information
  attachments?: Attachment[];      // Optional multimodal inputs
  options?: ToolOptions;          // Tool-specific configuration
  
  // Output
  result: ToolResult;             // Execution results and AssetPacks
  metrics: ExecutionMetrics;      // Performance and quality metrics
  streamUrl?: string;            // Real-time execution stream
}
```

### Repository Context
```typescript
interface RepositoryContext {
  owner: string;           // Repository owner (user or organization)
  name: string;           // Repository name
  branch?: string;        // Target branch (default: main)
  path?: string;          // Optional focus path within repository
  installationId?: number; // GitHub App installation ID
}
```

### Multimodal Attachments
```typescript
interface Attachment {
  type: 'image' | 'document' | 'audio' | 'video' | 'url' | 'figma' | 'file';
  content: string;        // URL, file path, or encoded data
  metadata?: Record<string, any>; // Additional context
}
```

## Pipeline Tools

### AssetPack Creation
**Tool**: `bitcode://pipelines/asset-pack/create`

Create production-ready features with comprehensive testing and documentation.

#### Request Schema
```typescript
interface AssetPackRequest {
  task: string;                    // Feature description (min 10 characters)
  repository: RepositoryContext;
  subtype: 'pull_request' | 'pr_review' | 'issue' | 'comment' | 'blog_post' | 
           'diagram' | 'api_spec' | 'frontend_scaffolder' | 'scope_analysis' |
           'implementation_plan' | 'refactor_proposal';
  attachments?: Attachment[];
  options?: {
    createPR?: boolean;           // Create GitHub pull request (default: true)
    runTests?: boolean;           // Run automated tests (default: true)
    generateDocs?: boolean;       // Generate documentation (default: true)
    securityCheck?: boolean;      // Run security analysis (default: true)
  };
  mcpConfig?: Record<string, any>; // External service configuration
  streaming?: boolean;            // Enable real-time streaming (default: true)
}
```

#### Response Schema
```typescript
interface AssetPackResponse {
  pipelineId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  assetPacks: Array<{
    type: string;                 // 'pull_request', 'documentation', 'tests'
    url?: string;                // External URL (e.g., GitHub PR)
    content?: string;            // Inline content
    metadata?: any;              // Additional information
  }>;
  metrics: {
    measuredBtd: number;
    btdSemantics: 'non_fungible_asset_pack_share_read_right';
    feeAsset: 'BTC';
    btcFeeUsdEquivalent?: number;
    tokensProcessed: number;
    confidence: number;          // 0-1 confidence score
    duration: number;            // Execution time in milliseconds
  };
  streamUrl?: string;            // WebSocket URL for real-time updates
}
```

#### Example Usage
```javascript
const result = await client.callTool('bitcode://pipelines/asset-pack/create', {
  task: "Create a user authentication system with JWT tokens, password hashing, and email verification",
  repository: {
    owner: "mycompany",
    name: "webapp",
    branch: "feature/auth"
  },
  subtype: "pull_request",
  attachments: [
    {
      type: "figma",
      content: "https://www.figma.com/file/ABC123/Auth-Flow",
      metadata: { pages: ["Login", "Signup", "Reset"] }
    }
  ],
  options: {
    createPR: true,
    runTests: true,
    generateDocs: true,
    securityCheck: true
  }
});
```

<!-- Non-AssetPack pipeline endpoints are not exposed via MCP -->

## Intelligence Tools

### Cross-Repository Learning
**Tool**: `bitcode://intelligence/learn/patterns`

Extract and apply patterns across multiple repositories.

```javascript
const learning = await client.callTool('bitcode://intelligence/learn/patterns', {
  task: "Learn authentication patterns from our successful projects",
  scope: "organization",
  repositories: ["auth-service", "user-api", "admin-portal"],
  patterns: ["authentication", "authorization", "session-management"]
});
```

### Predictive Analysis
**Tool**: `bitcode://intelligence/predict/issues`

Identify potential issues before they become problems.

```javascript
const prediction = await client.callTool('bitcode://intelligence/predict/issues', {
  task: "Predict potential security vulnerabilities and performance bottlenecks",
  repository: { owner: "mycompany", name: "production-app" },
  timeframe: "30d",
  categories: ["security", "performance", "reliability"]
});
```

## Monitoring & Observability Tools

### Pipeline Monitoring
**Tool**: `bitcode://monitoring/pipelines/status`

Monitor and control pipeline executions.

```javascript
const status = await client.callTool('bitcode://monitoring/pipelines/status', {
  pipelineId: "pipeline-123",
  includeMetrics: true,
  includeLogs: true
});
```

### System Health
**Tool**: `bitcode://monitoring/health/check`

Comprehensive system health monitoring.

```javascript
const health = await client.callTool('bitcode://monitoring/health/check', {
  components: ["api", "database", "queue", "storage"],
  includeMetrics: true,
  alertThresholds: {
    responseTime: 2000,    // 2 seconds
    errorRate: 0.01,       // 1%
    cpuUsage: 0.8         // 80%
  }
});
```

## Enterprise Integration Tools

### Webhook Orchestration
**Tool**: `bitcode://enterprise/webhooks/create`

Intelligent webhook routing and processing.

```javascript
const webhook = await client.callTool('bitcode://enterprise/webhooks/create', {
  task: "Route GitHub webhooks to appropriate team channels and trigger deployments",
  sources: ["github", "jira", "figma"],
  destinations: ["slack", "teams", "pagerduty"],
  routing: {
    "push": ["deployment-channel", "dev-team"],
    "pr_opened": ["review-channel"],
    "issue_created": ["triage-channel", "product-team"]
  }
});
```

### API Lifecycle Management
**Tool**: `bitcode://enterprise/api/lifecycle`

Complete API design, testing, and documentation workflows.

```javascript
const apiLifecycle = await client.callTool('bitcode://enterprise/api/lifecycle', {
  task: "Create complete API lifecycle for user management service",
  repository: { owner: "mycompany", name: "user-api" },
  phases: ["design", "implementation", "testing", "documentation", "deployment"],
  standards: ["openapi", "rest", "json-api"],
  integrations: ["postman", "swagger-ui", "insomnia"]
});
```

## Resources

### Pipeline History
**Resource**: `bitcode://resources/pipelines/{id}`

Access detailed pipeline execution history and results.

```javascript
const pipelineDetails = await client.readResource('bitcode://resources/pipelines/pipeline-123');
```

### Organization Analytics
**Resource**: `bitcode://resources/organizations/{id}/analytics`

Organization-level analytics and insights.

```javascript
const analytics = await client.readResource('bitcode://resources/organizations/org-456/analytics', {
  timeframe: "30d",
  metrics: ["productivity", "quality", "security", "performance"]
});
```

### Intelligence Insights
**Resource**: `bitcode://resources/intelligence/insights`

AI-generated insights and recommendations.

```javascript
const insights = await client.readResource('bitcode://resources/intelligence/insights', {
  scope: "team",
  categories: ["code-quality", "performance", "security"],
  timeframe: "7d"
});
```

## Prompts

### Development Workflows
**Prompt**: `bitcode://prompts/development/feature-implementation`

Best-practice templates for feature development.

```javascript
const prompt = await client.getPrompt('bitcode://prompts/development/feature-implementation', {
  feature: "user authentication",
  technology: "react-node-postgres",
  complexity: "medium"
});
```

### Code Review Guidelines
**Prompt**: `bitcode://prompts/review/security-checklist`

Comprehensive security review templates.

```javascript
const reviewPrompt = await client.getPrompt('bitcode://prompts/review/security-checklist', {
  language: "typescript",
  framework: "express",
  scope: "authentication"
});
```

## Real-Time Streaming

### WebSocket Connection
```javascript
// Connect to real-time pipeline stream
const ws = new WebSocket(result.streamUrl);

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  switch (update.type) {
    case 'phase':
      console.log(`Phase ${update.phase}: ${update.data.message}`);
      break;
    case 'tool':
      console.log(`Tool ${update.tool}: ${update.data.progress}%`);
      break;
    case 'completion':
      console.log('Pipeline completed successfully!');
      break;
    case 'error':
      console.error('Pipeline error:', update.data.error);
      break;
  }
};
```

### Stream Event Types
```typescript
interface StreamEvent {
  type: 'phase' | 'agent' | 'step' | 'tool' | 'completion' | 'error';
  timestamp: string;
  pipelineId: string;
  phase?: string;
  agent?: string;
  step?: string;
  tool?: string;
  data: {
    progress: number;        // 0-100
    message: string;
    metadata?: any;
    tokensUsed?: number;
    confidence?: number;
    error?: {
      message: string;
      recoverable: boolean;
    };
  };
}
```

## Error Handling

### Error Response Format
```typescript
interface MCPError {
  code: string;            // Error code (e.g., 'INVALID_REQUEST')
  message: string;         // Human-readable error message
  details?: any;          // Additional error context
  retryable?: boolean;    // Whether the operation can be retried
  suggestion?: string;    // Suggested fix or next steps
}
```

### Common Error Codes
- `INVALID_REQUEST`: Malformed request or missing required fields
- `AUTHENTICATION_FAILED`: Invalid API key or session
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `RATE_LIMIT_EXCEEDED`: Too many requests in time window
- `PIPELINE_EXECUTION_FAILED`: Pipeline encountered an error
- `EXTERNAL_SERVICE_ERROR`: External service (GitHub, etc.) error
- `INTERNAL_SERVER_ERROR`: Unexpected server error

### Retry Strategy
```javascript
async function callToolWithRetry(toolName, params, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.callTool(toolName, params);
    } catch (error) {
      if (!error.retryable || attempt === maxRetries) {
        throw error;
      }
      
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Rate Limiting

### Request Limits
- **Developer Plan**: 1,000 requests/hour
- **Team Plan**: 10,000 requests/hour  
- **Enterprise Plan**: Unlimited with fair usage

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Webhook Events
Register webhooks to receive real-time notifications:

```javascript
await client.createWebhook({
  url: "https://myapp.com/webhooks/bitcode",
  events: [
    "pipeline.completed",
    "pipeline.failed", 
    "analysis.finished",
    "security.alert"
  ],
  secret: "webhook-secret-key"
});
```

### Event Payload
```typescript
interface WebhookEvent {
  id: string;
  type: string;               // Event type
  timestamp: string;
  organizationId: string;
  data: {
    pipelineId?: string;
    status?: string;
    results?: any;
    error?: string;
  };
  signature: string;          // HMAC signature for verification
}
```

## SDK Libraries

### JavaScript/TypeScript
```bash
npm install @bitcode/mcp-client
```

```javascript
import { BitcodeMCPClient } from '@bitcode/mcp-client';

const client = new BitcodeMCPClient({
  apiKey: process.env.BITCODE_API_KEY,
  organizationId: 'your-org-id',
  baseUrl: 'https://api.bitcode.dev/mcp'
});
```

### Python
```bash
pip install bitcode-mcp-client
```

```python
from bitcode_mcp import BitcodeMCPClient

client = BitcodeMCPClient(
    api_key=os.environ['BITCODE_API_KEY'],
    organization_id='your-org-id'
)
```

### Go
```bash
go get github.com/bitcode-labs/mcp-client-go
```

```go
import "github.com/bitcode-labs/mcp-client-go"

client := mcp.NewClient(&mcp.Config{
    APIKey:         os.Getenv("BITCODE_API_KEY"),
    OrganizationID: "your-org-id",
})
```

## Configuration Reference

### Environment Variables
```bash
# Authentication
BITCODE_API_KEY=your-api-key                    # Required: API authentication
BITCODE_ORGANIZATION_ID=your-org-id             # Optional: Organization context

# Server Configuration
BITCODE_MCP_BASE_URL=https://api.bitcode.dev/mcp   # API base URL
BITCODE_MCP_TIMEOUT=300000                      # Request timeout (ms)
BITCODE_MCP_RETRY_ATTEMPTS=3                    # Max retry attempts

# Feature Flags
BITCODE_ENABLE_STREAMING=true                   # Enable real-time streaming
BITCODE_ENABLE_WEBHOOKS=true                    # Enable webhook delivery
BITCODE_ENABLE_ANALYTICS=true                   # Enable usage analytics

# Integration Settings
GITHUB_INSTALLATION_ID=12345                 # GitHub App installation
FIGMA_ACCESS_TOKEN=figma-token               # Figma API access
SLACK_WEBHOOK_URL=https://hooks.slack.com    # Slack notifications
```

---

**Read help?** Visit our [documentation](https://docs.bitcode.dev/mcp) or join our [Discord community](https://discord.gg/bitcode).
