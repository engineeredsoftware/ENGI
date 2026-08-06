# Bitcode Spec V48 Proven

- canonicalVersion: `V48`
- canonicalCommit: `61ae9ddcfcd6d90da637ecad8edd2c7bc22ff840`
- canonicalCommitRecordedAt: `2026-08-06T12:00:00-07:00`
- worktreeState: `clean`
- generatorId: `bitcode.proven-generator.v1`
- generatedAt: `2026-08-06T12:00:00-07:00`
- outputPath: `.specifications/BITCODE_SPEC_V48_PROVEN.md`
- scenarioIds: `auth-issuer-rollback`, `rust-validator-proof-gap`, `config-policy-precedence-incident`, `unsafe-patch-review-recovery`, `infra-deployment-mismatch`, `privacy-boundary-proof-export`, `polyglot-gateway-benchmark-remediation`, `auth-many-asset-normalization`
- branchModes: `patch`, `context`

## Aggregate Verdict

- fullyProven: `true`
- runCount: `16`
- familyCount: `9`
- theoremCount: `58`
- memberCount: `46`
- artifactDigestCount: `736`

## Proof Family Inventory

| proofFamily | proofArtifactPath | memberCount | theoremCount | witnessArtifactCount | replayArtifactCount | replayStepCount |
| --- | --- | --- | --- | --- | --- | --- |
| `inference-synthesis` | `.proofs/_shared/inference-synthesis-proof.json` | 5 | 6 | 6 | 7 | 3 |
| `prompt-completeness` | `.proofs/_shared/prompt-completeness-proof.json` | 5 | 8 | 5 | 5 | 4 |
| `static-code-analysis` | `.proofs/_shared/static-measurement-proof.json` | 4 | 5 | 5 | 5 | 3 |
| `verification-decisions` | `.proofs/_shared/verification-decisions-proof.json` | 5 | 7 | 3 | 3 | 2 |
| `selection-and-materialization` | `.proofs/_shared/selection-and-materialization-proof.json` | 5 | 7 | 7 | 7 | 2 |
| `authorization-and-sensitive-flow` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | 5 | 6 | 6 | 6 | 2 |
| `settlement-source-to-shares` | `.proofs/_shared/settlement-source-to-shares-proof.json` | 8 | 8 | 8 | 8 | 2 |
| `disclosure-boundary` | `.proofs/_shared/disclosure-boundary-proof.json` | 4 | 5 | 5 | 5 | 2 |
| `proof-contract` | `.proofs/_shared/proof-contract.json` | 5 | 6 | 3 | 3 | 3 |

## Family Details

### inference-synthesis

- proofArtifactPath: `.proofs/_shared/inference-synthesis-proof.json`
- witnessArtifactPaths: `.proofs/_shared/inference-moment-contracts.json`, `.proofs/_shared/inference-proofs.json`, `.proofs/_shared/prompt-implementation-surface.json`, `.proofs/_shared/prompt-surfaces.json`, `.proofs/_shared/parsed-completion-envelopes.json`, `.proofs/_shared/inference-synthesis-proof.json`
- replayArtifacts: `.proofs/_shared/inference-moment-contracts.json`, `.proofs/_shared/inference-proofs.json`, `.proofs/_shared/prompt-implementation-surface.json`, `.proofs/_shared/prompt-surfaces.json`, `.proofs/_shared/parsed-completion-envelopes.json`, `.proofs/_shared/eval-manifest.json`, `.proofs/_shared/inference-synthesis-proof.json`
- replayStepIds: `inference-synthesis.coverage-reconciliation`, `inference-synthesis.evaluator-status-replay`, `inference-synthesis.evidence-basis-replay`

#### Members

| memberId | passedRuns | totalRuns | fieldShape | failingRuns |
| --- | --- | --- | --- | --- |
| `task` | 16 | 16 | `evaluatorStatusTruthful`, `evidenceBasisClosed`, `field`, `fieldProofPresent`, `momentContractPresent`, `parsedEnvelopePresent`, `passed`, `promptSurfacePresent` | `none` |
| `failureModes` | 16 | 16 | `evaluatorStatusTruthful`, `evidenceBasisClosed`, `field`, `fieldProofPresent`, `momentContractPresent`, `parsedEnvelopePresent`, `passed`, `promptSurfacePresent` | `none` |
| `constraints` | 16 | 16 | `evaluatorStatusTruthful`, `evidenceBasisClosed`, `field`, `fieldProofPresent`, `momentContractPresent`, `parsedEnvelopePresent`, `passed`, `promptSurfacePresent` | `none` |
| `targetArtifactKinds` | 16 | 16 | `evaluatorStatusTruthful`, `evidenceBasisClosed`, `field`, `fieldProofPresent`, `momentContractPresent`, `parsedEnvelopePresent`, `passed`, `promptSurfacePresent` | `none` |
| `closureCriteria` | 16 | 16 | `evaluatorStatusTruthful`, `evidenceBasisClosed`, `field`, `fieldProofPresent`, `momentContractPresent`, `parsedEnvelopePresent`, `passed`, `promptSurfacePresent` | `none` |

#### Theorems

| theoremId | passedRuns | totalRuns | replayStepIds | failureReasons | failingRuns |
| --- | --- | --- | --- | --- | --- |
| `inference_synthesis.coverage_totality` | 16 | 16 | `inference-synthesis.coverage-reconciliation` | `none` | `none` |
| `inference_synthesis.evaluator_status_truth` | 16 | 16 | `inference-synthesis.evaluator-status-replay` | `none` | `none` |
| `inference_synthesis.evidence_basis_closure` | 16 | 16 | `inference-synthesis.evidence-basis-replay` | `none` | `none` |
| `inference_synthesis.ownership_traceability_closure` | 16 | 16 | `inference-synthesis.evidence-basis-replay` | `none` | `none` |
| `inference_synthesis.witness_materialization_closure` | 16 | 16 | `inference-synthesis.coverage-reconciliation`, `inference-synthesis.evaluator-status-replay`, `inference-synthesis.evidence-basis-replay` | `none` | `none` |
| `inference_synthesis.replay_closure` | 16 | 16 | `inference-synthesis.coverage-reconciliation`, `inference-synthesis.evaluator-status-replay`, `inference-synthesis.evidence-basis-replay` | `none` | `none` |

#### Replay Steps

| stepId | theoremIds | requiredArtifactPaths |
| --- | --- | --- |
| `inference-synthesis.coverage-reconciliation` | `inference_synthesis.coverage_totality` | `.proofs/_shared/inference-moment-contracts.json`, `.proofs/_shared/inference-proofs.json`, `.proofs/_shared/inference-synthesis-proof.json`, `.proofs/_shared/prompt-surfaces.json` |
| `inference-synthesis.evaluator-status-replay` | `inference_synthesis.evaluator_status_truth` | `.proofs/_shared/inference-moment-contracts.json`, `.proofs/_shared/inference-proofs.json`, `.proofs/_shared/prompt-surfaces.json`, `.proofs/_shared/eval-manifest.json` |
| `inference-synthesis.evidence-basis-replay` | `inference_synthesis.evidence_basis_closure`, `inference_synthesis.ownership_traceability_closure` | `.proofs/_shared/inference-moment-contracts.json`, `.proofs/_shared/inference-proofs.json`, `.proofs/_shared/prompt-surfaces.json`, `.proofs/_shared/parsed-completion-envelopes.json`, `.proofs/_shared/inference-synthesis-proof.json` |

### prompt-completeness

- proofArtifactPath: `.proofs/_shared/prompt-completeness-proof.json`
- witnessArtifactPaths: `.proofs/_shared/prompt-family-registry.json`, `.proofs/_shared/prompt-contracts.json`, `.proofs/_shared/prompt-surfaces.json`, `.proofs/_shared/parsed-completion-envelopes.json`, `.proofs/_shared/prompt-completeness-proof.json`
- replayArtifacts: `.proofs/_shared/prompt-family-registry.json`, `.proofs/_shared/prompt-contracts.json`, `.proofs/_shared/prompt-surfaces.json`, `.proofs/_shared/parsed-completion-envelopes.json`, `.proofs/_shared/prompt-completeness-proof.json`
- replayStepIds: `prompt-completeness.member-set-reconciliation`, `prompt-completeness.parse-admissibility`, `prompt-completeness.consumer-closure`, `prompt-completeness.provenance-truth`

#### Members

| memberId | passedRuns | totalRuns | fieldShape | failingRuns |
| --- | --- | --- | --- | --- |
| `task` | 16 | 16 | `classified`, `contractComplete`, `downstreamConsumersClosed`, `explicitlyExcluded`, `field`, `inDeclaredFamilyRegistry`, `parsedEnvelopeAdmissible`, `passed`, `provenanceAnnotationsTruthful`, `registered` | `none` |
| `failureModes` | 16 | 16 | `classified`, `contractComplete`, `downstreamConsumersClosed`, `explicitlyExcluded`, `field`, `inDeclaredFamilyRegistry`, `parsedEnvelopeAdmissible`, `passed`, `provenanceAnnotationsTruthful`, `registered` | `none` |
| `constraints` | 16 | 16 | `classified`, `contractComplete`, `downstreamConsumersClosed`, `explicitlyExcluded`, `field`, `inDeclaredFamilyRegistry`, `parsedEnvelopeAdmissible`, `passed`, `provenanceAnnotationsTruthful`, `registered` | `none` |
| `targetArtifactKinds` | 16 | 16 | `classified`, `contractComplete`, `downstreamConsumersClosed`, `explicitlyExcluded`, `field`, `inDeclaredFamilyRegistry`, `parsedEnvelopeAdmissible`, `passed`, `provenanceAnnotationsTruthful`, `registered` | `none` |
| `closureCriteria` | 16 | 16 | `classified`, `contractComplete`, `downstreamConsumersClosed`, `explicitlyExcluded`, `field`, `inDeclaredFamilyRegistry`, `parsedEnvelopeAdmissible`, `passed`, `provenanceAnnotationsTruthful`, `registered` | `none` |

#### Theorems

| theoremId | passedRuns | totalRuns | replayStepIds | failureReasons | failingRuns |
| --- | --- | --- | --- | --- | --- |
| `prompt_completeness.coverage_totality` | 16 | 16 | `prompt-completeness.member-set-reconciliation` | `none` | `none` |
| `prompt_completeness.no_ghost_coverage` | 16 | 16 | `prompt-completeness.member-set-reconciliation` | `none` | `none` |
| `prompt_completeness.explicit_exclusion_closure` | 16 | 16 | `prompt-completeness.member-set-reconciliation` | `none` | `none` |
| `prompt_completeness.contract_closure` | 16 | 16 | `prompt-completeness.parse-admissibility` | `none` | `none` |
| `prompt_completeness.parsed_envelope_admissibility` | 16 | 16 | `prompt-completeness.parse-admissibility` | `none` | `none` |
| `prompt_completeness.downstream_consumer_closure` | 16 | 16 | `prompt-completeness.consumer-closure` | `none` | `none` |
| `prompt_completeness.provenance_truth` | 16 | 16 | `prompt-completeness.provenance-truth` | `none` | `none` |
| `prompt_completeness.witness_replay_closure` | 16 | 16 | `prompt-completeness.member-set-reconciliation`, `prompt-completeness.parse-admissibility`, `prompt-completeness.consumer-closure`, `prompt-completeness.provenance-truth` | `none` | `none` |

#### Replay Steps

| stepId | theoremIds | requiredArtifactPaths |
| --- | --- | --- |
| `prompt-completeness.member-set-reconciliation` | `prompt_completeness.coverage_totality`, `prompt_completeness.no_ghost_coverage`, `prompt_completeness.explicit_exclusion_closure` | `.proofs/_shared/prompt-family-registry.json`, `.proofs/_shared/prompt-contracts.json`, `.proofs/_shared/prompt-surfaces.json` |
| `prompt-completeness.parse-admissibility` | `prompt_completeness.contract_closure`, `prompt_completeness.parsed_envelope_admissibility` | `.proofs/_shared/prompt-contracts.json`, `.proofs/_shared/parsed-completion-envelopes.json` |
| `prompt-completeness.consumer-closure` | `prompt_completeness.downstream_consumer_closure` | `.proofs/_shared/prompt-surfaces.json` |
| `prompt-completeness.provenance-truth` | `prompt_completeness.provenance_truth` | `.proofs/_shared/prompt-surfaces.json`, `.proofs/_shared/prompt-contracts.json` |

### static-code-analysis

- proofArtifactPath: `.proofs/_shared/static-measurement-proof.json`
- witnessArtifactPaths: `.proofs/_shared/code-analysis-fact-registry.json`, `.proofs/_shared/static-heuristics-registry.json`, `.proofs/_shared/measurement-receipts.json`, `.proofs/_shared/static-measurement-report.json`, `.proofs/_shared/static-measurement-proof.json`
- replayArtifacts: `.proofs/_shared/code-analysis-fact-registry.json`, `.proofs/_shared/static-heuristics-registry.json`, `.proofs/_shared/measurement-receipts.json`, `.proofs/_shared/static-measurement-report.json`, `.proofs/_shared/static-measurement-proof.json`
- replayStepIds: `static-code-analysis.stage-domain`, `static-code-analysis.stage-mapping`, `static-code-analysis.receipt-report-proof`

#### Members

| memberId | passedRuns | totalRuns | fieldShape | failingRuns |
| --- | --- | --- | --- | --- |
| `deterministic-parser` | 16 | 16 | `memberId`, `passed`, `stageIds` | `none` |
| `repo-context` | 16 | 16 | `memberId`, `passed`, `stageIds` | `none` |
| `content-unit` | 16 | 16 | `memberId`, `passed`, `stageIds` | `none` |
| `measurement-stages` | 16 | 16 | `memberId`, `passed`, `stageIds` | `none` |

#### Theorems

| theoremId | passedRuns | totalRuns | replayStepIds | failureReasons | failingRuns |
| --- | --- | --- | --- | --- | --- |
| `static_code_analysis.stage_domain_purity` | 16 | 16 | `static-code-analysis.stage-domain` | `none` | `none` |
| `static_code_analysis.abstract_to_concrete_stage_mapping` | 16 | 16 | `static-code-analysis.stage-mapping` | `none` | `none` |
| `static_code_analysis.registry_role_closure` | 16 | 16 | `static-code-analysis.stage-mapping` | `none` | `none` |
| `static_code_analysis.receipt_report_proof_agreement` | 16 | 16 | `static-code-analysis.receipt-report-proof` | `none` | `none` |
| `static_code_analysis.witness_replay_closure` | 16 | 16 | `static-code-analysis.stage-domain`, `static-code-analysis.stage-mapping`, `static-code-analysis.receipt-report-proof` | `none` | `none` |

#### Replay Steps

| stepId | theoremIds | requiredArtifactPaths |
| --- | --- | --- |
| `static-code-analysis.stage-domain` | `static_code_analysis.stage_domain_purity` | `.proofs/_shared/measurement-receipts.json`, `.proofs/_shared/static-measurement-proof.json` |
| `static-code-analysis.stage-mapping` | `static_code_analysis.abstract_to_concrete_stage_mapping`, `static_code_analysis.registry_role_closure` | `.proofs/_shared/measurement-receipts.json`, `.proofs/_shared/code-analysis-fact-registry.json`, `.proofs/_shared/static-heuristics-registry.json` |
| `static-code-analysis.receipt-report-proof` | `static_code_analysis.receipt_report_proof_agreement`, `static_code_analysis.witness_replay_closure` | `.proofs/_shared/measurement-receipts.json`, `.proofs/_shared/static-measurement-report.json`, `.proofs/_shared/static-measurement-proof.json` |

### verification-decisions

- proofArtifactPath: `.proofs/_shared/verification-decisions-proof.json`
- witnessArtifactPaths: `.proofs/_shared/verification-report.json`, `.proofs/_shared/verification-receipts.json`, `.proofs/_shared/verification-decisions-proof.json`
- replayArtifacts: `.proofs/_shared/verification-report.json`, `.proofs/_shared/verification-receipts.json`, `.proofs/_shared/verification-decisions-proof.json`
- replayStepIds: `verification-decisions.stage-mapping`, `verification-decisions.use-tier-consequence`

#### Members

| memberId | passedRuns | totalRuns | fieldShape | failingRuns |
| --- | --- | --- | --- | --- |
| `issuance` | 16 | 16 | `memberId`, `passed`, `stageIds` | `none` |
| `provenance` | 16 | 16 | `memberId`, `passed`, `stageIds` | `none` |
| `sufficiency` | 16 | 16 | `memberId`, `passed`, `stageIds` | `none` |
| `issuer-policy` | 16 | 16 | `memberId`, `passed`, `stageIds` | `none` |
| `use-tier-consequence` | 16 | 16 | `memberId`, `passed`, `stageIds` | `none` |

#### Theorems

