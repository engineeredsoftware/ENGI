# Bitcode Spec V28 Proven

- canonicalVersion: `V28`
- canonicalCommit: `1153286d0785b0d760ea392918575f0083cd570f`
- canonicalCommitRecordedAt: `2026-05-20T12:05:36-03:00`
- worktreeState: `clean`
- generatorId: `bitcode.proven-generator.v1`
- generatedAt: `2026-05-20T12:05:36-03:00`
- outputPath: `BITCODE_SPEC_V28_PROVEN.md`
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
| `inference-synthesis` | `.bitcode/inference-synthesis-proof.json` | 5 | 6 | 6 | 7 | 3 |
| `prompt-completeness` | `.bitcode/prompt-completeness-proof.json` | 5 | 8 | 5 | 5 | 4 |
| `static-code-analysis` | `.bitcode/static-measurement-proof.json` | 4 | 5 | 5 | 5 | 3 |
| `verification-decisions` | `.bitcode/verification-decisions-proof.json` | 5 | 7 | 3 | 3 | 2 |
| `selection-and-materialization` | `.bitcode/selection-and-materialization-proof.json` | 5 | 7 | 7 | 7 | 2 |
| `authorization-and-sensitive-flow` | `.bitcode/authorization-and-sensitive-flow-proof.json` | 5 | 6 | 6 | 6 | 2 |
| `settlement-source-to-shares` | `.bitcode/settlement-source-to-shares-proof.json` | 8 | 8 | 8 | 8 | 2 |
| `disclosure-boundary` | `.bitcode/disclosure-boundary-proof.json` | 4 | 5 | 5 | 5 | 2 |
| `proof-contract` | `.bitcode/proof-contract.json` | 5 | 6 | 3 | 3 | 3 |

## Family Details

### inference-synthesis

- proofArtifactPath: `.bitcode/inference-synthesis-proof.json`
- witnessArtifactPaths: `.bitcode/inference-moment-contracts.json`, `.bitcode/inference-proofs.json`, `.bitcode/prompt-implementation-surface.json`, `.bitcode/prompt-surfaces.json`, `.bitcode/parsed-completion-envelopes.json`, `.bitcode/inference-synthesis-proof.json`
- replayArtifacts: `.bitcode/inference-moment-contracts.json`, `.bitcode/inference-proofs.json`, `.bitcode/prompt-implementation-surface.json`, `.bitcode/prompt-surfaces.json`, `.bitcode/parsed-completion-envelopes.json`, `.bitcode/eval-manifest.json`, `.bitcode/inference-synthesis-proof.json`
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
| `inference-synthesis.coverage-reconciliation` | `inference_synthesis.coverage_totality` | `.bitcode/inference-moment-contracts.json`, `.bitcode/inference-proofs.json`, `.bitcode/inference-synthesis-proof.json`, `.bitcode/prompt-surfaces.json` |
| `inference-synthesis.evaluator-status-replay` | `inference_synthesis.evaluator_status_truth` | `.bitcode/inference-moment-contracts.json`, `.bitcode/inference-proofs.json`, `.bitcode/prompt-surfaces.json`, `.bitcode/eval-manifest.json` |
| `inference-synthesis.evidence-basis-replay` | `inference_synthesis.evidence_basis_closure`, `inference_synthesis.ownership_traceability_closure` | `.bitcode/inference-moment-contracts.json`, `.bitcode/inference-proofs.json`, `.bitcode/prompt-surfaces.json`, `.bitcode/parsed-completion-envelopes.json`, `.bitcode/inference-synthesis-proof.json` |

### prompt-completeness

- proofArtifactPath: `.bitcode/prompt-completeness-proof.json`
- witnessArtifactPaths: `.bitcode/prompt-family-registry.json`, `.bitcode/prompt-contracts.json`, `.bitcode/prompt-surfaces.json`, `.bitcode/parsed-completion-envelopes.json`, `.bitcode/prompt-completeness-proof.json`
- replayArtifacts: `.bitcode/prompt-family-registry.json`, `.bitcode/prompt-contracts.json`, `.bitcode/prompt-surfaces.json`, `.bitcode/parsed-completion-envelopes.json`, `.bitcode/prompt-completeness-proof.json`
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
| `prompt-completeness.member-set-reconciliation` | `prompt_completeness.coverage_totality`, `prompt_completeness.no_ghost_coverage`, `prompt_completeness.explicit_exclusion_closure` | `.bitcode/prompt-family-registry.json`, `.bitcode/prompt-contracts.json`, `.bitcode/prompt-surfaces.json` |
| `prompt-completeness.parse-admissibility` | `prompt_completeness.contract_closure`, `prompt_completeness.parsed_envelope_admissibility` | `.bitcode/prompt-contracts.json`, `.bitcode/parsed-completion-envelopes.json` |
| `prompt-completeness.consumer-closure` | `prompt_completeness.downstream_consumer_closure` | `.bitcode/prompt-surfaces.json` |
| `prompt-completeness.provenance-truth` | `prompt_completeness.provenance_truth` | `.bitcode/prompt-surfaces.json`, `.bitcode/prompt-contracts.json` |

### static-code-analysis

- proofArtifactPath: `.bitcode/static-measurement-proof.json`
- witnessArtifactPaths: `.bitcode/code-analysis-fact-registry.json`, `.bitcode/static-heuristics-registry.json`, `.bitcode/measurement-receipts.json`, `.bitcode/static-measurement-report.json`, `.bitcode/static-measurement-proof.json`
- replayArtifacts: `.bitcode/code-analysis-fact-registry.json`, `.bitcode/static-heuristics-registry.json`, `.bitcode/measurement-receipts.json`, `.bitcode/static-measurement-report.json`, `.bitcode/static-measurement-proof.json`
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
| `static-code-analysis.stage-domain` | `static_code_analysis.stage_domain_purity` | `.bitcode/measurement-receipts.json`, `.bitcode/static-measurement-proof.json` |
| `static-code-analysis.stage-mapping` | `static_code_analysis.abstract_to_concrete_stage_mapping`, `static_code_analysis.registry_role_closure` | `.bitcode/measurement-receipts.json`, `.bitcode/code-analysis-fact-registry.json`, `.bitcode/static-heuristics-registry.json` |
| `static-code-analysis.receipt-report-proof` | `static_code_analysis.receipt_report_proof_agreement`, `static_code_analysis.witness_replay_closure` | `.bitcode/measurement-receipts.json`, `.bitcode/static-measurement-report.json`, `.bitcode/static-measurement-proof.json` |

### verification-decisions

- proofArtifactPath: `.bitcode/verification-decisions-proof.json`
- witnessArtifactPaths: `.bitcode/verification-report.json`, `.bitcode/verification-receipts.json`, `.bitcode/verification-decisions-proof.json`
- replayArtifacts: `.bitcode/verification-report.json`, `.bitcode/verification-receipts.json`, `.bitcode/verification-decisions-proof.json`
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
| `verification-decisions.stage-mapping` | `verification_decisions.issuance_closure`, `verification_decisions.provenance_closure`, `verification_decisions.sufficiency_closure`, `verification_decisions.issuer_policy_closure` | `.bitcode/verification-receipts.json`, `.bitcode/verification-report.json` |
| `verification-decisions.use-tier-consequence` | `verification_decisions.use_tier_consequence_closure`, `verification_decisions.receipt_report_role_closure` | `.bitcode/verification-receipts.json`, `.bitcode/verification-report.json`, `.bitcode/verification-decisions-proof.json` |

### selection-and-materialization

- proofArtifactPath: `.bitcode/selection-and-materialization-proof.json`
- witnessArtifactPaths: `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/materialization-exclusions.json`, `.bitcode/materialization-visibility-proof.json`, `.bitcode/selection-consistency-proof.json`, `.bitcode/materialization-proof.json`, `.bitcode/selection-and-materialization-proof.json`
- replayArtifacts: `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/materialization-exclusions.json`, `.bitcode/materialization-visibility-proof.json`, `.bitcode/selection-consistency-proof.json`, `.bitcode/materialization-proof.json`, `.bitcode/selection-and-materialization-proof.json`
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
| `selection-and-materialization.selected-set` | `selection_and_materialization.selected_asset_closure`, `selection_and_materialization.lock_closure`, `selection_and_materialization.materialized_source_closure`, `selection_and_materialization.selection_consistency_closure` | `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/selection-consistency-proof.json`, `.bitcode/materialization-proof.json` |
| `selection-and-materialization.visibility` | `selection_and_materialization.visibility_closure`, `selection_and_materialization.exclusion_closure` | `.bitcode/materialization-exclusions.json`, `.bitcode/materialization-visibility-proof.json` |

### authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/authorization-and-sensitive-flow-proof.json`
- witnessArtifactPaths: `.bitcode/identity-bindings.json`, `.bitcode/authorization-decisions.json`, `.bitcode/sensitive-data-flow.json`, `.bitcode/identity-authorization-proof.json`, `.bitcode/sensitive-data-flow-proof.json`, `.bitcode/authorization-and-sensitive-flow-proof.json`
- replayArtifacts: `.bitcode/identity-bindings.json`, `.bitcode/authorization-decisions.json`, `.bitcode/sensitive-data-flow.json`, `.bitcode/identity-authorization-proof.json`, `.bitcode/sensitive-data-flow-proof.json`, `.bitcode/authorization-and-sensitive-flow-proof.json`
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
| `authorization-sensitive-flow.identity` | `authorization_and_sensitive_flow.principal_authority_totality`, `authorization_and_sensitive_flow.authorization_decision_closure` | `.bitcode/identity-bindings.json`, `.bitcode/authorization-decisions.json`, `.bitcode/identity-authorization-proof.json` |
| `authorization-sensitive-flow.flows` | `authorization_and_sensitive_flow.classification_closure`, `authorization_and_sensitive_flow.policy_assignment_closure`, `authorization_and_sensitive_flow.no_unauthorized_public_flow` | `.bitcode/sensitive-data-flow.json`, `.bitcode/sensitive-data-flow-proof.json` |

### settlement-source-to-shares

- proofArtifactPath: `.bitcode/settlement-source-to-shares-proof.json`
- witnessArtifactPaths: `.bitcode/source-to-shares.json`, `.bitcode/settlement-participation.json`, `.bitcode/settlement-preview.json`, `.bitcode/accounting-precision-report.json`, `.bitcode/journal-diff.json`, `.bitcode/journal-completeness-proof.json`, `.bitcode/settlement-proof.json`, `.bitcode/settlement-source-to-shares-proof.json`
- replayArtifacts: `.bitcode/source-to-shares.json`, `.bitcode/settlement-participation.json`, `.bitcode/settlement-preview.json`, `.bitcode/accounting-precision-report.json`, `.bitcode/journal-diff.json`, `.bitcode/journal-completeness-proof.json`, `.bitcode/settlement-proof.json`, `.bitcode/settlement-source-to-shares-proof.json`
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
| `settlement-source-to-shares.contribution-allocation` | `settlement_source_to_shares.contribution_totality`, `settlement_source_to_shares.clipping_determinism`, `settlement_source_to_shares.normalization_exactness`, `settlement_source_to_shares.participation_totality`, `settlement_source_to_shares.allocation_conservation`, `settlement_source_to_shares.quantized_fit_quality_receipting` | `.bitcode/source-to-shares.json`, `.bitcode/settlement-participation.json`, `.bitcode/settlement-preview.json`, `.bitcode/accounting-precision-report.json` |
| `settlement-source-to-shares.journal-theorem` | `settlement_source_to_shares.journal_completeness`, `settlement_source_to_shares.settlement_theorem_integrity` | `.bitcode/journal-diff.json`, `.bitcode/journal-completeness-proof.json`, `.bitcode/settlement-proof.json` |

### disclosure-boundary

- proofArtifactPath: `.bitcode/disclosure-boundary-proof.json`
- witnessArtifactPaths: `.bitcode/projection-policy.json`, `.bitcode/bounded-public-proof.json`, `.bitcode/redaction-proof.json`, `.bitcode/disclosure-proof.json`, `.bitcode/disclosure-boundary-proof.json`
- replayArtifacts: `.bitcode/projection-policy.json`, `.bitcode/bounded-public-proof.json`, `.bitcode/redaction-proof.json`, `.bitcode/disclosure-proof.json`, `.bitcode/disclosure-boundary-proof.json`
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
| `disclosure-boundary.policy-bounded-public` | `disclosure_boundary.projection_policy_closure`, `disclosure_boundary.bounded_public_metadata_only` | `.bitcode/projection-policy.json`, `.bitcode/bounded-public-proof.json` |
| `disclosure-boundary.redaction-disclosure` | `disclosure_boundary.redaction_alignment`, `disclosure_boundary.disclosure_verdict_alignment`, `disclosure_boundary.witness_replay_closure` | `.bitcode/redaction-proof.json`, `.bitcode/disclosure-proof.json`, `.bitcode/disclosure-boundary-proof.json` |

### proof-contract

- proofArtifactPath: `.bitcode/proof-contract.json`
- witnessArtifactPaths: `.bitcode/proof-contract.json`, `.bitcode/system-proof-bundle.json`, `.bitcode/proof-witness-manifest.json`
- replayArtifacts: `.bitcode/proof-contract.json`, `.bitcode/system-proof-bundle.json`, `.bitcode/proof-witness-manifest.json`
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
| `proof-contract.contract-materialization` | `proof_contract.contract_materialization` | `.bitcode/proof-contract.json` |
| `proof-contract.evidence-chain` | `proof_contract.evidence_chain_closure`, `proof_contract.theorem_check_binding` | `.bitcode/proof-contract.json`, `.bitcode/system-proof-bundle.json` |
| `proof-contract.bundle-witness` | `proof_contract.bundle_coherence`, `proof_contract.witness_manifest_coherence`, `proof_contract.replay_closure` | `.bitcode/system-proof-bundle.json`, `.bitcode/proof-witness-manifest.json`, `.bitcode/proof-contract.json` |

