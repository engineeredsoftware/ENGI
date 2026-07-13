# @bitcode/orm

Type-safe database access layer for the Bitcode platform. Provides 1:1 mapping with Supabase migrations, AssetPack evidence vector storage, and consistent read/write helpers.

## Core Architecture

- **Client Management**: Separate admin and user clients
- **Model System**: Type-safe model classes for all entities
- **AssetPack Evidence Vectors**: pgvector-backed storage helpers for AssetPack evidence rows
- **Profile Contracts**: Readiness and profile helpers for Bitcode account state
- **Data Health**: Supabase/PostgreSQL projection checks for schema, identity, Terminal, ledger, telemetry, and reconciliation parity

## Client Types

```typescript
import { createClient, createAdminClient } from '@bitcode/orm';

// User-scoped client (API routes)
const client = createClient(authToken);

// Admin client (field doc plugin, background jobs)
const adminClient = createAdminClient();
```

## Model Usage

```typescript
import {
 UsersModel,
 AssetPackEvidenceModel,
 ConversationsModel
} from '@bitcode/orm';

// List user AssetPack evidence
const assetPackEvidence = await client.assetPackEvidence.list({
 filter: { status: 'completed' },
 limit: 10
});

// AssetPack evidence vectors
const relatedVectors = await client.assetPackVectors.listByAssetPackEvidenceId(assetPackEvidence[0].id);
```

## Available Models

- **User Models**: Users, profiles, `$BTD` holding reads, connections, API keys
- **Organization Models**: Organizations, members, treasury posture, invitations
- **Pipeline Models**: Executions, AssetPack evidence, execution events
- **Communication Models**: Conversations, messages, notifications

## Bitcode Storage Capabilities

- **Semantic Search Support**: AssetPack evidence vector rows and RPC-backed search surfaces
- **pgvector Integration**: Native PostgreSQL vector storage for admitted AssetPack evidence
- **Profile Readiness**: Canonical user/profile readiness checks used by app and API routes
- **Schema Contracts**: Generated database types and typed model helpers kept in lockstep with Supabase migrations
- **Data Health Checks**: `pnpm -C packages/orm run data-health -- --suite daily` validates live Supabase projection health when a Postgres connection string is supplied through `SUPABASE_DB_URL`, `DATABASE_URL`, or compatible env.

## Auxillaries Profile Contract Boundary

`profile-contract.ts` owns database-shaped profile hydration, wallet-binding
normalization, and profile settings merge helpers. Auxillaries API routes should
import these helpers from `@bitcode/orm` and then pass hydrated records into
`@bitcode/api` Auxillaries contract builders. ORM does not own UI-ready
readiness diagnostics, interface admission, organization policy, or source-safe
payload redaction; those route contracts belong to `@bitcode/api`.
V31 Profile/account state keeps this boundary: ORM normalizes persisted profile
facts, while `@bitcode/api` derives account identity, preference posture,
notification posture, data-sharing posture, blockers, repair routes, and proof
roots.

## Architecture

Provides database as a typed service philosophy. 1:1 mapping with Supabase schema ensures consistency. Vector search, profile contracts, generated types, and data-health checks support Bitcode Terminal, wallet, GitHub, AssetPack, and proof-facing storage without admitting experimental non-Bitcode query corridors.
