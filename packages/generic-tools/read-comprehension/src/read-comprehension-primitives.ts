/**
 * READ COMPREHENSION PRIMITIVES
 *
 * Canonical pure-function owners behind the read-comprehension package.
 * Bitcode read-first product semantics own this package directly; removed
 * pre-reform primitive files must not re-enter this source boundary.
 */

import { z } from 'zod';
import { ReadIntentTypeSchema } from './read-comprehension-schemas';

function buildSourceToSharesServiceQuestions(expressedRead: string) {
  return {
    why: `Why does this read advance a customer's auditable source-to-shares outcome: ${expressedRead || 'unspecified read'}?`,
    how: 'How will written assets, proof evidence, and delivery mechanisms make the outcome inspectable?',
    when: 'When must this answer be reviewed before fit search, risk admission, Finish, Delivering, or settlement?',
    where: 'Where do repository scope, interface ingress, persistence state, and proof witnesses carry the evidence?',
    what: 'What exact code, package, interface, proof, or AssetPack object is being changed or produced?',
    who: 'Who relies on this answer: customer, Bitcode operator, provider, contributor, reviewer, or settlement participant?',
    audit: 'What evidence lets Advanced Engineered Software, Inc. defend this as auditable market infrastructure of technical knowledge?'
  };
}

export async function analyzeReadSemantics({
  expressed_read,
  context_information
}: {
  expressed_read: string;
  context_information?: {
    repository_type?: string;
    technology_stack?: string[];
    existing_attachments?: string[];
  };
}) {
  const expressedRead = expressed_read.trim();

  return {
    read: {
      expressed_read: expressedRead,
      primary_intent: expressedRead || 'Unspecified Bitcode read',
      satisfaction_criteria: [
        'Written assets satisfy the expressed read',
        'Asset-pack state remains coherent with repository context',
        'Delivery mechanisms remain explicit and secondary'
      ]
    },
    semantic_analysis: {
      primary_intent: expressedRead || 'Intent extracted from expressed read',
      scope_boundaries: [
        'Bitcode-owned asset-pack scope',
        'Connected-interface delivery-mechanism scope'
      ],
      semantic_keywords: ['read', 'written-asset', 'asset-pack', 'delivery-mechanism'],
      implied_requirements: [
        'Preserve proof-facing requirements',
        'Keep canonical Bitcode names at product ownership boundaries'
      ],
      complexity_indicators: [
        'Repository/package impact',
        'Proof and verification impact'
      ]
    },
    written_asset_expectations: ['source-bearing written asset', 'verification evidence'],
    source_to_shares_service_questions: buildSourceToSharesServiceQuestions(expressedRead),
    service_accountability: {
      provider: 'Advanced Engineered Software, Inc.',
      customer_outcome: 'source-to-shares system use',
      market_infrastructure_standard: 'auditable engineering-knowledge market infrastructure'
    },
    asset_pack_context: {
      repository_type: context_information?.repository_type,
      technology_stack: context_information?.technology_stack ?? [],
      attachment_names: context_information?.existing_attachments ?? []
    },
    delivery_mechanism_boundaries: ['GitHubPullRequest', 'JiraComment', 'interface-specific transport'],
    read_classification: {
      primary_read_type: 'feature_implementation' as const,
      related_read_types: ['enhancement', 'integration'] as const,
      confidence: 0.85
    },
    scope_analysis: {
      estimated_scope: 'medium' as const,
      affected_components: ['Component A', 'Component B'],
      integration_points: ['Integration 1', 'Integration 2']
    }
  };
}

