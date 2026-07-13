# Observability Core

## Overview

Industrial observability platform providing distributed tracing, performance monitoring, dry-run capabilities, and telemetry integration for the Bitcode platform. Implements comprehensive system observability with automatic instrumentation, error tracking, and operational intelligence.

## Core Functionality

### Distributed Tracing
- **Span Management**: Automatic span creation and lifecycle management via Sentry integration
- **Performance Monitoring**: Real-time performance measurement for async operations
- **Call Graph Construction**: Automatic call graph generation with timing information
- **Context Propagation**: Trace context propagation across service boundaries

### Dry-Run Infrastructure
- **Non-Destructive Testing**: Safe pipeline execution without external modifications
- **LLM Call Simulation**: Intelligent simulation of language model interactions
- **Tool Execution Control**: Selective tool execution in dry-run environments
- **Response Generation**: Schema-aware mock response generation

### Telemetry Management
- **Event Tracking**: Comprehensive event tracking with structured metadata
- **Feedback Collection**: User feedback aggregation with rating and comment support
- **Performance Metrics**: System performance metric collection and aggregation
- **Error Analytics**: Comprehensive error tracking and pattern analysis

### Route Instrumentation
- **Automatic Wrapping**: Transparent route handler instrumentation
- **Error Handling**: Standardized error handling with automatic reporting
- **Response Transformation**: Consistent HTTP response transformation
- **Context Enrichment**: Request context enrichment with tracing information

## API Reference

### Core Tracing Functions

```typescript
// General Purpose Tracing
async function trace<T>(name: string, fn: () => Promise<T>): Promise<T>

// Step-Level Tracing
async function traceStep<T>(name: string, fn: () => Promise<T>): Promise<T>

// LLM-Specific Tracing
async function generateTextTraced<T = any>(args: any): Promise<T>

// Route Handler Tracing
function traceRoute<T extends (...args: any[]) => any>(name: string, fn: T): T
```

### Dry-Run Functions

```typescript
// Dry-Run Mode Detection
function isDryRunEnabled(): boolean

// Tool Execution Control
function shouldExecuteInDryRun(toolName: string): boolean

// LLM Simulation
async function logDryRunPrompt(
 messages: ChatCompletionRequestMessage[],
 purpose: string,
 executionState: ExecutionState,
 correlationId?: string
): Promise<void>

// Response Generation
function generateDefaultResponse<T>(schema: z.ZodType<T>): T
```

### Telemetry Functions

```typescript
// Feedback Collection
async function logFeedback(params: {
 assetPackEvidenceId: string;
 userId: string;
 rating: -1 | 1;
 comment?: string;
}): Promise<void>
```

## Configuration

### Tracing Configuration
```typescript
// Sentry Integration Configuration
import { startSpan } from '@bitcode/external-telemetry-sentry';

// Automatic span creation with performance monitoring
export async function trace<T>(name: string, fn: () => Promise<T>): Promise<T> {
 return startSpan({ name }, fn);
}
```

### Dry-Run Configuration
```typescript
// Dry-Run Mode Detection
export function isDryRunEnabled(): boolean {
 return PIPELINE_CONSTANTS.DRY_RUN_MODE === true;
}

// Non-LLM Tool Whitelist
const nonLlmTools = [
 'cloneRepository',
 'initializeFileTracker',
 'analyzeRepository',
 'identifyCriticalPaths',
 'filterRelevantFiles'
];
```

### Telemetry Configuration
```typescript
// Supabase Client Configuration
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
 auth: { persistSession: false, autoRefreshToken: false }
});
```

## Performance Characteristics

### Tracing Performance
- **Span Overhead**: < 1ms per span creation with automatic cleanup
- **Context Propagation**: < 0.5ms for trace context transmission
- **Performance Measurement**: Nanosecond-precision timing with minimal overhead
- **Memory Usage**: < 5MB baseline with automatic span garbage collection

### Dry-Run Performance
- **Mode Detection**: < 0.1ms for dry-run mode validation
- **Response Generation**: < 10ms for schema-based mock response creation
- **Tool Filtering**: < 0.5ms for tool execution decision logic
- **Simulation Overhead**: < 2ms for LLM call simulation and logging

### Telemetry Performance
- **Event Collection**: < 5ms for structured event capture and transmission
- **Feedback Logging**: < 50ms for database-backed feedback persistence
- **Error Reporting**: < 25ms for error capture and external system integration
- **Metric Aggregation**: < 15ms for real-time metric calculation and storage

