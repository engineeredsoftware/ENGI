import { telemetry } from './telemetry.js';

/**
 * @param {any} state
 * @returns {any}
 */
export function buildDemoScenario(state) {
  const defaultOrg = state.licenses.find((/** @type {any} */ item) => item.orgId === 'demo-ai-lab') || state.licenses[0] || null;
  const objective = 'Demonstrate that the depot is openly writable, measurably readable, provable, and valuable for a buyer running a production auth incident.';
  const query = 'enterprise auth migration rollback for monorepo services with issuer mismatch';

  const scenario = {
    title: 'Bitcode gold-path demo',
    objective,
    query,
    defaultOrgId: defaultOrg?.orgId || null,
    stages: [
      {
        id: 'write',
        label: 'Openly writable',
        operatorLine: 'Show the public commitments table. Point out that anyone can deposit an engineering asset, but the full payload remains sealed.'
      },
      {
        id: 'read',
        label: 'Measurably readable',
        operatorLine: 'Run the licensed query for a buyer facing an auth-incident rollback. Show that the system assembles a read-matched private bundle based on measured contribution, not just asset existence.'
      },
      {
        id: 'prove',
        label: 'Provable',
        operatorLine: 'Show public issuance, ranking explanation, conservation, schema, policy, proof-log, and attestation panels. Emphasize that the system emits inspectable receipts and conserved economic consequences.'
      },
      {
        id: 'value',
        label: 'Valuable',
        operatorLine: 'Finish the demo on the utility receipt and benchmark lift panel. The final claim should be that the licensed read improved the buyer\'s remediation system and made it more likely to ship a safe fix under pressure, not merely that a bundle was issued.'
      }
    ]
  };

  telemetry('bitcode.buildDemoScenario', {
    defaultOrgId: scenario.defaultOrgId,
    stageIds: scenario.stages.map((/** @type {any} */ stage) => stage.id),
    assetCount: state.assets?.length,
    licenseCount: state.licenses?.length
  });

  return scenario;
}
