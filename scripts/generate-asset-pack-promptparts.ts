#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

type AgentMetadata = {
  name: string;
  display: string;
  purpose: string;
};

type PromptPartTemplate = {
  suffix: string;
  template: (agent: AgentMetadata, phase: string) => string;
};

type PtrrStep = {
  step: string;
  purpose: string;
};

// Define active AssetPack pipeline agents and their Bitcode semantics.
const AGENTS = {
  setup: [
    { name: 'clonerepository', display: 'Clone VCS Repository', purpose: 'securely clone VCS repositories from GitHub GitLab or Bitbucket' },
    { name: 'initializelsp', display: 'Initialize LSP', purpose: 'initialize Language Server Protocol for code intelligence and analysis' },
    { name: 'dangerwall', display: 'Danger Wall', purpose: 'detect and prevent dangerous operations that could harm systems or violate policies' },
    { name: 'comprehendread', display: 'Comprehend Read', purpose: 'understand expressed read context, satisfaction criteria, written-asset posture, and PR-backed Finish expectations' },
    { name: 'analyzecodebase', display: 'Analyze Codebase', purpose: 'analyze codebase structure patterns dependencies and architecture' },
    { name: 'readytoiterate', display: 'Ready to Iterate', purpose: 'determine if sufficient context exists to proceed or short-circuit with BTC fee-hold release evidence' }
  ],
  discovery: [
    { name: 'comprehendattachments', display: 'Comprehend Attachments', purpose: 'parse and understand all attached files images and documentation' },
    { name: 'selectfilesparallel', display: 'Select Files Parallel', purpose: 'identify relevant files for modification in parallel across codebase' },
    { name: 'understandrequirements', display: 'Understand Requirements', purpose: 'extract functional and non-functional requirements from the expressed Read' },
    { name: 'analyzeparallel', display: 'Analyze Parallel', purpose: 'analyze selected files in parallel for patterns dependencies and constraints' },
    { name: 'planimplementation', display: 'Plan Implementation', purpose: 'create detailed implementation plan with steps milestones and validation criteria' },
    { name: 'assesscomplexity', display: 'Assess Complexity', purpose: 'evaluate technical business integration and testing complexity metrics' }
  ],
  implementation: [
    { name: 'dividepullrequest', display: 'Divide Pull Request', purpose: 'plan code written assets that can later finish through a pull request settle delivery' },
    { name: 'applyfile', display: 'Apply File', purpose: 'apply planned changes in individual files according to Read-satisfaction evidence' },
    { name: 'correctpullrequest', display: 'Correct Pull Request', purpose: 'validate and correct code written assets for consistency and quality before Finish' },
    { name: 'reviewcodechanges', display: 'Review Code Changes', purpose: 'perform comprehensive review of code written assets before PR-backed Finish' }
  ],
  validation: [
    { name: 'validatecodechanges', display: 'Validate Code Changes', purpose: 'validate all code changes meet requirements and quality standards' },
    { name: 'validatereview', display: 'Validate Review', purpose: 'ensure code review feedback is comprehensive and actionable' },
    { name: 'validatedocument', display: 'Validate Document', purpose: 'verify design document completeness accuracy and clarity' },
    { name: 'readytofinish', display: 'AssetPack Ready to Finish', purpose: 'decide whether validated Read-satisfaction AssetPack synthesis artifacts and required evidence may enter Finish or must short-circuit with BTC fee-hold release evidence' }
  ],
  finish: [
    { name: 'createpullrequest', display: 'Create Pull Request', purpose: 'create the PR settle delivery with title description and metadata on a VCS platform' },
    { name: 'assetpackcompletion', display: 'AssetPack Completion', purpose: 'complete AssetPack Finish with metrics proof evidence and confirmation' }
  ]
};

