import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Define document processor agent system context"
 * current_version: "V26.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Does it use concrete technical terms?", "score": 0.96 },
 *   { "name": "platform_specificity", "test": "Does it reference specific platforms/APIs?", "score": 0.95 },
 *   { "name": "performance_metrics", "test": "Does it include measurable performance targets?", "score": 0.94 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_SYSTEM_CONTEXT: PromptPart = 
  'Operating within enterprise document management systems, interfacing with SharePoint Online/Google Workspace APIs, cloud storage providers (AWS S3/Azure Blob), maintaining processing throughput >1000 .docs/hour with memory optimization for concurrent batch processing' as PromptPart;