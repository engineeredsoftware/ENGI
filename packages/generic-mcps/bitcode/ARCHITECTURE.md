# Bitcode MCP Server Architecture

This document provides a comprehensive overview of the Bitcode MCP Server architecture, design decisions, and implementation details.

## 🏗️ High-Level Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Bitcode MCP Server                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Tools    │  │  Resources  │  │   Prompts   │             │
│  │             │  │             │  │             │             │
│  │ • Pipelines │  │ • Analytics │  │ • Workflows │             │
│  │ • Monitoring│  │ • History   │  │ • Analysis  │             │
│  │ • Analysis  │  │ • Synthesis │  │ • Development│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Auth     │  │  Streaming  │  │ Observability│             │
│  │             │  │             │  │             │             │
│  │ • API Keys  │  │ • WebSocket │  │ • Metrics   │             │
│  │ • Sessions  │  │ • SSE       │  │ • Tracing   │             │
│  │ • RBAC      │  │ • Events    │  │ • Logging   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                    MCP Protocol Layer                          │
│              (JSON-RPC 2.0 over stdio/websocket)              │
├─────────────────────────────────────────────────────────────────┤
│                  Bitcode Pipeline System                          │
│   ┌─────────┐                                              │
│   │ Asset   │                                              │
│   │ Packs   │                                              │
│   └─────────┘                                              │
├─────────────────────────────────────────────────────────────────┤
│                    Bitcode Infrastructure                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Supabase   │  │ BTC Fees &  │  │    Agent    │             │
│  │  Database   │  │ BTD Reads   │  │   System    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Core Components

### 1. MCP Protocol Server (`src/server.ts`)

The main server class implementing the MCP specification:

```typescript
class BitcodeMCPServer {
  private server: Server;
  private config: BitcodeMCPServerConfig;
  private authContextCache: Map<string, AuthCacheEntry>;

  // Core MCP handlers
  - registerToolHandlers()    // Handle tool execution
  - registerResourceHandlers() // Handle resource access
  - registerPromptHandlers()   // Handle prompt requests
  
  // Authentication & Authorization
  - authenticateRequest()      // Multi-method auth
  - validatePermissions()      // RBAC enforcement
  
  // Observability
  - setupObservability()       // Metrics and tracing
  - auditRequest()            // Security logging
}
```

**Key Features:**
- Full MCP 2024-11-05 specification compliance
- Multi-transport support (stdio, WebSocket, HTTP)
- Comprehensive error handling and recovery
- Request/response caching for performance
- OpenTelemetry integration for observability

### 2. Authentication System (`src/auth/middleware.ts`)

Multi-layered authentication and authorization:

```typescript
interface MCPAuthContext {
  userId: string;
  organizationId?: string;
  role: 'owner' | 'admin' | 'lead' | 'dev';
  permissions: {
    pipelines: { create: boolean; read: boolean; cancel: boolean };
    organization: { manageMembers: boolean; viewAnalytics: boolean };
    resources: { read: boolean; export: boolean };
  };
  btdBalance: number;
  mcpCredentials: Record<string, any>;
}
```

**Authentication Methods:**
- **API Keys**: Bearer token validation against `user_api_keys` table
- **Session Auth**: Supabase session validation with freshness checks
- **Organization Context**: Automatic organization scoping and permissions

**Security Features:**
- Session freshness validation (24-hour max age)
- Comprehensive audit logging
- Rate limiting and abuse prevention
- Role-based access control (RBAC)
- `$BTD` balance validation

### 3. Pipeline Tools (`src/tools/pipeline-tools.ts`)

Direct interface to Bitcode's sophisticated pipeline system:

```typescript
interface PipelineToolExecution {
  // BTC fee readiness and measured $BTD holding reads
  - estimatePipelineBtcFees()  // Pre-execution BTC fee estimation
  - reserveBtcFeeHold()        // Upfront fee-hold reservation
  - trackActualUsage()         // Real-time usage tracking
  - resolveUnusedFeeHold()     // Automatic fee-hold release
  
  // Pipeline Execution
  - executePipelineWithMonitoring()  // Comprehensive execution
  - handleExecutionFailure()         // Error recovery
  - recordExecutionMetrics()         // Performance tracking
}
```