| theoremId | passedRuns | totalRuns | replayStepIds | failureReasons | failingRuns |
| --- | --- | --- | --- | --- | --- |
| `verification_decisions.issuance_closure` | 16 | 16 | `verification-decisions.stage-mapping` | `none` | `none` |
| `verification_decisions.provenance_closure` | 16 | 16 | `verification-decisions.stage-mapping` | `none` | `none` |
| `verification_decisions.sufficiency_closure` | 16 | 16 | `verification-decisions.stage-mapping` | `none` | `none` |
| `verification_decisions.issuer_policy_closure` | 16 | 16 | `verification-decisions.stage-mapping` | `none` | `none` |
| `verification_decisions.use_tier_consequence_closure` | 16 | 16 | `verification-decisions.use-tier-consequence` | `none` | `none` |
| `verification_decisions.receipt_report_role_closure` | 16 | 16 | `verification-decisions.use-tier-consequence` | `none` | `none` |
| `verification_decisions.witness_replay_closure` | 16 | 16 | `verification-decisions.stage-mapping`, `verification-decisions.use-tier-consequence` | `none` | `none` |

#### Replay Steps

| stepId | theoremIds | requiredArtifactPaths |
| --- | --- | --- |
| `verification-decisions.stage-mapping` | `verification_decisions.issuance_closure`, `verification_decisions.provenance_closure`, `verification_decisions.sufficiency_closure`, `verification_decisions.issuer_policy_closure` | `.proofs/_shared/verification-receipts.json`, `.proofs/_shared/verification-report.json` |
| `verification-decisions.use-tier-consequence` | `verification_decisions.use_tier_consequence_closure`, `verification_decisions.receipt_report_role_closure` | `.proofs/_shared/verification-receipts.json`, `.proofs/_shared/verification-report.json`, `.proofs/_shared/verification-decisions-proof.json` |

### selection-and-materialization

- proofArtifactPath: `.proofs/_shared/selection-and-materialization-proof.json`
- witnessArtifactPaths: `.proofs/_shared/asset-pack.lock.json`, `.proofs/_shared/selected-source-material.json`, `.proofs/_shared/materialization-exclusions.json`, `.proofs/_shared/materialization-visibility-proof.json`, `.proofs/_shared/selection-consistency-proof.json`, `.proofs/_shared/materialization-proof.json`, `.proofs/_shared/selection-and-materialization-proof.json`
- replayArtifacts: `.proofs/_shared/asset-pack.lock.json`, `.proofs/_shared/selected-source-material.json`, `.proofs/_shared/materialization-exclusions.json`, `.proofs/_shared/materialization-visibility-proof.json`, `.proofs/_shared/selection-consistency-proof.json`, `.proofs/_shared/materialization-proof.json`, `.proofs/_shared/selection-and-materialization-proof.json`
- replayStepIds: `selection-and-materialization.selected-set`, `selection-and-materialization.visibility`

#### Members

| memberId | passedRuns | totalRuns | fieldShape | failingRuns |
| --- | --- | --- | --- | --- |
| `selected-assets` | 16 | 16 | `memberId`, `passed` | `none` |
| `locked-units` | 16 | 16 | `memberId`, `passed` | `none` |
| `materialized-source` | 16 | 16 | `memberId`, `passed` | `none` |
| `exclusions` | 16 | 16 | `memberId`, `passed` | `none` |
| `visibility-rules` | 16 | 16 | `memberId`, `passed` | `none` |

#### Theorems

| theoremId | passedRuns | totalRuns | replayStepIds | failureReasons | failingRuns |
| --- | --- | --- | --- | --- | --- |
| `selection_and_materialization.selected_asset_closure` | 16 | 16 | `selection-and-materialization.selected-set` | `none` | `none` |
| `selection_and_materialization.lock_closure` | 16 | 16 | `selection-and-materialization.selected-set` | `none` | `none` |
| `selection_and_materialization.materialized_source_closure` | 16 | 16 | `selection-and-materialization.selected-set` | `none` | `none` |
| `selection_and_materialization.exclusion_closure` | 16 | 16 | `selection-and-materialization.visibility` | `none` | `none` |
| `selection_and_materialization.visibility_closure` | 16 | 16 | `selection-and-materialization.visibility` | `none` | `none` |
| `selection_and_materialization.selection_consistency_closure` | 16 | 16 | `selection-and-materialization.selected-set` | `none` | `none` |
| `selection_and_materialization.materialization_proof_closure` | 16 | 16 | `selection-and-materialization.selected-set`, `selection-and-materialization.visibility` | `none` | `none` |

#### Replay Steps

| stepId | theoremIds | requiredArtifactPaths |
| --- | --- | --- |
| `selection-and-materialization.selected-set` | `selection_and_materialization.selected_asset_closure`, `selection_and_materialization.lock_closure`, `selection_and_materialization.materialized_source_closure`, `selection_and_materialization.selection_consistency_closure` | `.proofs/_shared/asset-pack.lock.json`, `.proofs/_shared/selected-source-material.json`, `.proofs/_shared/selection-consistency-proof.json`, `.proofs/_shared/materialization-proof.json` |
| `selection-and-materialization.visibility` | `selection_and_materialization.visibility_closure`, `selection_and_materialization.exclusion_closure` | `.proofs/_shared/materialization-exclusions.json`, `.proofs/_shared/materialization-visibility-proof.json` |

### authorization-and-sensitive-flow

- proofArtifactPath: `.proofs/_shared/authorization-and-sensitive-flow-proof.json`
- witnessArtifactPaths: `.proofs/_shared/identity-bindings.json`, `.proofs/_shared/authorization-decisions.json`, `.proofs/_shared/sensitive-data-flow.json`, `.proofs/_shared/identity-authorization-proof.json`, `.proofs/_shared/sensitive-data-flow-proof.json`, `.proofs/_shared/authorization-and-sensitive-flow-proof.json`
- replayArtifacts: `.proofs/_shared/identity-bindings.json`, `.proofs/_shared/authorization-decisions.json`, `.proofs/_shared/sensitive-data-flow.json`, `.proofs/_shared/identity-authorization-proof.json`, `.proofs/_shared/sensitive-data-flow-proof.json`, `.proofs/_shared/authorization-and-sensitive-flow-proof.json`
- replayStepIds: `authorization-sensitive-flow.identity`, `authorization-sensitive-flow.flows`

#### Members

| memberId | passedRuns | totalRuns | fieldShape | failingRuns |
| --- | --- | --- | --- | --- |
| `principals` | 16 | 16 | `memberId`, `passed` | `none` |
| `authorization-decisions` | 16 | 16 | `memberId`, `passed` | `none` |
| `confidentiality-classes` | 16 | 16 | `memberId`, `passed` | `none` |
| `retention-disclosure-rules` | 16 | 16 | `memberId`, `passed` | `none` |
| `sensitive-data-flows` | 16 | 16 | `memberId`, `passed` | `none` |

#### Theorems

| theoremId | passedRuns | totalRuns | replayStepIds | failureReasons | failingRuns |
| --- | --- | --- | --- | --- | --- |
| `authorization_and_sensitive_flow.principal_authority_totality` | 16 | 16 | `authorization-sensitive-flow.identity` | `none` | `none` |
| `authorization_and_sensitive_flow.authorization_decision_closure` | 16 | 16 | `authorization-sensitive-flow.identity` | `none` | `none` |
| `authorization_and_sensitive_flow.classification_closure` | 16 | 16 | `authorization-sensitive-flow.flows` | `none` | `none` |
| `authorization_and_sensitive_flow.policy_assignment_closure` | 16 | 16 | `authorization-sensitive-flow.flows` | `none` | `none` |
| `authorization_and_sensitive_flow.no_unauthorized_public_flow` | 16 | 16 | `authorization-sensitive-flow.flows` | `none` | `none` |
| `authorization_and_sensitive_flow.witness_replay_closure` | 16 | 16 | `authorization-sensitive-flow.identity`, `authorization-sensitive-flow.flows` | `none` | `none` |

#### Replay Steps

| stepId | theoremIds | requiredArtifactPaths |
| --- | --- | --- |
| `authorization-sensitive-flow.identity` | `authorization_and_sensitive_flow.principal_authority_totality`, `authorization_and_sensitive_flow.authorization_decision_closure` | `.proofs/_shared/identity-bindings.json`, `.proofs/_shared/authorization-decisions.json`, `.proofs/_shared/identity-authorization-proof.json` |
| `authorization-sensitive-flow.flows` | `authorization_and_sensitive_flow.classification_closure`, `authorization_and_sensitive_flow.policy_assignment_closure`, `authorization_and_sensitive_flow.no_unauthorized_public_flow` | `.proofs/_shared/sensitive-data-flow.json`, `.proofs/_shared/sensitive-data-flow-proof.json` |

### settlement-source-to-shares

- proofArtifactPath: `.proofs/_shared/settlement-source-to-shares-proof.json`
- witnessArtifactPaths: `.proofs/_shared/source-to-shares.json`, `.proofs/_shared/settlement-participation.json`, `.proofs/_shared/settlement-preview.json`, `.proofs/_shared/accounting-precision-report.json`, `.proofs/_shared/journal-diff.json`, `.proofs/_shared/journal-completeness-proof.json`, `.proofs/_shared/settlement-proof.json`, `.proofs/_shared/settlement-source-to-shares-proof.json`
- replayArtifacts: `.proofs/_shared/source-to-shares.json`, `.proofs/_shared/settlement-participation.json`, `.proofs/_shared/settlement-preview.json`, `.proofs/_shared/accounting-precision-report.json`, `.proofs/_shared/journal-diff.json`, `.proofs/_shared/journal-completeness-proof.json`, `.proofs/_shared/settlement-proof.json`, `.proofs/_shared/settlement-source-to-shares-proof.json`
- replayStepIds: `settlement-source-to-shares.contribution-allocation`, `settlement-source-to-shares.journal-theorem`

#### Members

| memberId | passedRuns | totalRuns | fieldShape | failingRuns |
| --- | --- | --- | --- | --- |
| `contribution` | 16 | 16 | `memberId`, `passed` | `none` |
| `clipping` | 16 | 16 | `memberId`, `passed` | `none` |
| `normalization` | 16 | 16 | `memberId`, `passed` | `none` |
| `participation` | 16 | 16 | `memberId`, `passed` | `none` |
| `allocation` | 16 | 16 | `memberId`, `passed` | `none` |
| `quantized-fit-quality-receipting` | 16 | 16 | `memberId`, `passed` | `none` |
| `journal` | 16 | 16 | `memberId`, `passed` | `none` |
| `settlement-proof` | 16 | 16 | `memberId`, `passed` | `none` |

#### Theorems

| theoremId | passedRuns | totalRuns | replayStepIds | failureReasons | failingRuns |
| --- | --- | --- | --- | --- | --- |
| `settlement_source_to_shares.contribution_totality` | 16 | 16 | `settlement-source-to-shares.contribution-allocation` | `none` | `none` |
| `settlement_source_to_shares.clipping_determinism` | 16 | 16 | `settlement-source-to-shares.contribution-allocation` | `none` | `none` |
| `settlement_source_to_shares.normalization_exactness` | 16 | 16 | `settlement-source-to-shares.contribution-allocation` | `none` | `none` |
| `settlement_source_to_shares.participation_totality` | 16 | 16 | `settlement-source-to-shares.contribution-allocation` | `none` | `none` |
| `settlement_source_to_shares.allocation_conservation` | 16 | 16 | `settlement-source-to-shares.contribution-allocation` | `none` | `none` |
| `settlement_source_to_shares.quantized_fit_quality_receipting` | 16 | 16 | `settlement-source-to-shares.contribution-allocation` | `none` | `none` |
| `settlement_source_to_shares.journal_completeness` | 16 | 16 | `settlement-source-to-shares.journal-theorem` | `none` | `none` |
| `settlement_source_to_shares.settlement_theorem_integrity` | 16 | 16 | `settlement-source-to-shares.journal-theorem` | `none` | `none` |

#### Replay Steps

| stepId | theoremIds | requiredArtifactPaths |
| --- | --- | --- |
| `settlement-source-to-shares.contribution-allocation` | `settlement_source_to_shares.contribution_totality`, `settlement_source_to_shares.clipping_determinism`, `settlement_source_to_shares.normalization_exactness`, `settlement_source_to_shares.participation_totality`, `settlement_source_to_shares.allocation_conservation`, `settlement_source_to_shares.quantized_fit_quality_receipting` | `.proofs/_shared/source-to-shares.json`, `.proofs/_shared/settlement-participation.json`, `.proofs/_shared/settlement-preview.json`, `.proofs/_shared/accounting-precision-report.json` |
| `settlement-source-to-shares.journal-theorem` | `settlement_source_to_shares.journal_completeness`, `settlement_source_to_shares.settlement_theorem_integrity` | `.proofs/_shared/journal-diff.json`, `.proofs/_shared/journal-completeness-proof.json`, `.proofs/_shared/settlement-proof.json` |

### disclosure-boundary

- proofArtifactPath: `.proofs/_shared/disclosure-boundary-proof.json`
- witnessArtifactPaths: `.proofs/_shared/projection-policy.json`, `.proofs/_shared/bounded-public-proof.json`, `.proofs/_shared/redaction-proof.json`, `.proofs/_shared/disclosure-proof.json`, `.proofs/_shared/disclosure-boundary-proof.json`
- replayArtifacts: `.proofs/_shared/projection-policy.json`, `.proofs/_shared/bounded-public-proof.json`, `.proofs/_shared/redaction-proof.json`, `.proofs/_shared/disclosure-proof.json`, `.proofs/_shared/disclosure-boundary-proof.json`
- replayStepIds: `disclosure-boundary.policy-bounded-public`, `disclosure-boundary.redaction-disclosure`

#### Members

| memberId | passedRuns | totalRuns | fieldShape | failingRuns |
| --- | --- | --- | --- | --- |
| `projection-policy` | 16 | 16 | `memberId`, `passed` | `none` |
| `bounded-public-proof` | 16 | 16 | `memberId`, `passed` | `none` |
| `redaction-proof` | 16 | 16 | `memberId`, `passed` | `none` |
| `disclosure-proof` | 16 | 16 | `memberId`, `passed` | `none` |

#### Theorems

| theoremId | passedRuns | totalRuns | replayStepIds | failureReasons | failingRuns |
| --- | --- | --- | --- | --- | --- |
| `disclosure_boundary.projection_policy_closure` | 16 | 16 | `disclosure-boundary.policy-bounded-public` | `none` | `none` |
| `disclosure_boundary.bounded_public_metadata_only` | 16 | 16 | `disclosure-boundary.policy-bounded-public` | `none` | `none` |
| `disclosure_boundary.redaction_alignment` | 16 | 16 | `disclosure-boundary.redaction-disclosure` | `none` | `none` |
| `disclosure_boundary.disclosure_verdict_alignment` | 16 | 16 | `disclosure-boundary.redaction-disclosure` | `none` | `none` |
| `disclosure_boundary.witness_replay_closure` | 16 | 16 | `disclosure-boundary.policy-bounded-public`, `disclosure-boundary.redaction-disclosure` | `none` | `none` |

#### Replay Steps

| stepId | theoremIds | requiredArtifactPaths |
| --- | --- | --- |
| `disclosure-boundary.policy-bounded-public` | `disclosure_boundary.projection_policy_closure`, `disclosure_boundary.bounded_public_metadata_only` | `.proofs/_shared/projection-policy.json`, `.proofs/_shared/bounded-public-proof.json` |
| `disclosure-boundary.redaction-disclosure` | `disclosure_boundary.redaction_alignment`, `disclosure_boundary.disclosure_verdict_alignment`, `disclosure_boundary.witness_replay_closure` | `.proofs/_shared/redaction-proof.json`, `.proofs/_shared/disclosure-proof.json`, `.proofs/_shared/disclosure-boundary-proof.json` |

### proof-contract

- proofArtifactPath: `.proofs/_shared/proof-contract.json`
- witnessArtifactPaths: `.proofs/_shared/proof-contract.json`, `.proofs/_shared/system-proof-bundle.json`, `.proofs/_shared/proof-witness-manifest.json`
- replayArtifacts: `.proofs/_shared/proof-contract.json`, `.proofs/_shared/system-proof-bundle.json`, `.proofs/_shared/proof-witness-manifest.json`
- replayStepIds: `proof-contract.contract-materialization`, `proof-contract.evidence-chain`, `proof-contract.bundle-witness`

#### Members

| memberId | passedRuns | totalRuns | fieldShape | failingRuns |
| --- | --- | --- | --- | --- |
| `proof-contract` | 16 | 16 | `memberId`, `passed` | `none` |
| `evidence-chain` | 16 | 16 | `memberId`, `passed` | `none` |
| `theorem-checks` | 16 | 16 | `memberId`, `passed` | `none` |
| `system-proof-bundle` | 16 | 16 | `memberId`, `passed` | `none` |
| `witness-manifest-closure` | 16 | 16 | `memberId`, `passed` | `none` |

#### Theorems

| theoremId | passedRuns | totalRuns | replayStepIds | failureReasons | failingRuns |
| --- | --- | --- | --- | --- | --- |
| `proof_contract.contract_materialization` | 16 | 16 | `proof-contract.contract-materialization` | `none` | `none` |
| `proof_contract.evidence_chain_closure` | 16 | 16 | `proof-contract.evidence-chain` | `none` | `none` |
| `proof_contract.theorem_check_binding` | 16 | 16 | `proof-contract.evidence-chain` | `none` | `none` |
| `proof_contract.bundle_coherence` | 16 | 16 | `proof-contract.bundle-witness` | `none` | `none` |
| `proof_contract.witness_manifest_coherence` | 16 | 16 | `proof-contract.bundle-witness` | `none` | `none` |
| `proof_contract.replay_closure` | 16 | 16 | `proof-contract.bundle-witness` | `none` | `none` |