## Scenario and Run Matrix

| scenarioId | branchMode | readId | branchName | assetPackId | familyCount | allFamiliesPassed | proofContractPassed | requiredArtifactPathCount | artifactDigestCount | fullyProven |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `auth-issuer-rollback` | `patch` | `read_auth-issuer-rollback_40b4b5cc9b` | `bitcode/remediation-read_auth-issuer-rollback_40b4b5cc9b-auth-issuer-rollback` | `asset_pack_f4d2f98e2b7f` | 9 | `true` | `true` | 47 | 46 | `true` |
| `auth-issuer-rollback` | `context` | `read_auth-issuer-rollback_40b4b5cc9b` | `bitcode/remediation-read_auth-issuer-rollback_40b4b5cc9b-auth-issuer-rollback` | `asset_pack_19909dd95164` | 9 | `true` | `true` | 47 | 46 | `true` |
| `rust-validator-proof-gap` | `patch` | `read_rust-validator-proof-gap_7044fe8972` | `bitcode/remediation-read_rust-validator-proof-gap_7044fe8972-rust-validator-proof-gap` | `asset_pack_3b7a68101d23` | 9 | `true` | `true` | 47 | 46 | `true` |
| `rust-validator-proof-gap` | `context` | `read_rust-validator-proof-gap_7044fe8972` | `bitcode/remediation-read_rust-validator-proof-gap_7044fe8972-rust-validator-proof-gap` | `asset_pack_3b7a68101d23` | 9 | `true` | `true` | 47 | 46 | `true` |
| `config-policy-precedence-incident` | `patch` | `read_config-policy-precedence-incident_f39d972e54` | `bitcode/remediation-read_config-policy-precedence-incident_f39d972e54-config-policy-precedence-incident` | `asset_pack_d0c7f0b06b9a` | 9 | `true` | `true` | 47 | 46 | `true` |
| `config-policy-precedence-incident` | `context` | `read_config-policy-precedence-incident_f39d972e54` | `bitcode/remediation-read_config-policy-precedence-incident_f39d972e54-config-policy-precedence-incident` | `asset_pack_d0c7f0b06b9a` | 9 | `true` | `true` | 47 | 46 | `true` |
| `unsafe-patch-review-recovery` | `patch` | `read_unsafe-patch-review-recovery_16a56c87c5` | `bitcode/remediation-read_unsafe-patch-review-recovery_16a56c87c5-unsafe-patch-review-recovery` | `asset_pack_fd3c892c8e9e` | 9 | `true` | `true` | 47 | 46 | `true` |
| `unsafe-patch-review-recovery` | `context` | `read_unsafe-patch-review-recovery_16a56c87c5` | `bitcode/remediation-read_unsafe-patch-review-recovery_16a56c87c5-unsafe-patch-review-recovery` | `asset_pack_fd3c892c8e9e` | 9 | `true` | `true` | 47 | 46 | `true` |
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
| `inference-synthesis` | `sha256:256959c2fe4952b795e30622c3811861f5488c1d81c55cb836ce21d8b2813e64` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:f4595d1c00efd134c3dbaf7f5eb8a1ea6f7afb1afeaacfc52da133a9d6619393` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:9592d38f7281eafa7ac658e48cbf6e35ab44591384bf73dc11e332237160df39` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:098b3934f79eaf77bbd0f72593b3e9d35a83344894d46a09a1c84853f2bc710e` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:7a0e18a77363e806d7074328330374cfc9b272d7f0a395a49eea2a16a3c232f0` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:0896df3fcc89b27fe7ac491caad0d739503111bdce24e03e8f037937ac2790de` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:2bc0cdb1b9c54e9b714d946f3bee408f0343a3dade3175bb2dd3e34c1ca022a9` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:a08dcb38b21b853afb64378b8872b02e066da3a7a72adfa93c6abfd217c55cfc` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:d411a52f30a124937b426356278e7e467dab963430d6b1a2ec7d7e0c4d17e834` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:098b3934f79eaf77bbd0f72593b3e9d35a83344894d46a09a1c84853f2bc710e` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:47ceaf18b9d61a7f4acfe88ffb5b43a0599f9bd9add69506cf2eff3fff74f267` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:f5da41a20f3a15375abbe1fdabd2a88239a2a8f637aaf033e8018915a0e9c7eb` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:1c47d4a3bef53a008f3915a7ef34843477eee49cc446b4d67e61e479c04499d8` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:0896df3fcc89b27fe7ac491caad0d739503111bdce24e03e8f037937ac2790de` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:f5da41a20f3a15375abbe1fdabd2a88239a2a8f637aaf033e8018915a0e9c7eb` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:548837fd08f4f544f0e4e7f5e2ef14f8621a1cf5acbac969bc0640c9c06b4a8c` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:d25e761512f1d40adc659462dd06c03af6e25f2e48a30b5b89ae7ffc928e776d` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:4d4111ebb0cb41d0246d93e30a808c007241d27c715b491aa53e762342c8759c` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:02e131ce1efdb0b3f9a621fbd2ba6a3f805b9b85b6903292117901611b0fe21d` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:9e6a10b2ec749912879e6bcd36fa1fba4ea6addfe1a37475e7a49718a154ad2d` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:256959c2fe4952b795e30622c3811861f5488c1d81c55cb836ce21d8b2813e64` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:f5f9f0d0bfcdb4e04468c26d9ad18a982d1c96bd542f748eb3e2f8895702dcb7` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:b259d0cc8915b4491f7cf220e2bba34ae95e7b68e1d30f07e3fa6ada7dfb0563` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:f377c98e7db49df061805373caca01b550d3fcadd7be710991e4c3ddf2df826d` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:a9c087535c2de8ba4550cb9ed8b7c0cb92b64dd3e9bf0eb5d8e502981602b771` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:295cf78382de6b94a028e4c61541ea0c6a57aa62ed63593efd0ba7998459a4e0` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:6dcc4f10e576cd74891519cda9354cd2b04d7a01f2a014653957f856f3eb1f6f` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:a612d67d1995853ee132d9dd21fd8c64c8f986b6c41a2b0e0d042447552f2cd6` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:bb8674abf94ae1d8ee5d5ed695258555f039326c2a75d3632dfd65271a06b1e1` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:1a33ac2be9d039f56b0448f6eb47833327f655c46770eff998d30232f759fe03` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:49a7941430fe1eccbe71c0b321955dd7790faa63c7d983123118ca94fddeb04d` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:7b3b4c552085629cbb6af1dfc705a69ada6e0f34c32365ac768407679052b24f` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:e314267ddeb7d3412f67a7f1a7cb4d81560be5893889c02754d98016e1bd8c45` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:f5da41a20f3a15375abbe1fdabd2a88239a2a8f637aaf033e8018915a0e9c7eb` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:a116782f3f2d2a02acc6f45be8320e9eb265bc77de7f4b2db59a5c610a0d2e97` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:9592d38f7281eafa7ac658e48cbf6e35ab44591384bf73dc11e332237160df39` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:0458593a95733b5c411c3cbdfe188bcc394fbfe5811f5deb8e73bb3a83aca630` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:9901fc2c0ead9f1445ec4254fdc9c621f3fd92e413e815b0b8d768fb8ab30f5d` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:1c440861c0295878cd3000544894b089d1c772558c6b43c87b33b00315c5baf5` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:f6e862d56ff0166f78dd46659332af9cb94f638d39c165b1573dcfb524aed357` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:32dec5372d1bb3b78e1e0c8d3ba5b1d86abd33fe9554813624a11fdd6cecca4c` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:cd7a40d4afea7bb3b5d0a595fd89566b9a5edaba704d8a82446158e3c5ef0de2` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:7a0e18a77363e806d7074328330374cfc9b272d7f0a395a49eea2a16a3c232f0` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:83bcaaf9d2b037535e3155879f3b613e714a963aee6577de070099cba6a07e14` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:862cc0e100f820a533cccf6e4705cccb65c7b6bc08afcf4c18591606b7fbdaa2` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:f4595d1c00efd134c3dbaf7f5eb8a1ea6f7afb1afeaacfc52da133a9d6619393` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:0e40751f7e15e39c69210e9bd1abd9d12cd49bb873bde875cf3c7de9b1395bd4` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:cede48f4241cf955d21e1635b6af3e2f804e2ec138ce5d3f48551d3569eca2e3` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:bca43c288e25698139d2da606e341ec375ea66473784d4d97b21c30225ec6ce1` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:256959c2fe4952b795e30622c3811861f5488c1d81c55cb836ce21d8b2813e64` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:f4595d1c00efd134c3dbaf7f5eb8a1ea6f7afb1afeaacfc52da133a9d6619393` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:e5d0ddd164f244e7747c498ab9ebebd58c9bbc881a38786fc3185a6a47f27cf6` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:ff2d9cec42dd2f31397e5bc8de46cffd9f53379230391b865468c27e8354122d` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:45cbd044403de9853d7da2c45421daa2f37bf627ce9d597a1f73fa708dcc7e90` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:ac206af0e4758da5b5b9b75d0972dee99057ce5f0694e7d84428c1e132f0d11c` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:0800e46f246b20d88857779f128a9a59edd322529b3dc5735eba5a9710399db0` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:cb89d3a06d4b07b5e70012ed8ad97838ee36e9689232913f9a86f1228dfe91cc` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:058c3f6bf64f48c27ce28f910ab8308f60988ace1a1dddc349bbc9426a979919` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:ff2d9cec42dd2f31397e5bc8de46cffd9f53379230391b865468c27e8354122d` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:6d4b004910180a938a060612f4b4c1b122148f5d1929afe67d1b8e9b63fd4682` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:588c76e7d32b2409990e39ad16946c59d6cf15db87d451f043f2a194cdd56dbb` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:1c47d4a3bef53a008f3915a7ef34843477eee49cc446b4d67e61e479c04499d8` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:ac206af0e4758da5b5b9b75d0972dee99057ce5f0694e7d84428c1e132f0d11c` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:588c76e7d32b2409990e39ad16946c59d6cf15db87d451f043f2a194cdd56dbb` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:548837fd08f4f544f0e4e7f5e2ef14f8621a1cf5acbac969bc0640c9c06b4a8c` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:7e22edb0b2a1daf5244a70102f5b66356ceb9358a23b92c3b31cc1a0eed849a4` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:94c92e34df4f6e3a8e15ef2030bdbd36663f16419a5fc66bf3b6c3fbc19a2a2e` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:02e131ce1efdb0b3f9a621fbd2ba6a3f805b9b85b6903292117901611b0fe21d` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:9e6a10b2ec749912879e6bcd36fa1fba4ea6addfe1a37475e7a49718a154ad2d` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:256959c2fe4952b795e30622c3811861f5488c1d81c55cb836ce21d8b2813e64` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:474af6929f6571b43b0bf7775885c66089db4111b9fe4862a10bc74c1453906c` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:8c167479576094e68a68e8e4041079403a22635f31826494a5a62eed0bd812d4` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:cbcae63fa8e4650193ba088f2efbe3132de023f9ad4334384d64b506d72f3db4` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:813bfe253077e589372561323feee22b8c354887d667ad66137d47b586d63f2f` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:5ea216f7a4ad931f4bb1cb10500eaffca2a183d29e828b4fbb2559239216b94e` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:6dcc4f10e576cd74891519cda9354cd2b04d7a01f2a014653957f856f3eb1f6f` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:a612d67d1995853ee132d9dd21fd8c64c8f986b6c41a2b0e0d042447552f2cd6` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:fa7522727b5f22d3920b966611ed101f0d3c28365936db8cc66fa60f84ac1a4a` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:1a33ac2be9d039f56b0448f6eb47833327f655c46770eff998d30232f759fe03` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:49a7941430fe1eccbe71c0b321955dd7790faa63c7d983123118ca94fddeb04d` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:7b3b4c552085629cbb6af1dfc705a69ada6e0f34c32365ac768407679052b24f` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:5b97d1057e7090f1477103d476f875b537b32e40b3691db0e71fecf9a0e6a440` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:588c76e7d32b2409990e39ad16946c59d6cf15db87d451f043f2a194cdd56dbb` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:ae941c8173e039154e73aed5639abd804c445e4a995ea70860c6a0e47f2f1c5d` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:e5d0ddd164f244e7747c498ab9ebebd58c9bbc881a38786fc3185a6a47f27cf6` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:ecbd5a7070f28dda086bce15a4dde9516694e604b5a5813f0f17e85a2adefede` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:9901fc2c0ead9f1445ec4254fdc9c621f3fd92e413e815b0b8d768fb8ab30f5d` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:1423d8b236094c1ce187e93348605f744cfd5646fbc48df9f8c9dbc2f9b182c5` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:38d3d641821f37594d0ee5dd779048826440a417be4faedfaa1c0273a9aafd83` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:80d28debb05c684e55a9384b526020a3d90a0a98082a6356f070d68c86d7802f` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:97f41557bafb9de563a20ba7ee60fa1e873fa636a172a904c782c1c2008f71f7` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:45cbd044403de9853d7da2c45421daa2f37bf627ce9d597a1f73fa708dcc7e90` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:83bcaaf9d2b037535e3155879f3b613e714a963aee6577de070099cba6a07e14` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:862cc0e100f820a533cccf6e4705cccb65c7b6bc08afcf4c18591606b7fbdaa2` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:f4595d1c00efd134c3dbaf7f5eb8a1ea6f7afb1afeaacfc52da133a9d6619393` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:0e40751f7e15e39c69210e9bd1abd9d12cd49bb873bde875cf3c7de9b1395bd4` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:cede48f4241cf955d21e1635b6af3e2f804e2ec138ce5d3f48551d3569eca2e3` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:4d3807233bd501dd73307d60d643a604b75eb39fe311b71f838d3b9aac808263` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:4f09eb2ae7c6db3a769ab72b39c692158c09da634ddd72b205c3d7a507783ede` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:b55a0102ac4e3332e525d2353d74b80087b1fdc6d2929fcfb9f2c8948441b92a` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:0832ded750cdd02c6465643c4472466116da0c4543272bbcad7040e9ac166dee` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:54673ee8002b9b47cdf6543c747ea377da8d7a2f4b16672a7d3f1cd01cd08acb` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:f749bdc6f4ba196c3cfc6b30d881c8a9adf6afb1d597379734c5fe7ee70d7891` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:6d730db590e80e5b9070d41dc88dfa2a83ec00050ee9bd976eb63c221fded753` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:34f2a976e6dc61ca978b606608d7205e2c5c0cd4ed5e8eb38fdaea91c8faa026` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:954f6fe05a26bb44a1f65602fb4a23d8b88571c3453cd0ed215c45963766a83b` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:0239fa462a03b51aa78bfc6b07891e133d18c4ef0d86285d54b58d1675415754` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:54673ee8002b9b47cdf6543c747ea377da8d7a2f4b16672a7d3f1cd01cd08acb` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:b3eadec2dfee4008bf34af249e39a611a8d7dd5ac6ca09edc2c608517533b15d` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:03329a4920190ad468ca25efb3ca0848cac25529e67e23273f2b6126ea7b126d` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:66a954e1ace1a76160f036be7a94544adc30f3f124f6d2535821b46ba20626c2` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:6d730db590e80e5b9070d41dc88dfa2a83ec00050ee9bd976eb63c221fded753` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:03329a4920190ad468ca25efb3ca0848cac25529e67e23273f2b6126ea7b126d` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:04b93bb60c461acf9d29cb7028e645446a5ef5ae2e7a69b8a7ee917965ab1e3b` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:2287984d304bf31068f4c3517233a3f7da5f2dc444ee5236b539bfd548e7be5a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:6fb14d8000883576783bf728694ae38f202197fa34e056d59e4ea56e44642887` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:0ba1bdf22cb299df63508fa49e6d994d716d0a5d89e426c260c68ebccd969771` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:276a42d09d1c3507cae113787129c222569bdb7a9934d70c791715e3a490b6b1` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:4f09eb2ae7c6db3a769ab72b39c692158c09da634ddd72b205c3d7a507783ede` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:ac5961a0c7d2162c86ce74e6e50119cd020397bca3db2ea0002f908aeae4c366` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:bb6746f6788dc16b240d863028e05f3522e9fa814c21f47723e79308f5016b41` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:56f03f73459c307d37adc3b8727e831934e2a4c9f563e1d3941fa04548cfd8b0` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:b32f4eec3c3318b969c91f9e90ad70b2242d3213e970e1660463916a86a8a01f` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:4084b99de4b1408240b0538b780841a006ec33f21a4d23346035a4ea32b3e272` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:f57acf4f92feccaf527a3136e98e0c62e8793e1791777cf2810fe80d9864381c` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:75fee22c4117c5669cf0b25919bda19d9dd09d68faa223d6fc2bcf42c4b1045b` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:12f98ec39b4b52000dd7c1a8cc86eb1deb8ba614dabdb5591dd02b54b8b4cb48` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:797e292bde61047478891c4753ee3e83d53e5adf90fac0f2870f3a5a74465909` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:81745756a07140ab4d6633127a602d24ea2e43eedbf1803eee531b391fcbd1bf` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:10c1bc687b7b161f69a70c174f548b1a6708c0e87394630574e19ddcd791c960` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:9c15e088a1cef74aeae5722882d989864f74540dd7a828eb0f5776ccc03061d5` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:03329a4920190ad468ca25efb3ca0848cac25529e67e23273f2b6126ea7b126d` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:06d016c0dc874b965838fcd75b9ab33f642c8dde4f995b545da8ce88506c79d0` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:0832ded750cdd02c6465643c4472466116da0c4543272bbcad7040e9ac166dee` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:3f7148afee2a0b067968500edbdc812560dbc5936fae54b6558474ac8a4687d9` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:ea8daa50baf855ebc90a9ce32cba0f9063d02f165f0badee508fb646b673e6c7` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:3008d2134593239289c46fe1b426a6e3853eb5643321094484a1761caa4ddf8f` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:2d9c02287ce036d3f03f9a47e18c617a933e3797d06f5309431e3a4c52eb8d0e` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:77f921bc6ab9b078a5abfcb4a1910b73b5453bc63d4a8b2a8faa2813759876a1` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:c4d47a9d807be83043e99469bd2f275526f6a77ee6a28ffd2bb639e195a94a09` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:f749bdc6f4ba196c3cfc6b30d881c8a9adf6afb1d597379734c5fe7ee70d7891` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:8f009ea19064c0f16810c3751adde06a46aa57c19b400218bfc84972da0319a1` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:64d59d5ca51c94006042e9f7d14d16fb730a0cc8adaeeafdb7cd35cee3192436` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:b55a0102ac4e3332e525d2353d74b80087b1fdc6d2929fcfb9f2c8948441b92a` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:a44a0169819cfa3ba7f4476ec9ec1a688db2144a2938eb19d0331b0a08ec6a7c` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:b3520aca26056974c19a6182285c9ef66a866d4d59ed77d5b85b0c0f166cc1e1` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:a824c58f407ee62740be747af3d77bc192404f972c0de9e816efef58c8264fe8` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:4f09eb2ae7c6db3a769ab72b39c692158c09da634ddd72b205c3d7a507783ede` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:b55a0102ac4e3332e525d2353d74b80087b1fdc6d2929fcfb9f2c8948441b92a` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:fae43adb9a288eabaf5946221c0715414693f6cf144b78fd3b6a8b43fe4b54ab` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:54673ee8002b9b47cdf6543c747ea377da8d7a2f4b16672a7d3f1cd01cd08acb` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:92d55101dfab337edb2cf92fd869875b613aaca1efb82ceb020c4ecda06c6eba` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:2fbb1f37244e7d0a1e313cfbe7f24e1cd88a6059bea1efe553030c45f3d31d24` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:34f2a976e6dc61ca978b606608d7205e2c5c0cd4ed5e8eb38fdaea91c8faa026` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:aa38f0352b0b25daa0bb120f6ec6bba92ad433f14fdbb522171f11e24add092d` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:e2f4226524cd29865bd70395a9933faec1cf07e204fbfd1c60e31135a4e4ebce` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:54673ee8002b9b47cdf6543c747ea377da8d7a2f4b16672a7d3f1cd01cd08acb` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:b3eadec2dfee4008bf34af249e39a611a8d7dd5ac6ca09edc2c608517533b15d` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:7bd6a0865e9267411b854f91754b10dc446d1b20375009a3099e670933eab4fb` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:66a954e1ace1a76160f036be7a94544adc30f3f124f6d2535821b46ba20626c2` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:2fbb1f37244e7d0a1e313cfbe7f24e1cd88a6059bea1efe553030c45f3d31d24` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:7bd6a0865e9267411b854f91754b10dc446d1b20375009a3099e670933eab4fb` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:04b93bb60c461acf9d29cb7028e645446a5ef5ae2e7a69b8a7ee917965ab1e3b` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:2287984d304bf31068f4c3517233a3f7da5f2dc444ee5236b539bfd548e7be5a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:6fb14d8000883576783bf728694ae38f202197fa34e056d59e4ea56e44642887` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:0ba1bdf22cb299df63508fa49e6d994d716d0a5d89e426c260c68ebccd969771` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:276a42d09d1c3507cae113787129c222569bdb7a9934d70c791715e3a490b6b1` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:4f09eb2ae7c6db3a769ab72b39c692158c09da634ddd72b205c3d7a507783ede` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:5e125c7620a790c8e3fd50ad27d8602568d5d43e00b0aff8b8efa52127286d59` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:e9c4799551aa74c418c9d483f98e19bb6ba61e073607f4bb7c058805a8032d61` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:b426ce94afa920bc8d16702fd2f54da342ba198387e30b237bf9d58305153be7` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:2fc6ecb431bf4672b35049183c26ce43260e20c9a79a2cea65b089ee7820ab2a` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:4084b99de4b1408240b0538b780841a006ec33f21a4d23346035a4ea32b3e272` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:f57acf4f92feccaf527a3136e98e0c62e8793e1791777cf2810fe80d9864381c` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:75fee22c4117c5669cf0b25919bda19d9dd09d68faa223d6fc2bcf42c4b1045b` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:12f98ec39b4b52000dd7c1a8cc86eb1deb8ba614dabdb5591dd02b54b8b4cb48` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:797e292bde61047478891c4753ee3e83d53e5adf90fac0f2870f3a5a74465909` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:81745756a07140ab4d6633127a602d24ea2e43eedbf1803eee531b391fcbd1bf` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:10c1bc687b7b161f69a70c174f548b1a6708c0e87394630574e19ddcd791c960` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:9c15e088a1cef74aeae5722882d989864f74540dd7a828eb0f5776ccc03061d5` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:7bd6a0865e9267411b854f91754b10dc446d1b20375009a3099e670933eab4fb` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:63ef504f3945894d77cc0974005bcce1092d5982ec3deb3ee2037d96f4aea598` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:fae43adb9a288eabaf5946221c0715414693f6cf144b78fd3b6a8b43fe4b54ab` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:3f7148afee2a0b067968500edbdc812560dbc5936fae54b6558474ac8a4687d9` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:ea8daa50baf855ebc90a9ce32cba0f9063d02f165f0badee508fb646b673e6c7` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:3008d2134593239289c46fe1b426a6e3853eb5643321094484a1761caa4ddf8f` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:ca40d86f416da0c66700f1a3ca2dc6651a16ce69276bda6c0c081987edd67c39` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:17bcb1dec8182b614988bc4c8fe2b007e855e41b4e76117eb826d6a475e20533` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:ac8b48eb4d8769e4517c52d135049a7c3a9e476784345da2f5df4dd6847e1694` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:92d55101dfab337edb2cf92fd869875b613aaca1efb82ceb020c4ecda06c6eba` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:8f009ea19064c0f16810c3751adde06a46aa57c19b400218bfc84972da0319a1` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:64d59d5ca51c94006042e9f7d14d16fb730a0cc8adaeeafdb7cd35cee3192436` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:b55a0102ac4e3332e525d2353d74b80087b1fdc6d2929fcfb9f2c8948441b92a` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:a44a0169819cfa3ba7f4476ec9ec1a688db2144a2938eb19d0331b0a08ec6a7c` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:b3520aca26056974c19a6182285c9ef66a866d4d59ed77d5b85b0c0f166cc1e1` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:7d4b54c4737896736c9d81697cf366713115ec67899b9cdcf8bf37d6f62410a8` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:b128d3ebfafc59642ae7d5574f24afe8f80dae532dcf68c24cef779bce0666c0` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:adab7903446c23a53b6104c1e12fefca4bd54fe2bba624f440d3aa2e774b2068` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:cef9aa43641f124d922603a162b931dcf0c616ce487316b777cdc29b976f03ed` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:1ef6377e7a3c393fe2fc43f8a9b54f24904631c887e365200062f87c720d08d4` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:d2bb9e1de5dfcb8a76c0d91c4fa0462f5d11c064e894785a46dc0b200d20a14a` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:43693ee69ddeef8ddbf2fb1059065789e6112ca8afa015368d31bdd12ec08c95` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:83aa4f69425eb95cb36148bfada58f4d224013ca26a2917c9b69bd61da2a57ac` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:acd148ad1e066d9d770424e43c377e9e516aedab81942860b14da52311d0dc4e` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:f1ecccd109a5220723416ff9c7cc107e10875b6e81d4f7edee543f8ebf39a349` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:1ef6377e7a3c393fe2fc43f8a9b54f24904631c887e365200062f87c720d08d4` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:8788bb7491240d55060271b33b68376eacaefdbfa15ffdcea3b89e5f3a3ab8e9` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:f4ea54ea40d36968ee1f9f3cf6938f04df6f448f98b4f5acad7a015bfed90ed8` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:361207ae82c22b9dadceb3369df0e95e0633eeb539ad7453f49f2eae203ea242` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:43693ee69ddeef8ddbf2fb1059065789e6112ca8afa015368d31bdd12ec08c95` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:f4ea54ea40d36968ee1f9f3cf6938f04df6f448f98b4f5acad7a015bfed90ed8` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:95812e9936b70f5a61769025327ab70ac1faa9d54ed6ccf05d5d2f2c82f2f4cc` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:cc3c680acc654e92261f714408b1cb0f2bbdc45d5623570d4ab6deecf552705b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:2b239e284be7d4bf2a1f43342e7c5318f77e5212e06257bfe663564893ff21ae` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:3c7873de78e25bb306c492ef3018539a5a164dbc34bb957a1016351c6d445808` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:f5c66f068437c614430df435bca8880c968a92209ee38ee56c564ad60ff678f1` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:b128d3ebfafc59642ae7d5574f24afe8f80dae532dcf68c24cef779bce0666c0` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:2a6e281fcd4a3d35f937a54f6906a4f063b301ec1fa4b7bbbd734091eb60a10f` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:c60b87b9eae4982faffb851a30b8d5cae58d436d34f1a460e9e7c7c1a0ea0989` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:7ffbb056c93ce895989b51308a6c83ab5022c974f8ac26d27aa29b43011cb122` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:1c9350dc5d2544a80dde57b1b15d8075cfcea39658d105312f5bba32521f93b5` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:e71a0789bffb8fba9b03092e766d0f589299c55d14f8d61edbf4a750a6c3b1b2` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:d717a53262cb2b72f17796e62b9b37cf4e20d1e90410560ed03db9fc7051b0d3` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:5e34372dc7330b48d668a36d656c06ceda4545f5911669c8da146fb4cb9be7d6` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:12f98ec39b4b52000dd7c1a8cc86eb1deb8ba614dabdb5591dd02b54b8b4cb48` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:e47ded65b7fa05c782049d88d0b5e48b71facde2517912023d24e7a306c364ca` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:c91b6d44013d9514498b464bc4c6dce52197bdf70121663ada56f7af3c331da4` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:3e365f6603e4066510fc07f0c16c245058c19b77e1b796ddc3e50d5ac5f2b91b` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:5231ccab8d3e53216663bf73d1acc20803873ee39204e338a5933f483002a8af` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:f4ea54ea40d36968ee1f9f3cf6938f04df6f448f98b4f5acad7a015bfed90ed8` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:80f8353e889bf019158f21988f781765f90b0f126df426fcfc76ded8d3e639ef` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:cef9aa43641f124d922603a162b931dcf0c616ce487316b777cdc29b976f03ed` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:501307fda8ba5ca845f985e7c2857595abc67ce54037f07ffa384080d45ca725` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:fdd7c9f7f92d31fd298f5a2259959d8f8e9b0cb1ce754e5d4a5a84aba4aa196b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:0e5084191e3d72dfe444cd3468843dce7535a774c707bd4e2419ba3f1bbdb655` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:d4b23a10fd81910d3ec2b5a0b275f4507b4146685e3a833c94c2623970b5e49b` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:30cfd7b1f26c7c0b317cddd72e73929c7e7aa41b0fd3e7cda0fe14acc047b833` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:d94d6c5f32a4ffced692a0a3c2c2a6f77477c4e2491a94deb53dcaff99cc7d10` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:d2bb9e1de5dfcb8a76c0d91c4fa0462f5d11c064e894785a46dc0b200d20a14a` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:ba57d7503ee19baee3d14abff0c0386aa5c6cac616c94d37a6d7f94d419b3d98` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:3bf5ce3edead266dcd0d2636ea5b4c8e6224b21ddebfabe7010588f2ad5d5cb5` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:adab7903446c23a53b6104c1e12fefca4bd54fe2bba624f440d3aa2e774b2068` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:1bb54e49a9d35a309f6d4609c114a240249ed537150afec8202fe0d882fb91cf` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:22cad3f19a2feeafc8416bd23d4319a7d3ccb997a3bea511731a7fa08e415c44` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:5454354a2d9a15f0f8e504482cea785cad6c8ec8bb167b0766cade5d7b4caae4` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:b128d3ebfafc59642ae7d5574f24afe8f80dae532dcf68c24cef779bce0666c0` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:adab7903446c23a53b6104c1e12fefca4bd54fe2bba624f440d3aa2e774b2068` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:5effc18dd1f65e1188616aa32cf8e4dc3a8a06bdd3eb95cc2e04341d166fca65` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:1ef6377e7a3c393fe2fc43f8a9b54f24904631c887e365200062f87c720d08d4` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:a8f5c6993b4224381bd406d4614617127b97de35f5a643353747db3b390acb3a` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:5610c4975fb289b3909932d3f5b53a7032b7a2507f60ec1b69079cb50f84dbf8` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:83aa4f69425eb95cb36148bfada58f4d224013ca26a2917c9b69bd61da2a57ac` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:95b45ae9eb9536bbfee549a496b4063a1be139c0c7afb6c793c4e2cb78d94012` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:86edf6e657964db322d97ce1c7c27dcf2779a270aae9eb467501f0ba95b68c42` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:1ef6377e7a3c393fe2fc43f8a9b54f24904631c887e365200062f87c720d08d4` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:8788bb7491240d55060271b33b68376eacaefdbfa15ffdcea3b89e5f3a3ab8e9` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:74c8e4cf02f637a9e6dc48854666992a91f6402dd5f80b2f31bfe483df9ef71c` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:361207ae82c22b9dadceb3369df0e95e0633eeb539ad7453f49f2eae203ea242` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:5610c4975fb289b3909932d3f5b53a7032b7a2507f60ec1b69079cb50f84dbf8` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:74c8e4cf02f637a9e6dc48854666992a91f6402dd5f80b2f31bfe483df9ef71c` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:95812e9936b70f5a61769025327ab70ac1faa9d54ed6ccf05d5d2f2c82f2f4cc` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:cc3c680acc654e92261f714408b1cb0f2bbdc45d5623570d4ab6deecf552705b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:2b239e284be7d4bf2a1f43342e7c5318f77e5212e06257bfe663564893ff21ae` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:3c7873de78e25bb306c492ef3018539a5a164dbc34bb957a1016351c6d445808` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:f5c66f068437c614430df435bca8880c968a92209ee38ee56c564ad60ff678f1` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:b128d3ebfafc59642ae7d5574f24afe8f80dae532dcf68c24cef779bce0666c0` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:0309f74cd280d6f56073065c73e01a0d81a260e6dd1e7d6c10c8f27ab9eea4e1` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:255aac1f31bf9ca54f311e31ecec87028cc6fa19815508a35292c16f480881aa` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:a5170676e5a1483126e7e8ec86a8740c5a033c44bfada9f7d54cc6fc9307ba13` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:ec141f1062a9fd079135318d1407ccab9340f96c037cb5fc2de32aea4918e3d7` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:e71a0789bffb8fba9b03092e766d0f589299c55d14f8d61edbf4a750a6c3b1b2` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:d717a53262cb2b72f17796e62b9b37cf4e20d1e90410560ed03db9fc7051b0d3` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:5e34372dc7330b48d668a36d656c06ceda4545f5911669c8da146fb4cb9be7d6` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:12f98ec39b4b52000dd7c1a8cc86eb1deb8ba614dabdb5591dd02b54b8b4cb48` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:e47ded65b7fa05c782049d88d0b5e48b71facde2517912023d24e7a306c364ca` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:c91b6d44013d9514498b464bc4c6dce52197bdf70121663ada56f7af3c331da4` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:3e365f6603e4066510fc07f0c16c245058c19b77e1b796ddc3e50d5ac5f2b91b` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:5231ccab8d3e53216663bf73d1acc20803873ee39204e338a5933f483002a8af` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:74c8e4cf02f637a9e6dc48854666992a91f6402dd5f80b2f31bfe483df9ef71c` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:6690719da2460798a8b855d707f9ded84fc28ce60b00aec55636e9d99e47cdd6` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:5effc18dd1f65e1188616aa32cf8e4dc3a8a06bdd3eb95cc2e04341d166fca65` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:501307fda8ba5ca845f985e7c2857595abc67ce54037f07ffa384080d45ca725` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:fdd7c9f7f92d31fd298f5a2259959d8f8e9b0cb1ce754e5d4a5a84aba4aa196b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:0e5084191e3d72dfe444cd3468843dce7535a774c707bd4e2419ba3f1bbdb655` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:9d143e66aa4753576e168a51b6c81203c7f90154f8762c493a1d7e3e914f8c56` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:5162fb394399d40af0378bddf3ede0efdb211104935f3f39b45d65ef3d1099e1` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:be5cd166fa52734e842d8ace7bdb37e120f8c015c758bce342cccea02b33e35a` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:a8f5c6993b4224381bd406d4614617127b97de35f5a643353747db3b390acb3a` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:ba57d7503ee19baee3d14abff0c0386aa5c6cac616c94d37a6d7f94d419b3d98` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:3bf5ce3edead266dcd0d2636ea5b4c8e6224b21ddebfabe7010588f2ad5d5cb5` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:adab7903446c23a53b6104c1e12fefca4bd54fe2bba624f440d3aa2e774b2068` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:1bb54e49a9d35a309f6d4609c114a240249ed537150afec8202fe0d882fb91cf` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:22cad3f19a2feeafc8416bd23d4319a7d3ccb997a3bea511731a7fa08e415c44` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:93b06b2774071f9fbfcb21476224bc29395dd6ba55c50d10fa56b445a1ca3b69` | `verification-decisions` | `verification-evidence` | `false` |

### unsafe-patch-review-recovery/patch

- branchName: `bitcode/remediation-read_unsafe-patch-review-recovery_16a56c87c5-unsafe-patch-review-recovery`
- readId: `read_unsafe-patch-review-recovery_16a56c87c5`
- assetPackId: `asset_pack_fd3c892c8e9e`
- proofContractHash: `sha256:081e1b7dde51ffe365b65b8a69d22bef36b87ec49e90d3c5bc81f1d731ba23eb`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:1d10c217eace8afce8408b11245435b2e9081835c29f5f2da5f29c59e41b7cc5` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:f4fba9666f284d709559ee6516ee9563926a367b8f7c6351fca108f319f1b4b6` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:fcc2ca2a8cb1a47c046d4cb66e6cce5bda0205778c6ab6e262d3be2cf5871816` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:2260487892adf8f4485b3d2e93477abe006715da4c6b703f30d76a57e028a12c` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:af24c468651822ac278745cda0e3074e50ae2e00092006af011d2fd2cf34d9df` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:45acb0a245c588240d0e9198a27e3ffa3a65362869d56727eb807343e4e36413` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:081e1b7dde51ffe365b65b8a69d22bef36b87ec49e90d3c5bc81f1d731ba23eb` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:211dcb4811d83b8ebc24e5c11af5fc09afb3c84e51c7d19b9f991fb7e7c81cdc` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:ef522897395a3258b9d9af678709e7652666d8e520693d27ad5e45ae0911916f` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:2260487892adf8f4485b3d2e93477abe006715da4c6b703f30d76a57e028a12c` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:7c48d725d866540ce46cd8410fead7c21dce0cbdf569622c4fb182f8a16a09b0` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:4c34cfb8e09abc3fea234130d5e22306e4384e7e02b72d10c38ed4e6a48f9ed6` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:1bd18f768ea116ed2cfb942169dc485aeaf0c342feae07b0443d5a2123cf6901` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:45acb0a245c588240d0e9198a27e3ffa3a65362869d56727eb807343e4e36413` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:4c34cfb8e09abc3fea234130d5e22306e4384e7e02b72d10c38ed4e6a48f9ed6` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:8907b2bd0e9c0efc090638fdd5dbf3a8d6e4fe648d1c1b27426fb56c9c429abd` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:1c9b1263bb7b7369c5198c518dfabccd135d3bb66f52807b99022037b205f034` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:d0debea21fc12d3c1b01fe923ed58a92b5f9188074c7f35bf138cc5cdbedcc89` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:0b81c774979bc960c5470c092f9d0f240bf9cbec0454b4f6e9a6afa595589607` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:c1cea028a02c09bf4071337f6971368a1ca149b1172b7cc0e251b9d3794e4245` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:1d10c217eace8afce8408b11245435b2e9081835c29f5f2da5f29c59e41b7cc5` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:b49a12e17932a30da0273d11cf9a47d7b2d43f51739526eacd600f272f2e1133` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:ce56c4fb5c0c3de094741a30c5a6e220192bb8b911ab4d9c0a172ef6b57180f0` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:1497918b2148fb9bad562416b2d46b90b85eeb988c3ea355e9aad5d38ea36547` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:ba634a091705d48920bbde42a75e0dc700bb1697c8b33feb68367b356814adf5` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:d27e089bde28105989dbbf6ec9bafe5da53f3c72ae8533e605b7c9f4ca12ff95` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:8af4e3ce8938d57e58bc1282d863cbfd15f15d6ba99c4972ab17d5bf1a571957` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:95ceba55806dcbebce98645a62a55e31b48767f7e5c1aa2fb5fd2d3a1ba512fa` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:12f98ec39b4b52000dd7c1a8cc86eb1deb8ba614dabdb5591dd02b54b8b4cb48` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:139369067a8d2d1ec94ed67bb51ba0b2ad74e92af71a988fda83113eb9edba14` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:566ba4e640705978e4064fa1c9c8d55b77f0fe7cfde0d4b112d006edc0ca63f2` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:927b1a4ce68b0ccc92e9e85c605b2e2f2d2ff0011b39b46c2ea31c4e2de6712b` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:76fb0b76ddbd2b6dcca0d8707be3b6f8d3520faf7f752a5ce59384ef7bf5374f` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:4c34cfb8e09abc3fea234130d5e22306e4384e7e02b72d10c38ed4e6a48f9ed6` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:241a88c2df2623a0f2fda365a4b56fbd0b87396d61b13975bd92331c85d16f22` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:fcc2ca2a8cb1a47c046d4cb66e6cce5bda0205778c6ab6e262d3be2cf5871816` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:6d85aaed7d0cf7270dc0b1a3f44b04df5487492cb02b8165e63c08e7efc38a7e` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:5cf464309b76a143cbf7a6aa7809b3ba933be40f9d5f216b525853ab6cfc675b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:10097ec69197af1f2029c6763f3869f93d4df875a0ffe1decc4c41bcb7ca2a4d` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:02cc19fd505fa15604a7ef08ef0c8ec020ffab6bb6dd32482e70392023aae9c9` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:313f9b2a7e10f4a9be9a9faf9b226837e5ae7379be98de1c00f63c9ec7a5af1f` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:1b4fa6190e27b9bc34e31a52c364ddae2546bab4fd0477d4d04026c0949022e1` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:af24c468651822ac278745cda0e3074e50ae2e00092006af011d2fd2cf34d9df` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:2cfd1ebd2206bd145f3eb79ca92d6692b40f55283c973459914e90dcaa1a6786` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:e6ac0d918107aedfed43ac114582520f3bfdcab67132b46503dcf662dd2cafff` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:f4fba9666f284d709559ee6516ee9563926a367b8f7c6351fca108f319f1b4b6` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:49801567def5c6832d2e1fad1c1ba1f3a03dbf85a224802074b5d0dd777bbe2b` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:d33ad11793c44bf8a6fbbcab6ed4a7c0a479b58cbe30d27181a505cb7dde55a4` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:0544ddd760b10d4336784bb17994c68b7bd0f04b9a1135c42858f5694becc590` | `verification-decisions` | `verification-evidence` | `false` |

### unsafe-patch-review-recovery/context

- branchName: `bitcode/remediation-read_unsafe-patch-review-recovery_16a56c87c5-unsafe-patch-review-recovery`
- readId: `read_unsafe-patch-review-recovery_16a56c87c5`
- assetPackId: `asset_pack_fd3c892c8e9e`
- proofContractHash: `sha256:081e1b7dde51ffe365b65b8a69d22bef36b87ec49e90d3c5bc81f1d731ba23eb`
- allFamiliesPassed: `true`
- proofContractPassed: `true`

#### Family Proof Hashes

| proofFamily | proofHash | proofArtifactPath |
| --- | --- | --- |
| `inference-synthesis` | `sha256:1d10c217eace8afce8408b11245435b2e9081835c29f5f2da5f29c59e41b7cc5` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:f4fba9666f284d709559ee6516ee9563926a367b8f7c6351fca108f319f1b4b6` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:f6abbdaf4249320486a9fd70d316ab1edda52b764cc4242f0136c40efa30ef27` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:2260487892adf8f4485b3d2e93477abe006715da4c6b703f30d76a57e028a12c` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:2a2e47c72d266728aba729a1df638a28a63d2a25b88593435bada4ee67ff93f9` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:1821843556aeb7ea7924f52129b0e00e9e7c35a7795f842947bde87b9120b743` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:081e1b7dde51ffe365b65b8a69d22bef36b87ec49e90d3c5bc81f1d731ba23eb` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:aedd512b38435c2c8788db85a80e13b2b3fc29417c12b244ad61101af9ba8b60` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:d578860b0d0d213f26f5a97e76cd74f753cb8e8c105bc4d376b5969bfe5e770d` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:2260487892adf8f4485b3d2e93477abe006715da4c6b703f30d76a57e028a12c` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:7c48d725d866540ce46cd8410fead7c21dce0cbdf569622c4fb182f8a16a09b0` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:3920104b24531e329948f80b2d900fc98cfc42698d4ac1fa0e7286df74a5e01d` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:1bd18f768ea116ed2cfb942169dc485aeaf0c342feae07b0443d5a2123cf6901` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:1821843556aeb7ea7924f52129b0e00e9e7c35a7795f842947bde87b9120b743` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:3920104b24531e329948f80b2d900fc98cfc42698d4ac1fa0e7286df74a5e01d` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:8907b2bd0e9c0efc090638fdd5dbf3a8d6e4fe648d1c1b27426fb56c9c429abd` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:1c9b1263bb7b7369c5198c518dfabccd135d3bb66f52807b99022037b205f034` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:d0debea21fc12d3c1b01fe923ed58a92b5f9188074c7f35bf138cc5cdbedcc89` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:0b81c774979bc960c5470c092f9d0f240bf9cbec0454b4f6e9a6afa595589607` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:c1cea028a02c09bf4071337f6971368a1ca149b1172b7cc0e251b9d3794e4245` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:1d10c217eace8afce8408b11245435b2e9081835c29f5f2da5f29c59e41b7cc5` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:7c1ebcb79090dd09243552478df9b9eb637bedbd91044dda36836887a4f4332d` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:bbaff4c9e409f03b11defdf0c152826374fde34f79b7a07be8b38471ee547e36` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:0979d8fece848a46034cff3b7439c73928e4490316688e0a5458a29d4251c34f` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:c106e15b75acfbdfe03de98f435b1e8c8c8ebb59867e0e6a1341a810935cb245` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:d27e089bde28105989dbbf6ec9bafe5da53f3c72ae8533e605b7c9f4ca12ff95` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:8af4e3ce8938d57e58bc1282d863cbfd15f15d6ba99c4972ab17d5bf1a571957` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:95ceba55806dcbebce98645a62a55e31b48767f7e5c1aa2fb5fd2d3a1ba512fa` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:12f98ec39b4b52000dd7c1a8cc86eb1deb8ba614dabdb5591dd02b54b8b4cb48` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:139369067a8d2d1ec94ed67bb51ba0b2ad74e92af71a988fda83113eb9edba14` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:566ba4e640705978e4064fa1c9c8d55b77f0fe7cfde0d4b112d006edc0ca63f2` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:927b1a4ce68b0ccc92e9e85c605b2e2f2d2ff0011b39b46c2ea31c4e2de6712b` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:76fb0b76ddbd2b6dcca0d8707be3b6f8d3520faf7f752a5ce59384ef7bf5374f` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:3920104b24531e329948f80b2d900fc98cfc42698d4ac1fa0e7286df74a5e01d` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:9885cb919e9f819c193899633241241f3217d2583aa76d8719a6f5fcc5308e0c` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:f6abbdaf4249320486a9fd70d316ab1edda52b764cc4242f0136c40efa30ef27` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:6d85aaed7d0cf7270dc0b1a3f44b04df5487492cb02b8165e63c08e7efc38a7e` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:5cf464309b76a143cbf7a6aa7809b3ba933be40f9d5f216b525853ab6cfc675b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:10097ec69197af1f2029c6763f3869f93d4df875a0ffe1decc4c41bcb7ca2a4d` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:5ce74f215f9d60e8005345240f4ece14b01bf4d68cca0e452e66f69fea4a77c9` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:7a109cdc9c2d022a8b9377f837671e084b3bc9c6b1a656dc9915229ed4d7780a` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:13336c6ff717f766c34101f92bcba1bcda71a760639a6658a4f5ff1b23692dbe` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:2a2e47c72d266728aba729a1df638a28a63d2a25b88593435bada4ee67ff93f9` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:2cfd1ebd2206bd145f3eb79ca92d6692b40f55283c973459914e90dcaa1a6786` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:e6ac0d918107aedfed43ac114582520f3bfdcab67132b46503dcf662dd2cafff` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:f4fba9666f284d709559ee6516ee9563926a367b8f7c6351fca108f319f1b4b6` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:49801567def5c6832d2e1fad1c1ba1f3a03dbf85a224802074b5d0dd777bbe2b` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:d33ad11793c44bf8a6fbbcab6ed4a7c0a479b58cbe30d27181a505cb7dde55a4` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:d4dc9c60a763d4ed91dbc037024cb464d48406eac45cb8d40660d647eca65af5` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:6a44eb26908aadf6943c6411c6e798675331f88d6e670690ac29f72f2df2d971` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:de13e187f609cf5b5a4f7462d404f3e5b6a9ec6a1b5409af0a41d54be89c7637` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:a8f038138ceed6859020675d71736cdba5a587e6b48ddb29133db3011ef74d52` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:2c1624cf684ae0a83834d9c7a28789d966ff776e1c61c5fbb611b5d73392547c` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:868570a18f2f19e690088dabf73208e3484c573951792c5c861174bb4be2cba3` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:5bde14deb75ac18013f2f69e21112f774c1d4322a93489e95c3919c7a967f7d5` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:7170c26e2b0d89451f79fe30b5e96f548a4f0c5e45f1947ee0fcefb109f93ca6` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:e6eb896b77c9fb159e64a9e29533a7c305055e01a579aeae6efbbb42bef72b77` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:434a20a208bcc11612454b8de14cec35dc8dd6fc0ad54e75a534116ac3cdff32` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:2c1624cf684ae0a83834d9c7a28789d966ff776e1c61c5fbb611b5d73392547c` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:8e0988ea71f64d569b06c9212f50b1af3d61339afc61ea1a729f4fe4be4c779e` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:af3e0c2cb3148443ca9f967906fa079cade336b39bbd36b05e6f031353dc0715` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:677db4a49c7564385eeceb68c6c9ee6550b3eafef33ebfd2d66ed7fca1fbe723` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:5bde14deb75ac18013f2f69e21112f774c1d4322a93489e95c3919c7a967f7d5` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:af3e0c2cb3148443ca9f967906fa079cade336b39bbd36b05e6f031353dc0715` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:0195f7c6c8c60fc7df745a69316f6ffa8e22fbb265987ec2154a0b977c3d06c3` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:965ba1aff4604765638f5f2fba6721007f57f6d4fa553938df7397fa460ad8d1` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:980c3e9afa612cfbdae5fee2668cea479236ea1ed699ed688ed553f8d960a054` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:a1e7ba65e662bebe0b9babb6067655b7cdcbaa5876d82140a3e84ecd8a892726` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:a7f910211080b140df9104153bc1ee2ca4e79cc014b42d89ee687e24278319c6` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:6a44eb26908aadf6943c6411c6e798675331f88d6e670690ac29f72f2df2d971` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:a7ca588dddbfafce36107d95c7d237b46c644c0122614e4967656c308fb38365` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:a726a4c350631cdff6d4f512a3b6cd30f7cf26b33077ba1049b66c54cf229fae` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:cbacb2561b13b5e8480a7fbc23488dfd87df92f9c07098d4bba449941109b45a` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:f27a92cfffb61f084e63838cda18b35ebd4b118170f88b06e427f9c8844464bf` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:598b7bb92d2791407ac01d15fe35c2b46f729c30534b819dff177672e9c44166` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:9c29647f452b16962ba7c3046d365f04e63e667df669fdcb4d0f16322c3de76e` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:adfd68a5c9458827e53484abc4f4b7c24320972545e0f5becd4c3443d1b828fd` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:12f98ec39b4b52000dd7c1a8cc86eb1deb8ba614dabdb5591dd02b54b8b4cb48` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:ebcb977eb8b8ad5a9fcb3d6640307ad033c642f08fab42326f1a2e7844752525` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:c3732845741f36061ac1103c9b2485c814592989e3402bc91a38f7a8541b38af` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:469e541169edd2d2bde8ff4ff540b41b3e2ad528438a1f425a644a9aabd2018c` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:f6e92b86b880ef9dbf12aa08b6201b8306e3a31fa5ac846dfde9a3c37f6aadbc` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:af3e0c2cb3148443ca9f967906fa079cade336b39bbd36b05e6f031353dc0715` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:e1818adb231f247cfcf9d54189d132f7c6d27020d5af67ab2c8d5ed3a3117aeb` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:a8f038138ceed6859020675d71736cdba5a587e6b48ddb29133db3011ef74d52` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:b0acbf48dbd4c5a4202a8683fc011822c96f6d7c566fd287412d544f7de1b4be` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:8f1970d50b815044e763d8f192ab7269689ea0b3916334f534df680e4b3eed57` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:dd02fa307ebed5bccc9d7563597c982db9779cf59253001e2110d84bdf0ae8b8` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:aef45c4332d64546c4ae0c94af83be2384f25ba49770b025c5bf85e40b82d71f` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:b384e7dd265cb144224001665c33403e60c10f6f794e386a0528a09c1fe0ce0e` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:ab9e642f4867ee73b8c143e1f7e4c8ea131dadd369a2140539f8a2e66b93d64c` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:868570a18f2f19e690088dabf73208e3484c573951792c5c861174bb4be2cba3` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:81cb9d04a88483e9a534ebb47a3c9dba1ca3ccdbfe7dd6b363516979753c0a6c` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:a359125807e3d48f8045b6d6377814e122db757051a2cd4751c5c4aea0007652` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:de13e187f609cf5b5a4f7462d404f3e5b6a9ec6a1b5409af0a41d54be89c7637` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:cef9d5e516f74689f3dc7315086660e2dd6d1385337367ac0038bb3681c53fe9` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:a84e46620fcfd16a5791ef72c70729d266771b4540954030f7241631c6da76b7` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:546abd6b161b3ae36e6aa5fdbc11021194e82bd37c646b0669cc3e1acee00718` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:6a44eb26908aadf6943c6411c6e798675331f88d6e670690ac29f72f2df2d971` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:de13e187f609cf5b5a4f7462d404f3e5b6a9ec6a1b5409af0a41d54be89c7637` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:4ed2198c3827ebb995f8a02e140884f55fc4af51746f586804533a0bcc7f6904` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:2c1624cf684ae0a83834d9c7a28789d966ff776e1c61c5fbb611b5d73392547c` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:380b4a4dd69a7b3c594f777eb130631387c09d418edba5e9b52a40e7f893b9a9` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:7f7de72b8b776f3b6b5250fb88ebb9efff0c3c67ba93043fc3efc63d507ea0a6` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:7170c26e2b0d89451f79fe30b5e96f548a4f0c5e45f1947ee0fcefb109f93ca6` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:7d34b19c9298cfe043e5ab0096e5766e839444a3027c806efd64f115e98a38b9` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:bd8adffca0c34cfdfc31c04b6ca5932f4f04d90e3567d1451fde80e746d7fb3d` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:2c1624cf684ae0a83834d9c7a28789d966ff776e1c61c5fbb611b5d73392547c` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:8e0988ea71f64d569b06c9212f50b1af3d61339afc61ea1a729f4fe4be4c779e` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:0ee4bbf7e89b96f7249da804ad174d47b8ed2133ca5ee6d533b080eafdeca75d` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:677db4a49c7564385eeceb68c6c9ee6550b3eafef33ebfd2d66ed7fca1fbe723` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:7f7de72b8b776f3b6b5250fb88ebb9efff0c3c67ba93043fc3efc63d507ea0a6` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:0ee4bbf7e89b96f7249da804ad174d47b8ed2133ca5ee6d533b080eafdeca75d` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:0195f7c6c8c60fc7df745a69316f6ffa8e22fbb265987ec2154a0b977c3d06c3` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:965ba1aff4604765638f5f2fba6721007f57f6d4fa553938df7397fa460ad8d1` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:980c3e9afa612cfbdae5fee2668cea479236ea1ed699ed688ed553f8d960a054` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:a1e7ba65e662bebe0b9babb6067655b7cdcbaa5876d82140a3e84ecd8a892726` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:a7f910211080b140df9104153bc1ee2ca4e79cc014b42d89ee687e24278319c6` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:6a44eb26908aadf6943c6411c6e798675331f88d6e670690ac29f72f2df2d971` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:3dc46c757b0617248af558fcd07a9e7e1a76281804749174d8e8100cf3fe24c5` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:7779bde5b2647f3de068b07f9d17fcfeceeea06564c801e6da94240cbe6ff0d9` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:53ce7e742f5a762e92a11728f0fbcd2785f87f4c4fd1564256a6948601932e03` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:3f3fe6bf4ec60092b5dd255619c6f5938268123cead2ce104e6a2ed9c5ede4b9` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:598b7bb92d2791407ac01d15fe35c2b46f729c30534b819dff177672e9c44166` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:9c29647f452b16962ba7c3046d365f04e63e667df669fdcb4d0f16322c3de76e` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:adfd68a5c9458827e53484abc4f4b7c24320972545e0f5becd4c3443d1b828fd` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:12f98ec39b4b52000dd7c1a8cc86eb1deb8ba614dabdb5591dd02b54b8b4cb48` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:ebcb977eb8b8ad5a9fcb3d6640307ad033c642f08fab42326f1a2e7844752525` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:c3732845741f36061ac1103c9b2485c814592989e3402bc91a38f7a8541b38af` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:469e541169edd2d2bde8ff4ff540b41b3e2ad528438a1f425a644a9aabd2018c` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:f6e92b86b880ef9dbf12aa08b6201b8306e3a31fa5ac846dfde9a3c37f6aadbc` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:0ee4bbf7e89b96f7249da804ad174d47b8ed2133ca5ee6d533b080eafdeca75d` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:93d3913609ce424a9e1fa849345755f1447e5d1da6b3df68afc118c72332155c` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:4ed2198c3827ebb995f8a02e140884f55fc4af51746f586804533a0bcc7f6904` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:b0acbf48dbd4c5a4202a8683fc011822c96f6d7c566fd287412d544f7de1b4be` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:8f1970d50b815044e763d8f192ab7269689ea0b3916334f534df680e4b3eed57` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:dd02fa307ebed5bccc9d7563597c982db9779cf59253001e2110d84bdf0ae8b8` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:7ad6bd3fd130367f088328db7f66846195082ec030bda9f4a9b5efa3ab04c7d2` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:a4c343bc7050a21106e4f5f27de9ca9a2a17d792bb8730996d15f898d5930dc1` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:2d25c8062c710f82e79bd1b124b50cce7274a226e2b6866afb868a2482a6fbe1` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:380b4a4dd69a7b3c594f777eb130631387c09d418edba5e9b52a40e7f893b9a9` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:81cb9d04a88483e9a534ebb47a3c9dba1ca3ccdbfe7dd6b363516979753c0a6c` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:a359125807e3d48f8045b6d6377814e122db757051a2cd4751c5c4aea0007652` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:de13e187f609cf5b5a4f7462d404f3e5b6a9ec6a1b5409af0a41d54be89c7637` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:cef9d5e516f74689f3dc7315086660e2dd6d1385337367ac0038bb3681c53fe9` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:a84e46620fcfd16a5791ef72c70729d266771b4540954030f7241631c6da76b7` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:7f01e637f06378aa72bf3d266bcd746ef4e2490412921f81ba9f0c9a52fc5212` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:af111ab74d6aa230fc1ae3a12a02592d15e6476d692beb927a2480c2033c8b60` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:dde5e174eddf0911801b1eb8845991d70f97df445d99c45e1002e24c80ab721c` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:9c75d8e790d30a067d1eebbd604bacf8be0ddab8a1b121e9b71f7e4fd1871ec3` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:d0a68ad68adbab5b801152274edbd5e7914f9172858603b62f2b16ba47c23c8b` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:101c68c14040754b624c4d5b2568859dcde213bab9e2156b420ac91016441090` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:f19ba812efd8d9010544988cbf24396d069b1996f6e96d3414278422ca581d3f` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:94214cf13298a6992d32afa5572d4359fc9c21a74ab86c4625e2b03d3a1a6d6c` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:880417de4a0cbaa4d2f42bc0b11ab35ae6f10df26bf243dd13eaac365485aacf` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:ba6ed72ea1b7523a436dee4f7d83b326d303a9098e78e8f69993fe5eede62683` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:d0a68ad68adbab5b801152274edbd5e7914f9172858603b62f2b16ba47c23c8b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:d662a15e71f8c3814e48f17ce6a0c729ae5ab13f777a17a222915844e1e8adeb` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:f7c3eaa6764f14eeee4e24e7692dfa16936c6051f3fb3f30a3464aad5ddaeca8` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:b854ae607f2f82e26bcaff6023da13c917187c2753da90b5c1b20ab7065cc021` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:f19ba812efd8d9010544988cbf24396d069b1996f6e96d3414278422ca581d3f` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:f7c3eaa6764f14eeee4e24e7692dfa16936c6051f3fb3f30a3464aad5ddaeca8` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:4f30f9a5003316c19d743d1c7ac31ab620e4c6e87f108a6f2c30cc43cdb4629b` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:204f4d39d06860e0b3d61d3ff23546c5d9e82ef0aa2ef829c3f8a612255bdf32` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:8a90b3cdf83cdf0ddd801342dfa9de3fc5036568d4e052f5334c6ca47b3a8175` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:7951f9416b5cc1a695aff3680f06573ce1ac52d185354df683cfdbda5c5a2e51` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:33ff45151baa265773582247cbe9d91529ee60888a2cdfb0de8a859b7e944470` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:af111ab74d6aa230fc1ae3a12a02592d15e6476d692beb927a2480c2033c8b60` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:a141b4bdf8c4659b8673034b87b34dd0a9db5b92993e2daa53a43a9ef375b402` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:b8c45aab1fc6181e6c20e2ce44ce3b56f455214c84d06e723873f1eaa7d37db8` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:77d34bf29812acc7deb933efef36044d638745e819ca34c195b2a83ca8472b8a` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:5c1db48989b73dd62e014886879996570d643fdb279adb9b9e5e3b3c1e207c40` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:176d7d498737532e79fdfa67a5a8cdfb7a8957f9cf5763970fbbd329c90bc9ab` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:17c95fe334d9af77142728c4bf8b16bd6ac399b57dcd9372325dd7702ea18a23` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:063a855154f438e9d4b9db49bfa62c06014135b8433e4add2db9d253483e9f3d` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:12f98ec39b4b52000dd7c1a8cc86eb1deb8ba614dabdb5591dd02b54b8b4cb48` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:df0ea68f7f27865bff6d69e5443d7f6599cb4e6bffab89a158e8f70be15087db` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:8eecc81dd8c33aef035eebf6fc194b04434593c743fdb2741a0f04fa116c8b11` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:30faae37b6da6cd4ab8be205941828d1ec4b5f247557ad7048be4c9924227ae4` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:3a55bb95a85c70ee1a706001019523497ddcabe730b12f1e728f80429881290e` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:f7c3eaa6764f14eeee4e24e7692dfa16936c6051f3fb3f30a3464aad5ddaeca8` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:34a0bf4054fa32b67637643a3f479b80e393bc8aece3ab00bd5bdc3cc5af026c` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:9c75d8e790d30a067d1eebbd604bacf8be0ddab8a1b121e9b71f7e4fd1871ec3` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:d2bb74466474b95020ef27ac13ab2978c4b4fe1d19cb41146414f38dfca8200b` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:51a841a7255f59929dbd350752437fd41a64b9fd512ffb10dbdf090b0652ab6a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:1762236bbdef1dc1d58d7b2ea385bf1654670ca783e15fd17d9221fad52a8e9b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:a5c163e62bec0a1d0942a3cc1e1ee9fa69810e3a443ae937b2148f65b0b957c9` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:4ecd0407d381e094edc78931d6f903e2bc7be52b1c901be9f6f9f8fed4ee54c3` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:532a74c44ff8543393c369b381653fe3c9b5b9fefea19ce505bdb719eacbb388` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:101c68c14040754b624c4d5b2568859dcde213bab9e2156b420ac91016441090` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:521a6dc55ecc831891cc7751754790b1c9e63a8019266e9955e60f7a4adbece3` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:1d3e3d14b78a438c3963371ebae7dabd20534caeefe5d2e1cbdfe09b85d7e4cc` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:dde5e174eddf0911801b1eb8845991d70f97df445d99c45e1002e24c80ab721c` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:3ddb6480ee510888e48cf1b9d97a62056c2d45daae10325dc890f80a58f14794` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:18abe0ae8f3c15d1aedeb6b980121af6399bebd17bd7eefd5f5f3999a125ccc3` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:8d3da6029908568f4af96175283f6df41b06e65923aae95b59e77c7101c1ee65` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:af111ab74d6aa230fc1ae3a12a02592d15e6476d692beb927a2480c2033c8b60` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:dde5e174eddf0911801b1eb8845991d70f97df445d99c45e1002e24c80ab721c` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:62345c3c0528519a4ba2ee002df3c4e5a5c37895bfb80dcf9e20b064f6a5d6aa` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:d0a68ad68adbab5b801152274edbd5e7914f9172858603b62f2b16ba47c23c8b` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:be52d2ea08872ad0caff61cf5c201bfda6157120140a7396331fa38acead8e28` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:25b1de6de0319574567b9345d304adc2bbf7626fd606391213062744b1690f8f` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:94214cf13298a6992d32afa5572d4359fc9c21a74ab86c4625e2b03d3a1a6d6c` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:04ba8c7c86a5d011ed124447ba82e47b05c3eedc12dfcc68371b1da4158857b9` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:399a9c1d822df2df22993f3ec81e92933718d0f59e202e999a4a820d93923e95` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:d0a68ad68adbab5b801152274edbd5e7914f9172858603b62f2b16ba47c23c8b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:d662a15e71f8c3814e48f17ce6a0c729ae5ab13f777a17a222915844e1e8adeb` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:49f8db175b8e0b080dbf8b99c35eab571742c0cd9047e213bfc29195d006ed34` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:b854ae607f2f82e26bcaff6023da13c917187c2753da90b5c1b20ab7065cc021` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:25b1de6de0319574567b9345d304adc2bbf7626fd606391213062744b1690f8f` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:49f8db175b8e0b080dbf8b99c35eab571742c0cd9047e213bfc29195d006ed34` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:4f30f9a5003316c19d743d1c7ac31ab620e4c6e87f108a6f2c30cc43cdb4629b` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:204f4d39d06860e0b3d61d3ff23546c5d9e82ef0aa2ef829c3f8a612255bdf32` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:8a90b3cdf83cdf0ddd801342dfa9de3fc5036568d4e052f5334c6ca47b3a8175` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:7951f9416b5cc1a695aff3680f06573ce1ac52d185354df683cfdbda5c5a2e51` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:33ff45151baa265773582247cbe9d91529ee60888a2cdfb0de8a859b7e944470` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:af111ab74d6aa230fc1ae3a12a02592d15e6476d692beb927a2480c2033c8b60` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:87776778ee2357eb269dfb6ee9978c21d4dd2d70d9c7f874b37de502e8100970` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:91b709761e65f51447f25399a5a419b27d351c985fbd05569d3d6ce1272e4015` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:b5d167c7f2d2b4b7a024fced17a93f00ef6de0764b7ac76c09fe5cf365b8dab5` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:c17f205b4e3b9a75e4bb141648d46f69b5a7ef60c06916aa26509d69a73abd87` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:176d7d498737532e79fdfa67a5a8cdfb7a8957f9cf5763970fbbd329c90bc9ab` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:17c95fe334d9af77142728c4bf8b16bd6ac399b57dcd9372325dd7702ea18a23` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:063a855154f438e9d4b9db49bfa62c06014135b8433e4add2db9d253483e9f3d` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:12f98ec39b4b52000dd7c1a8cc86eb1deb8ba614dabdb5591dd02b54b8b4cb48` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:df0ea68f7f27865bff6d69e5443d7f6599cb4e6bffab89a158e8f70be15087db` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:8eecc81dd8c33aef035eebf6fc194b04434593c743fdb2741a0f04fa116c8b11` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:30faae37b6da6cd4ab8be205941828d1ec4b5f247557ad7048be4c9924227ae4` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:3a55bb95a85c70ee1a706001019523497ddcabe730b12f1e728f80429881290e` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:49f8db175b8e0b080dbf8b99c35eab571742c0cd9047e213bfc29195d006ed34` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:fc0ecbd01376203a64dfdca51241ccab04bceee2b9577295637193cc9525537a` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:62345c3c0528519a4ba2ee002df3c4e5a5c37895bfb80dcf9e20b064f6a5d6aa` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:d2bb74466474b95020ef27ac13ab2978c4b4fe1d19cb41146414f38dfca8200b` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:51a841a7255f59929dbd350752437fd41a64b9fd512ffb10dbdf090b0652ab6a` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:1762236bbdef1dc1d58d7b2ea385bf1654670ca783e15fd17d9221fad52a8e9b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:6a812e4e668d8ef1fc28ad2f8d8ee77da8bafdd71c54845f8d702891f283bc40` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:68cf734c0d119e817064d8cead8dfbeebb57d72982e328ab30fe05a97bd4d909` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:1a948866a17f327b9bb3b14e4a711a78dfa9c25c3856b8d5fd4827e25ac5d084` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:be52d2ea08872ad0caff61cf5c201bfda6157120140a7396331fa38acead8e28` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:521a6dc55ecc831891cc7751754790b1c9e63a8019266e9955e60f7a4adbece3` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:1d3e3d14b78a438c3963371ebae7dabd20534caeefe5d2e1cbdfe09b85d7e4cc` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:dde5e174eddf0911801b1eb8845991d70f97df445d99c45e1002e24c80ab721c` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:3ddb6480ee510888e48cf1b9d97a62056c2d45daae10325dc890f80a58f14794` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:18abe0ae8f3c15d1aedeb6b980121af6399bebd17bd7eefd5f5f3999a125ccc3` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:0cff7e6b41301a6065c6b9779b50b767d9e89c97e5e8f83083501cb29b88f186` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:8ab3e39c78bd87bf4c686eb3b3a3cfa9ace4af2b6a0665a2726e455b86c3b5b2` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:0a196b14d27f8f17eb9952cf2c568764983f22d2efb6411f42d9e4cb227fda48` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:c08c6baf9c335ea6d9f771efde006ff8577953196a2bab6b9acace0521350189` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:8c6a898ee8e19a41a8f8399f98c61b80362ac20513ecd53dae26950fcae6e772` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:28acf365dfd229e7f8eaba7056979f18ca5fa84dbb40450e6471e2886681cf62` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:46424cedd179cc2e3248e7a9360316513092e0223703b917fdbaae180a9badb0` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:22639f352c74be4b4f1c33522cbea29687fbe5455521c9aed0d64103a90f5426` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:8d90f117e89ca5fd018f3ceb01de869a40618cc0676cbe6b7f7b8b60f514bb66` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:3e430ad10754818fd790242bd0550a3fb7fc00148e5579cfe794e25d2f151804` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:8c6a898ee8e19a41a8f8399f98c61b80362ac20513ecd53dae26950fcae6e772` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:c9fa4ac117adf0cc265730713d751b683155f531f5ed573119d556460b0d84bf` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:15f24a288cbf0de131137d9d96db7322a1e08fbd1a97bb987d5b63e8589693eb` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:eed61e3878e67c01204bf34a40cb633e7a60a909f1ffc92aaa23f32ebf5302ba` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:46424cedd179cc2e3248e7a9360316513092e0223703b917fdbaae180a9badb0` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:15f24a288cbf0de131137d9d96db7322a1e08fbd1a97bb987d5b63e8589693eb` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:d4809afdb3d306157cde796c9d7b17cab28f2e22c2cdb3755ef2579bf6b5ec98` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:9e17674ef60968c65af2f5e1c75a4d708ef2c603bfb0773362a384feabf93efb` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:f9bb5020368bc879a8463c16f39d410417d782cbad6414fe385e98e19e0a1377` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:9a947a33796d73ef1411053e0bce2b3bf269565e2d203ab6367dc6d1dacfe307` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:a334f0e7a5667f10b9c70831920b1ea755383f680661768745ee7403026d3520` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:8ab3e39c78bd87bf4c686eb3b3a3cfa9ace4af2b6a0665a2726e455b86c3b5b2` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:58c42eb9f8ba892bb071b8ad41905cf51ba215330e3659ca7039ac6583929d2b` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:1ee5dee8a724aade1fb69c47806cf2ebc8d2aa159340a5002e98068c9e493191` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:7840b9fec52f2ca8b3320cf239fe7388ee444621133bb04b0c855bfb68214bda` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:9f2b9eafe157c6224500eaa4935f6b063f46aee795639246df58765d3875bb42` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:dbb3ac97b571dbc90d9cd8482bf9535a14608b8bfcf2cd196b9facd52ba5453d` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:86fe9486c43f5878a655acd61ec83330ff8197114de70be6b5dfe3e7dff7a918` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:bba36f476eee16207d7ebdd896e4ba21836dcbda21ca4b2b0d68e8d38b7de713` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:12f98ec39b4b52000dd7c1a8cc86eb1deb8ba614dabdb5591dd02b54b8b4cb48` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:620e667076d4e955a26712e5aa2af0e52005f6f52829183d4e45467166a92d39` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:c921d4fc1c2722ebaaa7dee8dd7b44c6db3a8dfc739ab7cf3ffafbe1e5a97d0e` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:7699508f4e5564064848f7abcf4b2efbdb1a52e400a742d4017e6b28aa57047c` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:901be41110c9759803c1381ef7d52fe38c65d7ad0c949d0a831016597a4480c3` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:15f24a288cbf0de131137d9d96db7322a1e08fbd1a97bb987d5b63e8589693eb` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:79f3761e05a1511827f8929493f3eb32dce2e1497c6a1a19b31475173631bc7c` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:c08c6baf9c335ea6d9f771efde006ff8577953196a2bab6b9acace0521350189` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:c1e577b132475f4b327b593f0ec0052f8bb6668c7efad0693bfdc79debd96f2c` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:7cd7e52ebfbe66f7b7fedc9100e7803f6823a28488837f408ce98b076987d75b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:db83e0632ac685cfd60b099727ed97d1b50eba1105480d7f1b993df6ec9d690f` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:16d764b15028c1c70d2b1b023f0007ae9082c9673a8f2d606a58b2d5c9cf313e` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:55508dbd27f5ba95979fc6fab19a178eca61a59e0f94f733637dd9696c44d98e` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:150032185705a2b368f8f3bc039e25e2120cc5d96a9f9d8b2bf1c04e21a7faf5` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:28acf365dfd229e7f8eaba7056979f18ca5fa84dbb40450e6471e2886681cf62` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:70876006dc0c82da94e83a2b5faaff421960021e01454778c6c8dbbfb7d0c510` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:5fe88a1337ef9e9926008aebf07e2cd583e281d8cee4d6ae8cd6ad93c4c04c85` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:0a196b14d27f8f17eb9952cf2c568764983f22d2efb6411f42d9e4cb227fda48` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:6a5638b93a2bea9e4945c0be2501e582dcf4cd1b992b178c5e0fb3a8a2d8dd35` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:b900584b997f0166894b2356051ee6b4b06de13353b27dd8656c59afa37b2e97` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:fe8a7e49fa84013cfde14510ca36d1d22746127a30bfa40db3536e34c30ebc85` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:8ab3e39c78bd87bf4c686eb3b3a3cfa9ace4af2b6a0665a2726e455b86c3b5b2` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:0a196b14d27f8f17eb9952cf2c568764983f22d2efb6411f42d9e4cb227fda48` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:64713d43c3cf4ffe06599dd9a3571e5ba55636fd3a2fca591dc507c476edf424` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:8c6a898ee8e19a41a8f8399f98c61b80362ac20513ecd53dae26950fcae6e772` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:315cb30a569a94397fd6984c85d930a14c127b6b9acdf9bf5a8768533f8f9123` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:e47ecbea6d5fe25f3bcb908905403927e553c9c4c01063b58a2a4cf7b5e154ac` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:22639f352c74be4b4f1c33522cbea29687fbe5455521c9aed0d64103a90f5426` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:a3cbf9297ffd5abaf253fc9ab4f7ebcb5f7d21f0ae8077d66292de6c59773528` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:fa555b60298caed9c8dcd5543c878493931e0f61f87fa5fd58e68ebd10099e1a` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:8c6a898ee8e19a41a8f8399f98c61b80362ac20513ecd53dae26950fcae6e772` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:c9fa4ac117adf0cc265730713d751b683155f531f5ed573119d556460b0d84bf` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:f96900f0e7fee9f34ff255f1bd686f4d0332e055bb170604c4da7eaf9ff45130` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:eed61e3878e67c01204bf34a40cb633e7a60a909f1ffc92aaa23f32ebf5302ba` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:e47ecbea6d5fe25f3bcb908905403927e553c9c4c01063b58a2a4cf7b5e154ac` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:f96900f0e7fee9f34ff255f1bd686f4d0332e055bb170604c4da7eaf9ff45130` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:d4809afdb3d306157cde796c9d7b17cab28f2e22c2cdb3755ef2579bf6b5ec98` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:9e17674ef60968c65af2f5e1c75a4d708ef2c603bfb0773362a384feabf93efb` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:f9bb5020368bc879a8463c16f39d410417d782cbad6414fe385e98e19e0a1377` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:9a947a33796d73ef1411053e0bce2b3bf269565e2d203ab6367dc6d1dacfe307` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:a334f0e7a5667f10b9c70831920b1ea755383f680661768745ee7403026d3520` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:8ab3e39c78bd87bf4c686eb3b3a3cfa9ace4af2b6a0665a2726e455b86c3b5b2` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:85b9e0e294968560055014dcd2a989cad5b13bc80500d77d874aa7be4c5ac558` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:9f9acd2e42dd074bee49110bc22c450d0324e5ccb0183e3a2fcbf7cd18f6a6c7` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:7099e3048552085f0e49254ef7289bc9779aed170bdd285f0a741dada43b9da7` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:e94250d47636bfd2849803b0e765656b23dfe35be771fdee5aa556f131f76c35` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:dbb3ac97b571dbc90d9cd8482bf9535a14608b8bfcf2cd196b9facd52ba5453d` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:86fe9486c43f5878a655acd61ec83330ff8197114de70be6b5dfe3e7dff7a918` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:bba36f476eee16207d7ebdd896e4ba21836dcbda21ca4b2b0d68e8d38b7de713` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:12f98ec39b4b52000dd7c1a8cc86eb1deb8ba614dabdb5591dd02b54b8b4cb48` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:620e667076d4e955a26712e5aa2af0e52005f6f52829183d4e45467166a92d39` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:c921d4fc1c2722ebaaa7dee8dd7b44c6db3a8dfc739ab7cf3ffafbe1e5a97d0e` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:7699508f4e5564064848f7abcf4b2efbdb1a52e400a742d4017e6b28aa57047c` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:901be41110c9759803c1381ef7d52fe38c65d7ad0c949d0a831016597a4480c3` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:f96900f0e7fee9f34ff255f1bd686f4d0332e055bb170604c4da7eaf9ff45130` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:18b721ef22d8b28c8016d53dd7a5c1eeeaccb31defb64bb52d116c98c7900d7f` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:64713d43c3cf4ffe06599dd9a3571e5ba55636fd3a2fca591dc507c476edf424` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:c1e577b132475f4b327b593f0ec0052f8bb6668c7efad0693bfdc79debd96f2c` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:7cd7e52ebfbe66f7b7fedc9100e7803f6823a28488837f408ce98b076987d75b` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:db83e0632ac685cfd60b099727ed97d1b50eba1105480d7f1b993df6ec9d690f` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:8be23f5f1875a101ba6de6aa6ef5beaf82b2d5b88eb2ef06f2a6dff714a3e6bf` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:23b6f8e28d86d2ca8211f4d0d20331ac2d83a6bfbd34535d6d05ce4c4b438dc6` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:388141b0ccd287f3285e5d19f91a415510ba9ef4bea782702866ce932b2fc804` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:315cb30a569a94397fd6984c85d930a14c127b6b9acdf9bf5a8768533f8f9123` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:70876006dc0c82da94e83a2b5faaff421960021e01454778c6c8dbbfb7d0c510` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:5fe88a1337ef9e9926008aebf07e2cd583e281d8cee4d6ae8cd6ad93c4c04c85` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:0a196b14d27f8f17eb9952cf2c568764983f22d2efb6411f42d9e4cb227fda48` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:6a5638b93a2bea9e4945c0be2501e582dcf4cd1b992b178c5e0fb3a8a2d8dd35` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:b900584b997f0166894b2356051ee6b4b06de13353b27dd8656c59afa37b2e97` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:776510435091f0967ee9789915ffa96161fc5c4acd85d2a0170659ab8f16eda9` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:7021f326f42f8a44233fe094d79ada504e346a9f58b95f63ae28b60780d5d7a5` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:43d0c993cc81696809f32616c596372a95d41980c77a4477c880fe68f8463739` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:93443b0becdeebae98f5e288352518435faff73ab467b341fad0bd038eceefbc` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:9958392c28c4be80006c2bb33b353601ac820b5b635544a0ecdfb672629535e1` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:2306198592bf1d28b43294d4ffec85fa327250913ccb36fe2e8ba9d90717cdaa` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:93a6ae4d4886dea6ad89f294965b4980be1e971839a80510bf75c669a86f207e` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:07e9dde9b1decdd69ab9f3287b1158f89b3d3badb085d8f55489f6339b296f43` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:c487b54c19633f825bba257c5fbc803c2411cb9826ba760fc721436fc8c1ac99` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:6932e1942b776ff7bd923f3c49a6788f6cdc5806d59e2ad1a29c05c8a2557c5c` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:9958392c28c4be80006c2bb33b353601ac820b5b635544a0ecdfb672629535e1` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:0696f7dd643c13a8e1322ab573c26a7dd4cb0353b5a287d75512114288858055` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:e74ce71b622f8a4351bf789598fb2422993e0f52d8cb57b7ec3857c841f461ec` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:b3abf8523e55d2f94fbefba3701b6fd9208d05961d7f4c91faab971e202dd1ed` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:93a6ae4d4886dea6ad89f294965b4980be1e971839a80510bf75c669a86f207e` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:e74ce71b622f8a4351bf789598fb2422993e0f52d8cb57b7ec3857c841f461ec` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:83761fb262bfe20eb6ae01eb9b14266a7050700a70c0437a0b916c3ae31ce923` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:d32d2d442f872b5e5b4e1822631c6a4e55119476bd366aaa873a85b747c79aac` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:266980ddc09575e6b26a343be37671d921651aee24825537291cd68715853f53` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:f8d7a53bb5f56c87074b7b5e2aefd4e582278b9d737e1ddb647f51dc1c987f00` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:83b1f7096042f13d63d72e42e6188565208bd8e2bcacd74105a5547d9e73c7fd` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:7021f326f42f8a44233fe094d79ada504e346a9f58b95f63ae28b60780d5d7a5` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:c2c97292448cc0e0f3979d510f284cdef3f9d404cbf6b39eb639a6c6c214486d` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:f3ebf01987d5b184b19c7d02d3c196a848fa9b4eef79a99f7063d7b4794f3c27` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:d94851d00d025a78f73546c90077ee7dbbb35ada30b531745a094eea0fb9f5f0` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:d592858705dec7131279c0a523123d86107e9875111420fe703ee9172be6dda2` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:bf3148690787d7fe41f97061bdff0977f410b941b443ccaa4cc27976d18ef101` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:f7cdf9cd6177b5aa71578adffc7a985144bb3cc4343e15c66bd3a508a94643a4` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:cb6b93a204a1b42acc7c426b702bb4d317f4cae5bc4f9c297f66727d3dd795fc` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:bb8674abf94ae1d8ee5d5ed695258555f039326c2a75d3632dfd65271a06b1e1` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:ff9bb2fb885bff4335f776405fb197df7e5a3e1e7addb97b506b3f2060d200c9` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:2b167bf2a71100c16c5218af06210aad08f889af7c2ceeec5aef3a9d0c6bb38e` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:88d8d904ea7059636eddcf4ccc60796e32e48986f64743380167b007b5ac880b` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:a4f468337d7e61619040fbef272fd2dc8d10d046471225b100c1325602722725` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:e74ce71b622f8a4351bf789598fb2422993e0f52d8cb57b7ec3857c841f461ec` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:e51ecbf057c3863e2f20cea5414ee9f6f0783e4e964f671eb01c94968e805015` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:93443b0becdeebae98f5e288352518435faff73ab467b341fad0bd038eceefbc` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:3bfc16906769f2d1c0ed837a29f95a1b94589171a4aa0fed584ce85434742659` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:8e6cb9e1a5f53b05188964fc477ed3dc9cb246a3bfbaa57690cd38ad833b4dcb` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:3a740bd9d90dde77d675e4ceb9193572e55106e36da5b924c833dae789a4165f` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:85562bd4e401bc83d714a4da40234b3b03e6fc34157cb4f2ba4185646febcf6f` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:efd81b850e6fc9ab8ccc34e7eaeeb7ef841fb42dad3e0f77f2b230089d46bdb1` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:2dfd6c09c54b4719180fb251b73354efe495a6801a769f05d53e14b3131e3e80` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:2306198592bf1d28b43294d4ffec85fa327250913ccb36fe2e8ba9d90717cdaa` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:45beb6ee9be4ba5f94fb02b8f61427db470435df7219f2cd7eee33339fc831f3` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:a8d1d9dbc0a777883a2912844cbac4134724460af881f6ad7e1acb23c5989f6b` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:43d0c993cc81696809f32616c596372a95d41980c77a4477c880fe68f8463739` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:02b5cdc5a05c89652a579902133e8333659c9496bbc08a993b828a6a6231d952` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:36694a899abf13937d6ac53314eda61cd859e3d034c0a8b61088f04c9305eb4b` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:81abd3fa3967e44e3b81854da967dd0ff8e8e5b21dfeef19171844014f8c36cf` | `verification-decisions` | `verification-evidence` | `false` |

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
| `inference-synthesis` | `sha256:7021f326f42f8a44233fe094d79ada504e346a9f58b95f63ae28b60780d5d7a5` | `.bitcode/inference-synthesis-proof.json` |
| `prompt-completeness` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `.bitcode/prompt-completeness-proof.json` |
| `static-code-analysis` | `sha256:43d0c993cc81696809f32616c596372a95d41980c77a4477c880fe68f8463739` | `.bitcode/static-measurement-proof.json` |
| `verification-decisions` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `.bitcode/verification-decisions-proof.json` |
| `selection-and-materialization` | `sha256:44178db54efb33b972cd2e6cff2159b7d6c03cfc69901fa81a47ade8ef1b3e9b` | `.bitcode/selection-and-materialization-proof.json` |
| `authorization-and-sensitive-flow` | `sha256:9958392c28c4be80006c2bb33b353601ac820b5b635544a0ecdfb672629535e1` | `.bitcode/authorization-and-sensitive-flow-proof.json` |
| `settlement-source-to-shares` | `sha256:4466a4cfe52159a1abb2323d1198943bb4d07f8429f036cd49a0e410303d681f` | `.bitcode/settlement-source-to-shares-proof.json` |
| `disclosure-boundary` | `sha256:d4ecd4fa6a549fec13e5514cc6960b24afaaf385e312f2c6ae3c2280e5417584` | `.bitcode/disclosure-boundary-proof.json` |
| `proof-contract` | `sha256:07e9dde9b1decdd69ab9f3287b1158f89b3d3badb085d8f55489f6339b296f43` | `.bitcode/proof-contract.json` |

#### Proof Artifact Disclosure Classification

| path | sensitiveDataClass | disclosable | assetPackEvidenceConfidentiality | potentiallyDisclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/identity-authorization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/proof-witness-manifest.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `licensed-source-material` | `false` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `settlement-preview` | `false` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `bounded-public-proof-metadata` | `true` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/system-proof-bundle.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-decisions-proof.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `private-proof-artifact` | `false` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `verification-evidence` | `false` | `verification-evidence` | `false` |

#### Witness Artifact Digest Inventory

| path | digest | proofFamilies | sensitiveDataClass | disclosable |
| --- | --- | --- | --- | --- |
| `.bitcode/accounting-precision-report.json` | `sha256:9c0f5287e2cc4af88889d02d72d1d34a127745dfbfc02c47d59bd55a37478e11` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/asset-pack.lock.json` | `sha256:48c3e0998038adeefcdfc527f72f44b17f8d6aca0ab4b49a04de28b9d5b89d05` | `selection-and-materialization`, `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-and-sensitive-flow-proof.json` | `sha256:9958392c28c4be80006c2bb33b353601ac820b5b635544a0ecdfb672629535e1` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/authorization-decisions.json` | `sha256:0696f7dd643c13a8e1322ab573c26a7dd4cb0353b5a287d75512114288858055` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/bounded-public-proof.json` | `sha256:faa5bed0f9cd0e812aee5a69e3f21ac975f21e29e57eca1200f53636b2d20093` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/code-analysis-fact-registry.json` | `sha256:b3abf8523e55d2f94fbefba3701b6fd9208d05961d7f4c91faab971e202dd1ed` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/disclosure-boundary-proof.json` | `sha256:d4ecd4fa6a549fec13e5514cc6960b24afaaf385e312f2c6ae3c2280e5417584` | `disclosure-boundary` | `private-proof-artifact` | `false` |
| `.bitcode/disclosure-proof.json` | `sha256:faa5bed0f9cd0e812aee5a69e3f21ac975f21e29e57eca1200f53636b2d20093` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/eval-manifest.json` | `sha256:83761fb262bfe20eb6ae01eb9b14266a7050700a70c0437a0b916c3ae31ce923` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/external-boundary-manifest.json` | `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` | `bitcoin-settlement-interface` | `private-proof-artifact` | `false` |
| `.bitcode/identity-authorization-proof.json` | `sha256:d32d2d442f872b5e5b4e1822631c6a4e55119476bd366aaa873a85b747c79aac` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/identity-bindings.json` | `sha256:266980ddc09575e6b26a343be37671d921651aee24825537291cd68715853f53` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/inference-moment-contracts.json` | `sha256:f8d7a53bb5f56c87074b7b5e2aefd4e582278b9d737e1ddb647f51dc1c987f00` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-proofs.json` | `sha256:83b1f7096042f13d63d72e42e6188565208bd8e2bcacd74105a5547d9e73c7fd` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/inference-synthesis-proof.json` | `sha256:7021f326f42f8a44233fe094d79ada504e346a9f58b95f63ae28b60780d5d7a5` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/journal-completeness-proof.json` | `sha256:4b7ef245c2ccfe1cfaeaab022153ec9c9b8f99b617f4bb2a9a1d551db2de5c55` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/journal-diff.json` | `sha256:25862851c298858a3f7cb68e4d49383ffe6d6c03afd4a0d18f9a048ceaf6be9c` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-exclusions.json` | `sha256:b0c51aa9b75ae8f2f042d7d75121acda8a74d3a34fffd3c21bae43059440047a` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/materialization-proof.json` | `sha256:aae1b1470954e15061ea1345cd1d5074e8d598f923ad0ee31bcb188a03e76ec2` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/materialization-visibility-proof.json` | `sha256:bf3148690787d7fe41f97061bdff0977f410b941b443ccaa4cc27976d18ef101` | `selection-and-materialization` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/measurement-receipts.json` | `sha256:f7cdf9cd6177b5aa71578adffc7a985144bb3cc4343e15c66bd3a508a94643a4` | `static-code-analysis` | `private-proof-artifact` | `false` |
| `.bitcode/parsed-completion-envelopes.json` | `sha256:cb6b93a204a1b42acc7c426b702bb4d317f4cae5bc4f9c297f66727d3dd795fc` | `inference-synthesis`, `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/projection-policy.json` | `sha256:bb8674abf94ae1d8ee5d5ed695258555f039326c2a75d3632dfd65271a06b1e1` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-completeness-proof.json` | `sha256:9746305d06e0b55e0d7fe59a9ebddcd8d321d4de6e9c26b067aaa74e4842b018` | `prompt-completeness` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/prompt-contracts.json` | `sha256:ff9bb2fb885bff4335f776405fb197df7e5a3e1e7addb97b506b3f2060d200c9` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-family-registry.json` | `sha256:ab753a9f2a8152aff00bb63282d32a3cd518e38ab37d28372237ea049242cf59` | `prompt-completeness` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-implementation-surface.json` | `sha256:2b167bf2a71100c16c5218af06210aad08f889af7c2ceeec5aef3a9d0c6bb38e` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/prompt-surfaces.json` | `sha256:88d8d904ea7059636eddcf4ccc60796e32e48986f64743380167b007b5ac880b` | `inference-synthesis` | `private-proof-artifact` | `false` |
| `.bitcode/proof-contract.json` | `sha256:a4f468337d7e61619040fbef272fd2dc8d10d046471225b100c1325602722725` | `proof-contract` | `private-proof-artifact` | `false` |
| `.bitcode/redaction-proof.json` | `sha256:faa5bed0f9cd0e812aee5a69e3f21ac975f21e29e57eca1200f53636b2d20093` | `disclosure-boundary` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/selected-source-material.json` | `sha256:1de88ee5d506a61af4e096e89edb43a83742b3f8b69bbac2066d4c7820d027b9` | `selection-and-materialization` | `licensed-source-material` | `false` |
| `.bitcode/selection-and-materialization-proof.json` | `sha256:44178db54efb33b972cd2e6cff2159b7d6c03cfc69901fa81a47ade8ef1b3e9b` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/selection-consistency-proof.json` | `sha256:3bfc16906769f2d1c0ed837a29f95a1b94589171a4aa0fed584ce85434742659` | `selection-and-materialization` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow-proof.json` | `sha256:8e6cb9e1a5f53b05188964fc477ed3dc9cb246a3bfbaa57690cd38ad833b4dcb` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/sensitive-data-flow.json` | `sha256:3a740bd9d90dde77d675e4ceb9193572e55106e36da5b924c833dae789a4165f` | `authorization-and-sensitive-flow` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-participation.json` | `sha256:b23dd79a34d7fb37ff0884e0d475413c5760303d27525501c00069415a280588` | `settlement-source-to-shares` | `settlement-preview` | `false` |
| `.bitcode/settlement-preview.json` | `sha256:9eb2cf7b52c2b6d361738a11524bc6ebd77cf7753b09dae62357b7e0f5f53fab` | `settlement-source-to-shares`, `bitcoin-settlement-interface` | `settlement-preview` | `false` |
| `.bitcode/settlement-proof.json` | `sha256:87236547ec705a50999df710ed9f80e04b14ad67cfacfaee6d96121c4d7a525f` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/settlement-source-to-shares-proof.json` | `sha256:4466a4cfe52159a1abb2323d1198943bb4d07f8429f036cd49a0e410303d681f` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/source-to-shares.json` | `sha256:45beb6ee9be4ba5f94fb02b8f61427db470435df7219f2cd7eee33339fc831f3` | `settlement-source-to-shares` | `private-proof-artifact` | `false` |
| `.bitcode/static-heuristics-registry.json` | `sha256:a8d1d9dbc0a777883a2912844cbac4134724460af881f6ad7e1acb23c5989f6b` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-proof.json` | `sha256:43d0c993cc81696809f32616c596372a95d41980c77a4477c880fe68f8463739` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/static-measurement-report.json` | `sha256:02b5cdc5a05c89652a579902133e8333659c9496bbc08a993b828a6a6231d952` | `static-code-analysis` | `bounded-public-proof-metadata` | `true` |
| `.bitcode/verification-decisions-proof.json` | `sha256:608f4210eb9b498b765f65b1d7a8c67edddf9bc3d5ff1fd6a0c7c3aeb7c5859f` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-receipts.json` | `sha256:36694a899abf13937d6ac53314eda61cd859e3d034c0a8b61088f04c9305eb4b` | `verification-decisions` | `private-proof-artifact` | `false` |
| `.bitcode/verification-report.json` | `sha256:f3395eace4ae0fb8d5e3f344abd7cec4ac60dd57c864be7340ff88d3a2dc3776` | `verification-decisions` | `verification-evidence` | `false` |

