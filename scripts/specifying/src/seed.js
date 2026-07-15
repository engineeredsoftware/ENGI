import { makeAssetCommitment, seedLicense } from './bitcode-core.js';
import { telemetry } from './telemetry.js';

export function initialState() {
  const assets = [
    makeAssetCommitment({
      title: 'Enterprise auth migration rollback playbook',
      author: 'Garrett',
      organization: 'Bitcode',
      tags: ['auth', 'migration', 'rollback', 'monorepo', 'enterprise'],
      sourceType: 'runbook',
      compileOk: true,
      testsOk: true,
      proofOk: true,
      noveltyBp: 2400,
      demandBp: 3200,
      antiNoiseBp: 1900,
      content: `Objective: recover an enterprise monorepo auth migration without leaving half-migrated services or invalid sessions in production.\n\nProcedure: freeze writes, capture a signed migration snapshot, validate token issuer compatibility, restore prior verifier configuration, replay only idempotent schema steps, and re-enable traffic behind a kill switch.\n\nGuardrail: every rollback step must preserve session validation invariants and emit an audit receipt that ties environment, commit, and migration batch together.\n\nBuyer value: this artifact cuts mean time to safe rollback during a revenue-sensitive auth incident and gives downstream agents a high-confidence recovery path instead of generic advice.`
    }),
    makeAssetCommitment({
      title: 'Proof-carrying session validator patch kit',
      author: 'Eve',
      organization: 'Bitcode',
      tags: ['rust', 'proof', 'validator', 'safety', 'patch'],
      sourceType: 'crate',
      compileOk: true,
      testsOk: true,
      proofOk: true,
      noveltyBp: 2500,
      demandBp: 2900,
      antiNoiseBp: 1800,
      content: `Contract: session validation lookups must not panic, must preserve index bounds, and must never accept expired or issuer-mismatched entries.\n\nImplementation note: replace unchecked indexing with guarded access, propagate Result and Option values, and prove that cache eviction preserves validator invariants.\n\nVerification summary: cargo test passes, cargo creusot prove passes, and the proof logs show no overflow or assertion failures under the contract preconditions.\n\nBuyer value: this gives an AI remediation system a proof-backed patch pattern it can reuse under production pressure.`
    }),
    makeAssetCommitment({
      title: 'Token issuer incident escalation notes',
      author: 'Avery',
      organization: 'Bitcode',
      tags: ['issuer', 'incident-response', 'runbook', 'escalation'],
      sourceType: 'notes',
      compileOk: false,
      testsOk: true,
      proofOk: false,
      noveltyBp: 1700,
      demandBp: 2500,
      antiNoiseBp: 1600,
      content: `Incident pattern: auth migration changed issuer and audience validation together, which broke pre-migration services still pinned to the previous JWKS endpoint.\n\nRecovery pattern: split issuer migration from audience migration, ship an explicit compatibility window, and add a runtime audit that rejects mixed config before rollout.\n\nOperator note: most failed recoveries came from restoring schema before restoring validator config.\n\nBuyer value: this note shortens on-call diagnosis by telling the reader where prior recoveries actually failed.`
    })
  ];

  const licenses = [
    seedLicense({ orgId: 'demo-ai-lab', orgName: 'Frontier Code Systems', units: 900 }),
    seedLicense({ orgId: 'bitcode-internal', orgName: 'Bitcode Internal', units: 1500 })
  ];

  const state = {
    version: 1,
    assets,
    licenses,
    receipts: [],
    balances: Object.fromEntries(assets.map((asset) => [asset.author, 0])),
    utilityLedger: {}
  };

  telemetry('bitcode.initialState', {
    assetIds: assets.map((asset) => asset.assetId),
    licenseIds: licenses.map((license) => license.licenseId),
    balanceAuthors: Object.keys(state.balances)
  });

  return state;
}