#### Replay Steps

| stepId | theoremIds | requiredArtifactPaths |
| --- | --- | --- |
| `proof-contract.contract-materialization` | `proof_contract.contract_materialization` | `.proofs/_shared/proof-contract.json` |
| `proof-contract.evidence-chain` | `proof_contract.evidence_chain_closure`, `proof_contract.theorem_check_binding` | `.proofs/_shared/proof-contract.json`, `.proofs/_shared/system-proof-bundle.json` |
| `proof-contract.bundle-witness` | `proof_contract.bundle_coherence`, `proof_contract.witness_manifest_coherence`, `proof_contract.replay_closure` | `.proofs/_shared/system-proof-bundle.json`, `.proofs/_shared/proof-witness-manifest.json`, `.proofs/_shared/proof-contract.json` |

## Scenario and Run Matrix

| scenarioId | branchMode | readId | branchName | assetPackId | familyCount | allFamiliesPassed | proofContractPassed | requiredArtifactPathCount | artifactDigestCount | fullyProven |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `auth-issuer-rollback` | `patch` | `read_auth-issuer-rollback_40b4b5cc9b` | `bitcode/remediation-read_auth-issuer-rollback_40b4b5cc9b-auth-issuer-rollback` | `asset_pack_f4d2f98e2b7f` | 9 | `true` | `true` | 47 | 46 | `true` |
| `auth-issuer-rollback` | `context` | `read_auth-issuer-rollback_40b4b5cc9b` | `bitcode/remediation-read_auth-issuer-rollback_40b4b5cc9b-auth-issuer-rollback` | `asset_pack_19909dd95164` | 9 | `true` | `true` | 47 | 46 | `true` |
| `rust-validator-proof-gap` | `patch` | `read_rust-validator-proof-gap_7044fe8972` | `bitcode/remediation-read_rust-validator-proof-gap_7044fe8972-rust-validator-proof-gap` | `asset_pack_3b7a68101d23` | 9 | `true` | `true` | 47 | 46 | `true` |
| `rust-validator-proof-gap` | `context` | `read_rust-validator-proof-gap_7044fe8972` | `bitcode/remediation-read_rust-validator-proof-gap_7044fe8972-rust-validator-proof-gap` | `asset_pack_3b7a68101d23` | 9 | `true` | `true` | 47 | 46 | `true` |
| `config-policy-precedence-incident` | `patch` | `read_config-policy-precedence-incident_f39d972e54` | `bitcode/remediation-read_config-policy-precedence-incident_f39d972e54-config-policy-precedence-incident` | `asset_pack_d0c7f0b06b9a` | 9 | `true` | `true` | 47 | 46 | `true` |
| `config-policy-precedence-incident` | `context` | `read_config-policy-precedence-incident_f39d972e54` | `bitcode/remediation-read_config-policy-precedence-incident_f39d972e54-config-policy-precedence-incident` | `asset_pack_d0c7f0b06b9a` | 9 | `true` | `true` | 47 | 46 | `true` |
| `unsafe-patch-review-recovery` | `patch` | `read_unsafe-patch-review-recovery_16a56c87c5` | `bitcode/remediation-read_unsafe-patch-review-recovery_16a56c87c5-unsafe-patch-review-recovery` | `asset_pack_cce630153e2f` | 9 | `true` | `true` | 47 | 46 | `true` |
| `unsafe-patch-review-recovery` | `context` | `read_unsafe-patch-review-recovery_16a56c87c5` | `bitcode/remediation-read_unsafe-patch-review-recovery_16a56c87c5-unsafe-patch-review-recovery` | `asset_pack_cce630153e2f` | 9 | `true` | `true` | 47 | 46 | `true` |
| `infra-deployment-mismatch` | `patch` | `read_infra-deployment-mismatch_be8a999141` | `bitcode/remediation-read_infra-deployment-mismatch_be8a999141-infra-deployment-mismatch` | `asset_pack_9f1b844a2cdf` | 9 | `true` | `true` | 47 | 46 | `true` |
| `infra-deployment-mismatch` | `context` | `read_infra-deployment-mismatch_be8a999141` | `bitcode/remediation-read_infra-deployment-mismatch_be8a999141-infra-deployment-mismatch` | `asset_pack_9f1b844a2cdf` | 9 | `true` | `true` | 47 | 46 | `true` |
| `privacy-boundary-proof-export` | `patch` | `read_privacy-boundary-proof-export_8163942d95` | `bitcode/remediation-read_privacy-boundary-proof-export_8163942d95-privacy-boundary-proof-export` | `asset_pack_c5fef3ab17c5` | 9 | `true` | `true` | 47 | 46 | `true` |
| `privacy-boundary-proof-export` | `context` | `read_privacy-boundary-proof-export_8163942d95` | `bitcode/remediation-read_privacy-boundary-proof-export_8163942d95-privacy-boundary-proof-export` | `asset_pack_c5fef3ab17c5` | 9 | `true` | `true` | 47 | 46 | `true` |
| `polyglot-gateway-benchmark-remediation` | `patch` | `read_polyglot-gateway-benchmark-remediation_ca6f233369` | `bitcode/remediation-read_polyglot-gateway-benchmark-remediation_ca6f233369-polyglot-gateway-benchmark-remediation` | `asset_pack_654da1e46737` | 9 | `true` | `true` | 47 | 46 | `true` |
| `polyglot-gateway-benchmark-remediation` | `context` | `read_polyglot-gateway-benchmark-remediation_ca6f233369` | `bitcode/remediation-read_polyglot-gateway-benchmark-remediation_ca6f233369-polyglot-gateway-benchmark-remediation` | `asset_pack_654da1e46737` | 9 | `true` | `true` | 47 | 46 | `true` |
| `auth-many-asset-normalization` | `patch` | `read_auth-many-asset-normalization_f6dbfe951c` | `bitcode/remediation-read_auth-many-asset-normalization_f6dbfe951c-auth-many-asset-normalization` | `asset_pack_186c76eb7d2d` | 9 | `true` | `true` | 47 | 46 | `true` |
| `auth-many-asset-normalization` | `context` | `read_auth-many-asset-normalization_f6dbfe951c` | `bitcode/remediation-read_auth-many-asset-normalization_f6dbfe951c-auth-many-asset-normalization` | `asset_pack_186c76eb7d2d` | 9 | `true` | `true` | 47 | 46 | `true` |

## Incomplete Verdicts

- none

## Run Details

### auth-issuer-rollback/patch

- branchName: `bitcode/remediation-read_auth-issuer-rollback_40b4b5cc9b-auth-issuer-rollback`
- readId: `read_auth-issuer-rollback_40b4b5cc9b`
- assetPackId: `asset_pack_f4d2f98e2b7f`
- proofContractHash: `sha256:2bc0cdb1b9c54e9b714d946f3bee408f0343a3dade3175bb2dd3e34c1ca022a9`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:256959c2fe4952b795e30622c3811861f5488c1d81c55cb836ce21d8b2813e64` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:ef1b8ca12d6f3721400e708e5a5ca7f9f47b4badf6c5d489c4202af9057bb17d` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:a699a9d4a93f02f9fcb5b55b3d800a9f5054eccc060f1fd70ca22403790b062e` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:dbd511852b36bc668d92cb11693edef914be3bb0ab67a0fc9551ecb567d6bb89` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:90e9ab83bdd89f9f30884839989744d76c4e1a255139a41ad9125fb5b8a902c3` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:a62cd1ac553854bf6245789734a263fa453a359240f302495fde87ddb4266f85` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:2bc0cdb1b9c54e9b714d946f3bee408f0343a3dade3175bb2dd3e34c1ca022a9` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:9a6e2f064abffb599de2da3958dcc34872ea7ee8f1391833892adc9165ffbd3b` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:5e11035a0494b9469ec3e0ae8da9551fa453a4db26b683629ccc386f258956f6` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:dbd511852b36bc668d92cb11693edef914be3bb0ab67a0fc9551ecb567d6bb89` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:8d53e712cc5428f330c44f0b9a655184dfa0c1b2e9c37d943bebdc4a4fe7abb7` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:dbbefbc15726b9c8549a12d839ef255e408165561934a990ffc57f00cf17bdec` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:95ea653c70ac6b1bdac49a954e374e5c7e558dbe4ba78b2179e1e6c33a6de3a3` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:a62cd1ac553854bf6245789734a263fa453a359240f302495fde87ddb4266f85` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:dbbefbc15726b9c8549a12d839ef255e408165561934a990ffc57f00cf17bdec` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:c7bf28b10599cbeed80e59bee47b9b6b799cd188cb2a46b0f91f96b462e3d392` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:d2e5b13ede9cf7ed83508d98e23c977f8834385f9f0daea55f85a3f4214fa874` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:6785dfd7468c04256efcc79d07a7d8a7e95878300a29dd7018b3f8e91b3362ab` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:84f3d30696056f8be6056acc338e2cfadfdade990b1736be82391bb606af1076` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:9e6a10b2ec749912879e6bcd36fa1fba4ea6addfe1a37475e7a49718a154ad2d` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:256959c2fe4952b795e30622c3811861f5488c1d81c55cb836ce21d8b2813e64` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:f5f9f0d0bfcdb4e04468c26d9ad18a982d1c96bd542f748eb3e2f8895702dcb7` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:29ff4ec48f268fb6d01200b2fe7ce73d9163e23750063a18f82c4718b7a959f3` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:55dbd6deb51d87eb2ff01171e034d15cfed21816c8e57153255ae7bea45959da` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:53e381a359ca047b8d0b7ef1c3d5cde49040d956323791cdc28428e58d2440c9` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:7ce41a1c51e3a7cdac620291ab8cef1e1af9cc12d30a5837aa3e769c74af681d` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:88e91d3b9fda3530435c6bd9ca97ba215ad754bdf5ac29091cebdd546a362f35` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:a612d67d1995853ee132d9dd21fd8c64c8f986b6c41a2b0e0d042447552f2cd6` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:7e019f446bf0e5598721d48a07faf09d8a92b86fe037a9383c27fe075c376727` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:5d174065b4f78b059f10f0d39d4f256ce0adcd2dc0e1a825f9f9618b85a58964` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:3521603a18e2f2d11f8c7513318fd8e35f143d0c6c7232d34dbbd08887b16b70` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:6b9bfd5c1dab04e253f4786b0f6375266fef472ddcfd6ae63b5750fb48cdefc7` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:374a307f4d4e017f4ce372feea54a7201e38b5eb3055cc64f1a04ed7e322c049` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:dbbefbc15726b9c8549a12d839ef255e408165561934a990ffc57f00cf17bdec` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:83aed0ae012894de55ab87556cae19eedb46712815db8124a4b9ed52076dfdf0` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:a699a9d4a93f02f9fcb5b55b3d800a9f5054eccc060f1fd70ca22403790b062e` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:0458593a95733b5c411c3cbdfe188bcc394fbfe5811f5deb8e73bb3a83aca630` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:9901fc2c0ead9f1445ec4254fdc9c621f3fd92e413e815b0b8d768fb8ab30f5d` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:67b87bf5996298f2177f9db66ed562b31a90d8b7b746090074b74acbb274f238` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:2e53b0aaefdeedcffd626747c247f61dd7cbfbcd8edd54ee6e27d43b89919ea6` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:4b8e9b850357b52fdfa98451bb678e23b21abe83e652cd8bcb0dbe3308a24b9b` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:a2da5bdc3dfc4931778432c06416007c8ca154aadae5c334d563a0ac9b585073` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:90e9ab83bdd89f9f30884839989744d76c4e1a255139a41ad9125fb5b8a902c3` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:83bcaaf9d2b037535e3155879f3b613e714a963aee6577de070099cba6a07e14` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:d4b99c26cb2a37743cbbd1f99761212f0065129290b416c1819a8a9934f8f751` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:ef1b8ca12d6f3721400e708e5a5ca7f9f47b4badf6c5d489c4202af9057bb17d` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:4f1a499e20476e17314d509f31bbb2916af74de48aadc94291ed2d0e3ca0f466` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:a3d43519a9c90ff44fdef10626caa552c380d594845d4fad6166a5ef9e79928a` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:b76d433cbe01cda9637c652416b2045618a6da8f5cf8ae36dbf8d545c9536b38` | `verification-decisions` | `verification-evidence` | `false` |

### auth-issuer-rollback/context

- branchName: `bitcode/remediation-read_auth-issuer-rollback_40b4b5cc9b-auth-issuer-rollback`
- readId: `read_auth-issuer-rollback_40b4b5cc9b`
- assetPackId: `asset_pack_19909dd95164`
- proofContractHash: `sha256:0800e46f246b20d88857779f128a9a59edd322529b3dc5735eba5a9710399db0`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:256959c2fe4952b795e30622c3811861f5488c1d81c55cb836ce21d8b2813e64` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:ef1b8ca12d6f3721400e708e5a5ca7f9f47b4badf6c5d489c4202af9057bb17d` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:5e69262ed8fcf6938df97b030537b5ca3562b710bd8953f15b56851f4961d03c` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:afef8b8aa27280c9ce1d63c35e9cba68430a57dab0a2ba3b4ebb20fd57e621a3` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:f8eb0241be39488c3e9dd7da0acfa1ac0aade7702a7b5a48932b3779b1ceb5c1` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:b8cf6c4686f476249ec92057770d4b67ff3514fa63a6b48e9de2089f724435c3` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:0800e46f246b20d88857779f128a9a59edd322529b3dc5735eba5a9710399db0` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:3255b47b969074ca2889a8a30d5ef020dddc3f71033a87add947fe49397a1bb7` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:fb42afe7dfa35406e743ac6e33fde0d46a54f17661ed2e66b92f821453a42292` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:afef8b8aa27280c9ce1d63c35e9cba68430a57dab0a2ba3b4ebb20fd57e621a3` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:57aae14b479887067a17ffb179f7f340bb0c7409eae2b696ff4ad622a14b2237` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:5ca87938497b7e5744c3a630d53d0970c721ae4767358368bf5fa0be60d92034` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:95ea653c70ac6b1bdac49a954e374e5c7e558dbe4ba78b2179e1e6c33a6de3a3` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:b8cf6c4686f476249ec92057770d4b67ff3514fa63a6b48e9de2089f724435c3` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:5ca87938497b7e5744c3a630d53d0970c721ae4767358368bf5fa0be60d92034` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:c7bf28b10599cbeed80e59bee47b9b6b799cd188cb2a46b0f91f96b462e3d392` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:02e35de18dbd94fda4da1621d0ef15130d33ff0e257485d432fc90275c89630b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:c48fea714cadaf811ea6abbcff3062929d0ccfa7b16e943af104176201cbb98c` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:84f3d30696056f8be6056acc338e2cfadfdade990b1736be82391bb606af1076` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:9e6a10b2ec749912879e6bcd36fa1fba4ea6addfe1a37475e7a49718a154ad2d` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:256959c2fe4952b795e30622c3811861f5488c1d81c55cb836ce21d8b2813e64` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:474af6929f6571b43b0bf7775885c66089db4111b9fe4862a10bc74c1453906c` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:ddc957b36850ea6bd7122d828826751bef0a726e07b426aae561fb7a03b8c3a6` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:0602936380cb56c3e942d28298f7fca0f4eb34477bb453aac8ca1511fe92653f` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:a36987dd6be3eeae5c53d8dd6607d89e6dccfa7ebe6b3ced1057c571037a077f` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:affbbe0d862f2d4cdbae7c6935b6fd5ee43ab4849b22556ccd84e2cd2f49388e` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:88e91d3b9fda3530435c6bd9ca97ba215ad754bdf5ac29091cebdd546a362f35` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:a612d67d1995853ee132d9dd21fd8c64c8f986b6c41a2b0e0d042447552f2cd6` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:7d5e5e6b7c45801a8d0a9f6eacef932fd24e624b825b36b08d72f807f46de67b` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:5d174065b4f78b059f10f0d39d4f256ce0adcd2dc0e1a825f9f9618b85a58964` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:3521603a18e2f2d11f8c7513318fd8e35f143d0c6c7232d34dbbd08887b16b70` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:6b9bfd5c1dab04e253f4786b0f6375266fef472ddcfd6ae63b5750fb48cdefc7` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:609365c7c00e60e3776bc4f7e51f12f0a9592e73ad6fb5dd30ea864169403851` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:5ca87938497b7e5744c3a630d53d0970c721ae4767358368bf5fa0be60d92034` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:e18adb7120599728160b56e57b69210387b2fe36a94f64dbce5bc616f363d685` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:5e69262ed8fcf6938df97b030537b5ca3562b710bd8953f15b56851f4961d03c` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:ecbd5a7070f28dda086bce15a4dde9516694e604b5a5813f0f17e85a2adefede` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:9901fc2c0ead9f1445ec4254fdc9c621f3fd92e413e815b0b8d768fb8ab30f5d` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:38c39642c49d9428a3b1e57e668b4ecf3d2833a4d6ab27e92b5e5a0d78fe3ca8` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:796699114487839b6ddfdab36c790f4b527690e96769c8203a67ec09685d15b5` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:b88a8998eff552c152b09f77591a3017aebd2a4a88ae781f1465978b9615d006` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:185b4496db8c60a7b18b3b86517dd57f4272f3971c3f50e1a4c01797ec013a51` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:f8eb0241be39488c3e9dd7da0acfa1ac0aade7702a7b5a48932b3779b1ceb5c1` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:83bcaaf9d2b037535e3155879f3b613e714a963aee6577de070099cba6a07e14` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:d4b99c26cb2a37743cbbd1f99761212f0065129290b416c1819a8a9934f8f751` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:ef1b8ca12d6f3721400e708e5a5ca7f9f47b4badf6c5d489c4202af9057bb17d` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:4f1a499e20476e17314d509f31bbb2916af74de48aadc94291ed2d0e3ca0f466` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:a3d43519a9c90ff44fdef10626caa552c380d594845d4fad6166a5ef9e79928a` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:ec86c64e5f264417564c93a477a2ca78596a571048848c98f7119e65f4dac1d7` | `verification-decisions` | `verification-evidence` | `false` |

### rust-validator-proof-gap/patch

- branchName: `bitcode/remediation-read_rust-validator-proof-gap_7044fe8972-rust-validator-proof-gap`
- readId: `read_rust-validator-proof-gap_7044fe8972`
- assetPackId: `asset_pack_3b7a68101d23`
- proofContractHash: `sha256:34f2a976e6dc61ca978b606608d7205e2c5c0cd4ed5e8eb38fdaea91c8faa026`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:4f09eb2ae7c6db3a769ab72b39c692158c09da634ddd72b205c3d7a507783ede` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:7dd293ae5e77426d61f149094cdd5cd270958c709e5450e2fd2e59071b3ecf27` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:1ef0e9dbdab22331bc9f5be87d5177cc19aa2a899e6c26c4a563a0882f330746` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:37d2ff77cc9bdc01ffd3d5eaaa3800571cb75fdce16914ccaad1ffabca503d91` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:4798e4b74f752495e3f86098e43d3f8eb040469c1d47ea39be5fb72aee9f9d3a` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:3e6e1264438e0e3af4365c50a93d6ab55f38c552b748d0d92c87803bdd79d138` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:34f2a976e6dc61ca978b606608d7205e2c5c0cd4ed5e8eb38fdaea91c8faa026` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:da4b79d0450bab8a6f7561d6599608cfd3242b8b034cd7d26fbe86edfbe1fd8a` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:814f7ba82b0a68df6ea1cec2cf2d2cc7402209f0f525156351ecaf11653e9012` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:37d2ff77cc9bdc01ffd3d5eaaa3800571cb75fdce16914ccaad1ffabca503d91` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:4910272ce690e05a4da36aede0dfdf5cebf5620df992644819cc88051d4e2e58` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:a723b407fd033e8303a99db2876fb53c09387b09361100ed3904f51acea2ac6f` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:ff62568a9de1e21b652e4e3182ec8f993e58f1397aa51d0339d88fc799c82e60` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:3e6e1264438e0e3af4365c50a93d6ab55f38c552b748d0d92c87803bdd79d138` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:a723b407fd033e8303a99db2876fb53c09387b09361100ed3904f51acea2ac6f` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:1b72a64b055795e67f2177bc3797069ae0fd58d0a3d5c709dccf461390d49a4e` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:219fc46372c945c417cff684dc7c67798d80bad9c01a3388eacfd490b1a6b255` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:e13043611334caee42156d937557e178bdd4415d0b063bcdfc129d44fc8ec643` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:519f691be91077b676c361901d1deb1dc99c51698307c9d21f23b38c399893ec` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:276a42d09d1c3507cae113787129c222569bdb7a9934d70c791715e3a490b6b1` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:4f09eb2ae7c6db3a769ab72b39c692158c09da634ddd72b205c3d7a507783ede` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:ac5961a0c7d2162c86ce74e6e50119cd020397bca3db2ea0002f908aeae4c366` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:ea21dbf7b59f8af276a6039b98112f6eced801881db2408ddd6d25fa727e0bc9` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:e46dfdfb72cef278816754660918af86cf9b5715aa19c56ed78c79e4f9bd91d8` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:e48d427b420ff2f7622b93e34299c019a3f9cddeac59e669febd4846810c85d2` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:7243dc10a8a7110d33cfb1e19b6e6dd11bd22dde647c71030cd14ce96cffefe1` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:24acf3a10dd89da1bdbfa4cc8591e537f89d28befa009a451cc3bfe09a64d5c6` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:75fee22c4117c5669cf0b25919bda19d9dd09d68faa223d6fc2bcf42c4b1045b` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:79125cbf4a797320623a707ad7419d9d6cb2fec735b90e8f4fe5b9cd8e59e033` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:4c9320e1fb1e760211f8851eb15ea69ba881504e90475e754a786add18174632` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:e095edda3ba3d6e04edddcd9e3878383ec33fd66f23ea7d2557718031d991b5a` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:721bc6d6f9a94bed07b07aa441ba4d92a689cc562f6594e5f04bea4c97c2dc18` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:a5211d59927786d89bf03d1d5f324abff026c82ed7730896cc964f12a01e6ab9` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:a723b407fd033e8303a99db2876fb53c09387b09361100ed3904f51acea2ac6f` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:5d8f8846a7aed1a7693a93f69524bab7180f25130915e79b53eb242e6ca55f58` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:1ef0e9dbdab22331bc9f5be87d5177cc19aa2a899e6c26c4a563a0882f330746` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:3f7148afee2a0b067968500edbdc812560dbc5936fae54b6558474ac8a4687d9` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:ea8daa50baf855ebc90a9ce32cba0f9063d02f165f0badee508fb646b673e6c7` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:441a223b4ac47882d958d1fbfdefb48afc1d2fdfb1e0404fe12395683006e3f7` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:b0bb00da6865cdbb4d761ef935e1573359b3f293f1b55e07d7810252dd0c7c1e` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:65c0265ca56dddca5ac1909af2e827a50ade4b6bd7fa7e0840317b4be7dfcc38` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:d5f3ab92eacf2fced5af1918ec071cbc3c5fcae227caaee23ba24a5c7f690dcd` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:4798e4b74f752495e3f86098e43d3f8eb040469c1d47ea39be5fb72aee9f9d3a` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:8f009ea19064c0f16810c3751adde06a46aa57c19b400218bfc84972da0319a1` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:b782f2c8bfd781ad772533bc66999906325618c5248837e1107517f2dab36cb0` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:7dd293ae5e77426d61f149094cdd5cd270958c709e5450e2fd2e59071b3ecf27` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:ca97eb1e6ef469039eba9bc3f04e99bac616148263ecfb560d9038a5a6713dcd` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:7d1fa0d85783f56b148948d5559c8237301233a2183121d1a6b1b588ccd77f42` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:4ffb78da8965bc202d6e4933569e1dab7f71067094aa5fa0290d3c779be6b1d5` | `verification-decisions` | `verification-evidence` | `false` |

