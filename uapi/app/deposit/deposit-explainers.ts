import type { BitcodeExplainer } from '@/components/base/bitcode/execution/bitcode-transaction-types';

function buildExplainer(explainer: BitcodeExplainer): BitcodeExplainer {
  return explainer;
}

const DEPOSIT_SOURCE_REFS = [
  'uapi/app/deposit/DepositPageClient.tsx',
  'uapi/app/deposit/deposit-route-model.ts',
] as const;

const DEPOSIT_CANON_REFS = [
  'BITCODE_SPEC_V48_NOTES.md § V48 Gate 3 in progress',
] as const;

export const DEPOSIT_SECTION_EXPLAINERS = {
  options: buildExplainer({
    kicker: 'Options',
    title: 'Source-safe AssetPack proposals',
    summary:
      'Each card is one measured AssetPack option that SynthesizeAssetPacks produced from your connected source — a synthesized patch plus its absolute measurements, never a raw slice of your code.',
    detail:
      'Proposals show the synthesized contents (file changes + a natural-language summary) and the provenant source paths that informed them, alongside tool-measured sizes and a correctness estimate. Select one to admit it permanently to the Depository, or archive it (re-depositable later; stale measurements resynthesize).',
    points: [
      'Compare measured options before committing to one',
      'Check the neediness preview to see estimated future read demand',
      'Approve is a permanent, confirmed admission — archive is reversible',
    ],
    references: {
      source: [
        ...DEPOSIT_SOURCE_REFS,
        'packages/pipelines/asset-pack/src/asset-packs-synthesis-pipeline.ts',
        'packages/pipelines/asset-pack/src/deposit-option-real-synthesis.ts',
      ],
      canon: [
        ...DEPOSIT_CANON_REFS,
        'BITCODE_SPEC_V48_NOTES.md § Gate-3 depositing closure — tool-measured absolutes, decision-grade cards, config cleanup',
      ],
    },
  }),
  earnings: buildExplainer({
    kicker: 'Earnings',
    title: 'All-repositories supply estimate',
    summary:
      'An aggregate estimate of what your connected repositories could earn as Depository supply — likely reader demand, underserved (unfit-Need) opportunities, and an expected Bitcoin compensation range.',
    detail:
      'This rolls up every connected repository, not just the one selected above, so you can see where supplying a new AssetPack is most likely to be needed before you spend synthesis effort on it. Supply recommendations flag which candidates are approve-ready versus needing repair.',
    points: [
      'See which repositories are most likely to be read before depositing',
      'Gauge an expected Bitcoin compensation range across all supply',
      'Spot approve-ready versus repair-required recommendations',
    ],
    references: {
      source: [
        ...DEPOSIT_SOURCE_REFS,
        'packages/pipelines/asset-pack/src/depositor-earning-supply-intelligence.ts',
      ],
      canon: [
        ...DEPOSIT_CANON_REFS,
        'BITCODE_V48_QA.md § F24 — Neediness v0: deposit-side preview of read Need-fit (depository search during depositing)',
      ],
    },
  }),
  governance: buildExplainer({
    kicker: 'Governance',
    title: 'Organization authority',
    summary:
      'Whether this account is currently authorized to pay the Bitcoin fee that finalizes a deposit — organization, role, explicit grant, and policy all have to resolve before settlement is allowed.',
    detail:
      'Authority is fail-closed by design: a missing organization, role, permission grant, or policy confirmation each independently blocks payment. A solo operator with no organization configured will read as Denied here until that gap is closed — that is expected law, not a bug, but it does mean settlement stays blocked until it is addressed.',
    points: [
      'See exactly which authority requirement is blocking settlement',
      'Confirm wallet authority and deposit policy state before depositing',
      'Understand why a solo account may show Denied today',
    ],
    references: {
      source: [...DEPOSIT_SOURCE_REFS, 'packages/btd/src/authority.ts'],
      canon: [
        ...DEPOSIT_CANON_REFS,
        'BITCODE_V48_QA.md § F9 — Organization Authority permanently Denied for solo operators; no bootstrap path exists',
      ],
    },
  }),
  session: buildExplainer({
    kicker: 'Session',
    title: 'Source-safe deposit state',
    summary:
      'A source-safe readback of this deposit session — repository, branch, commit, transaction, pipeline/policy/admission identifiers, and option/compensation counts — with no raw source or prompt content.',
    detail:
      'Use this panel to confirm exactly what is selected and where the session stands before you commit to synthesizing or depositing. Every value here is an identifier, count, or hash — never file content, prompts, or provider responses.',
    points: [
      'Confirm the exact repository/branch/commit before depositing',
      'Check option, admission, and expected-compensation counts at a glance',
      'Everything shown here is source-safe by law',
    ],
    references: {
      source: DEPOSIT_SOURCE_REFS,
      canon: [
        ...DEPOSIT_CANON_REFS,
        'BITCODE_V48_QA.md § Gate 3 depositing — QA finalization runbook',
      ],
    },
  }),
};
