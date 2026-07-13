/**
 * Docs content module: sections mcp.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const mcpSections = [
  {
    id: 'mcp-role',
    eyebrow: 'MCP',
    title: 'Bitcode MCP is a connected proof-readback interface',
    summary:
      'MCP tools should expose current Bitcode actions and reads: attach source, express Read, admit AssetPack intent, read activity, inspect proof posture, and return write-admission evidence.',
    detail:
      'The MCP surface should be narrow and explicit. Non-admitted generic tools are support or reference surfaces until the Protocol and /packs can read their effects.',
    reason:
      'MCP makes Bitcode programmable, but programmability is only valuable if it keeps AssetPack proof parity.',
    points: [
      'Tool calls must be confirmation-gated when they write.',
      'Tool results must point back to /packs-readable activity.',
      'PromptPart and attachment structures preserve source and Read context.',
    ],
  },
  {
    id: 'api-read-write',
    eyebrow: 'API',
    title: 'The API contract is write, reread, and prove',
    summary:
      'A useful API action writes bounded intent, returns admission evidence, and gives the caller a way to reread the resulting proof-backed activity state.',
    detail:
      'Docs for MCP should therefore teach request shape, expected result, failure posture, and which proof readback confirms the write.',
    reason:
      'This mirrors the action manual for external developers and agentic clients.',
  },
] as const satisfies readonly DocsGuideCard[];