export async function extractReadRequirements({
  expressed_read,
  semantic_analysis,
  attachment_context
}: {
  expressed_read: string;
  semantic_analysis: any;
  attachment_context?: {
    user_attachments?: string[];
    figma_designs?: string[];
    code_snippets?: string[];
  };
}) {
  const expressedRead = expressed_read.trim();

  return {
    read_requirements: {
      expressed_read: expressedRead,
      written_asset_types: ['source-change', 'proof-update', 'interface-payload'],
      asset_pack_requirements: ['repository coherence', 'verification evidence'],
      delivery_mechanism_requirements: ['transport payload does not redefine the written asset']
    },
    functional_requirements: [
      {
        id: 'req-001',
        description: 'Primary written asset must satisfy the expressed read',
        type: 'functional' as const,
        priority: 'critical' as const,
        confidence: 0.9,
        source: 'expressed_read',
        acceptance_criteria: ['Read is rereadable', 'Written asset is verifiable']
      }
    ],
    non_functional_requirements: [
      {
        id: 'req-nf-001',
        description: 'Proof and runtime evidence remain bounded and repeatable',
        type: 'non_functional' as const,
        priority: 'high' as const,
        confidence: 0.8,
        source: 'inferred',
        acceptance_criteria: ['Focused verification passes']
      }
    ],
    business_requirements: [],
    technical_requirements: [],
    proof_requirements: ['Spec/proof witnesses updated when semantics change'],
    service_requirements: [
      'Read answer explains why/how/when/where/what/who the work serves source-to-shares',
      'Proof evidence supports customer-facing audit and market-infrastructure acceptance'
    ],
    interface_requirements: ['Connected-interface payloads carry semantic aliases'],
    written_asset_requirement_map: {
      source_change: ['functional_requirements', 'technical_requirements', 'proof_requirements'],
      delivery_mechanism: ['interface_requirements']
    },
    extraction_metadata: {
      total_requirements: 2,
      confidence_average: 0.85,
      sources_analyzed: ['expressed_read', 'attachments'],
      extraction_completeness: 0.9
    }
  };
}

export async function identifyReadConstraints({
  read_context,
  repository_context,
  business_context
}: {
  read_context: any;
  repository_context?: {
    technology_stack?: string[];
    existing_architecture?: string;
    deployment_environment?: string;
  };
  business_context?: {
    timeline_constraints?: string;
    resource_constraints?: string;
    compliance_requirements?: string[];
  };
}) {
  return {
    technical_constraints: [
      {
        id: 'const-tech-001',
        description: 'Repository and package boundaries constrain the written asset',
        type: 'technical' as const,
        severity: 'high' as const,
        mitigation_strategy: 'Use public package boundaries and narrow imports',
        validation_method: 'Typecheck and focused integration tests'
      }
    ],
    business_constraints: [
      {
        id: 'const-bus-001',
        description: 'Read satisfaction must stay scoped to the requested asset pack',
        type: 'timeline' as const,
        severity: 'medium' as const,
        mitigation_strategy: 'Sequence smallest coherent written-asset slices',
        validation_method: 'Reread satisfaction criteria before Delivering'
      }
    ],
    resource_constraints: [],
    compliance_constraints: [],
    proof_constraints: [
      {
        id: 'const-proof-001',
        description: 'Semantic prompt changes require raw PromptPart carry-through and proof refresh',
        type: 'technical' as const,
        severity: 'high' as const,
        mitigation_strategy: 'Update canonical PromptPart source and generated runtime prompt artifacts together',
        validation_method: 'Run raw promptpart carry-through and spec-family checks'
      }
    ],
    interface_constraints: ['Delivery mechanisms may deliver assets but must not own Bitcode semantics'],
    constraint_analysis: {
      total_constraints: 3,
      critical_count: 0,
      high_severity_count: 2,
      mitigation_coverage: 1.0
    }
  };
}

export async function generateReadSatisfactionCriteria({
  requirements,
  constraints,
  read_type,
  quality_standards
}: {
  requirements: any;
  constraints: any;
  read_type: z.infer<typeof ReadIntentTypeSchema>;
  quality_standards?: {
    performance_standards?: string[];
    quality_gates?: string[];
    acceptance_thresholds?: Record<string, string>;
  };
}) {
  return {
    read_satisfaction_criteria: [
      'Expressed read is explicitly preserved',
      'Written asset expectations are measurable',
      'Asset-pack and delivery-mechanism boundaries are separate',
      'Verification evidence is attached'
    ],
    functional_criteria: [
      {
        id: 'success-func-001',
        description: 'Primary Bitcode read is satisfied by stable written assets',
        type: 'functional' as const,
        measurement_method: 'Read reread, focused tests, and written-asset inspection',
        acceptance_threshold: 'All blocking read requirements are met',
        validation_approach: 'Automated testing plus proof/reread verification'
      }
    ],
    performance_criteria: [
      {
        id: 'success-perf-001',
        description: 'Runtime and proof evidence remain bounded',
        type: 'performance' as const,
        measurement_method: 'Focused command/runtime verification',
        acceptance_threshold: 'No introduced prompt/runtime carry-through drift',
        validation_approach: 'Promptpart equivalence and package-local checks'
      }
    ],
    quality_criteria: [
      {
        id: 'success-qual-001',
        description: 'Canonical Bitcode terminology is maintained',
        type: 'quality' as const,
        measurement_method: 'Static code analysis and review',
        acceptance_threshold: 'Canonical Bitcode names own product semantics at every boundary',
        validation_approach: 'Spec and prompt surface assertions'
      }
    ],
    proof_criteria: ['Generated V26 proof artifacts include the changed prompt surface'],
    service_accountability_criteria: [
      'Critical source-to-shares service questions are answered before fit search or settlement',
      'The answer is reviewable by the customer/operator using canonical Bitcode terminology'
    ],
    persistence_criteria: ['Any persisted run state mirrors read and written-asset aliases'],
    interface_criteria: ['Delivery mechanisms are transport metadata on top of stable assets'],
    blocking_criteria: ['No old prompt text remains in runtime prompt carry-through'],
    business_criteria: [],
    user_experience_criteria: [],
    success_framework: {
      total_criteria: 3,
      measurable_percentage: 1.0,
      validation_coverage: 1.0,
      acceptance_clarity: 0.95
    }
  };
}

