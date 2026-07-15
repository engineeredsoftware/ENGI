#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const checks = [
  {
    file: '.specifications/BITCODE_SPEC_V28.md',
    needles: [
      'Gate 10: Read Request To Read-Need Comprehension',
      'ReadNeedComprehensionSynthesis',
      'ReadFitsFindingSynthesis',
      'request Read, synthesize a',
      'block Finding Fits until the Need',
    ],
    forbidden: ['ReadFindingFitsSynthesis'],
  },
  {
    file: '.specifications/BITCODE_SPEC_V28_PARITY_MATRIX.md',
    needles: [
      'Read Request capture',
      'Read-Need synthesis, review, and resynthesis',
      'ReadNeedComprehensionSynthesis',
      'ReadFitsFindingSynthesis',
    ],
    forbidden: ['ReadFindingFitsSynthesis'],
  },
  {
    file: '.qa/BITCODE_V28_QA.md',
    needles: [
      'ReadNeedComprehensionSynthesis',
      'ReadFitsFindingSynthesis',
      'fitsFindingAdmission.admitted=true',
    ],
    forbidden: ['ReadFindingFitsSynthesis', 'findingFitsAdmission'],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/read-need.ts',
    needles: [
      "schema: 'bitcode.read.request'",
      'export interface ReadNeedRequest',
      'previousReadNeed',
      'previousNeedId',
      'synthesizeReadNeedForPipelineInputWithInference',
      'admitReadFitsFinding',
    ],
    forbidden: ['admitReadFindingFits', 'ReadFindingFitsAdmission'],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
    needles: [
      'READ_NEED_COMPREHENSION_SYNTHESIS',
      'READ_FITS_FINDING_SYNTHESIS',
      'ReadFitsFindingSynthesis',
      'type PTRRAgentConfig',
      'listReadingPipelineTelemetryTrace',
      'factoryPTRRAgent',
      'thricifiedGenerationIds',
    ],
    forbidden: ['PptrAgentConfig', 'PtrrAgentConfig', 'READ_FINDING_FITS_SYNTHESIS', 'ReadFindingFitsSynthesis'],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/agents/setup/read-fits-finding-synthesis-setup-plan-agent.ts',
    needles: [
      'ReadFitsFindingSynthesisSetupPlanAgent',
      'ReadFitsFindingSynthesis.prompt.setup-plan',
    ],
    forbidden: ['asset-pack-setup-plan-agent', 'realSetupPlanAgent'],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/agents/setup/read-fits-finding-synthesis-read-comprehension-agent.ts',
    needles: [
      'ReadFitsFindingSynthesisReadComprehensionAgent',
      'ReadFitsFindingSynthesis.prompt.read-comprehension',
    ],
    forbidden: ['asset-pack-comprehend-read-agent', 'AssetPackComprehendReadAgent', 'bitcode-setup-read-comprehension'],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/agents/implementation/read-fits-finding-synthesis-asset-pack-synthesis-agent.ts',
    needles: [
      'ReadFitsFindingSynthesisAssetPackSynthesisAgent',
      'ReadFitsFindingSynthesis.prompt.asset-pack-synthesis',
    ],
    forbidden: ['asset-pack-synthesize-artifacts-agent', 'AssetPackSynthesizeArtifactsAgent'],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/phases/setup.ts',
    needles: [
      'setup:ReadFitsFindingSynthesisSetupPlanAgent',
      'setup:ReadFitsFindingSynthesisReadComprehensionAgent',
    ],
    forbidden: ['setup:asset-pack-setup-plan-agent', 'setup:asset-pack-comprehend-read-agent'],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/phases/implementation.ts',
    needles: [
      'implementation:ReadFitsFindingSynthesisAssetPackSynthesisAgent',
    ],
    forbidden: ['implementation:asset-pack-synthesize-artifacts-agent'],
  },
  {
    file: 'apps/uapi/app/api/read-review/route.ts',
    needles: [
      'synthesize_read_need',
      'resynthesize_read_need',
      'accept_read_need',
      'readRequest: readNeed.request',
      'pipelineTrace: listReadingPipelineTelemetryTrace',
      'READ_FITS_FINDING_SYNTHESIS',
      'fitsFindingAdmission',
    ],
    forbidden: ['READ_FINDING_FITS_SYNTHESIS', 'ReadFindingFitsSynthesis', 'findingFitsAdmission'],
  },
  {
    file: 'apps/uapi/app/ (removed cockpit tree) ProductDepositReadWorkbench.tsx',
    needles: [
      'Synthesize Read-Need',
      'Resynthesize with feedback',
      'Accept Read-Need',
      'Request Fit',
      'previousReadNeed',
      'fitsFindingAdmission',
    ],
    forbidden: ['ReadFindingFitsSynthesis', 'findingFitsAdmission', 'TerminalFitPipelineHarness', 'readFitProgress'],
  },
  {
    file: 'apps/uapi/tests/api/readReviewRoute.test.ts',
    needles: [
      'resynthesizes a Read-Need with feedback',
      'pipelineTrace',
      'previousNeedId',
    ],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/__tests__/read-need.test.ts',
    needles: [
      'carries Read Request lineage and feedback through resynthesis',
      'bitcode.read.request',
    ],
  },
];

const failures = [];

for (const check of checks) {
  const absolute = path.join(repoRoot, check.file);
  if (!fs.existsSync(absolute)) {
    failures.push(`${check.file}: missing`);
    continue;
  }

  const text = fs.readFileSync(absolute, 'utf8');
  for (const needle of check.needles) {
    if (!text.includes(needle)) {
      failures.push(`${check.file}: missing "${needle}"`);
    }
  }
  for (const forbidden of check.forbidden || []) {
    if (text.includes(forbidden)) {
      failures.push(`${check.file}: forbidden "${forbidden}"`);
    }
  }
}

if (failures.length) {
  console.error('V28 Gate 10 Read-Need comprehension check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('V28 Gate 10 Read-Need comprehension check passed.');
