/**
 * AssetPack Pipeline Tool catalog (source list for preprocess registration)
 *
 * These are **Tool** instances only. At pipeline init they enter
 * `ExecutionPipelineToolRegistry` by name. DocCode (`__docCodePrompt`) is
 * optional Tool documentation for usable-tool docs — **not** a registration gate.
 *
 * Organized by phase for authoring; registration is one flat pipeline catalog.
 */

import { Tool } from '@bitcode/tools-generics';

// VCS and Repository Tools (always available)
import { assetPackCloneVCSRepositoryTool } from './AssetPackCloneVCSRepositoryTool';
import { bitcodeReadMeasurementComputerUseTool } from './BitcodeReadMeasurementComputerUseTool';
import { lexicalDepositorySearchTool } from './AssetPackLexicalDepositorySearchTool';
import { depositDepositoryAssetPackSearchTool } from './DepositDepositoryAssetPackSearchTool';
import { assetPackVerificationEvidenceTool } from './AssetPackVerificationEvidenceTool';
import { assetPackMultimodalProcessingTool } from './AssetPackMultimodalProcessingTool';
import { assetPackImageComprehensionTool } from './AssetPackImageComprehensionTool';
import { assetPackPDFComprehensionTool } from './AssetPackPDFComprehensionTool';
import { assetPackAudioComprehensionTool } from './AssetPackAudioComprehensionTool';
import { assetPackVideoComprehensionTool } from './AssetPackVideoComprehensionTool';
// Buyer-repo PR shipping tools live on settle-asset-pack-pipeline only
// (not SDIVF Finish). Do not reintroduce createPullRequest into synthesis.

// AssetPack tool policy:
// - MCP tool wrappers are disabled pending future pipeline configuration.
// - Computer use is internal, server-flagged, and limited to Read measurement.
// - LSP tools are ALWAYS available (not env-gated).

export const BITCODE_COMPUTER_USE_READ_MEASUREMENT_FLAG =
  'BITCODE_ENABLE_COMPUTER_USE_READ_MEASUREMENT' as const;

export function isComputerUseReadMeasurementEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.BITCODE_ENABLE_COMPUTER_USE_READ_MEASUREMENT === 'true';
}

let lspSemanticAnalysisEngine: Tool | undefined;
let lspCodeIntelligenceEngine: Tool | undefined;
let lspWorkspaceNavigationEngine: Tool | undefined;

// Disable provider MCP tool arrays until pipeline configuration enables them.
const awsTools: Tool[] = [];
const supabaseTools: Tool[] = [];
const vercelTools: Tool[] = [];

try {
  // Load LSP query tools unconditionally (best-effort)
  const m = require('@bitcode/generic-tools-lsp-query');
  // Map common LSP operations to semantic/code intelligence slots
  lspSemanticAnalysisEngine = m.documentSymbolsTool || m.referencesTool || m.hoverInfoTool;
  lspCodeIntelligenceEngine = m.codeActionsTool || m.completionTool || m.signatureHelpTool;
  lspWorkspaceNavigationEngine = m.workspaceSymbolsTool || m.definitionTool;
} catch { }

const present = (t: Tool | undefined): t is Tool => Boolean(t);
const optionalTools = (...tools: Array<Tool | undefined>): Tool[] => tools.filter(present);

// ==================== PHASE-SPECIFIC TOOL SETS ====================

/**
 * Setup Phase Tools
 * VCS operations, LSP initialization, security scanning
 */
export const SETUP_PHASE_TOOLS: Tool[] = [
  // VCS Operations
  // Use AssetPack wrapper for clone (merged doc-code prompt)
  assetPackCloneVCSRepositoryTool,
  // Multimodal comprehension (images, pdf, audio, video)
  assetPackMultimodalProcessingTool,
  assetPackImageComprehensionTool,
  assetPackPDFComprehensionTool,
  assetPackAudioComprehensionTool,
  assetPackVideoComprehensionTool,
  lexicalDepositorySearchTool,
  assetPackVerificationEvidenceTool,
  // Provider MCP tools disabled for GA‑1
  // LSP and Code Intelligence
  //lspSemanticAnalysisEngine,
  //lspCodeIntelligenceEngine,
  //lspWorkspaceNavigationEngine,
  // Additional providers appended later (post-GA‑1)
].filter(present);

/**
 * Discovery Phase Tools
 * File analysis, requirement extraction, complexity assessment
 */
export const DISCOVERY_PHASE_TOOLS: Tool[] = [
  lexicalDepositorySearchTool,
  depositDepositoryAssetPackSearchTool,
  assetPackVerificationEvidenceTool,
  ...optionalTools(
    lspSemanticAnalysisEngine,
    lspCodeIntelligenceEngine,
    lspWorkspaceNavigationEngine,
  ),
].filter(present);

/**
 * Internal Read-measurement computer-use registry.
 *
 * This is intentionally not mounted in product action controls and is not a
 * general implementation/Delivering capability. The tool surface can expand
 * after the Read measurement contract is fully proven.
 */
export function getComputerUseReadMeasurementTools(
  env: NodeJS.ProcessEnv = process.env,
): Tool[] {
  return isComputerUseReadMeasurementEnabled(env)
    ? [bitcodeReadMeasurementComputerUseTool]
    : [];
}

/**
 * Implementation Phase Tools
 * File editing, code generation, VCS operations
 */
export const IMPLEMENTATION_PHASE_TOOLS: Tool[] = [
].filter(present);

/**
 * Validation Phase Tools
 * Testing, quality checks, security validation
 */
export const VALIDATION_PHASE_TOOLS: Tool[] = [
].filter(present);

