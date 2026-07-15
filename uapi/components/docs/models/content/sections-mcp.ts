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
      'MCP tools expose programmable Bitcode actions: attach permitted source, express a Reading, admit AssetPack intent, read activity, inspect proof posture, and return write-admission evidence.',
    detail:
      'Keep the MCP surface narrow and explicit. Generic tools that are not admitted remain support or reference until Protocol and /packs can reread their effects.',
    reason:
      'Programmability only helps when it preserves AssetPack proof parity with product routes.',
    points: [
      'Writes are confirmation-gated.',
      'Results point back to /packs-readable activity.',
      'Attachments preserve source and Read context for later audit.',
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
