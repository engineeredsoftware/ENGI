# Bitcode Apps (primarily `apps/uapi`)

This guide describes the **commercial application surfaces** of Bitcode—especially
the Next.js website and API under `apps/uapi`. Package domain law lives under
`packages/`; specification law under `.specifications/`.

For agent engineering rules see [`AGENTS.md`](./AGENTS.md). For package catalog
and inheritance, see [`.docs/FAMILIARIZATION.md`](./FAMILIARIZATION.md). For AssetPack
domain depth see [`.docs/ASSET_PACKS.md`](./ASSET_PACKS.md).

## Product apps in this monorepo

| App | Path | Role |
| --- | --- | --- |
| **uapi** | `apps/uapi` | Primary commercial website + HTTP APIs (`/deposits`, `/reads`, `/packs`, Auxillaries, Docs, Conversations) |
| **mcp** | `apps/mcp` | Bitcode MCP server surface |
| **chatgpt** | `apps/chatgpt` | ChatGPT App actions |
| **claude** | `apps/claude` | Claude App surface |

**Run uapi:** from repo root `pnpm run dev:remote` or `pnpm -C apps/uapi dev:remote` (path is always `apps/uapi`; no root `uapi/` symlink).

## Architecture (uapi)

Dependency direction:

```
packages/* (domain)
  → apps/uapi/lib, networking, hooks
  → components/shadcn → Bitcode*
  → experiences: marketing | packs | reads | deposits | docs | conversations | auxillaries
  → app/* thin page shells
```

Product run language is **Pipeline**. BTD ledger language is **journal**.
Product routes: `/packs`, `/deposits`, `/reads`, `/docs`.

## Commercial loop (Deposit → Read → Settle)


## Evidence Documents System

**Evidence basis**: repository-facing documents keep product intent, operating instructions, and tool configuration readable across Bitcode sessions.

### Architecture

```typescript
interface CodebaseIntelligence {
  ".docs/AGENTS.md": "Questions about how to design in THIS codebase"
  ".docs/PRODUCT.md": "Implementation truth of THIS product"
  ".docs/MCPS.md": "Tools and integrations THIS codebase uses"
}
```

### The Experience

**Rich Response Diffs**: When AI learns something new about your codebase:

```diff
## .docs/AGENTS.md changes proposed:

+ ### How should I handle authentication in this codebase?
+ Use the existing AuthService with JWT refresh rotation pattern.
+ All auth checks must go through middleware/authentication.ts.
+ Never store tokens in localStorage - use httpOnly cookies.

+ ### What patterns does this codebase follow for data access?
+ Repository pattern with explicit interfaces.
+ All database queries through Prisma ORM.
+ Transaction boundaries at service layer only.
```

**User Control**:
- **Accept**: Knowledge becomes permanent
- **Modify**: Edit the understanding before accepting
- **Reject**: AI forgets this learning

### The Intelligence Loop

```
Execution generates Unknowledge
  → Unknowledge becomes Questions
    → Questions drive Discovery
      → Discovery updates .docs/
        → .docs/ drives next Execution
          → (Exponential Learning)
```

### Generating Unknowledge

**The Humility Protocol**: AI must document what it DOESN'T know:

```markdown
## .docs/AGENTS.md - Unknowledge Section

### Questions I Cannot Yet Answer:
- How does this codebase handle distributed transactions?
- What is the reasoning behind the custom EventBus implementation?
- Why does AuthService bypass the standard middleware for admin routes?

### Assumptions Requiring Validation:
- ASSUMING: All API routes follow REST conventions (needs verification)
- ASSUMING: Database migrations run automatically (found no evidence)
- ASSUMING: The custom Logger writes to CloudWatch (unconfirmed)
```

### Highly Amenable Instructions

Instructions that ADAPT based on .docs/ knowledge:

