import { sha256 } from './bitcode-core.js';

export function currentPolicyRelease() {
  const policy = {
    version: 'bitcode-policy-v0.2',
    scoringWeights: {
      quantity: 0.2,
      quality: 0.45,
      valence: 0.35,
      lexicalQueryMatch: 0.55,
      assetMeasurementCarry: 0.45
    },
    trustedBoundary: [
      'canonical serialization',
      'measurement normalization',
      'license validity checks',
      'allocation conservation',
      'receipt hashing and schema binding'
    ],
    untrustedBoundary: [
      'query wording',
      'chunking heuristics',
      'retrieval overlap heuristic',
      'benchmark harness implementation',
      'operator-authored asset content'
    ],
    claims: [
      'The prototype proves deterministic economic consequences, not perfect semantic truth.',
      'Only licensed issuance reveals private bundle payloads.',
      'Allocation must conserve metered units exactly.'
    ]
  };

  return {
    ...policy,
    policyHash: `sha256:${sha256(JSON.stringify(policy))}`
  };
}
