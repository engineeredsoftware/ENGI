/**
 * Docs content module: sections mcp — product protocol truth
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const mcpSections = [
  {
    id: 'mcp-role',
    eyebrow: 'MCP',
    title: 'Bitcode MCP is a connected proof-readback interface',
    summary:
      'MCP exposes exactly eight product tools: measure, synthesize-asset-packs-for-deposit, synthesize-asset-packs-for-reads, packs, and four Auxillaries panes.',
    detail:
      'Keep the MCP surface narrow and explicit. Deposit/Read synthesize mirror website Synthesize DataPacks (obfuscations vs Need). Measure returns source-safe evidence. Packs and Auxillaries reread product posture.',
    reason:
      'Programmability only helps when it preserves DataPack proof parity with product routes.',
    points: [
      'synthesize-asset-packs-for-deposit requires obfuscations configuration (empty allowed).',
      'synthesize-asset-packs-for-reads requires Need configuration.',
      'measure returns source-safe measurement evidence only.',
      'packs and auxiliary-* tools point at Packs/Auxillaries product routes.',
      'Writes are confirmation-gated; results point back to Packs-readable activity.',
    ],
  },
  {
    id: 'api-read-write',
    eyebrow: 'API',
    title: 'The API contract is write, reread, and prove',
    summary:
      'A useful API action writes bounded intent, returns admission evidence, and gives the caller a way to reread the resulting proof-backed activity state.',
    detail:
      'Docs for MCP therefore teach request shape, expected result, failure posture, and which proof readback confirms the write.',
    reason:
      'This mirrors the action manual for external developers and agentic clients.',
  },
  {
    id: 'mcp-docs-disclosure',
    eyebrow: 'Disclosure',
    title: 'Public docs expose guidance and proof posture, not protected source',
    summary:
      'MCP and public docs may describe tool names, schemas, measurements, and proof roots. They must not serialize protected source, unpaid DataPack source, credentials, or wallet private material.',
    detail:
      'When a measure or synthesize call returns roots and source-safe summaries, treat those as the admissible public surface.',
    reason: 'Source-safety is protocol law on every interface, including MCP.',
  },
] as const satisfies readonly DocsGuideCard[];