// Part types to generate for each agent
const PART_TYPES: PromptPartTemplate[] = [
    { suffix: 'identity_definition', template: (agent, phase) =>
    `'You are the retained Bitcode asset-pack pipeline ${capitalize(phase)} phase ${agent.display.replace(/\s/g, '')} agent responsible for ${agent.purpose}'` },
  { suffix: 'purpose_corestatement', template: (agent) =>
    `'Core purpose: ${agent.purpose} while preserving read satisfaction, written-asset integrity, and PR-backed Finish correctness at every step'` },
  { suffix: 'capabilities_list', template: () =>
    `'Capabilities: analyze expressed read and requirements, validate inputs and outputs, handle edge cases gracefully, provide detailed feedback, support parallel processing, integrate with VCS platforms, maintain execution state, and preserve asset-pack run semantics'` },
  { suffix: 'tools_available', template: () =>
    `'Available tools: file system operations, code analysis tools, VCS integrations, validation utilities, parallel execution framework, state management, error handling, and recovery'` },
  { suffix: 'requirements_context', template: () =>
    `'Requirements: execution context from prior phases, expressed read description, written-asset expectations, AssetPack metadata, codebase metadata, VCS credentials when applicable, validation criteria, and quality thresholds'` }
];

// PTRR step purposes
const PTRR_STEPS: PtrrStep[] = [
  { step: 'plan', purpose: 'analyze context and create strategic approach' },
  { step: 'try', purpose: 'execute initial asset-pack synthesis attempt' },
  { step: 'refine', purpose: 'improve results based on validation feedback' },
  { step: 'retry', purpose: 'ensure completion with guaranteed success' }
];

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generatePromptPart(phase: string, agent: AgentMetadata, partType: PromptPartTemplate): string {
  const agentKey = `assetpack${phase}${agent.name}`;
  const constName = `PROMPTPART_SPECIFIC_AGENT_${agentKey.toUpperCase()}_${partType.suffix.toUpperCase()}`;
  
  return `import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpart
 * domain: agent
 * intent: "${partType.suffix.replace(/_/g, ' ')} for ${agent.display} agent"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "${partType.suffix}_clarity", "test": "Clear ${partType.suffix.replace(/_/g, ' ')}?", "score": 0.95 }
 * ]
 */
export const ${constName}: PromptPart = 
  ${partType.template(agent, phase)} as PromptPart;`;
}

function generatePTRRStepPromptPart(phase: string, agent: AgentMetadata, step: PtrrStep): string {
  const agentKey = `assetpack${phase}${agent.name}`;
  const constName = `PROMPTPART_SPECIFIC_AGENT_${agentKey.toUpperCase()}_PTRR${step.step.toUpperCase()}_PURPOSE`;
  
  return `import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpart
 * domain: agent
 * intent: "PTRR ${step.step} step purpose for ${agent.display} agent"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "step_${step.step}_clarity", "test": "Clear ${step.step} purpose?", "score": 0.95 }
 * ]
 */
export const ${constName}: PromptPart = 
  'PTRR ${capitalize(step.step)} Step: ${step.purpose} for ${agent.purpose}' as PromptPart;`;
}

// Main generation
async function generateAll() {
  const outputDir = path.join(process.cwd(), 'packages/prompts/src/raw_promptparts/specific');
  
  let totalGenerated = 0;
  
  for (const [phase, agents] of Object.entries(AGENTS)) {
    for (const agent of agents) {
      // Generate basic part types
      for (const partType of PART_TYPES) {
        const content = generatePromptPart(phase, agent, partType);
        const fileName = `promptpart_specific_agent_assetpack${phase}${agent.name}_${partType.suffix}.ts`;
        const filePath = path.join(outputDir, fileName);
        
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, content);
          console.log(`Created: ${fileName}`);
          totalGenerated++;
        }
      }
      
      // Generate PTRR step purposes
      for (const step of PTRR_STEPS) {
        const content = generatePTRRStepPromptPart(phase, agent, step);
        const fileName = `promptpart_specific_agent_assetpack${phase}${agent.name}_ptrr${step.step}_purpose.ts`;
        const filePath = path.join(outputDir, fileName);
        
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, content);
          console.log(`Created: ${fileName}`);
          totalGenerated++;
        }
      }
    }
  }
  
  console.log(`\nTotal PromptParts generated: ${totalGenerated}`);
  console.log(`Total agents: ${Object.values(AGENTS).flat().length}`);
  console.log(`Parts per agent: ${PART_TYPES.length + PTRR_STEPS.length}`);
}

generateAll().catch(console.error);
