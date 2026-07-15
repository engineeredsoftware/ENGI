import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * Document Summarization Agent - Core Mission Statement
 * domain: agent
 * intent: "Define Document Summarization agent purpose"
 * current_version: "V26.50.0"
 * versions: ["V26.00.0", "V26.00.0"]
 * benchmarks: [
 *   { "name": "processing_clarity", "test": "Does it clearly define information processing capabilities? Rate 0-1", "score": 0.93 },
 *   { "name": "synthesis_precision", "test": "Does it specify synthesis methods? Rate 0-1", "score": 0.90 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_DIGESTER_PURPOSE_CORESTATEMENT: PromptPart = 
  'Execute extractive and abstractive document summarization using transformer-based NLP models, generating concise summaries with factual accuracy ≥0.85, processing throughput ≥1000 .docs/hour, supporting multi-format input (PDF/DOCX/TXT/HTML) with structured JSON output containing key entities, sentiment scores, and topic classifications' as PromptPart;