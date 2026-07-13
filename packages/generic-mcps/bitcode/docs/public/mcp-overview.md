# Bitcode MCP: Bitcode Exchange interface over Model Context Protocol

> One admitted Bitcode Exchange machine interface for MCP-capable clients.

## What Bitcode MCP is

Bitcode MCP is not a separate product. Under V26 it is one of the formal Bitcode interfaces:

- `Bitcode Protocol`: the specification, proofs, tests, and promotional audit system
- `Bitcode Exchange`: the backend implementation of Bitcode mainnet, including ledgers, transactions, schemas, routes, and utilities
- `Bitcode Terminal`: the primary UX/UI for reading and writing Bitcode Exchange activity
- `Bitcode MCP`: an Exchange-facing machine interface for MCP-capable clients

That distinction matters:

- third-party MCPs, repository connections, and attachments are ingress/input context
- Bitcode MCP reads and writes Bitcode Exchange state
- asset packs are output meaning
- the interface remains auditable against Bitcode Protocol canon

## Core capabilities

- Read measurement and activity continuation through standardized tool calls
- Repository-scoped operations using authenticated source context
- Multi-modal ingress using attachments, documents, images, audio, video, and design references
- Output normalization toward Bitcode asset packs, proofs, history, and settlement follow-through
- Real-time streaming and rereadable execution state

## Usage pattern

Bitcode MCP is for machine clients that read to interoperate with Bitcode Exchange without becoming a parallel product surface.

Typical pattern:

1. bind repository and connection context
2. submit read/deposit/activity intent
3. stream or poll execution progress
4. reread Bitcode Exchange outputs such as asset packs, proofs, history, and settlement posture

## Conversational example

```text
Human: "Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow,
        using the connected repository and attached design files."

Bitcode MCP: reads repository scope, attachments, and readiness posture
Bitcode MCP: measures read and continues Bitcode activity through the admitted interface
Bitcode MCP: returns asset-pack, proof, history, and settlement-facing outputs
```

## Getting started

### Claude Desktop integration

```json
{
  "mcpServers": {
    "bitcode-engineering": {
      "command": "npx",
      "args": ["@bitcode/mcp-server"],
      "env": {
        "BITCODE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### VS Code extension

```bash
code --install-extension bitcode.mcp-integration
code --command "bitcode.configure"
```

### API integration

```javascript
import { BitcodeMCPClient } from '@bitcode/mcp-client';

const client = new BitcodeMCPClient({
  apiKey: process.env.BITCODE_API_KEY,
  organizationId: 'your-org-id'
});

const result = await client.createAssetPack({
  read: 'Build user authentication system',
  repository: { owner: 'myorg', name: 'myapp' },
  options: { createPR: true, runTests: true }
});
```

### Self-hosted option

```bash
docker run -d \
  --name bitcode-mcp \
  -e BITCODE_LICENSE_KEY=your-license \
  -e DATABASE_URL=your-database \
  -p 3000:3000 \
  bitcode/mcp-server:latest
```

## Interface boundary reminders

- Bitcode Terminal remains the primary human UX/UI
- Bitcode MCP remains an Exchange-facing machine interface
- third-party MCPs remain ingress/input carriers unless explicitly admitted as Bitcode interfaces
- attachments and connections remain inputs; asset packs remain outputs
- all interface behavior should stay aligned with Bitcode Protocol canon
