/**
 * AssetPack Pipeline - Comprehend Read Agent
 *
 * Pipeline-local adapter for the generic Bitcode setup Read-comprehension
 * PTRR agent. Generic tools own callable analysis capabilities; the generic
 * agent composes those tools; this adapter stores setup-phase Read evidence
 * for downstream AssetPack synthesis phases.
 *
 * Inference is non-configurable: this adapter ALWAYS runs the real generic
 * comprehension agent. Determinism for tests comes from a boundary LLM mock.
 */

import { bitcodeSetupReadComprehensionAgent } from '@bitcode/generic-agents-read-comprehension';

export const ReadFitsFindingSynthesisReadComprehensionAgent = bitcodeSetupReadComprehensionAgent;

// Wrapper export that stores classification into execution state
export async function runReadFitsFindingSynthesisReadComprehensionAgent(input: any, execution: any) {
  const expressedRead =
    input?.read ??
    input?.expressedRead ??
    input?.definitionOfRead ??
    execution?.get?.('setup/read', 'expressed') ??
    execution?.get?.('setup/read-definition', 'definition') ??
    '';
  const agentInput = {
    ...input,
    read: expressedRead,
    expressedRead,
    phase: 'setup',
    beforeAgent: 'danger-wall'
  };
  const out = await ReadFitsFindingSynthesisReadComprehensionAgent(agentInput, execution);
  try {
    const result = out as any;
    const types = Array.isArray(result?.written_asset_types) && result?.written_asset_types.length
      ? result?.written_asset_types
      : [];
    if (types && types.length) {
      execution.store('setup', 'writtenAssetRequest', types);
      execution.store('setup/written-asset-request', 'type', types);
    }

    const readSatisfactionCriteria =
      result?.read_satisfaction_criteria ||
      result?.read_definition_analysis;
    if (readSatisfactionCriteria) {
      execution.store('setup/read', 'satisfactionCriteria', readSatisfactionCriteria);
      execution.store('setup/read-definition', 'analysis', readSatisfactionCriteria);
    }
    if (result?.read) {
      execution.store('setup/read', 'model', result.read);
      execution.store('setup/read-comprehension', 'model', result.read);
    }
    if (result?.comprehension) {
      execution.store('setup/read', 'comprehension', result.comprehension);
      execution.store('setup/read-comprehension', 'comprehension', result.comprehension);
      execution.store('setup/read-definition', 'comprehension', result.comprehension);
    }
    if (result?.entities) {
      execution.store('setup/read', 'entities', result.entities);
    }
    if (result?.toolEvidence) execution.store('setup/read-comprehension', 'toolEvidence', result.toolEvidence);
    if (result?.riskAdmissionInput) execution.store('setup/read-comprehension', 'riskAdmissionInput', result.riskAdmissionInput);
    if (result?.attachmentsComprehension) execution.store('setup/read-definition', 'attachmentsComprehension', result.attachmentsComprehension);
    if (result?.comprehended_multimodal_attachments)
      execution.store('setup/read-definition', 'attachmentsComprehension', result.comprehended_multimodal_attachments);
  } catch {}
  return out;
}

export const ReadFitsFindingSynthesisReadDefinitionComprehensionAgent = ReadFitsFindingSynthesisReadComprehensionAgent;
export default runReadFitsFindingSynthesisReadComprehensionAgent;