### rust-validator-proof-gap/context

- branchName: `bitcode/remediation-read_rust-validator-proof-gap_7044fe8972-rust-validator-proof-gap`
- readId: `read_rust-validator-proof-gap_7044fe8972`
- assetPackId: `asset_pack_3b7a68101d23`
- proofContractHash: `sha256:34f2a976e6dc61ca978b606608d7205e2c5c0cd4ed5e8eb38fdaea91c8faa026`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:4f09eb2ae7c6db3a769ab72b39c692158c09da634ddd72b205c3d7a507783ede` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:7dd293ae5e77426d61f149094cdd5cd270958c709e5450e2fd2e59071b3ecf27` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:952784485c94a90909c1e5e2a80883288938fdbf68574f8d529ee518fdc0b2a5` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:37d2ff77cc9bdc01ffd3d5eaaa3800571cb75fdce16914ccaad1ffabca503d91` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:717e03dc4dbacec818475f95617db4f40da6d528eeeaece35f18dc362ca969ab` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:f4596c1ca8aa6c7560ba782a8d655142be2fefd6d87615be8b51f2c39da8414f` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:34f2a976e6dc61ca978b606608d7205e2c5c0cd4ed5e8eb38fdaea91c8faa026` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:e648351a7138ca1276edb76f7c5798a35f6be1a9b418072f2e624c270003cff8` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:19278c55d71218caddd367a5e1b21d248f3a6158532871a539223a32be0c5e8c` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:37d2ff77cc9bdc01ffd3d5eaaa3800571cb75fdce16914ccaad1ffabca503d91` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:4910272ce690e05a4da36aede0dfdf5cebf5620df992644819cc88051d4e2e58` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:56d1ddda3f41936ad55777671a4cfd10750f674287862b06c17a83634b8c0285` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:ff62568a9de1e21b652e4e3182ec8f993e58f1397aa51d0339d88fc799c82e60` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:f4596c1ca8aa6c7560ba782a8d655142be2fefd6d87615be8b51f2c39da8414f` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:56d1ddda3f41936ad55777671a4cfd10750f674287862b06c17a83634b8c0285` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:1b72a64b055795e67f2177bc3797069ae0fd58d0a3d5c709dccf461390d49a4e` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:219fc46372c945c417cff684dc7c67798d80bad9c01a3388eacfd490b1a6b255` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:e13043611334caee42156d937557e178bdd4415d0b063bcdfc129d44fc8ec643` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:519f691be91077b676c361901d1deb1dc99c51698307c9d21f23b38c399893ec` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:276a42d09d1c3507cae113787129c222569bdb7a9934d70c791715e3a490b6b1` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:4f09eb2ae7c6db3a769ab72b39c692158c09da634ddd72b205c3d7a507783ede` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:5e125c7620a790c8e3fd50ad27d8602568d5d43e00b0aff8b8efa52127286d59` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:d2f4128d0f6e4e2627e0f46c69b00a6212616ad4f795bc599cc5e24be8d6a034` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:9c85838d234617258bbaba461d4afade881941b4a09ff4754af08824fa1281cd` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:21cb7730a4c4508217d95247da4677f13f792ca81b01c3edc6fea2a7f513e89e` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:7243dc10a8a7110d33cfb1e19b6e6dd11bd22dde647c71030cd14ce96cffefe1` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:24acf3a10dd89da1bdbfa4cc8591e537f89d28befa009a451cc3bfe09a64d5c6` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:75fee22c4117c5669cf0b25919bda19d9dd09d68faa223d6fc2bcf42c4b1045b` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:79125cbf4a797320623a707ad7419d9d6cb2fec735b90e8f4fe5b9cd8e59e033` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:4c9320e1fb1e760211f8851eb15ea69ba881504e90475e754a786add18174632` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:e095edda3ba3d6e04edddcd9e3878383ec33fd66f23ea7d2557718031d991b5a` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:721bc6d6f9a94bed07b07aa441ba4d92a689cc562f6594e5f04bea4c97c2dc18` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:a5211d59927786d89bf03d1d5f324abff026c82ed7730896cc964f12a01e6ab9` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:56d1ddda3f41936ad55777671a4cfd10750f674287862b06c17a83634b8c0285` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:f7f153fe92714565b805eadc8d881821945a69c5bdc66ca948c8fd252138acdc` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:952784485c94a90909c1e5e2a80883288938fdbf68574f8d529ee518fdc0b2a5` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:3f7148afee2a0b067968500edbdc812560dbc5936fae54b6558474ac8a4687d9` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:ea8daa50baf855ebc90a9ce32cba0f9063d02f165f0badee508fb646b673e6c7` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:441a223b4ac47882d958d1fbfdefb48afc1d2fdfb1e0404fe12395683006e3f7` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:727c072a206c5c44fa1c6e3a2546883a118ebe14445e9667a0ae272dcd7c10d7` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:afaa06fe8bd0394591492353368327f1874c5bcc160f0d993abf2370728819ab` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:02ccf498968830b618b2abeb28cd2e675c3fb01b927734418b250ef29c235fdd` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:717e03dc4dbacec818475f95617db4f40da6d528eeeaece35f18dc362ca969ab` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:8f009ea19064c0f16810c3751adde06a46aa57c19b400218bfc84972da0319a1` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:b782f2c8bfd781ad772533bc66999906325618c5248837e1107517f2dab36cb0` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:7dd293ae5e77426d61f149094cdd5cd270958c709e5450e2fd2e59071b3ecf27` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:ca97eb1e6ef469039eba9bc3f04e99bac616148263ecfb560d9038a5a6713dcd` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:7d1fa0d85783f56b148948d5559c8237301233a2183121d1a6b1b588ccd77f42` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:7da25e732a38b8f8712a544f5ed6b05c1e46b937b0e9c47f9cbd1bf0cd279a74` | `verification-decisions` | `verification-evidence` | `false` |

### config-policy-precedence-incident/patch

- branchName: `bitcode/remediation-read_config-policy-precedence-incident_f39d972e54-config-policy-precedence-incident`
- readId: `read_config-policy-precedence-incident_f39d972e54`
- assetPackId: `asset_pack_d0c7f0b06b9a`
- proofContractHash: `sha256:83aa4f69425eb95cb36148bfada58f4d224013ca26a2917c9b69bd61da2a57ac`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:341bab27034bb5ea4cbf3c84c4fad6af7999a0032535a796c678b186e7049bf4` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:5dda7271fe1c689026c0e8d950f873fbeffd1a657a7df9bdd6bbbcccc88113e6` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:cb142b06d96cd1ea3222957b284a3b4863cfbe85cc0bdbe69d5ad29b886ce419` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:b5606a50b6eb0e03353585bce86ce0d3ca493c16d507e4fa8b4d18b11eb59a71` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:e2161b30f8359370f7fbfc99091fc81d5d55e9e31c72e0b5a2a66be4f748a131` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:7feba115452010df8c55cadb0be0a0fa934152685ecb5817ed0291f2daba274e` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:83aa4f69425eb95cb36148bfada58f4d224013ca26a2917c9b69bd61da2a57ac` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:cdaa11532aaf3b123d72a2e387d2a198e4f0db37d0f49c1ac19d1112be80ea2f` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:b25fbfb1bfc6cae3f99732f72d6fe9480326972cd277c7ac18ddef13b8804f41` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:b5606a50b6eb0e03353585bce86ce0d3ca493c16d507e4fa8b4d18b11eb59a71` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:d916c391d1663edbb793477e0e5c71b41c503cbe5f125af46253fb7e6664d9de` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:ce9682c495f926c57cc5f5587430b0717c95dcf2061755fbefd8d57e892dc492` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:5165fbf0ac8579b32e842eaa6536ba9376f526a2fe4a43e4c47a7f85232ddf83` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:7feba115452010df8c55cadb0be0a0fa934152685ecb5817ed0291f2daba274e` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:ce9682c495f926c57cc5f5587430b0717c95dcf2061755fbefd8d57e892dc492` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:fe7fdb5d91537160137f7af897b5bd201651576d69440b8140ada814bb2959b2` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:c04c3591f60dd7d343077c7631ffa35ccc9e9bc6e608305c218e079aadc4548f` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:bd4f6f76beebdb3cffa4c50fe565718f118bc3ecd11b7b5442ac6444be656769` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:37dfa2db6fe88693a2ed13bfea82fa43ecbc5250256f9a5881547e3645bc0731` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:ad81c65fd80eae707038113a0bd0ad942b67566217b9427390e5fece14ee70b0` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:341bab27034bb5ea4cbf3c84c4fad6af7999a0032535a796c678b186e7049bf4` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:2a6e281fcd4a3d35f937a54f6906a4f063b301ec1fa4b7bbbd734091eb60a10f` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:70dfbc7edf50b2b469c977442ca6f0654dedd983a30174eb1b7aca7c4aff4e72` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:6d1316da3861442c5b766130b973a627c29242d5ade14afe37483c8c9b1a6bb5` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:51bcad14c5db9b7459a34a0389a7db4a596e2c0463aed3d47746a440aa5afa3d` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:63dfac749774e06c70652d08718aca00101084c0d0cb096ac057f707e8d3a0d1` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:10f9a395aa72e6feb2f3dec26ba16f2db3cdd41592a81c7efb348f5bdb05e339` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:32ab01fe64f2e64e3d3d19c1b5b3a5b2ff0db154e7e786ba1dd6ef107fd16ff7` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:79125cbf4a797320623a707ad7419d9d6cb2fec735b90e8f4fe5b9cd8e59e033` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:a32fbbdfd31f6caaac059a52ad1b1af0364770b4bf857a06b43f95ead26f40fb` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:7ff2e8c2cf327bf6e8771fbb764c9b66c481bccdea538ebd05d045cdaa576977` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:650ea4f81dca3a213ff9eda3a23580b55d069e180dce24aef77b3c033e596654` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:6d78fa0bbd1076be3b0ea026097aa5188f5f0123ee4f1e58dda83d838327c09c` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:ce9682c495f926c57cc5f5587430b0717c95dcf2061755fbefd8d57e892dc492` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:5e5b40250552626eda08490a78c415e951a0507b0251e600e9eadee4302983ff` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:cb142b06d96cd1ea3222957b284a3b4863cfbe85cc0bdbe69d5ad29b886ce419` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:501307fda8ba5ca845f985e7c2857595abc67ce54037f07ffa384080d45ca725` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:fdd7c9f7f92d31fd298f5a2259959d8f8e9b0cb1ce754e5d4a5a84aba4aa196b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:e2eb00a48eb8691cc490c735239b33a9c45cab59904c991f227a42c421c5cc49` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:5198f6682c8a7af2dbb502018a7463abe7417d4997f35436db49b5db2515a0b9` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:1c76fba96dc7531e1e0324fc0076a1e436a5b7a2c1cc075ba4aedead8ac4cf7c` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:e182aa1ce618398e2f5f957e5449281f0ecbe4728006b34b05838965ec78a41c` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:e2161b30f8359370f7fbfc99091fc81d5d55e9e31c72e0b5a2a66be4f748a131` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:ba57d7503ee19baee3d14abff0c0386aa5c6cac616c94d37a6d7f94d419b3d98` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:8f1938e2a6559b824050b52802ee5afc2fb3be7eb6672a1f0491d08b6850c695` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:5dda7271fe1c689026c0e8d950f873fbeffd1a657a7df9bdd6bbbcccc88113e6` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:c51ad650de2fa9e648c248db4958a15eb0073c1063cff700616bdd550fd0d294` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:d42488c92d5b4bbb05e7574c45b852168b2bc67d7a9efd7cc0fb20d5eb81d4fb` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:d90c9440b865e101aa56102292399b413c537835ede4ec90bbf847195706807d` | `verification-decisions` | `verification-evidence` | `false` |

### config-policy-precedence-incident/context

- branchName: `bitcode/remediation-read_config-policy-precedence-incident_f39d972e54-config-policy-precedence-incident`
- readId: `read_config-policy-precedence-incident_f39d972e54`
- assetPackId: `asset_pack_d0c7f0b06b9a`
- proofContractHash: `sha256:83aa4f69425eb95cb36148bfada58f4d224013ca26a2917c9b69bd61da2a57ac`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:341bab27034bb5ea4cbf3c84c4fad6af7999a0032535a796c678b186e7049bf4` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:5dda7271fe1c689026c0e8d950f873fbeffd1a657a7df9bdd6bbbcccc88113e6` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:b35d37fe26d442d50de032aaee771cb5c13b394e48722963e450a6556a095962` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:b5606a50b6eb0e03353585bce86ce0d3ca493c16d507e4fa8b4d18b11eb59a71` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:637d4ded2dfa3ce7d6b597716e6839d934d38747c5c2a536f8afb1e257a58aa0` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:3fda2201f8395275c9075dcdfb2274a38b5b7c7d8f57637ff937c6f6ec0687da` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:83aa4f69425eb95cb36148bfada58f4d224013ca26a2917c9b69bd61da2a57ac` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:c8d6e774d7e2d281e371167d59a0e236ed5279f0cc2310f126fbbcc2f46e8ff4` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:c13f40c79d646df44bbad7a6aa72cc2c4b416e0ba17d0a1a7c301c40f024c7b3` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:b5606a50b6eb0e03353585bce86ce0d3ca493c16d507e4fa8b4d18b11eb59a71` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:d916c391d1663edbb793477e0e5c71b41c503cbe5f125af46253fb7e6664d9de` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:d9d62322ab1a73c306e7bff5b5a1258527002ecd451892fc6908c6187a445125` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:5165fbf0ac8579b32e842eaa6536ba9376f526a2fe4a43e4c47a7f85232ddf83` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:3fda2201f8395275c9075dcdfb2274a38b5b7c7d8f57637ff937c6f6ec0687da` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:d9d62322ab1a73c306e7bff5b5a1258527002ecd451892fc6908c6187a445125` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:fe7fdb5d91537160137f7af897b5bd201651576d69440b8140ada814bb2959b2` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:c04c3591f60dd7d343077c7631ffa35ccc9e9bc6e608305c218e079aadc4548f` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:bd4f6f76beebdb3cffa4c50fe565718f118bc3ecd11b7b5442ac6444be656769` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:37dfa2db6fe88693a2ed13bfea82fa43ecbc5250256f9a5881547e3645bc0731` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:ad81c65fd80eae707038113a0bd0ad942b67566217b9427390e5fece14ee70b0` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:341bab27034bb5ea4cbf3c84c4fad6af7999a0032535a796c678b186e7049bf4` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:0309f74cd280d6f56073065c73e01a0d81a260e6dd1e7d6c10c8f27ab9eea4e1` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:2ee6b643505c60c98bb62ef3cfed0da34d9f668403a35fd3b5504328a9441600` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:4f4076430670545fc5dc50be860d8d71126263b0dc3d7c0e27370686b3d8a76c` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:85344442b67131ef5aff6c8ae74db54d49f971a9a1c4f6cd234993e5b0f0ac46` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:63dfac749774e06c70652d08718aca00101084c0d0cb096ac057f707e8d3a0d1` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:10f9a395aa72e6feb2f3dec26ba16f2db3cdd41592a81c7efb348f5bdb05e339` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:32ab01fe64f2e64e3d3d19c1b5b3a5b2ff0db154e7e786ba1dd6ef107fd16ff7` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:79125cbf4a797320623a707ad7419d9d6cb2fec735b90e8f4fe5b9cd8e59e033` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:a32fbbdfd31f6caaac059a52ad1b1af0364770b4bf857a06b43f95ead26f40fb` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:7ff2e8c2cf327bf6e8771fbb764c9b66c481bccdea538ebd05d045cdaa576977` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:650ea4f81dca3a213ff9eda3a23580b55d069e180dce24aef77b3c033e596654` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:6d78fa0bbd1076be3b0ea026097aa5188f5f0123ee4f1e58dda83d838327c09c` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:d9d62322ab1a73c306e7bff5b5a1258527002ecd451892fc6908c6187a445125` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:644e320c978ac4dcd4693348413fa7a55b1df32af529d518a88072dbb154b7ad` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:b35d37fe26d442d50de032aaee771cb5c13b394e48722963e450a6556a095962` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:501307fda8ba5ca845f985e7c2857595abc67ce54037f07ffa384080d45ca725` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:fdd7c9f7f92d31fd298f5a2259959d8f8e9b0cb1ce754e5d4a5a84aba4aa196b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:e2eb00a48eb8691cc490c735239b33a9c45cab59904c991f227a42c421c5cc49` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:c432db3615e95e4335740ba696370dff4e9338a03a7604224a449b7630d442a0` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:08f92dedde0fc775c6c52cba283a4b8ace556a94c440243431b622a675e8a8cb` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:a99cdfb7e88cffd23701cb23a8bc211b37f40954c31dbce9529791e61621fc82` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:637d4ded2dfa3ce7d6b597716e6839d934d38747c5c2a536f8afb1e257a58aa0` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:ba57d7503ee19baee3d14abff0c0386aa5c6cac616c94d37a6d7f94d419b3d98` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:8f1938e2a6559b824050b52802ee5afc2fb3be7eb6672a1f0491d08b6850c695` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:5dda7271fe1c689026c0e8d950f873fbeffd1a657a7df9bdd6bbbcccc88113e6` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:c51ad650de2fa9e648c248db4958a15eb0073c1063cff700616bdd550fd0d294` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:d42488c92d5b4bbb05e7574c45b852168b2bc67d7a9efd7cc0fb20d5eb81d4fb` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:9ad9eea14476d8ff6344fc93d9575f010d1ac1a747e0fefdc4da203bc371e4bb` | `verification-decisions` | `verification-evidence` | `false` |

### unsafe-patch-review-recovery/patch

- branchName: `bitcode/remediation-read_unsafe-patch-review-recovery_16a56c87c5-unsafe-patch-review-recovery`
- readId: `read_unsafe-patch-review-recovery_16a56c87c5`
- assetPackId: `asset_pack_cce630153e2f`
- proofContractHash: `sha256:1d3c713ffdc5133e3a2f11e00050728ab0191aaee894c1ffc1b97fbe500a66f0`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:04a97d2cc4e6adbb898ac04dc335c78fbbcbafa66ba06f2e03f7f6dd16470715` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:377d362462ddd325ae7c4c1f436dd57fb1ed72610c696ca9f9a5df66686b714f` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:2a809e20dd184437babda413048672266058c7f7b8994964237006acb072484f` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:7402cb7644b4e56a54c3e435d5af11400f99338b66614d8479043f0215066753` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:1c23ea9cb8d55dd030d6b8cf911fe426ca70d6e2dd1a2875149b9b9ef749e6a9` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:f586e24663a035f490921d939652293b836e050c8721fbab7b84b60b609e4471` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:1d3c713ffdc5133e3a2f11e00050728ab0191aaee894c1ffc1b97fbe500a66f0` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:abbc30776be85470a0393126a2d723c243daedea5eda751b055e52876e7ecd02` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:078a8f72779bc83dd0d1448c39c8a2613cc59420cbc2546ef633abe06ffb3fe9` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:7402cb7644b4e56a54c3e435d5af11400f99338b66614d8479043f0215066753` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:1e15c856668cb4a4ad5db6d75654f1d6a12c86db551444e29055c53692e6b339` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:3e8e6d5884c41035254b7c40507ee94d173576fa2fe7eaafc3d8dc499fed5b35` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:69cd7a0f2057d6887cc3ed251511abe607c58117e294639f58baea4e95d9bf85` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:f586e24663a035f490921d939652293b836e050c8721fbab7b84b60b609e4471` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:3e8e6d5884c41035254b7c40507ee94d173576fa2fe7eaafc3d8dc499fed5b35` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:02133c34e4c950723e1615b9a90967c8322c0021e5cb3365289f053997543f27` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:f0988f6b6166a84300a9ce998ad9a8a35914bf66ca92e3860d504564d7a387f7` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:fcae533d757248e65ef605bc5fa8a752848897f3a8a463743b03efa40a76257a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:81ed661185f840902ccc6f489c17657cae1c808596d26ff63d0a906e0290595f` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:17eb732be79c0822cb9ba16d3f55caa922a71b0f5d8f9ed42eb013de069d7c79` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:04a97d2cc4e6adbb898ac04dc335c78fbbcbafa66ba06f2e03f7f6dd16470715` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:fcb172d97adfad2b8a7b97c488ac8c9160b9a62445e8e23e843c4e3b47c04b27` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:bb7fceff2570971e83401ef4e52f55a9de538c68da43eb3751a280a5ebbc9304` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:1497918b2148fb9bad562416b2d46b90b85eeb988c3ea355e9aad5d38ea36547` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:c07529ced4d1be67c41088d536c28987b716a69dd93912bc787e9fb3d00dc7d2` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:8c9ce1da2936d4acb4e565e203c3dc740db5d466d5cb4ab1837bb23a513d22fa` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:983be6969ace07a90a289bdbbc9d3b7433785f14645cf84f6b600c98edc1060b` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:abfdb21610626a23355333ec28514af7c059249b842e96437f81e883e0a6b46c` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:79125cbf4a797320623a707ad7419d9d6cb2fec735b90e8f4fe5b9cd8e59e033` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:791d05f79f1b2df503f0b9bcefba15bc08413ed461d0b64cd3503149ab4d3fb9` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:699459500a28dbb00ebeb428dfe5df02855b6408e94fd6284e448b110fdd88e2` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:0ddd9c3527c0991887bbd08723dda8a2e53014e0533e7edf68873f938945f12a` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:f029c7b21d761c59a58abc433696f50fa4fda01e81401112e8b2b12fc6c28322` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:3e8e6d5884c41035254b7c40507ee94d173576fa2fe7eaafc3d8dc499fed5b35` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:85bf5b67a92a1ca5ef4741d7f02b04ca100899563c1b304ab75c2aadeeb46116` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:2a809e20dd184437babda413048672266058c7f7b8994964237006acb072484f` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:ea46703f1038d089fe7492ab6ac245b92340f8cad9dcd435f28b2e1acb638a63` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:5cf464309b76a143cbf7a6aa7809b3ba933be40f9d5f216b525853ab6cfc675b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:0bb8b155a2c04c9a5de97587562d9f28133d4eb3e6c654bf8bf3692388baec16` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:799295e9d3d79aa31e1c644802d648dbfff323cddc052a76e11a92e0b4278cb7` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:3cb5279f8728f1db6c304d5d5f2909c105e6bb1f8f9d5961cf4cb906067b7a95` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:b527a3606a21307d25de24a637c1f987f251bc3ddf4fa06cb37b7e696b784e7b` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:1c23ea9cb8d55dd030d6b8cf911fe426ca70d6e2dd1a2875149b9b9ef749e6a9` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:d0c2824e904ef7357f4d40882cbf0f772c4bc448954fc5f65c1c6aa4c933e179` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:1ffc7bce7c77371c0b9cb57cc888156526e32652e0f9bc5136cbb203dfba79f7` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:377d362462ddd325ae7c4c1f436dd57fb1ed72610c696ca9f9a5df66686b714f` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:a0d049ee7e85b5f568746fd41fbea1103bd81a64b9dcb79baad198175e593269` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:8c7cc1ac9acf776fafebd7e863c14df8737b5bde79bf09dbbfe8ec0da4fc4fbb` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:ea349d4e72c8ea62f4274abbed2f2193032bbf4036ce68d885b59373c8f3cf0f` | `verification-decisions` | `verification-evidence` | `false` |