```typescript
// Same instruction: "Add user authentication"

// Codebase A (from .docs/AGENTS.md):
→ Implements OAuth2 with existing Google provider
→ Extends current SessionManager
→ Follows established JWT refresh pattern

// Codebase B (from different .docs/AGENTS.md):
→ Implements basic auth with bcrypt
→ Creates new auth middleware
→ Uses cookie-based sessions
```

## AssetPack Pipeline

**SDIVF Pattern**: Setup → Discovery → Implementation → Validation → Finish

### V26 Precision Instrument

1. **Code Change** → Pull Request
   - Divide|Apply|Correct execution pattern
   - AST-based symbol resolution
   - Automatic test generation
   - Performance regression detection

2. **Code Change Review** → PR Analysis
   - Security vulnerability scanning
   - Performance impact assessment
   - Architecture compliance verification
   - Test coverage validation

3. **Design Document** → Issue Creation
   - Requirements extraction from instructions
   - Technical specification generation
   - Dependency graph visualization
   - Implementation roadmap creation

4. **Design Document Review** → Issue Analysis
   - Feasibility assessment
   - Risk identification
   - Alternative approach generation
   - Cost/benefit analysis

### Execution Streaming

**Real-Time Intelligence Flow**:
- Server-Sent Events with <50ms latency
- Hierarchical execution visibility
- BTC fee-liquidity readiness and measured `$BTD` evidence transparency
- Tool execution tracing with industrial precision
- Generation streaming with token-level visibility

### PTRR Architecture

Every agent follows Plan → Try → Refine → Retry with 7-substep hierarchy:
- 3 Failsafe parents handle context/noise/scale
- Each parent has 3 generation children (Reason/Judge/Output)
- Minimum 3 iterations for convergence
- Maximum 10 iterations with exponential backoff

## Orbitals Experience

**Your Bitcode operations workspace**

### BTC Fee Readiness and BTD Holdings
- Real-time BTC fee-liquidity posture
- Automatic fee-hold release on failure
- Usage analytics with model-cost breakdown
- Cost optimization recommendations
- Budget alerts and limits

### Model Preferences
- Per-operation model routing
- Quality vs speed vs cost optimization
- Automatic failover chains
- A/B testing infrastructure
- Performance benchmarking

### GitHub Integration
- Repository auto-discovery
- Branch protection compliance
- Commit signing enforcement
- PR template generation
- Issue label automation

### Template System
- Instruction templates with variables
- Context-aware suggestions
- Performance-based recommendations
- Team sharing and versioning
- Usage analytics

### Notification Streams
- Execution start/complete/fail
- BTC fee-liquidity threshold warnings
- PR merge notifications
- Review request alerts
- Performance anomaly detection

## Conversations Reasoning

**Conversation Surface**: Always-available Bitcode reasoning over repository and Exchange context

### Contextual Understanding
- Repository-aware responses
- File-system navigation
- Symbol resolution
- Dependency understanding
- Pattern recognition

### Conversation State
- Cross-session memory
- Context switching
- Multi-repository support
- Team knowledge sharing
- Learning accumulation

### Codebase Learning
- Pattern extraction
- Convention discovery
- Architecture mapping
- Performance profiling
- Security scanning

## Executions Interface

**Unified Control Plane**: All pipeline executions through single interface

### Execution Types
- `agentic-execution:asset-pack` (V26 only)
- Future: measure, obfuscate pipelines

### State Management
- Persisted with 3s debounce
- Multi-tab synchronization
- URL state preservation
- Back button support
- Recovery on refresh

### VCS Integration
- Provider → Account → Repository → Branch → Commit flow
- Auto-selection with memory
- Default branch detection
- Latest commit selection
- File browser interface

## TPS (Third-Party Surfaces)

**Integration Points for External Services**

### Payment Processing
- Stripe checkout integration
- Usage-based billing
- Invoice generation
- Payment method management
- Subscription handling

### Communication
- Twilio SMS notifications
- Email via SendGrid
- Slack integration
- Discord webhooks
- Teams connectors

### Productivity
- Notion synchronization
- Linear issue sync
- Jira integration
- Confluence documentation
- Google Workspace

