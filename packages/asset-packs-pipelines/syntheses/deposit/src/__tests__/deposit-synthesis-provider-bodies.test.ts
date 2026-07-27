/**
 * Critical: deposit synthesis LLMs must receive real file / patch bodies.
 * Source-safety is product/API disclosure — not provider-input redaction.
 */
// @ts-nocheck
import { projectInventoryForSynthesisProvider } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis';
import { buildCommercialNlPacket } from '../agents/implementation/deposit-implementation-agent-asset-packs-commercial-nl';
import { pickSiblingExcerpts } from '../agents/implementation/deposit-create-body-hydrate';
import { toDepositMeasuredPack, toDepositPatchfilePack } from '../agents/implementation/deposit-implementation-pack-types';
import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

function fullCatalogAbsolutes() {
  return DATA_PACK_ABSOLUTES_CATALOG.map((spec) => ({
    measurementKind: spec.measurementKind,
    label: spec.label,
    weight: spec.weight,
    volume: 0.4,
    magnitude: 0.4,
    unit: spec.unit,
    category: 'absolute',
    status: 'measured',
  }));
}

describe('deposit synthesis provider body grounding', () => {
  it('synthesis inventory projection carries full checkout bodies', () => {
    const inv = {
      paths: ['src/auth/session.ts', 'src/auth/token.ts', 'README.md'],
      samples: [],
      sources: [
        { path: 'src/auth/session.ts', content: 'export function createSession() { return 1; }\n' },
        { path: 'src/auth/token.ts', content: 'export function refresh() { return 2; }\n' },
        { path: 'README.md', content: '# Auth kit\n' },
      ],
    };
    const projected = projectInventoryForSynthesisProvider(inv);
    expect(projected?.disclosureNote).toMatch(/SYNTHESIS_PROVIDER_INPUT/);
    expect(projected?.sources?.some((s) => s.content.includes('createSession'))).toBe(true);
    expect(projected?.sources?.some((s) => s.content.includes('refresh'))).toBe(true);
  });

  it('commercial-NL packet includes patch bodies and unifiedDiff', () => {
    const plan = toDepositPatchfilePack({
      kind: 'capability-slice',
      title: 'Session auth capability slice',
      summary:
        'A bounded capability slice covering session authentication and token refresh flows for commercial deposit.',
      coveredSourcePaths: ['src/auth/session.ts'],
      confidence: 0.8,
      patch: {
        fileChanges: [{ path: 'src/auth/session.ts', op: 'modify' }],
        patchSummary: 'Session lifecycle knowledge.',
      },
    });
    const withArt = {
      ...plan,
      patchArtifact: {
        artifactId: 'artifact-patch-test',
        assetPackId: 'ap-test',
        schema: 'bitcode.artifact.patch',
        productSchema: 'bitcode.artifact.patch.asset-pack',
        format: 'unified-diff',
        patchSummary: plan.patch.patchSummary,
        fileCount: 1,
        files: [
          {
            path: 'src/auth/session.ts',
            op: 'modify',
            body: 'export function createSession() { return true; }\n',
          },
        ],
        name: 'a.patch',
        envelopeJson: '{"artifactId":"artifact-patch-test"}',
        unifiedDiff:
          'diff --git a/src/auth/session.ts b/src/auth/session.ts\n+export function createSession() { return true; }\n',
        bodiesComplete: true,
      },
    };
    const measured = toDepositMeasuredPack(withArt as any, fullCatalogAbsolutes());
    const packet = buildCommercialNlPacket([measured]) as any;
    expect(packet.packs[0].patch.fileChanges[0].body).toContain('createSession');
    expect(packet.packs[0].patch.unifiedDiff).toContain('createSession');
    expect(packet.packs[0].measurements.absolutes.length).toBe(
      DATA_PACK_ABSOLUTES_CATALOG.length,
    );
  });

  it('create-body sibling excerpts carry large real source, not path-only stubs', () => {
    const longBody = 'export const value = 1;\n'.repeat(200);
    const map = new Map([
      ['src/auth/session.ts', longBody],
      ['src/auth/new-note.md', ''], // create target missing
    ]);
    const excerpts = pickSiblingExcerpts(map, ['src/auth/new-note.md']);
    expect(excerpts.length).toBeGreaterThan(0);
    expect(excerpts[0].excerpt.length).toBeGreaterThan(1000);
    expect(excerpts[0].excerpt).toContain('export const value');
  });
});
