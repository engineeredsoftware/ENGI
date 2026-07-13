import { sha256, nowIso } from './bitcode-core.js';

export function buildAttestationSnapshot() {
  const gitCommit = 'demo-cff6dc9';
  const imageDigest = `sha256:${sha256('bitcode-demo-image')}`;
  const policyDigest = `sha256:${sha256('bitcode-policy-release-v1')}`;
  const verifierDigest = `sha256:${sha256('bitcode-demo-verifier')}`;

  return {
    deploymentId: `deploy_${sha256(`${gitCommit}:${imageDigest}`).slice(0, 10)}`,
    builtAt: nowIso(),
    gitCommit,
    imageDigest,
    verifierDigest,
    policyDigest,
    provenance: {
      buildSystem: 'github-actions (modeled)',
      predicateType: 'https://slsa.dev/provenance/v1',
      sourceRepo: 'workspace/bitcode',
      builderIdentity: 'github-actions/demo-workflow',
      attestationStatus: 'modeled-demo'
    },
    runtimeClaims: [
      'Receipts reference the current deployment id.',
      'Measurement logic is deterministic within this prototype shell.',
      'Private bundle content is disclosed only on licensed issuance responses.'
    ]
  };
}