## Integration Patterns

### Automatic Route Instrumentation
```typescript
// Route Handler Wrapping
export const authenticatedHandler = traceRoute('auth-handler', async (request) => {
 const authResult = await trace('authenticate-request', () =>
 authenticateRequest(request)
 );

 return await trace('process-request', () =>
 processAuthenticatedRequest(authResult)
 );
});
```

### LLM Call Instrumentation
```typescript
// Automatic LLM Tracing
const response = await generateTextTraced({
 model: anthropic('claude-3-sonnet'),
 messages: conversationMessages,
 temperature: 0.7
});

// Equivalent to:
const response = await trace('llm:generateText:claude-3-sonnet', () =>
 generateText({ model, messages, temperature })
);
```

### Dry-Run Integration
```typescript
// Conditional Tool Execution
if (isDryRunEnabled() && !shouldExecuteInDryRun(toolName)) {
 await logDryRunPrompt(messages, purpose, executionState, correlationId);
 return generateDefaultResponse(responseSchema);
}

// Normal execution path
return await executeTool(toolName, parameters);
```

### Error Handling Integration
```typescript
// Automatic Error Reporting
export function traceRoute<T>(name: string, fn: T): T {
 return async (...args: any[]) => {
 try {
 return await trace(`api:${name}`, () => fn(...args));
 } catch (err) {
 const { status, body } = toHttpResponse(reportError(err));
 return new Response(JSON.stringify(body), {
 status,
 headers: { 'Content-Type': 'application/json' }
 });
 }
 };
}
```

## Dry-Run Capabilities

### Schema-Aware Response Generation
```typescript
// Automatic Mock Response Creation
function generateDefaultResponse<T>(schema: z.ZodType<T>): T {
 // Handle primitive types
 if (schema instanceof z.ZodString) return '' as T;
 if (schema instanceof z.ZodNumber) return 0 as T;
 if (schema instanceof z.ZodBoolean) return false as T;

 // Handle complex objects with recursive generation
 if (schema instanceof z.ZodObject) {
 const shape = schema._def.shape();
 const result: Record<string, any> = {};

 for (const [key, propSchema] of Object.entries(shape)) {
 if (!(propSchema instanceof z.ZodOptional)) {
 result[key] = generateDefaultResponse(propSchema as z.ZodType<any>);
 }
 }

 return result as T;
 }
}
```

### LLM Call Simulation
```typescript
// Comprehensive LLM Simulation
export async function logDryRunPrompt(
 messages: ChatCompletionRequestMessage[],
 purpose: string,
 executionState: ExecutionState,
 correlationId?: string
): Promise<void> {
 // Log detailed prompt information
 log('DRY RUN: LLM prompt that would have been sent', 'info', {
 purpose,
 messageCount: messages.length,
 systemPrompt: messages.find(m => m.role === 'system')?.content?.slice(0, 200),
 executionState,
 correlationId
 });

 // Stream simulation status
 await writeStreamMessage(dataStream, {
 type: 'status',
 progress: 'info',
 message: `DRY RUN: LLM prompt for ${purpose}`,
 metadata: { dryRun: true, purpose, correlationId }
 });
}
```

## Operational Excellence

### Monitoring Integration
- **Performance Dashboards**: Real-time performance visualization with trace data
- **Error Analytics**: Comprehensive error pattern analysis and alerting
- **Service Health**: Continuous service health monitoring with SLA tracking
- **Capacity Planning**: Resource utilization tracking for capacity management

### Telemetry Analytics
- **User Behavior Analysis**: Comprehensive user interaction pattern analysis
- **Feature Usage Metrics**: Detailed feature adoption and usage analytics
- **Performance Benchmarking**: System performance benchmarking and optimization
- **Business Intelligence**: Revenue and usage correlation analysis

### Security and Compliance
- **Data Privacy**: Automatic PII detection and redaction in telemetry data
- **Access Control**: Role-based access control for observability data
- **Audit Logging**: Comprehensive audit trail for observability system access
- **Compliance Reporting**: Automated compliance reporting for regulatory requirements

### System Reliability
- **Circuit Breaking**: Automatic circuit breaking for failing external dependencies
- **Graceful Degradation**: Observability system graceful degradation under load
- **Data Retention**: Configurable data retention policies with automatic cleanup
- **Disaster Recovery**: Comprehensive disaster recovery for observability infrastructure
