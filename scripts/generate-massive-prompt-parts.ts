/**
 * Bitcode PromptPart generator.
 * Generates atomic PromptParts into the active raw_promptparts filesystem.
 */

import * as fs from 'fs';
import * as path from 'path';

interface PromptCategory {
  name: string;
  parts: Array<{
    suffix: string;
    description: string;
    content: string;
    priority?: 'ultra_critical' | 'critical' | 'high' | 'medium' | 'low';
  }>;
}

const genericCategories: PromptCategory[] = [
  {
    name: 'reasoning',
    parts: [
      {
        suffix: 'analytical_thinking',
        description: 'Analytical thinking approach',
        content: 'ANALYTICAL THINKING:\nBreak down complex problems systematically.\nIdentify patterns and relationships.\nDraw logical conclusions from evidence.'
      },
      {
        suffix: 'creative_reasoning',
        description: 'Creative reasoning patterns',
        content: 'CREATIVE REASONING:\nExplore unconventional solutions.\nConnect disparate concepts.\nChallenge assumptions boldly.'
      },
      {
        suffix: 'critical_evaluation',
        description: 'Critical evaluation framework',
        content: 'CRITICAL EVALUATION:\nQuestion every assumption.\nSeek contradictory evidence.\nValidate through multiple lenses.'
      },
      {
        suffix: 'systems_thinking',
        description: 'Systems thinking approach',
        content: 'SYSTEMS THINKING:\nUnderstand interconnections.\nIdentify feedback loops.\nConsider emergent properties.'
      },
      {
        suffix: 'probabilistic_reasoning',
        description: 'Probabilistic reasoning',
        content: 'PROBABILISTIC REASONING:\nQuantify uncertainty.\nConsider multiple scenarios.\nUpdate beliefs with evidence.'
      }
    ]
  },
  {
    name: 'communication',
    parts: [
      {
        suffix: 'clarity_first',
        description: 'Clarity in communication',
        content: 'CLARITY FIRST:\nUse simple, precise language.\nAvoid jargon unless necessary.\nStructure thoughts logically.'
      },
      {
        suffix: 'empathetic_tone',
        description: 'Empathetic communication',
        content: 'EMPATHETIC COMMUNICATION:\nUnderstand the audience perspective.\nAcknowledge concerns genuinely.\nRespond with compassion.'
      },
      {
        suffix: 'technical_precision',
        description: 'Technical communication precision',
        content: 'TECHNICAL PRECISION:\nUse exact terminology.\nProvide specific examples.\nInclude relevant details.'
      },
      {
        suffix: 'concise_expression',
        description: 'Concise expression',
        content: 'CONCISE EXPRESSION:\nEliminate redundancy.\nGet to the point quickly.\nRespect reader time.'
      }
    ]
  },
  {
    name: 'validation',
    parts: [
      {
        suffix: 'input_validation',
        description: 'Input validation strategies',
        content: 'INPUT VALIDATION:\nVerify data types and formats.\nCheck boundary conditions.\nSanitize user inputs.',
        priority: 'critical'
      },
      {
        suffix: 'output_verification',
        description: 'Output verification methods',
        content: 'OUTPUT VERIFICATION:\nConfirm expected structure.\nValidate business logic.\nCheck for completeness.'
      },
      {
        suffix: 'consistency_checking',
        description: 'Consistency checking',
        content: 'CONSISTENCY CHECKING:\nCross-reference related data.\nVerify invariants hold.\nDetect contradictions.'
      },
      {
        suffix: 'regression_prevention',
        description: 'Regression prevention',
        content: 'REGRESSION PREVENTION:\nMaintain observed behavior.\nTest edge cases thoroughly.\nDocument changes clearly.'
      }
    ]
  },
  {
    name: 'optimization',
    parts: [
      {
        suffix: 'time_complexity',
        description: 'Time complexity optimization',
        content: 'TIME COMPLEXITY:\nAnalyze algorithmic efficiency.\nIdentify bottlenecks.\nOptimize critical paths.',
        priority: 'high'
      },
      {
        suffix: 'space_efficiency',
        description: 'Space efficiency',
        content: 'SPACE EFFICIENCY:\nMinimize memory usage.\nReuse data structures.\nImplement efficient caching.'
      },
      {
        suffix: 'network_optimization',
        description: 'Network optimization',
        content: 'NETWORK OPTIMIZATION:\nReduce request count.\nMinimize payload size.\nImplement caching strategies.'
      },
      {
        suffix: 'database_performance',
        description: 'Database performance',
        content: 'DATABASE PERFORMANCE:\nOptimize query structure.\nUse appropriate indexes.\nMinimize round trips.'
      }
    ]
  },
  {
    name: 'patterns',
    parts: [
      {
        suffix: 'design_patterns',
        description: 'Software design patterns',
        content: 'DESIGN PATTERNS:\nApply proven solutions.\nRecognize pattern contexts.\nAvoid over-engineering.'
      },
      {
        suffix: 'anti_patterns',
        description: 'Anti-pattern recognition',
        content: 'ANTI-PATTERNS:\nIdentify code smells.\nRecognize architectural flaws.\nRefactor systematically.'
      },
      {
        suffix: 'functional_patterns',
        description: 'Functional programming patterns',
        content: 'FUNCTIONAL PATTERNS:\nFavor immutability.\nCompose pure functions.\nHandle side effects explicitly.'
      },
      {
        suffix: 'concurrent_patterns',
        description: 'Concurrency patterns',
        content: 'CONCURRENT PATTERNS:\nManage shared state carefully.\nPrevent race conditions.\nDesign for parallelism.'
      }
    ]
  },
  {
    name: 'debugging',
    parts: [
      {
        suffix: 'systematic_debugging',
        description: 'Systematic debugging approach',
        content: 'SYSTEMATIC DEBUGGING:\nReproduce consistently.\nIsolate variables.\nTest hypotheses methodically.'
      },
      {
        suffix: 'logging_strategy',
        description: 'Strategic logging',
        content: 'LOGGING STRATEGY:\nLog at appropriate levels.\nInclude context information.\nStructure for searchability.'
      },
      {
        suffix: 'error_diagnosis',
        description: 'Error diagnosis techniques',
        content: 'ERROR DIAGNOSIS:\nRead stack traces carefully.\nIdentify root causes.\nDocument findings.'
      },
      {
        suffix: 'performance_profiling',
        description: 'Performance profiling',
        content: 'PERFORMANCE PROFILING:\nMeasure before optimizing.\nIdentify hot paths.\nValidate improvements.'
      }
    ]
  },
  {
    name: 'learning',
    parts: [
      {
        suffix: 'continuous_improvement',
        description: 'Continuous improvement mindset',
        content: 'CONTINUOUS IMPROVEMENT:\nLearn from every experience.\nSeek feedback actively.\nIterate relentlessly.'
      },
      {
        suffix: 'knowledge_synthesis',
        description: 'Knowledge synthesis',
        content: 'KNOWLEDGE SYNTHESIS:\nConnect new to existing knowledge.\nBuild mental models.\nShare insights generously.'
      },
      {
        suffix: 'skill_development',
        description: 'Skill development approach',
        content: 'SKILL DEVELOPMENT:\nPractice deliberately.\nSeek challenging problems.\nReflect on progress.'
      },
      {
        suffix: 'learning_from_failure',
        description: 'Learning from failures',
        content: 'LEARNING FROM FAILURE:\nAnalyze without blame.\nExtract lessons systematically.\nPrevent future occurrences.'
      }
    ]
  },
  {
    name: 'planning',
    parts: [
      {
        suffix: 'strategic_planning',
        description: 'Strategic planning approach',
        content: 'STRATEGIC PLANNING:\nDefine clear objectives.\nIdentify key milestones.\nAllocate resources wisely.'
      },
      {
        suffix: 'risk_assessment',
        description: 'Risk assessment framework',
        content: 'RISK ASSESSMENT:\nIdentify potential risks.\nEvaluate impact and likelihood.\nDevelop mitigation strategies.'
      },
      {
        suffix: 'contingency_planning',
        description: 'Contingency planning',
        content: 'CONTINGENCY PLANNING:\nPrepare for failures.\nDefine fallback options.\nDocument recovery procedures.'
      },
      {
        suffix: 'iterative_planning',
        description: 'Iterative planning approach',
        content: 'ITERATIVE PLANNING:\nStart with MVP.\nGather feedback early.\nAdapt based on learning.'
      }
    ]
  },
  {
    name: 'automation',
    parts: [
      {
        suffix: 'automation_strategy',
        description: 'Automation strategy',
        content: 'AUTOMATION STRATEGY:\nAutomate repetitive tasks.\nMaintain human oversight.\nDocument automation logic.'
      },
      {
        suffix: 'testing_automation',
        description: 'Test automation principles',
        content: 'TESTING AUTOMATION:\nAutomate regression tests.\nMaintain test stability.\nBalance coverage with speed.'
      },
      {
        suffix: 'deployment_automation',
        description: 'Deployment automation',
        content: 'DEPLOYMENT AUTOMATION:\nAutomate build processes.\nImplement rollback capability.\nMonitor deployment health.'
      },
      {
        suffix: 'workflow_automation',
        description: 'Workflow automation',
        content: 'WORKFLOW AUTOMATION:\nStreamline processes.\nEliminate manual handoffs.\nTrack automation metrics.'
      }
    ]
  },
  {
    name: 'monitoring',
    parts: [
      {
        suffix: 'observability_principles',
        description: 'Observability principles',
        content: 'OBSERVABILITY PRINCIPLES:\nInstrument comprehensively.\nCorrelate across systems.\nAlert on anomalies.',
        priority: 'high'
      },
      {
        suffix: 'metrics_collection',
        description: 'Metrics collection strategy',
        content: 'METRICS COLLECTION:\nMeasure what matters.\nAvoid metric overload.\nVisualize effectively.'
      },
      {
        suffix: 'alerting_strategy',
        description: 'Alerting strategy',
        content: 'ALERTING STRATEGY:\nAlert on symptoms, not causes.\nProvide actionable information.\nAvoid alert fatigue.'
      },
      {
        suffix: 'incident_response',
        description: 'Incident response framework',
        content: 'INCIDENT RESPONSE:\nDefine clear procedures.\nCommunicate status updates.\nConduct thorough postmortems.'
      }
    ]
  }
];