### unsafe-patch-review-recovery/context

- branchName: `bitcode/remediation-read_unsafe-patch-review-recovery_16a56c87c5-unsafe-patch-review-recovery`
- readId: `read_unsafe-patch-review-recovery_16a56c87c5`
- assetPackId: `asset_pack_cce630153e2f`
- proofContractHash: `sha256:1d3c713ffdc5133e3a2f11e00050728ab0191aaee894c1ffc1b97fbe500a66f0`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:04a97d2cc4e6adbb898ac04dc335c78fbbcbafa66ba06f2e03f7f6dd16470715` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:377d362462ddd325ae7c4c1f436dd57fb1ed72610c696ca9f9a5df66686b714f` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:3b0408e0319b76ea7218b440e99b9cb4473f59fee9e7f0692d68f1caecb72931` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:7402cb7644b4e56a54c3e435d5af11400f99338b66614d8479043f0215066753` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:0c6ab8288b97a0fd368fe7d38a3fc1e0c518c346b72d6345e493a6885fe51753` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:bdd12a459db1cd068a38befd233ac35ce05d4826908dffa5c6238fe1198c71b3` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:1d3c713ffdc5133e3a2f11e00050728ab0191aaee894c1ffc1b97fbe500a66f0` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:04c55df1a934fdd1f694d1b30c3e38b9f4df4c022e165039d8024e245089d5c4` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:b4e8aec217a92683cd0be93f48678c859cc663a4aed8442f4533df4514df85c3` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:7402cb7644b4e56a54c3e435d5af11400f99338b66614d8479043f0215066753` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:1e15c856668cb4a4ad5db6d75654f1d6a12c86db551444e29055c53692e6b339` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:52f8171f3d038aa2a25caf047e261c08d1a1822fc27d6cb9289192936d6e1eb6` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:69cd7a0f2057d6887cc3ed251511abe607c58117e294639f58baea4e95d9bf85` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:bdd12a459db1cd068a38befd233ac35ce05d4826908dffa5c6238fe1198c71b3` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:52f8171f3d038aa2a25caf047e261c08d1a1822fc27d6cb9289192936d6e1eb6` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:02133c34e4c950723e1615b9a90967c8322c0021e5cb3365289f053997543f27` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:f0988f6b6166a84300a9ce998ad9a8a35914bf66ca92e3860d504564d7a387f7` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:fcae533d757248e65ef605bc5fa8a752848897f3a8a463743b03efa40a76257a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:81ed661185f840902ccc6f489c17657cae1c808596d26ff63d0a906e0290595f` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:17eb732be79c0822cb9ba16d3f55caa922a71b0f5d8f9ed42eb013de069d7c79` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:04a97d2cc4e6adbb898ac04dc335c78fbbcbafa66ba06f2e03f7f6dd16470715` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:e199c9550062e98d66bd75fe71fdab5941a26fcebf566d8ca0467194523730e0` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:65e22544f2d1d0d8cde4e7275620f8224e9ccdd8b393fc7001cc1911b6cf0c4a` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:0979d8fece848a46034cff3b7439c73928e4490316688e0a5458a29d4251c34f` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:2bce4d5bdc8e06a98b7573b468be829e64232be0c9832adb8ab62ede28ee2ca5` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:8c9ce1da2936d4acb4e565e203c3dc740db5d466d5cb4ab1837bb23a513d22fa` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:983be6969ace07a90a289bdbbc9d3b7433785f14645cf84f6b600c98edc1060b` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:abfdb21610626a23355333ec28514af7c059249b842e96437f81e883e0a6b46c` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:79125cbf4a797320623a707ad7419d9d6cb2fec735b90e8f4fe5b9cd8e59e033` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:791d05f79f1b2df503f0b9bcefba15bc08413ed461d0b64cd3503149ab4d3fb9` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:699459500a28dbb00ebeb428dfe5df02855b6408e94fd6284e448b110fdd88e2` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:0ddd9c3527c0991887bbd08723dda8a2e53014e0533e7edf68873f938945f12a` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:f029c7b21d761c59a58abc433696f50fa4fda01e81401112e8b2b12fc6c28322` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:52f8171f3d038aa2a25caf047e261c08d1a1822fc27d6cb9289192936d6e1eb6` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:4f207ce5044e2b0949ad20d383953e3364b009b99f8f16d429ec3a7a57004286` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:3b0408e0319b76ea7218b440e99b9cb4473f59fee9e7f0692d68f1caecb72931` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:ea46703f1038d089fe7492ab6ac245b92340f8cad9dcd435f28b2e1acb638a63` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:5cf464309b76a143cbf7a6aa7809b3ba933be40f9d5f216b525853ab6cfc675b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:0bb8b155a2c04c9a5de97587562d9f28133d4eb3e6c654bf8bf3692388baec16` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:c54baaaa0686ce1a8b707201d1b8f946a4d7543949feddcd79692ef0f6b1d7a3` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:a3e2515e80d912aafc1d25df1c58c75ad48d865144aea9cdbcb5b760aeaaebf9` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:da1ffeaa0dab3a9d10d6d74eb6feb9f393420f81a789dfe5b1334fe7777021d4` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:0c6ab8288b97a0fd368fe7d38a3fc1e0c518c346b72d6345e493a6885fe51753` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:d0c2824e904ef7357f4d40882cbf0f772c4bc448954fc5f65c1c6aa4c933e179` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:1ffc7bce7c77371c0b9cb57cc888156526e32652e0f9bc5136cbb203dfba79f7` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:377d362462ddd325ae7c4c1f436dd57fb1ed72610c696ca9f9a5df66686b714f` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:a0d049ee7e85b5f568746fd41fbea1103bd81a64b9dcb79baad198175e593269` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:8c7cc1ac9acf776fafebd7e863c14df8737b5bde79bf09dbbfe8ec0da4fc4fbb` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:a9f3e5057e18f483b4686c757c60ed967985e9408e0ced2f132c4f0a9aec811b` | `verification-decisions` | `verification-evidence` | `false` |

### infra-deployment-mismatch/patch

- branchName: `bitcode/remediation-read_infra-deployment-mismatch_be8a999141-infra-deployment-mismatch`
- readId: `read_infra-deployment-mismatch_be8a999141`
- assetPackId: `asset_pack_9f1b844a2cdf`
- proofContractHash: `sha256:7170c26e2b0d89451f79fe30b5e96f548a4f0c5e45f1947ee0fcefb109f93ca6`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:6a44eb26908aadf6943c6411c6e798675331f88d6e670690ac29f72f2df2d971` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:d5666ac8a6dcba67a0bfe3d33fa8d7cdd13e5d226369188d133343295d69fc29` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:5554805521c6d684a621d6c404026275f82bfc9a32a9063cc46532b815f4ff21` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:2c1624cf684ae0a83834d9c7a28789d966ff776e1c61c5fbb611b5d73392547c` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:cbfcc3cc8d66251b2dcef3b5d948254f0b138545884ce0ed005a350e74dbae6a` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:4cce4b0e39c1d228092ccaf383dfbcda4040c0e9115777f21c12695dd2605397` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:7170c26e2b0d89451f79fe30b5e96f548a4f0c5e45f1947ee0fcefb109f93ca6` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:b64dfc3bd493a147c1abd7b0a7c7c39ee2c87017375c69688c3718cc37256f58` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:8102e2e735b13179a502977a86babc3a143319143dcaab933e6294b59ada151b` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:2c1624cf684ae0a83834d9c7a28789d966ff776e1c61c5fbb611b5d73392547c` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:f8d2fcfc7c2f80d195b4b7a63876aba729bf0b8b51b153764bed2b6f2a6176a3` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:cbca71525b191736e08f83a5225365d9374fca60903a2b077374afa664bbf4f8` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:f8275c847d1dbe7a9583bf4c8d0260408dfd5616a0bd05c4e19d6d6c4340aa3a` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:4cce4b0e39c1d228092ccaf383dfbcda4040c0e9115777f21c12695dd2605397` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:cbca71525b191736e08f83a5225365d9374fca60903a2b077374afa664bbf4f8` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:7a50c7e61d4c94b39b2390014a694aa9a453916258ff5511774ce90454bbf27d` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:965ba1aff4604765638f5f2fba6721007f57f6d4fa553938df7397fa460ad8d1` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:980c3e9afa612cfbdae5fee2668cea479236ea1ed699ed688ed553f8d960a054` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:67909363540bab7e1ac5446932fe50fad555bcf351001db03c7f104666a78cdb` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:a7f910211080b140df9104153bc1ee2ca4e79cc014b42d89ee687e24278319c6` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:6a44eb26908aadf6943c6411c6e798675331f88d6e670690ac29f72f2df2d971` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:a7ca588dddbfafce36107d95c7d237b46c644c0122614e4967656c308fb38365` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:b9a7f2de35b107af0855324dfacc099efd07408e720f1369d8ac0975fc6c63c5` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:7dc8887e06981d6c318794b761e0df050f65005e7df02d4f3478308de3d97d97` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:7f630cfce7e0cb6347869b41f220ce253d541a4dbb1d0b321277a3e01fa2b82e` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:7a7149783ec4e0c2118e45c770c255aa00e6c076b6f2359a9b2cf7a84cb1d8e0` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:704fbd5b7fc3e93e4cc79054f0ed587fb42b94919dd3364a840a87b9f544d2da` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:adfd68a5c9458827e53484abc4f4b7c24320972545e0f5becd4c3443d1b828fd` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:79125cbf4a797320623a707ad7419d9d6cb2fec735b90e8f4fe5b9cd8e59e033` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:e8f75314e80d343646088acd7aba5909bb2ffd83e6a97a622bbd9726d4e5615b` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:d170dc4a100d8e868ed2a00932076332bd30e007c2a8a2b331b79567eae5c745` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:8ffd430d1f8069736b391ba547e0c34c8112b34c5b8692f8d685bffef13cfd34` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:829d529da7286600464fec1b18a1ead2bbc27dc71aa8940f3034ffecfdb63114` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:cbca71525b191736e08f83a5225365d9374fca60903a2b077374afa664bbf4f8` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:d3f60fbe71971443246be6166f09dfab9d6baf02c39092057a836cbd96aff8b3` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:5554805521c6d684a621d6c404026275f82bfc9a32a9063cc46532b815f4ff21` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:b0acbf48dbd4c5a4202a8683fc011822c96f6d7c566fd287412d544f7de1b4be` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:8f1970d50b815044e763d8f192ab7269689ea0b3916334f534df680e4b3eed57` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:5ebeb320a1bcaa26f0f5131950831d144edc04744ed7f80d900f55b2d6efc90a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:6ae0678494caf66c04b59896845189b77f4ad072cb3b4e72b6c48e5365d8bbb1` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:e38ea3d9c9515d5ff396a8cd20b7ceef4f9da904bb86ac460e0f9d0e73512757` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:ef08088d345fda0c26db631772ac3c448f8dfeaa056685a9ef21e17165a5bee7` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:cbfcc3cc8d66251b2dcef3b5d948254f0b138545884ce0ed005a350e74dbae6a` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:81cb9d04a88483e9a534ebb47a3c9dba1ca3ccdbfe7dd6b363516979753c0a6c` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:baf352d37937dbb20d6f75992ce457f7cc170f98a9f67d2c0222617bf330c328` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:d5666ac8a6dcba67a0bfe3d33fa8d7cdd13e5d226369188d133343295d69fc29` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:a01835292f5b4bd3430aa38a2d2487e52b5b0261a8fb09d335cd9b35da13eee7` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:a7422762156150e3238d3ab270a334a573ad9e73ddb412f0ef193911a8b3d5aa` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:a5fe22fd99ff1b609cd1812f8e7bddd05a5bdad381c91d7e6e996783b28ac2cd` | `verification-decisions` | `verification-evidence` | `false` |

### infra-deployment-mismatch/context

- branchName: `bitcode/remediation-read_infra-deployment-mismatch_be8a999141-infra-deployment-mismatch`
- readId: `read_infra-deployment-mismatch_be8a999141`
- assetPackId: `asset_pack_9f1b844a2cdf`
- proofContractHash: `sha256:7170c26e2b0d89451f79fe30b5e96f548a4f0c5e45f1947ee0fcefb109f93ca6`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:6a44eb26908aadf6943c6411c6e798675331f88d6e670690ac29f72f2df2d971` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:d5666ac8a6dcba67a0bfe3d33fa8d7cdd13e5d226369188d133343295d69fc29` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:2a2b51730647470332f6a9c7cb16a61c50bed4f78f20fbe285b4f0ccf7b51d15` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:2c1624cf684ae0a83834d9c7a28789d966ff776e1c61c5fbb611b5d73392547c` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:713c1056dde545f145ffb98db0019127b6462ec6d006c530bf0a2fc7b0fa9ea1` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:f4c83cdccfabb13a0928e479e31db2b61be251cfc4832fcd6ea98bb499371155` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:7170c26e2b0d89451f79fe30b5e96f548a4f0c5e45f1947ee0fcefb109f93ca6` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:c73fea919fa434b77e9a07c9f7fae7f3627985bd39867bb45788cfd3c1383e42` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:3814c5fe0c016ec138019399b81d88e2dc38d2b2a6d3d6d7a28cd27b06a207ac` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:2c1624cf684ae0a83834d9c7a28789d966ff776e1c61c5fbb611b5d73392547c` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:f8d2fcfc7c2f80d195b4b7a63876aba729bf0b8b51b153764bed2b6f2a6176a3` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:a95f89bec667eab9e09c0a2ab941628cee5e339ae8039331269c6e430c6b80d6` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:f8275c847d1dbe7a9583bf4c8d0260408dfd5616a0bd05c4e19d6d6c4340aa3a` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:f4c83cdccfabb13a0928e479e31db2b61be251cfc4832fcd6ea98bb499371155` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:a95f89bec667eab9e09c0a2ab941628cee5e339ae8039331269c6e430c6b80d6` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:7a50c7e61d4c94b39b2390014a694aa9a453916258ff5511774ce90454bbf27d` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:965ba1aff4604765638f5f2fba6721007f57f6d4fa553938df7397fa460ad8d1` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:980c3e9afa612cfbdae5fee2668cea479236ea1ed699ed688ed553f8d960a054` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:67909363540bab7e1ac5446932fe50fad555bcf351001db03c7f104666a78cdb` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:a7f910211080b140df9104153bc1ee2ca4e79cc014b42d89ee687e24278319c6` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:6a44eb26908aadf6943c6411c6e798675331f88d6e670690ac29f72f2df2d971` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:3dc46c757b0617248af558fcd07a9e7e1a76281804749174d8e8100cf3fe24c5` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:9038afd7aeb57c7d71fbe249602cc9c932d73bc4c9c9c847a55f8f4513aaffd9` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:eceafd0aa2326b7a7b36d83e8e3876ffc9761d6cc3c869b5ef89ef8d7918c001` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:495853c330ef53743a2ec1711f40d28094b8d964f541f68adb8cf9695cd6d5c3` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:7a7149783ec4e0c2118e45c770c255aa00e6c076b6f2359a9b2cf7a84cb1d8e0` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:704fbd5b7fc3e93e4cc79054f0ed587fb42b94919dd3364a840a87b9f544d2da` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:adfd68a5c9458827e53484abc4f4b7c24320972545e0f5becd4c3443d1b828fd` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:79125cbf4a797320623a707ad7419d9d6cb2fec735b90e8f4fe5b9cd8e59e033` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:e8f75314e80d343646088acd7aba5909bb2ffd83e6a97a622bbd9726d4e5615b` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:d170dc4a100d8e868ed2a00932076332bd30e007c2a8a2b331b79567eae5c745` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:8ffd430d1f8069736b391ba547e0c34c8112b34c5b8692f8d685bffef13cfd34` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:829d529da7286600464fec1b18a1ead2bbc27dc71aa8940f3034ffecfdb63114` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:a95f89bec667eab9e09c0a2ab941628cee5e339ae8039331269c6e430c6b80d6` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:8c64eb02fda26bb6fa9688ec996cd1a3535c8b739d965803cfda7afba4372909` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:2a2b51730647470332f6a9c7cb16a61c50bed4f78f20fbe285b4f0ccf7b51d15` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:b0acbf48dbd4c5a4202a8683fc011822c96f6d7c566fd287412d544f7de1b4be` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:8f1970d50b815044e763d8f192ab7269689ea0b3916334f534df680e4b3eed57` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:5ebeb320a1bcaa26f0f5131950831d144edc04744ed7f80d900f55b2d6efc90a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:84ddf5d78af850b819d5950766ca3b7dfc55adb476de9466683552b015b61d4c` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:dfe35f5cc5ca25b1c8111243deb50acea2b7bed4d67fde175ffec87eb642f65b` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:e48ef327efe677bc83e35da3c338082fe6638842e2b0d66714b1a36c4c5f30e9` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:713c1056dde545f145ffb98db0019127b6462ec6d006c530bf0a2fc7b0fa9ea1` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:81cb9d04a88483e9a534ebb47a3c9dba1ca3ccdbfe7dd6b363516979753c0a6c` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:baf352d37937dbb20d6f75992ce457f7cc170f98a9f67d2c0222617bf330c328` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:d5666ac8a6dcba67a0bfe3d33fa8d7cdd13e5d226369188d133343295d69fc29` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:a01835292f5b4bd3430aa38a2d2487e52b5b0261a8fb09d335cd9b35da13eee7` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:a7422762156150e3238d3ab270a334a573ad9e73ddb412f0ef193911a8b3d5aa` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:292a210164ffc67673f8cfc309a3a0b9f682aae482b5e503c3aa7fe96d008c14` | `verification-decisions` | `verification-evidence` | `false` |

### privacy-boundary-proof-export/patch

- branchName: `bitcode/remediation-read_privacy-boundary-proof-export_8163942d95-privacy-boundary-proof-export`
- readId: `read_privacy-boundary-proof-export_8163942d95`
- assetPackId: `asset_pack_c5fef3ab17c5`
- proofContractHash: `sha256:94214cf13298a6992d32afa5572d4359fc9c21a74ab86c4625e2b03d3a1a6d6c`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:87fc217050d4e5b915bb3c9db7f3ef68a6857fa16d4840d21cb20b46b285a370` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:234d29c603cb2e9066cb04a0ef0ad3729d41f58ef8a2e4f53ca407062646aae3` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:e02e083b3e0bcc576ab943385968b3bc1665a6ced2660d1f605942a2ba3d6c1e` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:f2c2274fe3b2459987f6cd51e99ec1ad6dc5de25aa6db87029bc93ef15ef7e7b` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:26b67f835201cb735147d27c26176c7a5bf2e21eb629af56ccd98be5f77d4626` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:7c551377048988aa559ceee58841c71e9b89a7b63658fe9c7fe4ea1ffb66f90a` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:94214cf13298a6992d32afa5572d4359fc9c21a74ab86c4625e2b03d3a1a6d6c` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:50a17d03bb7be7a8df62806f08ee0e27aebd634074d4cbe1640cbe56df69930a` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:e1bc31f5d93cbc4b532f6818015026500a35b4fe7134903b5140ad3d4e8d68bf` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:f2c2274fe3b2459987f6cd51e99ec1ad6dc5de25aa6db87029bc93ef15ef7e7b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:12eb37c75757ad72700d9fe0d9ccb566c6454f27afa168f57e11e90e8a0c8716` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:fc0e33be02f1ef77af6bc200f2a0d7f354b910bffe07bb609e4f684a156c2e80` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:6a5446d198324e7e4748c2065940512b05e045dadcc10d8ffda3f6d828fa06fa` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:7c551377048988aa559ceee58841c71e9b89a7b63658fe9c7fe4ea1ffb66f90a` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:fc0e33be02f1ef77af6bc200f2a0d7f354b910bffe07bb609e4f684a156c2e80` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:88aed215f4d18034cedf67a44e9a48d0b1aa2b686b4fc38f243712f0e838f4b0` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:af97dfb3f8e18887a6773e83a62e8edffb3d663e62998dcb491cedab10b16211` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:eda32290cfc4a6b5c8ebff0eebd2d99d434dfe9c00c75b79597dcc1203e66fea` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:9fe9c80a46c4ca82f8547d3976e588d241e2726621c5480e5805a22fa1528007` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:250d56416dc51f46deaf4f87284c0e40f091d2eb3f29858d0c1f3aa6db3bca6a` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:87fc217050d4e5b915bb3c9db7f3ef68a6857fa16d4840d21cb20b46b285a370` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:a141b4bdf8c4659b8673034b87b34dd0a9db5b92993e2daa53a43a9ef375b402` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:9847c2a51a10446110085211de83a03a0019f173fabe637d04da8614680576c3` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:54e7883de41f23af88f851e94ebb9ab7165b4e65325f040f102b6868661c7fa6` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:5b454c4ec23e609b5dcb19e626fe75deacba2ed297bdb415aefe5eb0cab4b9d9` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:f9291e5ec3a4ca411ddfbd96dca075400c8c80e3a1286970f0757586c4f88b70` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:3b72a0802fbba9cf1ee386757f85466daabb98c2e9b9fb40117fa7d22a708323` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:de50ba7c48e3cac6f699797df985ef6f0cf71ce49e1f6d1aade0f3faf6839693` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:79125cbf4a797320623a707ad7419d9d6cb2fec735b90e8f4fe5b9cd8e59e033` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:8f045bf37e019386645eeba07916dcb19744ac5a53bb4ed14cfd65e473e9bbec` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:37b1323da0ed7326c7d4be71c74b160a5719bcd9cecf1f21cf1f9f786b37d5e1` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:cb7cb4f174e5ee07bce0350e233e9e25235d25aff988b631ca40c60db81dd19b` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:347fe9b28ce05aecb94a9269a5030766c6507c2bc5c853f76ed5a962bd7f4d6e` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:fc0e33be02f1ef77af6bc200f2a0d7f354b910bffe07bb609e4f684a156c2e80` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:ea23c293890a4a0ccb58866a2aad9df464c77cbc4de647e4bbc86e1be3344547` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:e02e083b3e0bcc576ab943385968b3bc1665a6ced2660d1f605942a2ba3d6c1e` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:d2bb74466474b95020ef27ac13ab2978c4b4fe1d19cb41146414f38dfca8200b` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:51a841a7255f59929dbd350752437fd41a64b9fd512ffb10dbdf090b0652ab6a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:b6e41e04d9cc34b04f15d5493cb1b05103ce8270dcdb99e54a54b1e05411203f` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:fd27081ad28c4bb2a0be07c43591a64d9055900aa9455c71ee9c837b5d9ff798` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:73eee65a38ddfba79bab59bff35daac0eef340b6986581f7d95c8f384c151b1c` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:324c164381d47ffbfdc4811e86d15db72a9b252d3046597b3de11dc5ca01e6bd` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:26b67f835201cb735147d27c26176c7a5bf2e21eb629af56ccd98be5f77d4626` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:521a6dc55ecc831891cc7751754790b1c9e63a8019266e9955e60f7a4adbece3` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:61947676f617771d43af25215055398ff0ba22bafbc2f63e17183827b75a2120` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:234d29c603cb2e9066cb04a0ef0ad3729d41f58ef8a2e4f53ca407062646aae3` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:06bb775c26f970432704f8334f6fa4c43f9a42409f0b2c015c627330ff2037d6` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:7ae9c974b62b1f54c1d5a9816c7c48a1d671e8c07a08170ca52399e1e395c73f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:5e88a0db002fe7b6818677dc7bf707a424ba6d010266a81b5f6c08cafee92092` | `verification-decisions` | `verification-evidence` | `false` |

### privacy-boundary-proof-export/context

- branchName: `bitcode/remediation-read_privacy-boundary-proof-export_8163942d95-privacy-boundary-proof-export`
- readId: `read_privacy-boundary-proof-export_8163942d95`
- assetPackId: `asset_pack_c5fef3ab17c5`
- proofContractHash: `sha256:94214cf13298a6992d32afa5572d4359fc9c21a74ab86c4625e2b03d3a1a6d6c`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:87fc217050d4e5b915bb3c9db7f3ef68a6857fa16d4840d21cb20b46b285a370` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:234d29c603cb2e9066cb04a0ef0ad3729d41f58ef8a2e4f53ca407062646aae3` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:00a97248b8d41dc62075a7dc623efbf35d5fbc706c6524fa6208e8d7bd85de0d` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:f2c2274fe3b2459987f6cd51e99ec1ad6dc5de25aa6db87029bc93ef15ef7e7b` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:73de5536bad96fcf0659d4ee3dc146b38deeefbef1de37ed2e69397750f643db` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:a589c317909a07d709b99325e06da18f23e979b8e4cc2f01e5e2ac62cab9dafe` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:94214cf13298a6992d32afa5572d4359fc9c21a74ab86c4625e2b03d3a1a6d6c` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:59119a73fbf95cca5148e09a8bed74d695ae562bbbe942670cdd0d6ffe8703a0` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:15f0e703b189cc2647b4caf47ebaa26bb19e9ba30fe206b9743135d0e43b9c4d` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:f2c2274fe3b2459987f6cd51e99ec1ad6dc5de25aa6db87029bc93ef15ef7e7b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:12eb37c75757ad72700d9fe0d9ccb566c6454f27afa168f57e11e90e8a0c8716` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:b4d6a60ba64989be522956970a9bb571fc293dfddcc40b68d4bdb8d97fe5b5cf` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:6a5446d198324e7e4748c2065940512b05e045dadcc10d8ffda3f6d828fa06fa` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:a589c317909a07d709b99325e06da18f23e979b8e4cc2f01e5e2ac62cab9dafe` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:b4d6a60ba64989be522956970a9bb571fc293dfddcc40b68d4bdb8d97fe5b5cf` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:88aed215f4d18034cedf67a44e9a48d0b1aa2b686b4fc38f243712f0e838f4b0` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:af97dfb3f8e18887a6773e83a62e8edffb3d663e62998dcb491cedab10b16211` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:eda32290cfc4a6b5c8ebff0eebd2d99d434dfe9c00c75b79597dcc1203e66fea` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:9fe9c80a46c4ca82f8547d3976e588d241e2726621c5480e5805a22fa1528007` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:250d56416dc51f46deaf4f87284c0e40f091d2eb3f29858d0c1f3aa6db3bca6a` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:87fc217050d4e5b915bb3c9db7f3ef68a6857fa16d4840d21cb20b46b285a370` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:87776778ee2357eb269dfb6ee9978c21d4dd2d70d9c7f874b37de502e8100970` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:845906fbaa1331be9b3816b28d235ed92ec2dc4ac53ba6aba7dca0a4b8b0ec72` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:db3edc4d4b8ec0d848af9cc1a2cab826ec2f02d27a79e65f877ad41ec65b300f` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:bc3e7fcb121d4d584440160e0e7987144ae6835194e441d3c7bba3580af9f411` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:f9291e5ec3a4ca411ddfbd96dca075400c8c80e3a1286970f0757586c4f88b70` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:3b72a0802fbba9cf1ee386757f85466daabb98c2e9b9fb40117fa7d22a708323` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:de50ba7c48e3cac6f699797df985ef6f0cf71ce49e1f6d1aade0f3faf6839693` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:79125cbf4a797320623a707ad7419d9d6cb2fec735b90e8f4fe5b9cd8e59e033` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:8f045bf37e019386645eeba07916dcb19744ac5a53bb4ed14cfd65e473e9bbec` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:37b1323da0ed7326c7d4be71c74b160a5719bcd9cecf1f21cf1f9f786b37d5e1` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:cb7cb4f174e5ee07bce0350e233e9e25235d25aff988b631ca40c60db81dd19b` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:347fe9b28ce05aecb94a9269a5030766c6507c2bc5c853f76ed5a962bd7f4d6e` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:b4d6a60ba64989be522956970a9bb571fc293dfddcc40b68d4bdb8d97fe5b5cf` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:c2d73f7078ecc53f0cdb148f0e18b4af2bb53642118d2e1cf7dfaca8534182a9` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:00a97248b8d41dc62075a7dc623efbf35d5fbc706c6524fa6208e8d7bd85de0d` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:d2bb74466474b95020ef27ac13ab2978c4b4fe1d19cb41146414f38dfca8200b` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:51a841a7255f59929dbd350752437fd41a64b9fd512ffb10dbdf090b0652ab6a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:b6e41e04d9cc34b04f15d5493cb1b05103ce8270dcdb99e54a54b1e05411203f` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:6253926d92af03530870a550a42045d2ca2ae4f6f91facca489940166a2f060e` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:1e8f675348d3a4eba42ff25de58da663cd1170cb7a05fcba5c10abf2a6651bf1` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:6c2176fe619c63b32dc18bdc5368d5683ad2b18aaf9145f2f3050bdce6b18b59` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:73de5536bad96fcf0659d4ee3dc146b38deeefbef1de37ed2e69397750f643db` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:521a6dc55ecc831891cc7751754790b1c9e63a8019266e9955e60f7a4adbece3` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:61947676f617771d43af25215055398ff0ba22bafbc2f63e17183827b75a2120` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:234d29c603cb2e9066cb04a0ef0ad3729d41f58ef8a2e4f53ca407062646aae3` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:06bb775c26f970432704f8334f6fa4c43f9a42409f0b2c015c627330ff2037d6` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:7ae9c974b62b1f54c1d5a9816c7c48a1d671e8c07a08170ca52399e1e395c73f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:e88f61f0bb817831bc9c72a5220ab1f20ad393f1aa259934bba534b654462f69` | `verification-decisions` | `verification-evidence` | `false` |

### polyglot-gateway-benchmark-remediation/patch

- branchName: `bitcode/remediation-read_polyglot-gateway-benchmark-remediation_ca6f233369-polyglot-gateway-benchmark-remediation`
- readId: `read_polyglot-gateway-benchmark-remediation_ca6f233369`
- assetPackId: `asset_pack_654da1e46737`
- proofContractHash: `sha256:22639f352c74be4b4f1c33522cbea29687fbe5455521c9aed0d64103a90f5426`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:8ab3e39c78bd87bf4c686eb3b3a3cfa9ace4af2b6a0665a2726e455b86c3b5b2` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:bada346830f6fd2dd28aaeb039f6d60ee70809aaccd48288f84fd18b97037c06` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:bb8a91a07e8845178eaf50b2b79a9f52d359ac16489e8a1b17f03552bce11844` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:2601ed3cf5d29afa89ec9fdd61c1ac6692aab4481f745e0b898542c7a31c224d` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:a2e27586d7318245f7496b399919a86953e18966ffcfc05115721fc2aaecdcfe` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:90e855d681cb2b0ddef86a88f9a3f12a5b306511bf5fc1535a4145b2a63680bf` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:22639f352c74be4b4f1c33522cbea29687fbe5455521c9aed0d64103a90f5426` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:0f17fa10b9e28f9fac9d126bdb0b8a42c2827feb6231edc5534f0cff51b70424` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:37106b281c3b7428fcd53e8bd9a69ccd58fb658adaac0bc01d2caf380b15f4ef` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:2601ed3cf5d29afa89ec9fdd61c1ac6692aab4481f745e0b898542c7a31c224d` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:00c46d08aab790938dc56e36d4ba6d4901717b428de1950112c6195c5f66d082` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:6274b5b608cef5b40769a9dc1b50ba30de647bc759792d8db32b5ec7794d8eae` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:1bde5ea5c5373fd0d67216e0ef1b27f43f0f1b7e5afc749bcff039386c59e6b5` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:90e855d681cb2b0ddef86a88f9a3f12a5b306511bf5fc1535a4145b2a63680bf` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:6274b5b608cef5b40769a9dc1b50ba30de647bc759792d8db32b5ec7794d8eae` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:52a80b47e65dba97e9678e0ef96c22dcd8d844ff307012d8f777ed1a729ced3c` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:3d0fd91029cf718d0b2edde26a725f4417aba6d84d393f64131034bef16d1015` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:59bb92186982aa56b70f6576eeab1ac6c988578b7d65a04a32db195b368ab97a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:395553fbe74a5c6721e73f157a8dfbe7109ca86d2414a7d10217873f996c1fc8` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:a334f0e7a5667f10b9c70831920b1ea755383f680661768745ee7403026d3520` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:8ab3e39c78bd87bf4c686eb3b3a3cfa9ace4af2b6a0665a2726e455b86c3b5b2` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:58c42eb9f8ba892bb071b8ad41905cf51ba215330e3659ca7039ac6583929d2b` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:adda92ad7a71be6de0ea163779031aec2081466b8d9a08e7e5abb3c5403bf321` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:c847260c42c924dfc3b42f90524fc1e192ce60334687081738a3ed4609fb5e48` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:a7eb907f44fadfd982f6f1aafb6d32def6471427e91552fb7691a9490f61de12` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:84d1d88fa48a166c1e09dc8d5a7fa6438a3d4680b403fad2cb97e920b24d7479` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:32721a082f3cca9043f2e25b25e277546b1e5b4819e188e068ed20c3d7eae183` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:bba36f476eee16207d7ebdd896e4ba21836dcbda21ca4b2b0d68e8d38b7de713` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:79125cbf4a797320623a707ad7419d9d6cb2fec735b90e8f4fe5b9cd8e59e033` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:4bf6468365de826f38562e2fe346fbb222766db20027e71024f3282ac7f37e02` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:cee097f697032a71ffc726b266094799ff80f3c77a75e51fde8925df89d0eda5` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:e6347bfa13386df8d062f8d9bc665c055b2bcc8bd10df6471b3b3352441ceae9` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:3fe61d2a7f249f311bf397531a09641a8c663c4fd77b4ed0b6b8db43a738673c` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:6274b5b608cef5b40769a9dc1b50ba30de647bc759792d8db32b5ec7794d8eae` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:9101da150821237dc101a861e4efce99adc70e32bb475764ef2baec7deba9f51` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:bb8a91a07e8845178eaf50b2b79a9f52d359ac16489e8a1b17f03552bce11844` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:c1e577b132475f4b327b593f0ec0052f8bb6668c7efad0693bfdc79debd96f2c` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:7cd7e52ebfbe66f7b7fedc9100e7803f6823a28488837f408ce98b076987d75b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:90ba01dc7e88620db2b4819707607264e84495284cca7c9f7a81e9d671fa20de` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:5d95cdef7baccc9658b1e5d8af26e51958ee9870e9d294ae7b0756aa16922e71` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:1c1442867dfb3ce195ac6b0719db2daa6f55dc277b295b5e9115b32ca7cad327` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:918dca39773d6bec750aeb8936933d23bd8172beaa14795b1e3ed1fe76492fe4` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:a2e27586d7318245f7496b399919a86953e18966ffcfc05115721fc2aaecdcfe` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:70876006dc0c82da94e83a2b5faaff421960021e01454778c6c8dbbfb7d0c510` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:d240261f1d94c737777ba934bfdf547e88f1cac426576b9a4a2cdf62abb57a43` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:bada346830f6fd2dd28aaeb039f6d60ee70809aaccd48288f84fd18b97037c06` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:07026d7b4ec3fe833f803732b52c229dd15f40cf34e974b4820dcb32b863c690` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:ccd4830dfe15a2fe99e10be759f252bb00789ec5422fdc28ba635ee8aaaa2286` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:67e227ff75ced5656905421d22b53856048bc851695a738e705a34c6eff3e9b1` | `verification-decisions` | `verification-evidence` | `false` |

