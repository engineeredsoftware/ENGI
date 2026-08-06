/**
 * Create-body hydrate + commercial-NL agent unit tests.
 */
// @ts-nocheck
jest.mock('@bitcode/generic-llms', () =>
  require('./support/generic-llms-mock').makeGenericLLMsMock(),
);

import {
  buildDeterministicCreateBody,
  hydrateMissingCreateBodies,
  listMissingCreatePaths,
} from '../agents/implementation/deposit-create-body-hydrate';
import {
  buildFallbackCommercialNl,
  buildCommercialNlPacket,
} from '../agents/implementation/deposit-implementation-agent-asset-packs-commercial-nl';
import {
  hasCommercialNl,
  isDepositPresentablePack,
  toDepositCommercialPack,
  toDepositMeasuredPack,
  toDepositPatchfilePack,
} from '../agents/implementation/deposit-implementation-pack-types';
import { writeDepositPatchfileArtifact } from '../agents/implementation/deposit-implementation-agent-asset-packs-patchfile';
import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

function fullCatalogAbsolutes(seedVolume = 0.2) {
  return DATA_PACK_ABSOLUTES_CATALOG.map((spec) => ({
    measurementKind: spec.measurementKind,
    label: spec.label,
    weight: spec.weight,
    volume: seedVolume,
    magnitude: seedVolume,
    unit: spec.unit,
    category: 'absolute',
    status: 'measured',
  }));
}

const PLAN = {
  kind: 'capability-slice',
  title: 'Session auth capability slice',
  summary:
    'A bounded, source-safe capability slice covering session authentication and token refresh flows for commercial deposit.',
  coveredSourcePaths: ['src/auth/session.ts', 'docs/auth-knowledge.md'],
  confidence: 0.8,
  patch: {
    fileChanges: [
      { path: 'src/auth/session.ts', op: 'modify' },
      { path: 'docs/auth-knowledge.md', op: 'create' },
    ],
    patchSummary: 'Encodes session lifecycle knowledge as modify + create.',
  },
};

describe('create body hydrate', () => {
  it('lists missing create paths and fills deterministic bodies', async () => {
    const bodies = new Map([['src/auth/session.ts', 'export const session = 1;\n']]);
    expect(listMissingCreatePaths(PLAN, bodies)).toEqual(['docs/auth-knowledge.md']);
    const result = await hydrateMissingCreateBodies(PLAN, bodies);
    expect(result.filled).toContain('docs/auth-knowledge.md');
    expect(bodies.get('docs/auth-knowledge.md')).toContain('Session auth capability slice');
    expect(listMissingCreatePaths(PLAN, bodies)).toEqual([]);
  });

  it('writeDepositPatchfileArtifact binds create + modify and skips delete', () => {
    const bodies = new Map([
      ['src/auth/session.ts', 'export const session = 1;\n'],
      ['docs/auth-knowledge.md', buildDeterministicCreateBody('docs/auth-knowledge.md', PLAN)],
    ]);
    const art = writeDepositPatchfileArtifact(PLAN, bodies);
    expect(art.bodiesComplete).toBe(true);
    expect(art.unifiedDiff).toContain('diff --git');
    expect(art.unifiedDiff).toContain('docs/auth-knowledge.md');
    expect(art.files.every((f) => f.op !== 'delete')).toBe(true);
  });
});

describe('presentable gate no-delete + bodiesComplete', () => {
  it('rejects delete ops and incomplete bodies', () => {
    const plan = toDepositPatchfilePack(PLAN);
    const withDelete = {
      ...plan,
      patchArtifact: {
        artifactId: 'a',
        assetPackId: 'b',
        schema: 's',
        productSchema: 'p',
        format: 'path-op-json',
        patchSummary: 'x',
        fileCount: 1,
        files: [{ path: 'f', op: 'delete' }],
        name: 'n',
        envelopeJson: '{}',
        bodiesComplete: true,
      },
    };
    const pack = toDepositMeasuredPack(withDelete as any, fullCatalogAbsolutes());
    expect(isDepositPresentablePack(pack)).toBe(false);

    const incomplete = {
      ...plan,
      patchArtifact: {
        artifactId: 'a',
        assetPackId: 'b',
        schema: 's',
        productSchema: 'p',
        format: 'path-op-json',
        patchSummary: 'x',
        fileCount: 1,
        files: [{ path: 'f', op: 'modify' }],
        name: 'n',
        envelopeJson: '{}',
        bodiesComplete: false,
      },
    };
    expect(
      isDepositPresentablePack(
        toDepositMeasuredPack(incomplete as any, fullCatalogAbsolutes()),
      ),
    ).toBe(false);
  });
});

describe('commercial NL', () => {
  it('fallback prose is rich; commercial packet includes full bodies for LLM', () => {
    const plan = toDepositPatchfilePack(PLAN);
    const withArt = {
      ...plan,
      patchArtifact: {
        artifactId: 'artifact-patch-test',
        assetPackId: 'ap-test',
        schema: 'bitcode.artifact.patch',
        productSchema: 'bitcode.artifact.patch.asset-pack',
        format: 'unified-diff',
        patchSummary: plan.patch.patchSummary,
        fileCount: 2,
        files: [
          { path: 'src/auth/session.ts', op: 'modify', body: 'x' },
          { path: 'docs/auth-knowledge.md', op: 'create', body: 'y' },
        ],
        name: 'a.patch',
        envelopeJson: '{"artifactId":"artifact-patch-test"}',
        bodiesComplete: true,
      },
    };
    const measured = toDepositMeasuredPack(withArt as any, fullCatalogAbsolutes());
    const fb = buildFallbackCommercialNl(measured);
    expect(fb.commercialTitle.length).toBeGreaterThanOrEqual(8);
    expect(fb.commercialDescription.length).toBeGreaterThanOrEqual(80);
    expect(fb.commercialDescription).not.toContain('export const');
    const commercial = toDepositCommercialPack(measured, fb);
    expect(hasCommercialNl(commercial)).toBe(true);
    expect(isDepositPresentablePack(commercial)).toBe(true);

    const packet = buildCommercialNlPacket([measured]) as any;
    // Provider input includes real bodies (source-safety is product/API, not LLM input).
    expect(packet.disclosureNote).toMatch(/SYNTHESIS_PROVIDER_INPUT/i);
    expect(packet.packs[0].patch.fileChanges[0].body).toBe('x');
    expect(packet.packs[0].patch.fileChanges[1].body).toBe('y');
    expect(typeof packet.packs[0].patch.unifiedDiff === 'string' || packet.packs[0].patch.unifiedDiff === null).toBe(
      true,
    );
    expect(Array.isArray(packet.packs[0].measurements.absolutes)).toBe(true);
  });
});