**Supported Pipelines:**
- **AssetPack**: Read-satisfaction execution that can Finish by delivering Shippables such as pull requests, reviews, issues, or comments.
- The MCP server currently exposes AssetPack execution. Other pipeline families are not exposed via MCP.
- **Ad-hoc**: Custom engineering tasks and investigations

### 4. Real-Time Streaming (`src/streaming/pipeline-stream.ts`)

Advanced streaming system for live pipeline monitoring:

```typescript
class PipelineStreamManager extends EventEmitter {
  private connections: Map<string, StreamConnection>;
  private pipelineSubscriptions: Map<string, Set<string>>;
  private wsServer?: WebSocketServer;

  // Connection Management
  - handleWebSocketConnection()  // WebSocket setup
  - createSSEConnection()        // Server-Sent Events
  - authenticateStreamConnection() // Stream auth
  
  // Event Broadcasting
  - broadcastPipelineEvent()     // Multi-subscriber broadcast
  - storePipelineEvent()         // Database persistence
  - sendToConnection()           // Individual connection
}
```

**Streaming Features:**
- **WebSocket Support**: Full-duplex communication with client
- **Server-Sent Events**: HTTP-based streaming for web clients
- **Multi-Subscriber**: One pipeline can have multiple watchers
- **Event Persistence**: All events stored for replay and analysis
- **Connection Management**: Automatic cleanup and heartbeat monitoring

### 5. Resource System (`src/resources/`)

Read-only data access with intelligent filtering:

#### Pipeline Resources (`pipeline-resources.ts`)
- **Active Pipelines**: Real-time list of running executions
- **Pipeline History**: Historical data with advanced filtering
- **Pipeline Details**: Comprehensive execution information
- **Pipeline Events**: Real-time event streams and logs

#### Intelligence Resources (`intelligence-resources.ts`)
- **Technical Knowledge**: Bitcode evidence and insight synthesis
- **Evidence Document Recommendations**: ML-driven Evidence Document suggestions
- **Trend Analysis**: Pattern recognition across time periods
- **Quality Metrics**: Comprehensive quality assessment

#### Organization Resources (`organization-resources.ts`)
- **Team Analytics**: Member activity and productivity metrics
- **Repository Coverage**: Multi-repo analysis and insights
- **BTC Fee Readiness and BTD Holdings**: Fee-liquidity tracking and non-fungible share/read-right visibility
- **Collaboration Patterns**: Team workflow analysis

### 6. Workflow Prompts (`src/prompts/`)

Best-practice templates for common engineering workflows:

#### Workflow Prompts (`workflow-prompts.ts`)
- **Feature Creation**: Complete feature development workflow
- **Bug Analysis**: Systematic debugging and resolution
- **Code Review**: Comprehensive review with security focus
- **Architecture Review**: System design evaluation
- **Performance Optimization**: Systematic performance improvement

#### Analysis Prompts (`analysis-prompts.ts`)
- **Security Audit**: OWASP-compliant security assessment
- **Technical Debt**: Comprehensive debt analysis and planning
- **Dependency Analysis**: Security and licensing evaluation

#### Development Prompts (`development-prompts.ts`)
- **API Development**: RESTful API implementation workflow
- **Frontend Scaffolding**: Modern frontend project setup
- **Database Integration**: Comprehensive database setup

## 🏛️ Architectural Patterns

### 1. Three-Tier Architecture

**Tier 1: Tools** - Actions and operations
- Execute pipelines and workflows
- Modify system state
- Require authentication and authorization
- Support real-time streaming

**Tier 2: Resources** - Data access and retrieval
- Read-only data access
- Intelligent filtering and pagination
- Organization-scoped access control
- Cached for performance

**Tier 3: Prompts** - Workflow templates
- Best-practice guidance
- Parameterized templates
- Educational and onboarding value
- Version-controlled workflows

### 2. Event-Driven Architecture