### polyglot-gateway-benchmark-remediation/context

- branchName: `bitcode/remediation-read_polyglot-gateway-benchmark-remediation_ca6f233369-polyglot-gateway-benchmark-remediation`
- readId: `read_polyglot-gateway-benchmark-remediation_ca6f233369`
- assetPackId: `asset_pack_654da1e46737`
- proofContractHash: `sha256:22639f352c74be4b4f1c33522cbea29687fbe5455521c9aed0d64103a90f5426`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:8ab3e39c78bd87bf4c686eb3b3a3cfa9ace4af2b6a0665a2726e455b86c3b5b2` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:bada346830f6fd2dd28aaeb039f6d60ee70809aaccd48288f84fd18b97037c06` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:6adcc2bbf6399996a5221a623f704edc944b8baa6c09339c36c2c2bb6e24ecca` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:2601ed3cf5d29afa89ec9fdd61c1ac6692aab4481f745e0b898542c7a31c224d` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:61b76bdf41aba7db3cf3234aef8873703025dda83b268fd93807f264b938df56` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:fbef435b642c100b12ae890805b508259b43efc208228e6443694a80c9f238be` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:22639f352c74be4b4f1c33522cbea29687fbe5455521c9aed0d64103a90f5426` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:0abf7f66fe0ed44ca9ba46482b2be818239757b2366eeb8d2590194d11c9b3c2` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:f9fcd6e34d7afbd2cec19f86d52016a8bea972880b09b51e4cba5bde233c12c7` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:2601ed3cf5d29afa89ec9fdd61c1ac6692aab4481f745e0b898542c7a31c224d` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:00c46d08aab790938dc56e36d4ba6d4901717b428de1950112c6195c5f66d082` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:d1439026785bc881585cb978f5fa74734b58c845915deedc9fd97b6df28cc3d3` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:1bde5ea5c5373fd0d67216e0ef1b27f43f0f1b7e5afc749bcff039386c59e6b5` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:fbef435b642c100b12ae890805b508259b43efc208228e6443694a80c9f238be` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:d1439026785bc881585cb978f5fa74734b58c845915deedc9fd97b6df28cc3d3` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:52a80b47e65dba97e9678e0ef96c22dcd8d844ff307012d8f777ed1a729ced3c` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:3d0fd91029cf718d0b2edde26a725f4417aba6d84d393f64131034bef16d1015` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:59bb92186982aa56b70f6576eeab1ac6c988578b7d65a04a32db195b368ab97a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:395553fbe74a5c6721e73f157a8dfbe7109ca86d2414a7d10217873f996c1fc8` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:a334f0e7a5667f10b9c70831920b1ea755383f680661768745ee7403026d3520` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:8ab3e39c78bd87bf4c686eb3b3a3cfa9ace4af2b6a0665a2726e455b86c3b5b2` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:85b9e0e294968560055014dcd2a989cad5b13bc80500d77d874aa7be4c5ac558` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:ab16b7c5f25f76e9de60c71ad246dbb6346d4969786ba01b6fc55da0e7c4f49d` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:c2596397e98a0fa88cafb8c8015e4b690b71596062fa03f2d65ade1b2f0ddd2a` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:d58c8df93723f5af3cae6552858918ede3bd6bf6b8b23dfc35943f276ff5fb18` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:84d1d88fa48a166c1e09dc8d5a7fa6438a3d4680b403fad2cb97e920b24d7479` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:32721a082f3cca9043f2e25b25e277546b1e5b4819e188e068ed20c3d7eae183` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:bba36f476eee16207d7ebdd896e4ba21836dcbda21ca4b2b0d68e8d38b7de713` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:79125cbf4a797320623a707ad7419d9d6cb2fec735b90e8f4fe5b9cd8e59e033` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:4bf6468365de826f38562e2fe346fbb222766db20027e71024f3282ac7f37e02` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:cee097f697032a71ffc726b266094799ff80f3c77a75e51fde8925df89d0eda5` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:e6347bfa13386df8d062f8d9bc665c055b2bcc8bd10df6471b3b3352441ceae9` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:3fe61d2a7f249f311bf397531a09641a8c663c4fd77b4ed0b6b8db43a738673c` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:d1439026785bc881585cb978f5fa74734b58c845915deedc9fd97b6df28cc3d3` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:f6373984aff507aeba31c4454760b77ee33b7c5aeb018724525047cf43ffa5a2` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:6adcc2bbf6399996a5221a623f704edc944b8baa6c09339c36c2c2bb6e24ecca` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:c1e577b132475f4b327b593f0ec0052f8bb6668c7efad0693bfdc79debd96f2c` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:7cd7e52ebfbe66f7b7fedc9100e7803f6823a28488837f408ce98b076987d75b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:90ba01dc7e88620db2b4819707607264e84495284cca7c9f7a81e9d671fa20de` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:8815a160670d5109367977f04f837de32aee20978fa9cbdbfd33589a4ddc94fe` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:04a21c0af4aefe85a99b4d3f5ac071a3363f32d2ded0701e707c8d5981093b90` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:50683d2805555c2933b4a8e62d4f6c60dc8b723bccd9fc9373a95f1ad704476e` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:61b76bdf41aba7db3cf3234aef8873703025dda83b268fd93807f264b938df56` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:70876006dc0c82da94e83a2b5faaff421960021e01454778c6c8dbbfb7d0c510` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:d240261f1d94c737777ba934bfdf547e88f1cac426576b9a4a2cdf62abb57a43` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:bada346830f6fd2dd28aaeb039f6d60ee70809aaccd48288f84fd18b97037c06` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:07026d7b4ec3fe833f803732b52c229dd15f40cf34e974b4820dcb32b863c690` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:ccd4830dfe15a2fe99e10be759f252bb00789ec5422fdc28ba635ee8aaaa2286` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:be0b1fe8f1bc311cf2ff00ec7a490cbaf0d55b8b535dbb3e3c42685977b154b2` | `verification-decisions` | `verification-evidence` | `false` |

### auth-many-asset-normalization/patch

- branchName: `bitcode/remediation-read_auth-many-asset-normalization_f6dbfe951c-auth-many-asset-normalization`
- readId: `read_auth-many-asset-normalization_f6dbfe951c`
- assetPackId: `asset_pack_186c76eb7d2d`
- proofContractHash: `sha256:07e9dde9b1decdd69ab9f3287b1158f89b3d3badb085d8f55489f6339b296f43`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:7021f326f42f8a44233fe094d79ada504e346a9f58b95f63ae28b60780d5d7a5` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:271b12a3324d4e502477c9653598b0bf81a8cb4f7a3d9416ba909d0c066f4d5a` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:e7e47f9c9525353445c784a128fee2986f9023307fd9df67d2c591eda0d0ce2b` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:9958392c28c4be80006c2bb33b353601ac820b5b635544a0ecdfb672629535e1` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:c01e2649b6d9e19b0f6aecffaee59d58037a5f2dbf298732ad09a32a71959757` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:b2d6dfc8663afc6f4e5d41be141d69ff52df448ca8e8061f54bfb1a43bd38289` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:07e9dde9b1decdd69ab9f3287b1158f89b3d3badb085d8f55489f6339b296f43` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:764f8a25c392342b4c6aa7237befc9d05f78843f40741a2cb1419ac12b297ffa` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:56a85c17a59492b97da3a4da19a401186269d3e5ef73df9f27e8ba11033f22b4` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:9958392c28c4be80006c2bb33b353601ac820b5b635544a0ecdfb672629535e1` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:1801081aa0ec2e625c83cb50fea4368b1fbcc0bcb181cded95d11974995ebd09` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:e146454244e287f8804abad3d014d77fe181284043c80ccc433b112a3f66f9d4` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:76a8a6f376f4ad47f47d2cfe15b37b75238f5488076a38f2b2b2a96a196e8924` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:b2d6dfc8663afc6f4e5d41be141d69ff52df448ca8e8061f54bfb1a43bd38289` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:e146454244e287f8804abad3d014d77fe181284043c80ccc433b112a3f66f9d4` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:4351b7a14410e6b6f8a2ac8951a21e2d6b022502fdacdc55386d890904e84a36` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:d32d2d442f872b5e5b4e1822631c6a4e55119476bd366aaa873a85b747c79aac` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:266980ddc09575e6b26a343be37671d921651aee24825537291cd68715853f53` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:2b11569a795d34a21537ff9fb334743404e0147ca43b5b44674042ddb79ac526` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:83b1f7096042f13d63d72e42e6188565208bd8e2bcacd74105a5547d9e73c7fd` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:7021f326f42f8a44233fe094d79ada504e346a9f58b95f63ae28b60780d5d7a5` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:c2c97292448cc0e0f3979d510f284cdef3f9d404cbf6b39eb639a6c6c214486d` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:5d38343b76b08107cf7c89913a0af865234deeb71040e81a64fcc20338be0956` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:de94fee2e3e4802017e81e8ca831d1a1d1f7b50659c0df8942577e5ac4d705a2` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:a1c36167a946c20554629f04d2ccf1ac675cb0712fed54e990ad467c8393e2c0` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:6fa8f624a25aeefbc49e25ebd46b51542d0b6e4aabbf6c3cddf6a8618e139c86` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:1ecb6a0bb5b64cffd3ee01c37b6a0bf24d3e35003305c27512958d9fe572886d` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:cb6b93a204a1b42acc7c426b702bb4d317f4cae5bc4f9c297f66727d3dd795fc` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:7e019f446bf0e5598721d48a07faf09d8a92b86fe037a9383c27fe075c376727` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:f2f554ed7435eaa862533071b52e7011853aa56ee362db6151782909b8163de4` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:ec806278ce9882a3e6b6875fd534f368972bb11db1c2bddd60f72d56c63986c6` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:5d3f2b38619e2f03c5b5206477c7a335b9acfb32e24310ae80186858c600c612` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:4047ed19d6584ba57c01fb27d48ee04615e03866ef133c0832595bcf0fb257de` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:e146454244e287f8804abad3d014d77fe181284043c80ccc433b112a3f66f9d4` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:0377aedee56f69cd182ce5e997ab82167af691ff197882b09964c1804e99568b` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:e7e47f9c9525353445c784a128fee2986f9023307fd9df67d2c591eda0d0ce2b` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:3bfc16906769f2d1c0ed837a29f95a1b94589171a4aa0fed584ce85434742659` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:8e6cb9e1a5f53b05188964fc477ed3dc9cb246a3bfbaa57690cd38ad833b4dcb` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:dcc39c2fafa1184a26018574b8d6921df1893f516d436c03bcf43483e69b6f2a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:480830498c6ae80c62efe89d2d315348d3e39669c87710643fb893d817e87498` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:d1356d18354eda8cf0ed868808b4351a1d46dce733e21f2d8153ef48c4913806` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:7c39b39fedd7515703b26ed8868e77768c8c2fddb34f3bc8da756f8680dc8836` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:c01e2649b6d9e19b0f6aecffaee59d58037a5f2dbf298732ad09a32a71959757` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:45beb6ee9be4ba5f94fb02b8f61427db470435df7219f2cd7eee33339fc831f3` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:26b1238fd39fadf0a0245e43136fea0b639fbffb751cf4c5b96aab26a3a00d21` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:271b12a3324d4e502477c9653598b0bf81a8cb4f7a3d9416ba909d0c066f4d5a` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:6ccaa957ba9544621746a2526cf8be763764b3821e9c6ff75bf383814794d2fd` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:b85b8d075ed3e46d0c0be55a8fac81a03c87cca8c2333d541103e5145ac8c137` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:f622378e573527b531941f2ae35afdf5a067c9ffc4cce7de91ef9e278a2c6811` | `verification-decisions` | `verification-evidence` | `false` |

### auth-many-asset-normalization/context

- branchName: `bitcode/remediation-read_auth-many-asset-normalization_f6dbfe951c-auth-many-asset-normalization`
- readId: `read_auth-many-asset-normalization_f6dbfe951c`
- assetPackId: `asset_pack_186c76eb7d2d`
- proofContractHash: `sha256:07e9dde9b1decdd69ab9f3287b1158f89b3d3badb085d8f55489f6339b296f43`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:7021f326f42f8a44233fe094d79ada504e346a9f58b95f63ae28b60780d5d7a5` | `.proofs/_shared/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `.proofs/_shared/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:271b12a3324d4e502477c9653598b0bf81a8cb4f7a3d9416ba909d0c066f4d5a` | `.proofs/_shared/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.proofs/_shared/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:4ede265a7e670c351f7e9814e1d80ebcb48bbda7beaa15ff1341589a98d76c6f` | `.proofs/_shared/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:9958392c28c4be80006c2bb33b353601ac820b5b635544a0ecdfb672629535e1` | `.proofs/_shared/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:3b15a3295c324569569c10ce5a96bc7769402292998a8d072b78019acdd72f17` | `.proofs/_shared/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:45a1ed032db753f1881a704f02ac0f3af46ac2b9b59270c75925c52cda39fa2c` | `.proofs/_shared/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:07e9dde9b1decdd69ab9f3287b1158f89b3d3badb085d8f55489f6339b296f43` | `.proofs/_shared/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.proofs/_shared/accounting-precision-report.json` | `sha256:5918b398a0c2344668e85399f5a94a85d3b0d913fac04040e925a75bef95a26b` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/asset-pack.lock.json` | `sha256:7f8ce9b64359556203b95faa371b182c760335608eb799174204cb24c255ceb9` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-and-sensitive-flow-proof.json` | `sha256:9958392c28c4be80006c2bb33b353601ac820b5b635544a0ecdfb672629535e1` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/authorization-decisions.json` | `sha256:1801081aa0ec2e625c83cb50fea4368b1fbcc0bcb181cded95d11974995ebd09` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/bounded-public-proof.json` | `sha256:53b386a7d7b4e67018966f904565db8c344c2af6d15e5f0298eab580ea201262` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/code-analysis-fact-registry.json` | `sha256:76a8a6f376f4ad47f47d2cfe15b37b75238f5488076a38f2b2b2a96a196e8924` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/disclosure-boundary-proof.json` | `sha256:45a1ed032db753f1881a704f02ac0f3af46ac2b9b59270c75925c52cda39fa2c` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.proofs/_shared/disclosure-proof.json` | `sha256:53b386a7d7b4e67018966f904565db8c344c2af6d15e5f0298eab580ea201262` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/eval-manifest.json` | `sha256:4351b7a14410e6b6f8a2ac8951a21e2d6b022502fdacdc55386d890904e84a36` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-authorization-proof.json` | `sha256:d32d2d442f872b5e5b4e1822631c6a4e55119476bd366aaa873a85b747c79aac` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/identity-bindings.json` | `sha256:266980ddc09575e6b26a343be37671d921651aee24825537291cd68715853f53` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-moment-contracts.json` | `sha256:2b11569a795d34a21537ff9fb334743404e0147ca43b5b44674042ddb79ac526` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-proofs.json` | `sha256:83b1f7096042f13d63d72e42e6188565208bd8e2bcacd74105a5547d9e73c7fd` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/inference-synthesis-proof.json` | `sha256:7021f326f42f8a44233fe094d79ada504e346a9f58b95f63ae28b60780d5d7a5` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-completeness-proof.json` | `sha256:4b7ef245c2ccfe1cfaeaab022153ec9c9b8f99b617f4bb2a9a1d551db2de5c55` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/journal-diff.json` | `sha256:d3c6d6a837a3491e4379312a87b4f76230858969c1fdc5d83e4a045e69386088` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-exclusions.json` | `sha256:a458dc0999928587214c7982fa376d821ca111eaa587c5f6136c31f6e64cd0ce` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/materialization-proof.json` | `sha256:5eccc4da7b2baeef0708438fe959c9fa8ccdd0293f898b5c0dacec44faf9577b` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/materialization-visibility-proof.json` | `sha256:6fa8f624a25aeefbc49e25ebd46b51542d0b6e4aabbf6c3cddf6a8618e139c86` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/measurement-receipts.json` | `sha256:1ecb6a0bb5b64cffd3ee01c37b6a0bf24d3e35003305c27512958d9fe572886d` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/parsed-completion-envelopes.json` | `sha256:cb6b93a204a1b42acc7c426b702bb4d317f4cae5bc4f9c297f66727d3dd795fc` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/projection-policy.json` | `sha256:7e019f446bf0e5598721d48a07faf09d8a92b86fe037a9383c27fe075c376727` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-completeness-proof.json` | `sha256:c8848e397ed8694f673966ac40445e61cdb8369f01f239bb7974b8a3499538eb` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/prompt-contracts.json` | `sha256:f2f554ed7435eaa862533071b52e7011853aa56ee362db6151782909b8163de4` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-implementation-surface.json` | `sha256:ec806278ce9882a3e6b6875fd534f368972bb11db1c2bddd60f72d56c63986c6` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/prompt-surfaces.json` | `sha256:5d3f2b38619e2f03c5b5206477c7a335b9acfb32e24310ae80186858c600c612` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.proofs/_shared/proof-contract.json` | `sha256:4047ed19d6584ba57c01fb27d48ee04615e03866ef133c0832595bcf0fb257de` | `proof-contract` | `private-proof-artifact` | `false` |
| `.proofs/_shared/redaction-proof.json` | `sha256:53b386a7d7b4e67018966f904565db8c344c2af6d15e5f0298eab580ea201262` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/selected-source-material.json` | `sha256:337004255e58d270c35ab3b6964ae1f90b600a4ddc101d69c12c0809326803a6` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.proofs/_shared/selection-and-materialization-proof.json` | `sha256:4ede265a7e670c351f7e9814e1d80ebcb48bbda7beaa15ff1341589a98d76c6f` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/selection-consistency-proof.json` | `sha256:3bfc16906769f2d1c0ed837a29f95a1b94589171a4aa0fed584ce85434742659` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow-proof.json` | `sha256:8e6cb9e1a5f53b05188964fc477ed3dc9cb246a3bfbaa57690cd38ad833b4dcb` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/sensitive-data-flow.json` | `sha256:dcc39c2fafa1184a26018574b8d6921df1893f516d436c03bcf43483e69b6f2a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-participation.json` | `sha256:c52eeeae583a4aa525795f84c764d90c234c196c257518031d23639a24730982` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-preview.json` | `sha256:f5887134b216701fcad565231d60cf21d575c0afc49b1f028e7fc4ddefcaae37` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.proofs/_shared/settlement-proof.json` | `sha256:7331cf92a9716a2041bcfd981bcce0776e18f1e306d8ec7c5daccc1978a91045` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/settlement-source-to-shares-proof.json` | `sha256:3b15a3295c324569569c10ce5a96bc7769402292998a8d072b78019acdd72f17` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/source-to-shares.json` | `sha256:45beb6ee9be4ba5f94fb02b8f61427db470435df7219f2cd7eee33339fc831f3` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.proofs/_shared/static-heuristics-registry.json` | `sha256:26b1238fd39fadf0a0245e43136fea0b639fbffb751cf4c5b96aab26a3a00d21` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-proof.json` | `sha256:271b12a3324d4e502477c9653598b0bf81a8cb4f7a3d9416ba909d0c066f4d5a` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/static-measurement-report.json` | `sha256:6ccaa957ba9544621746a2526cf8be763764b3821e9c6ff75bf383814794d2fd` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.proofs/_shared/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-receipts.json` | `sha256:b85b8d075ed3e46d0c0be55a8fac81a03c87cca8c2333d541103e5145ac8c137` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.proofs/_shared/verification-report.json` | `sha256:a71bdd76c82e9fd75f48ad1bb9006127260ac651eab68256d01f7d3877e87383` | `verification-decisions` | `verification-evidence` | `false` |