const assetPackCategories: PromptCategory[] = [
  {
    name: 'read_comprehension',
    parts: [
      {
        suffix: 'read_semantics',
        description: 'Read semantics for AssetPack runs',
        content: 'READ SEMANTICS:\nPreserve the expressed read exactly.\nSeparate read facts from implementation guesses.\nRecord assumptions as evidence for Finish reread.',
        priority: 'high'
      },
      {
        suffix: 'satisfaction_criteria',
        description: 'Read-satisfaction criteria',
        content: 'READ-SATISFACTION CRITERIA:\nState measurable acceptance criteria.\nTie each criterion to source evidence.\nKeep delivery-mechanism preferences subordinate to read satisfaction.'
      },
      {
        suffix: 'delivery_boundary',
        description: 'Delivery-mechanism boundary',
        content: 'DELIVERY-MECHANISM BOUNDARY:\nTreat GitHub pull requests as V26 delivery mechanisms.\nDo not branch into issues, comments, reviews, or uploads.\nKeep stored AssetPack evidence primary.'
      }
    ]
  },
  {
    name: 'asset_pack_synthesis',
    parts: [
      {
        suffix: 'synthesis_plan',
        description: 'AssetPack synthesis plan',
        content: 'ASSETPACK SYNTHESIS PLAN:\nDerive implementation work from the expressed read.\nPreserve written-asset intent.\nName source files, proof hooks, and verification commands before mutation.',
        priority: 'high'
      },
      {
        suffix: 'written_asset_integrity',
        description: 'Written-asset integrity',
        content: 'WRITTEN-ASSET INTEGRITY:\nKeep generated changes coherent as AssetPack synthesis artifacts.\nVerify changed files against read-satisfaction criteria.\nAvoid support aliases once canonical Bitcode names exist.'
      },
      {
        suffix: 'proof_evidence',
        description: 'Proof evidence capture',
        content: 'PROOF EVIDENCE:\nCapture tests, typechecks, scans, and source references.\nBind evidence to the AssetPack run.\nPreserve failures honestly for Finish completion.'
      }
    ]
  },
  {
    name: 'finish_evidence',
    parts: [
      {
        suffix: 'stored_asset_pack_evidence',
        description: 'Stored AssetPack evidence',
        content: 'STORED ASSETPACK EVIDENCE:\nSummarize synthesized artifacts, proof commands, and repository state.\nStore evidence for Exchange and product reread.\nDo not emit non-Bitcode output mirrors.',
        priority: 'high'
      },
      {
        suffix: 'asset_pack_completion',
        description: 'AssetPack completion payload',
        content: 'ASSETPACK COMPLETION:\nCarry summary, assetPackSynthesisArtifacts, writtenAssets, shippables, deliveryMechanism, read, writtenAssetType, and repoSnapshot.\nReplace pre-V26 final-summary semantics completely.'
      },
      {
        suffix: 'terminal_reread',
        description: 'product reread evidence',
        content: 'TERMINAL REREAD:\nPrefer assetPackSynthesisArtifacts, then semantic writtenAssets, then Shippables.\nExpose proof evidence without non-Bitcode output taxonomy.\nKeep payload fields Bitcode-native.'
      }
    ]
  },
  {
    name: 'pull_request_delivery',
    parts: [
      {
        suffix: 'pr_shippable',
        description: 'GitHub pull-request Shippable',
        content: 'PULL-REQUEST SHIPPABLE:\nCreate one GitHub pull request delivery mechanism from validated AssetPack evidence.\nLink summary and proof evidence.\nKeep the PR subordinate to the AssetPack completion.',
        priority: 'high'
      },
      {
        suffix: 'delivery_metadata',
        description: 'Delivery metadata',
        content: 'DELIVERY METADATA:\nRecord pullRequestUrl, branch, repository, and proof context.\nDo not invent review, issue, comment, Jira, or upload branches in V26.\nPreserve delivery mechanism boundaries.'
      },
      {
        suffix: 'delivery_review_context',
        description: 'Delivery review context',
        content: 'DELIVERY REVIEW CONTEXT:\nPrepare concise reviewer context from stored AssetPack evidence.\nName validation commands and known residual risks.\nAvoid broad release or deployment ceremony language.'
      }
    ]
  }
];