/**
 * Finish tools (SDIVF). Review upload / store / ledgerize only.
 * PR shipping is settle-asset-pack-pipeline `ship-asset-pack-patch-pr`.
 */
export const FINISH_PHASE_TOOLS: Tool[] = [].filter(present);

// ==================== AGENT-SPECIFIC TOOL MAPPINGS ====================

/**
 * Get tools for specific agent by name
 */
export function getAssetPackPipelineToolsForAgent(agentName: string): Tool[] {
  const agentToolMappings: Record<string, Tool[]> = {
    // Setup Phase
    'asset-pack-clone-vcs-repository-tools': [assetPackCloneVCSRepositoryTool],
    'asset-pack-clone-vcs-repository-agent': [assetPackCloneVCSRepositoryTool],
    //'initialize-lsp': [lspSemanticAnalysisEngine, lspCodeIntelligenceEngine, lspWorkspaceNavigationEngine],
    //'danger-wall': [],
    'asset-pack-comprehend-read-definition-agent': [
      assetPackMultimodalProcessingTool,
      assetPackImageComprehensionTool,
      assetPackPDFComprehensionTool,
      assetPackAudioComprehensionTool,
      assetPackVideoComprehensionTool,
    ],
    'asset-pack-ready-to-iterate-agent': [],
    'bitcode-read-risk-admission': [
      lexicalDepositorySearchTool,
      assetPackVerificationEvidenceTool,
    ],

    // Discovery Phase
                'asset-pack-plan-implementation-agent': [lexicalDepositorySearchTool],
    'asset-pack-digest-codebase-agent': [],
    'asset-pack-research-web-agent': [],
    // Deposit Discovery roster keys (one entry each; factory names only if tools resolve by agent class).
    'DepositCodebaseComprehensionAgent': optionalTools(
      lspSemanticAnalysisEngine,
      lspCodeIntelligenceEngine,
      lspWorkspaceNavigationEngine,
    ),
    'discovery:comprehend-codebase': optionalTools(
      lspSemanticAnalysisEngine,
      lspCodeIntelligenceEngine,
      lspWorkspaceNavigationEngine,
    ),
    'DepositDepositorySearchForRelevantsAgent': [
      depositDepositoryAssetPackSearchTool,
      lexicalDepositorySearchTool,
    ],
    'DepositDepositorySearchAgent': [depositDepositoryAssetPackSearchTool, lexicalDepositorySearchTool],
    'discovery:search-depository-for-deposit-relevants': [
      depositDepositoryAssetPackSearchTool,
      lexicalDepositorySearchTool,
    ],
    'ReadDepositorySearchForNeedFitsAgent': [
      depositDepositoryAssetPackSearchTool,
      lexicalDepositorySearchTool,
    ],
    'discovery:search-depository-for-read-need-fits': [
      depositDepositoryAssetPackSearchTool,
      lexicalDepositorySearchTool,
    ],
    'discovery:inherent-regurgitation': [],
    'DepositInherentRegurgitationAgent': [],

    // Implementation Phase (roster key + factory name when tools bind by either)
    'ReadFitsFindingSynthesisAssetPackSynthesisAgent': [],
    'implementation:ReadFitsFindingSynthesisAssetPackSynthesisAgent': [],
    'implementation:deposit-asset-pack-synthesis': [],
    'DepositAssetPackSynthesisAgent': [],

    // Validation Phase
    'asset-pack-validate-last-iterations-validation-phase-agent': optionalTools(lspSemanticAnalysisEngine),
    'asset-pack-validate-discovery-phase-agent': optionalTools(lspSemanticAnalysisEngine),
    'asset-pack-validate-synthesis-artifacts-agent': optionalTools(lspSemanticAnalysisEngine),
    'asset-pack-validation-ready-to-finish-agent': [],
    'asset-pack-ready-to-finish-agent': [],
    'validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline': [],
    'validation:asset-pack-ready-to-finish-agent': [],

    // Internal Read-measurement computer-use option
    'read-measurement:computer-use-evidence-agent': getComputerUseReadMeasurementTools(),

    // Finish Phase (SDIVF: store / ledgerize / synthesize-run / review upload).
    // Buyer-repo PR tools are settle-asset-pack-pipeline only (not Finish).
    'finish:store-artifacts': [],
    'finish:ledgerize': [],
    'finish:finish-synthesize-asset-packs-for-deposit-run': [],
    'finish:finish-synthesize-asset-packs-for-read-run': [],
    'finish:upload-asset-packs-for-review': [],
    'finish:asset-pack-completion': [],
  };

  return agentToolMappings[agentName] || [];
}

/**
 * Get all tools for a phase.
 */
export function getToolsForPhase(phase: string): Tool[] {
  const phaseToolMappings: Record<string, Tool[]> = {
    setup: SETUP_PHASE_TOOLS,
    //discovery: DISCOVERY_PHASE_TOOLS,
    //implementation: IMPLEMENTATION_PHASE_TOOLS,
    //validation: VALIDATION_PHASE_TOOLS,
    finish: FINISH_PHASE_TOOLS
  };

  return phaseToolMappings[phase] || [];
}

/**
 * Get tools that support short-circuiting
 */
export function getShortCircuitTools(): Tool[] {
  return [
    //shortCircuitHandler, executionStateManager
  ];
}

/**
 * Export all tools for the AssetPack pipeline registry.
 */
export const ALL_ASSET_PACK_TOOLS: Tool[] = [
  ...new Set([
    ...SETUP_PHASE_TOOLS,
    ...DISCOVERY_PHASE_TOOLS,
    ...IMPLEMENTATION_PHASE_TOOLS,
    ...VALIDATION_PHASE_TOOLS,
    ...FINISH_PHASE_TOOLS
  ])
];