```typescript
// Pipeline execution generates events
PipelineExecution → PipelineEvent → StreamBroadcast → ClientNotification

// Event flow
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Pipeline  │───▶│    Event    │───▶│   Stream    │───▶│   Client    │
│  Execution  │    │  Generation │    │  Broadcast  │    │ Notification│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Event Types:**
- Phase transitions (setup → discovery → implementation → validation → finish)
- Agent execution (plan → generate → refine → intensify)
- Tool execution and results
- Progress updates and metrics
- Completion and error states

### 3. Layered Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                       │
│  • Business logic authorization                            │
│  • Resource-level access control                          │
│  • BTC fee readiness and BTD holding validation           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   Authentication Layer                     │
│  • Multi-method authentication (API key, session)         │
│  • Session freshness validation                           │
│  • Token validation and refresh                           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Transport Layer                         │
│  • TLS encryption                                          │
│  • Request/response validation                             │
│  • Rate limiting and abuse prevention                     │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Patterns

### 1. Pipeline Execution Flow

```
Client Request
    ↓
Authentication & Authorization
    ↓
BTC Fee-Hold Reservation
    ↓
Pipeline Execution (SDIVF)
    ├─ Setup Phase
    ├─ Discovery Phase ↺
    ├─ Implementation Phase ↺ (Iterative DIV Loop)
    ├─ Validation Phase ↺
    └─ Finish Phase
    ↓
AssetPack Results & Delivery Receipts
    ↓
BTC Fee-Hold Resolution
    ↓
Response to Client
```

### 2. Streaming Event Flow

```
Pipeline Execution
    ↓
Event Generation
    ↓
Database Persistence
    ↓
Stream Manager
    ├─ WebSocket Clients
    ├─ SSE Clients
    └─ HTTP Polling Clients
    ↓
Client UI Updates
```

### 3. Resource Access Flow

```
Resource Request
    ↓
Authentication Check
    ↓
Permission Validation
    ↓
Query Parameter Parsing
    ↓
Database Query (with filters)
    ↓
Data Transformation
    ↓
Response Caching
    ↓
Client Response
```

## 🧩 Integration Points

### 1. Bitcode Pipeline System Integration

```typescript
// Direct integration with current Bitcode pipeline runners
import { runAssetPackPipeline } from '@bitcode/pipeline-asset-pack';

// MCP tools wrap pipeline execution with:
// - Authentication and authorization
// - $BTD treasury management and settlement visibility
// - Real-time streaming and monitoring
// - Error handling and recovery
// - Comprehensive logging and metrics
```

### 2. Supabase Database Integration

```typescript
// Multi-client architecture
const supabase = createClient();        // Browser/anon client
const supabaseAdmin = createAdminClient(); // Server/admin client

// Tables accessed:
// - user_profiles, user_api_keys, user_credits
// - organizations, organization_memberships
// - pipeline_executions, pipeline_events, pipeline_phases
// - analysis_results, Evidence Document storage, security_audit_log
```

### 3. $BTD Treasury Integration

```typescript
// Integrated Bitcode treasury management
interface BtdTreasuryManagement {
  estimateBtd(operation: MCPOperation): Promise<number>;
  reserveBtd(userId: string, amount: number): Promise<BtdReservation>;
  trackBtdUsage(reservationId: string, actualUsage: number): Promise<void>;
  refundBtd(reservationId: string, reason: string): Promise<void>;
}
```

## 🎯 Performance Optimizations

### 1. Connection Management

- **Connection Pooling**: Database connection pooling for high concurrency
- **Connection Caching**: Auth context caching (5-minute TTL)
- **WebSocket Management**: Efficient connection cleanup and heartbeat monitoring
- **SSE Optimization**: Keep-alive and connection reuse

### 2. Database Optimizations

- **Query Optimization**: Indexed queries with proper WHERE clauses
- **Pagination**: Limit/offset pagination for large datasets
- **Selective Fetching**: Only fetch required columns
- **Row-Level Security**: Database-enforced access control

### 3. Caching Strategies

- **Auth Context Cache**: 5-minute cache for authentication results
- **Resource Response Cache**: Configurable caching for read-only resources
- **Pipeline Status Cache**: Fast status lookups for active pipelines
- **Metadata Cache**: Cache organization and user metadata

### 4. Streaming Optimizations

- **Event Batching**: Batch multiple events for efficiency
- **Selective Broadcasting**: Only send events to subscribed clients
- **Compression**: WebSocket compression for large payloads
- **Heartbeat Management**: Efficient keep-alive and cleanup

## 🛡️ Security Architecture

### 1. Defense in Depth

```
┌─────────────────────────────────────────────────────────────┐
│                   Network Security                         │
│  • TLS 1.3 encryption                                      │
│  • CORS and security headers                               │
│  • Rate limiting and DDoS protection                      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                Application Security                        │
│  • Input validation (Zod schemas)                         │
│  • SQL injection prevention                               │
│  • XSS protection                                         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Data Security                           │
│  • Row-level security (RLS)                               │
│  • Encrypted credentials storage                          │
│  • Audit logging                                          │
└─────────────────────────────────────────────────────────────┘
```

### 2. Access Control Matrix

| Role | Pipeline Create | Pipeline Cancel | Org Analytics | Member Management |
|------|----------------|----------------|---------------|-------------------|
| dev | ✅ | Own only | Own only | ❌ |
| lead | ✅ | Own + team | Team | ❌ |
| admin | ✅ | ✅ | ✅ | ✅ |
| owner | ✅ | ✅ | ✅ | ✅ |

### 3. Audit and Compliance

```typescript
// Comprehensive audit logging
interface SecurityAuditLog {
  event_type: string;           // Action performed
  user_id: string;             // Who performed it
  request_id: string;          // Request correlation
  metadata: Record<string, any>; // Context data
  ip_address: string;          // Source IP
  user_agent: string;          // Client information
  created_at: timestamp;       // When it happened
}
```

## 📊 Monitoring and Observability

### 1. OpenTelemetry Integration

```typescript
// Comprehensive tracing
const span = tracer.startSpan('mcp_tool_execution');
span.setAttributes({
  'mcp.tool.name': toolName,
  'mcp.user.id': userId,
  'mcp.organization.id': organizationId
});