### Development Tools
- MCP (Model Context Protocol) tools
- GitHub App webhooks
- CircleCI pipeline triggers
- Vercel deployment hooks
- Netlify build notifications

## Security Architecture

### OWASP Compliance
- CSP headers with nonce-based scripts
- HSTS with preload
- X-Frame-Options DENY
- X-Content-Type-Options nosniff
- Referrer-Policy strict-origin

### Authentication
- Supabase SSO with PKCE
- Session validation middleware
- Ownership verification
- Rate limiting per user
- Token bucket implementation

### Data Protection
- Encryption at rest (AES-256)
- TLS 1.3 only
- Secret rotation automation
- Audit logging
- PII scrubbing

## Performance Requirements

### Latency Targets
- **Instruction → Execution**: <500ms
- **SSE Event Delivery**: <50ms
- **BTC Fee Estimate Calculation**: <10ms
- **Pattern Match**: <100ms
- **Tool Execution**: Parallel with DAG

### Scalability Metrics
- 10,000 concurrent executions
- 1M SSE connections
- 100K repos indexed
- 10M prompt parts
- 1B tool executions/month

### Reliability Standards
- 99.99% API uptime
- Zero data loss guarantee
- Automatic failure recovery
- Circuit breaker patterns
- Dead letter queues

## Database Architecture

### Single Migration Truth
```sql
-- 001_v26_production.sql
-- Current Bitcode schema, transitional shims excluded

CREATE TABLE executions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT DEFAULT 'agentic-execution:asset-pack',
  status TEXT DEFAULT 'pending',
  -- Complete schema...
);

-- Plus: generations, AssetPack evidence, artifacts, conversations,
-- BTD holding storage, user_profiles, vcs_repositories, and BTC fee readiness state
```

### Performance Optimizations
- Indexed foreign keys
- Materialized views for analytics
- Connection pooling with pgBouncer
- Read replicas for queries
- Automatic vacuum tuning

## Monitoring & Observability

### Metrics Collection
- OpenTelemetry instrumentation
- Custom execution metrics
- Business KPI tracking
- Error rate monitoring
- Performance profiling

### Alerting
- PagerDuty integration
- Slack notifications
- Email escalation
- Custom thresholds
- Anomaly detection

### Debugging
- Distributed tracing
- Correlation IDs
- Event sourcing
- Time-travel debugging
- Replay capability

## Success Metrics

### User Success
- Instructions → Merged PRs in <10 minutes
- Zero failed executions due to ambiguity
- Transparent BTC fee readiness, measured `$BTD` holdings, and fail-closed settlement receipts
- Pattern recognition accuracy >95%
- User satisfaction NPS >70

### System Success
- Every execution faster than the last
- Every pattern strengthens the whole
- Every user improves it for everyone
- Knowledge compounds exponentially
- Architecture self-optimizes

### Business Success
- Exponential user growth via excellence
- Network effects from pattern sharing
- Defensible moat from execution data
- Viral coefficient >1.5
- LTV:CAC ratio >3

## The Network Effect

```
Users provide Instructions
  → System discovers Patterns
    → Patterns improve Execution
      → Excellence becomes Standard
        → Standards attract Users
          → More data improves AI
            → AI generates better code
              → Success stories spread
                → (Exponential Loop)
```

## REMEMBER

**Bitcode is market infrastructure for auditable technical knowledge exchange.**

Every instruction becomes architecture.
Every execution becomes learning.
Every pattern becomes permanent.
Every codebase becomes auditable technical knowledge.
Every user makes it better for everyone.

This is not a generic automation surface.
This is the commercial Bitcode baseline for source, Read, fit, proof, settlement, and AssetPack reread.

---

**THE PRODUCT IS THE PROTOCOL**
**THE PROTOCOL IS PROVEN**
**THE PROOF IS REPLAYABLE**

Make every Read measurable.
Make every fit reviewable.
Make every AssetPack auditable.
Make every share traceable.

V26 is the first commercial Bitcode promotion baseline.

