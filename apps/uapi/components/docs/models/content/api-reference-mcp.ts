/**
 * Docs content module: MCP API reference — product protocol truth.
 * Exactly eight product tools: measure, deposit/read synthesize, packs, auxiliaries.
 */
import type { DocsInterfaceApiSection } from '../bitcode-docs-types';

export const mcpApiReference = [
  {
    id: 'mcp-call-lifecycle',
    title: 'MCP call lifecycle',
    summary:
      'The proof-readback MCP server exposes tools/list and tools/call over the Model Context Protocol, authenticates each call, applies rate/resource limits, and dispatches the eight product tools.',
    packagePath: 'apps/mcp/src/server.ts',
    features: [
      {
        name: 'tools/list',
        method: 'MCP request',
        packagePath: 'apps/mcp/src/server.ts',
        useWhen: 'Discover the active Bitcode MCP product tools.',
        howToUse:
          'Call tools/list after connecting. The default surface registers exactly eight product tools.',
        inputs: ['No body is required for discovery.'],
        outputs: [
          'tools: array of eight { name, description, inputSchema } records.',
          'Server logs include count and failed category count.',
        ],
      },
      {
        name: 'tools/call',
        method: 'MCP request',
        packagePath: 'apps/mcp/src/server.ts',
        useWhen: 'Execute one product MCP tool.',
        howToUse:
          'Pass name and arguments. Include request params _meta.authorization when auth is required. Local repositories are prepared before execution when repository.provider is local.',
        inputs: [
          'name: required bitcode:// product tool identifier.',
          'arguments: tool-specific validated input object.',
          '_meta.authorization: optional auth header used by authenticateMCPRequest.',
        ],
        outputs: [
          'Tool-specific result object.',
          'Execution passes through auth, rate limits, resource limits, and circuit breaker handling.',
        ],
        failureModes: [
          'Authentication failure rejects the call.',
          'Invalid schema arguments return validation errors.',
          'Unknown tool names fail closed.',
        ],
      },
    ],
  },
  {
    id: 'mcp-product-tools',
    title: 'Product tools (eight)',
    summary:
      'The only admitted MCP tools: measure, synthesize-asset-packs-for-deposit, synthesize-asset-packs-for-reads, packs, and four Auxillaries panes.',
    packagePath: 'apps/mcp/src/tools/product-tools.ts',
    features: [
      {
        name: 'bitcode://measure',
        method: 'tools/call',
        packagePath: 'apps/mcp/src/tools/product-tools.ts',
        useWhen: 'Measure a repository for product measurement dimensions (source-safe).',
        howToUse: 'Pass repository coordinates, measureType, and optional depth/output controls.',
        inputs: [
          'repository: { owner, name, branch? }.',
          'measureType: architecture, dependencies, security, performance, quality, complexity, patterns, or technical_debt.',
          'depth, includeMetrics, outputFormat.',
        ],
        outputs: [
          'repository, branch, measureType, timestamp.',
          'results and metadata (measureId, confidence, lines/files measured) — source-safe only.',
        ],
      },
      {
        name: 'bitcode://synthesize-asset-packs-for-deposit',
        method: 'tools/call',
        packagePath: 'apps/mcp/src/tools/product-tools.ts',
        useWhen:
          'Synthesize Deposit AssetPack options from a repository with obfuscations — same law as /deposits.',
        howToUse:
          'Pass repository, obfuscations (empty allowed), optional forced inclusions/exclusions, streaming. Requires confirmation (write).',
        inputs: [
          'repository: required RepositoryContext.',
          'obfuscations: required string (may be empty).',
          'forcedInclusions, forcedExclusions, streaming, organizationId, connections, attachments.',
        ],
        outputs: [
          'runId and assetPackEvidenceId for /packs reread.',
          'status, interfaceSurface: mcp, writeAdmission, outputMeaning.',
        ],
        requiresConfirmation: true,
      },
      {
        name: 'bitcode://synthesize-asset-packs-for-reads',
        method: 'tools/call',
        packagePath: 'apps/mcp/src/tools/product-tools.ts',
        useWhen:
          'Synthesize Read AssetPack options from Need configuration — same law as /reads.',
        howToUse: 'Pass repository and need (prompt required). Requires confirmation (write).',
        inputs: [
          'repository: required target/source RepositoryContext.',
          'need: required Need configuration (prompt and optional accepted-need fields).',
          'streaming, organizationId, connections, attachments.',
        ],
        outputs: [
          'runId and evidence ids for activity reread.',
          'status, interfaceSurface: mcp, writeAdmission, outputMeaning.',
        ],
        requiresConfirmation: true,
      },
      {
        name: 'bitcode://packs',
        method: 'tools/call',
        packagePath: 'apps/mcp/src/tools/product-tools.ts',
        useWhen: 'Reread Packs activity posture (source-safe options, measurements, settlement).',
        howToUse: 'Optionally pass activityId and limit.',
        inputs: ['activityId optional.', 'limit optional (1–50).', 'organizationId optional.'],
        outputs: [
          'productRoute: /packs.',
          'source-safe packs/activity posture and writeAdmission metadata.',
        ],
      },
      {
        name: 'bitcode://auxiliary-profile',
        method: 'tools/call',
        packagePath: 'apps/mcp/src/tools/product-tools.ts',
        useWhen: 'Open or reread Auxillaries Profile posture via MCP.',
        howToUse: 'Optional confirmOpen for write-admission open posture.',
        inputs: ['organizationId optional.', 'confirmOpen optional boolean.'],
        outputs: ['productRoute with auxillary-open-to=profile.', 'source-safe pane posture.'],
      },
      {
        name: 'bitcode://auxiliary-wallet',
        method: 'tools/call',
        packagePath: 'apps/mcp/src/tools/product-tools.ts',
        useWhen: 'Open or reread Auxillaries Wallet posture via MCP.',
        howToUse: 'Optional confirmOpen for write-admission open posture.',
        inputs: ['organizationId optional.', 'confirmOpen optional boolean.'],
        outputs: ['productRoute with auxillary-open-to=wallet.', 'source-safe pane posture.'],
      },
      {
        name: 'bitcode://auxiliary-interfaces',
        method: 'tools/call',
        packagePath: 'apps/mcp/src/tools/product-tools.ts',
        useWhen: 'Open or reread Auxillaries Interfaces posture via MCP.',
        howToUse: 'Optional confirmOpen for write-admission open posture.',
        inputs: ['organizationId optional.', 'confirmOpen optional boolean.'],
        outputs: ['productRoute with auxillary-open-to=interfaces.', 'source-safe pane posture.'],
      },
      {
        name: 'bitcode://auxiliary-externals',
        method: 'tools/call',
        packagePath: 'apps/mcp/src/tools/product-tools.ts',
        useWhen: 'Open or reread Auxillaries Externals posture via MCP.',
        howToUse: 'Optional confirmOpen for write-admission open posture.',
        inputs: ['organizationId optional.', 'confirmOpen optional boolean.'],
        outputs: ['productRoute with auxillary-open-to=externals.', 'source-safe pane posture.'],
      },
    ],
  },
] as const satisfies readonly DocsInterfaceApiSection[];