// Custom metrics
observability.recordMetric('mcp_tool_duration', {
  tool: toolName,
  duration: executionTime,
  success: result.success
});
```

### 2. Health Checks

```typescript
// Multi-level health checks
interface HealthStatus {
  server: 'healthy' | 'degraded' | 'unhealthy';
  database: 'connected' | 'slow' | 'disconnected';
  streaming: 'active' | 'limited' | 'disabled';
  pipelines: 'operational' | 'degraded' | 'failed';
}
```

### 3. Performance Metrics

- **Request Latency**: P50, P95, P99 latencies for all operations
- **Throughput**: Requests per second and concurrent connections
- **Error Rates**: Error percentages by operation type
- **Resource Utilization**: Memory, CPU, and database connection usage

## 🚀 Scalability Considerations

### 1. Horizontal Scaling

- **Stateless Design**: Server instances are stateless for easy scaling
- **Database Scaling**: Supabase handles database scaling automatically
- **Streaming Distribution**: WebSocket connections can be load-balanced
- **Cache Distribution**: Redis for distributed caching (future)

### 2. Vertical Scaling

- **Connection Pooling**: Configurable database connection limits
- **Memory Management**: Efficient memory usage with streaming
- **CPU Optimization**: Async/await patterns for non-blocking operations
- **I/O Optimization**: Streaming responses for large datasets

### 3. Future Enhancements

- **Microservice Architecture**: Split into specialized services
- **Message Queues**: Async processing for heavy operations
- **CDN Integration**: Static asset and response caching
- **Geographic Distribution**: Multi-region deployment support

## 🧪 Testing Strategy

### 1. Test Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     E2E Tests                              │
│  • Full MCP protocol integration                           │
│  • Authentication flows                                    │
│  • Pipeline execution scenarios                           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                Integration Tests                           │
│  • Database integration                                    │
│  • Pipeline system integration                            │
│  • Streaming functionality                                │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   Unit Tests                               │
│  • Tool execution logic                                    │
│  • Authentication logic                                    │
│  • Resource filtering                                     │
└─────────────────────────────────────────────────────────────┘
```

### 2. Test Coverage Goals

- **Unit Tests**: >90% code coverage
- **Integration Tests**: All major integration points
- **E2E Tests**: Critical user journeys
- **Performance Tests**: Load and stress testing
- **Security Tests**: Penetration testing and vulnerability scanning

This architecture provides a robust, scalable, and secure foundation for exposing Bitcode technical knowledge through the Model Context Protocol, while maintaining high performance and comprehensive observability.