// Function to generate all prompt parts
function generateAllPromptParts() {
  const genericDir = path.join(__dirname, '../packages/prompts/src/raw_promptparts/generic');
  const specificDir = path.join(__dirname, '../packages/prompts/src/raw_promptparts/specific');
  
  let genericCount = 0;
  let specificCount = 0;
  
  // Generate generic prompt parts
  genericCategories.forEach(category => {
    category.parts.forEach(part => {
      const filename = `promptpart_generic_${category.name}_${part.suffix}`;
      const exportName = filename.toUpperCase();
      const priority = part.priority || 'medium';
      
      const content = `/**
 * @doc-comment-promptpartdoc
 * name: "${category.name}_${part.suffix}"
 * category: "${category.name}"
 * description: "${part.description}"
 * usage: "Generic ${category.name} guidance"
 * priority: "${priority}"
 * version: "1.0.0"
 */

import { PromptPart } from '../../parts/PromptPart';

export const ${exportName}: PromptPart = \`${part.content}\` as PromptPart;`;
      
      fs.writeFileSync(path.join(genericDir, `${filename}.ts`), content);
      genericCount++;
    });
  });
  
  // Generate Bitcode AssetPack specific prompt parts.
  assetPackCategories.forEach(category => {
    category.parts.forEach(part => {
      const filename = `promptpart_specific_assetpack_${category.name}_${part.suffix}`;
      const exportName = filename.toUpperCase();
      const priority = part.priority || 'high';
      
      const content = `/**
 * @doc-comment-promptpartdoc
 * name: "assetpack_${category.name}_${part.suffix}"
 * category: "assetpack_${category.name}"
 * description: "${part.description}"
 * usage: "Bitcode AssetPack ${category.name} guidance for read-satisfaction, stored evidence, and PR Shippables"
 * priority: "${priority}"
 * version: "1.0.0"
 */

import { PromptPart } from '../../parts/PromptPart';

export const ${exportName}: PromptPart = \`${part.content}\` as PromptPart;`;
      
      fs.writeFileSync(path.join(specificDir, `${filename}.ts`), content);
      specificCount++;
    });
  });
  
  console.log(`Generated ${genericCount} generic prompt parts across ${genericCategories.length} categories`);
  console.log(`Generated ${specificCount} AssetPack prompt parts across ${assetPackCategories.length} categories`);
  console.log(`TOTAL PROMPT PARTS GENERATED: ${genericCount + specificCount}`);
}

// Run the generator
generateAllPromptParts();