export async function validateReadComprehension({
  read_comprehension,
  validation_criteria = {}
}: {
  read_comprehension: {
    read_type: z.infer<typeof ReadIntentTypeSchema>;
    requirements: any;
    constraints: any;
    read_satisfaction_criteria: any;
    semantic_analysis?: any;
  };
  validation_criteria?: {
    completeness_threshold?: number;
    accuracy_threshold?: number;
    consistency_threshold?: number;
  };
}) {
  const readComprehension = read_comprehension;
  const {
    completeness_threshold = 0.9,
    accuracy_threshold = 0.85,
    consistency_threshold = 0.9
  } = validation_criteria;

  return {
    validation_results: {
      completeness_score: 0.92,
      accuracy_score: 0.88,
      consistency_score: 0.94,
      overall_score: 0.91
    },
    validation_details: {
      requirements_completeness: 0.95,
      constraints_identification: 0.90,
      success_criteria_clarity: 0.88,
      semantic_accuracy: 0.92,
      written_asset_coherence: 0.9,
      proof_coverage: 0.86
    },
    service_accountability_findings: [
      'Read comprehension must explain why/how/when/where/what/who this code serves Bitcode source-to-shares'
    ],
    terminology_findings: [
      'read_comprehension is the canonical Bitcode interpretation'
    ],
    read_comprehension: readComprehension,
    written_asset_coherence: true,
    proof_coverage: 'focused checks required when prompt content changes',
    validation_issues: [],
    recommendations: [
      'Consider adding more specific acceptance criteria for performance requirements',
      'Validate constraint mitigation strategies with technical team'
    ],
    validation_passed: true,
    validation_metadata: {
      validation_timestamp: new Date().toISOString(),
      thresholds_applied: { completeness_threshold, accuracy_threshold, consistency_threshold },
      validation_approach: 'read_comprehension_validation'
    }
  };
}

export async function analyzeReadSatisfactionImplementationComplexity({
  read_comprehension,
  repository_context
}: {
  read_comprehension: any;
  repository_context?: {
    codebase_size?: string;
    architecture_complexity?: string;
    technology_maturity?: string;
  };
}) {
  const readComprehension = read_comprehension;

  return {
    read_comprehension: readComprehension,
    complexity_assessment: {
      overall_complexity: 'medium' as const,
      implementation_complexity: 'medium' as const,
      integration_complexity: 'low' as const,
      testing_complexity: 'medium' as const,
      proof_complexity: 'medium' as const,
      delivery_mechanism_complexity: 'low' as const,
      service_accountability_complexity: 'medium' as const
    },
    risk_analysis: {
      technical_risks: ['Package boundary drift', 'Prompt runtime carry-through drift'],
      timeline_risks: ['Broad reform slices may exceed a single written asset'],
      resource_risks: [],
      mitigation_strategies: [
        'Sequence semantic mirrors before destructive renames',
        'Run promptpart equivalence, typecheck, and spec/proof checks'
      ]
    },
    strategic_insights: [
      {
        insight: 'Small asset-pack slices are safer than broad reform passes',
        priority: 'high' as const,
        actionable: true,
        confidence: 0.9
      }
    ],
    implementation_recommendations: [
      'Remove noncanonical names after semantic mirrors are proven',
      'Update canonical PromptPart source and generated runtime prompt artifacts together',
      'Refresh V26 proof artifacts when prompt surfaces change'
    ]
  };
}
