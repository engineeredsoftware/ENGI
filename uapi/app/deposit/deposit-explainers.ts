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
  readback: buildExplainer({
    kicker: 'Readback',
    title: 'Recent Deposit activity',
    summary:
      'A source-safe journal of your recent deposit runs — requests, syntheses, and review decisions — the ledgerized activity history for this account.',
    detail:
      'Rows here are your personal deposit history (requests, archived options, connected sources); an admitted AssetPack additionally appears in the network-wide Depository feed once approved. Refresh to pull the latest runs.',
    points: [
      'Audit what you have deposited, archived, or requested before',
      'Confirm a run actually persisted after synthesis completes',
      'Jump back into an in-progress deposit from where you left off',
    ],
    references: {
      source: [...DEPOSIT_SOURCE_REFS, 'uapi/app/deposit/deposit-route-model.ts'],
      canon: DEPOSIT_CANON_REFS,
    },
  }),
  repository: buildExplainer({
    kicker: 'Repository',
    title: 'Select the repository you are depositing',
    summary:
      'One connected repository, branch, and commit form the exact source package the rest of Deposit reads — the Host clones this precise revision and measures the full checkout, not a sample.',
    detail:
      'Picking a different repository, branch, or commit here invalidates any prior synthesis for the old selection: the deposit route re-derives its source state from whatever is selected, so a fresh Synthesize options run is needed after a change.',
    points: [
      'Search across every repository your connected provider account can see',
      'Anchor a repository into the activity ledger for quick reuse later',
      'A private repository still measures fully — only synthesis outputs are ever reviewed',
    ],
    references: {
      source: ['uapi/app/deposit/DepositSourceSelection.tsx', 'uapi/app/terminal/terminal-repository-context.ts'],
      canon: [
        ...DEPOSIT_CANON_REFS,
        'BITCODE_SPEC_V48_NOTES.md § Gate-3 HOST architecture — the primitive Host, its kinds, in-host execution',
      ],
    },
  }),
  branch: buildExplainer({
    kicker: 'Branch',
    title: 'Repository source branch',
    summary:
      'The branch whose latest state gets measured. The repository\'s default branch is selected automatically when available.',
    detail:
      'Changing branch reloads the commit list for that branch and clears any previously selected commit, since a commit only makes sense in the context of the branch it belongs to.',
    points: ['Defaults to the repository\'s default branch', 'Reloads commits for the newly selected branch'],
    references: { source: ['uapi/app/deposit/DepositSourceSelection.tsx'], canon: DEPOSIT_CANON_REFS },
  }),
  commit: buildExplainer({
    kicker: 'Commit / ref',
    title: 'Repository source commit',
    summary:
      'The exact commit synthesis measures against — pins the source package to one immutable revision rather than a moving branch head.',
    detail:
      'The branch\'s latest commit is selected automatically when available. Picking an older commit is useful for reproducing or auditing a prior synthesis run against the exact state it saw.',
    points: ['Pins synthesis to one immutable revision', 'Useful for reproducing a past run\'s exact source state'],
    references: { source: ['uapi/app/deposit/DepositSourceSelection.tsx'], canon: DEPOSIT_CANON_REFS },
  }),
  obfuscations: buildExplainer({
    kicker: 'Option synthesis',
    title: 'Obfuscations',
    summary:
      'Everything SynthesizeAssetPacks needs to know before it measures your source: what to withhold, hints about where sensitive paths live, and a hard fail-closed exclusion list.',
    detail:
      'This replaces the earlier "depositor instructions" naming — the Setup phase\'s input-comprehension agent reads these fields to derive structured obfuscation guidance before any measurement happens, alongside the protected-IP exclusions enforced independently at both ends of the pipeline.',
    points: [
      'Set guidance before synthesizing, not after — it shapes what gets measured',
      'Protected-IP exclusions are enforced fail-closed regardless of what the model does',
      'Re-synthesizing re-reads these fields against the current source',
    ],
    references: {
      source: [
        ...DEPOSIT_SOURCE_REFS,
        'packages/pipelines/asset-pack/src/phases/setup.ts',
        'packages/pipelines/asset-pack/src/agents/setup/deposit-input-comprehension-agent.ts',
      ],
      canon: [
        ...DEPOSIT_CANON_REFS,
        'BITCODE_SPEC_V48_NOTES.md § Gate 3 in progress: synthesis pipeline algorithmic + telemetric correctness',
      ],
    },
  }),
  whatToObfuscate: buildExplainer({
    kicker: 'Option synthesis',
    title: 'What to obfuscate or withhold',
    summary:
      'Free-text guidance on what synthesis should avoid surfacing — naming, business logic, or concepts you would rather AssetPack summaries not reference directly.',
    detail:
      'This is guidance for the model\'s framing, not a hard technical boundary — for a guaranteed, fail-closed exclusion, use Protected IP exclusions below instead. The Setup phase\'s input-comprehension agent turns this into structured guidance the rest of the pipeline honors.',
    points: ['Shapes how synthesized options are framed and worded', 'Pair with Protected IP exclusions for a hard boundary'],
    references: {
      source: ['packages/pipelines/asset-pack/src/agents/setup/deposit-input-comprehension-agent.ts'],
      canon: DEPOSIT_CANON_REFS,
    },
  }),
  sourcePathHints: buildExplainer({
    kicker: 'Option synthesis',
    title: 'Source path hints',
    summary:
      'Optional pointers (one per line or comma-separated) to paths or concepts worth flagging — used to estimate this deposit\'s criticality and cost, not to change what synthesis measures.',
    detail:
      'Hints that look sensitive (mentioning secrets, credentials, wallets, auth, keys, payments, or settlement) raise a review warning and nudge the deposit\'s estimated development cost and expected settlement upward — a client-side heuristic, not a synthesis-time exclusion.',
    points: [
      'Distinct from Protected IP exclusions — this only informs review/cost estimates',
      'Sensitive-sounding hints trigger a "requires review" warning',
    ],
    references: { source: DEPOSIT_SOURCE_REFS, canon: DEPOSIT_CANON_REFS },
  }),
  protectedIpExclusions: buildExplainer({
    kicker: 'Option synthesis',
    title: 'Protected IP exclusions (one per line)',
    summary:
      'The hard, fail-closed boundary: paths and concepts listed here never enter AssetPack knowledge synthesis at all.',
    detail:
      'Excluded paths are removed from the source inventory before any prompt is built, and any candidate whose covered paths touch an exclusion (or cite paths outside the real inventory) is dropped after inference — enforced independently at both ends of the pipeline, not just by model instruction-following.',
    points: [
      'Excluded content never reaches the model, not even as a prompt reference',
      'Violating candidates are dropped after synthesis as a second, independent check',
    ],
    references: {
      source: DEPOSIT_SOURCE_REFS,
      canon: [
        ...DEPOSIT_CANON_REFS,
        'BITCODE_V48_QA.md § F14 — No protected-IP exclusion instructions for deposit synthesis',
      ],
    },
  }),
  synthesisTelemetry: buildExplainer({
    kicker: 'AssetPacksSynthesis',
    title: 'Synthesis run telemetry',
    summary:
      'A live, source-safe stream of the SynthesizeAssetPacks pipeline actually running — every phase, agent, step, and LLM/tool call, with prompt and response content withheld by law.',
    detail:
      'Rows appear only for completed LLM calls and tool uses, each carrying its full Phase→Agent→Step→Failsafe→Thinkings hierarchy; the processing indicator underneath shows what is currently running and how long since the last update, so a genuine stall is visible instead of an unexplained gap. Use "Copy raw logs" to grab the full run for support/debugging.',
    points: [
      'Watch which phase/agent is running in real time',
      'The processing indicator flags a likely stall after ~90s of silence',
      'Copy raw logs exports the full source-safe run for debugging',
    ],
    references: {
      source: [
        ...DEPOSIT_SOURCE_REFS,
        'packages/pipelines-generics/src/streaming/pipeline-stream-integration.ts',
        'uapi/components/base/bitcode/execution/pipeline-execution-log.tsx',
      ],
      canon: [
        ...DEPOSIT_CANON_REFS,
        'BITCODE_SPEC_V48_NOTES.md § Gate 3 in progress: synthesis pipeline algorithmic + telemetric correctness',
      ],
    },
  }),
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
