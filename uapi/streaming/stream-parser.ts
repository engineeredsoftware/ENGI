import type { ParsedStreamData } from '../types/stream';

/**
 * Collapse a (possibly multi-line) telemetry message to a single line so one
 * pipeline event renders as exactly one accordion row. The accumulated stream
 * `text` is newline-delimited (one line per event); embedded newlines in a
 * generation/tool payload would otherwise fragment a single event into many
 * rows. The full payload remains available in the event's executionState/details
 * for the expandable content.
 */
function toSingleLine(value: unknown): string {
  return String(value ?? '').replace(/\s*\r?\n\s*/g, ' ').trim();
}

/**
 * Build the `[phase → agent → step → failsafe → generation]` execution tag,
 * null-guarded: only the populated layers appear (no literal "undefined" when a
 * pipeline emits partial executionState). Returns a trailing-spaced tag or ''.
 */
function formatExecutionTag(ctx: any): string {
  if (!ctx) return '';
  const parts = [ctx.phase, ctx.agent, ctx.step, ctx.failsafe, ctx.generation]
    .map((part) => (part == null ? '' : String(part).trim()))
    .filter(Boolean);
  return parts.length ? `[${parts.join(' → ')}] ` : '';
}

function pickCanonicalProcessingStats(processingStats: any) {
  if (!processingStats || typeof processingStats !== 'object') {
    return processingStats;
  }

  const canonicalStats: Record<string, unknown> = {};
  if (typeof processingStats.time === 'string') {
    canonicalStats.time = processingStats.time;
  }
  if (processingStats.tokens && typeof processingStats.tokens === 'object') {
    canonicalStats.tokens = processingStats.tokens;
  }
  if (typeof processingStats.measuredBtd === 'number') {
    canonicalStats.measuredBtd = processingStats.measuredBtd;
  }
  if (typeof processingStats.btdSemantics === 'string') {
    canonicalStats.btdSemantics = processingStats.btdSemantics;
  }
  if (typeof processingStats.feeAsset === 'string') {
    canonicalStats.feeAsset = processingStats.feeAsset;
  }
  if (typeof processingStats.btcFeesPaid === 'number') {
    canonicalStats.btcFeesPaid = processingStats.btcFeesPaid;
  }
  if (typeof processingStats.btcFeeUsdEquivalent === 'number') {
    canonicalStats.btcFeeUsdEquivalent = processingStats.btcFeeUsdEquivalent;
  }
  if (typeof processingStats.averageLatencyMs === 'number') {
    canonicalStats.averageLatencyMs = processingStats.averageLatencyMs;
  }
  if (Array.isArray(processingStats.modelUsage)) {
    canonicalStats.modelUsage = processingStats.modelUsage;
  }

  return canonicalStats;
}

function normalizeAssetPackSurface(surface: any, fileChanges?: any, summary?: string | null) {
  if (!surface && !fileChanges && !summary) {
    return null;
  }

  const normalized: Record<string, unknown> = {
    pullRequest: surface?.pullRequest || null,
    fileChanges: surface?.fileChanges || fileChanges || null,
    summary: surface?.summary || summary || null,
  };

  if (Array.isArray(surface?.proofEvidence)) {
    normalized.proofEvidence = surface.proofEvidence;
  }
  if (Array.isArray(surface?.reviewNotes)) {
    normalized.reviewNotes = surface.reviewNotes;
  }

  return normalized;
}

function normalizeAssetPackEvidenceSurface(surface: any, fileChanges?: any, summary?: string | null) {
  const normalized = normalizeAssetPackSurface(surface, fileChanges, summary);
  if (!normalized) return null;

  const hasEvidence =
    normalized.fileChanges ||
    normalized.summary ||
    (Array.isArray(normalized.proofEvidence) && normalized.proofEvidence.length > 0) ||
    (Array.isArray(normalized.reviewNotes) && normalized.reviewNotes.length > 0);

  if (!hasEvidence) return null;

  return {
    ...normalized,
    pullRequest: null,
  };
}

function normalizeAssetPackDeliverySurface(surface: any, summary?: string | null) {
  const normalized = normalizeAssetPackSurface(surface, null, summary);
  if (!normalized) return null;
  if (!normalized.pullRequest && !normalized.summary) return null;

  return {
    pullRequest: normalized.pullRequest,
    fileChanges: null,
    summary: normalized.summary,
  };
}

function normalizePullRequestShippableSurface(surface: any, summary?: string | null) {
  const deliverySurface = normalizeAssetPackDeliverySurface(surface, summary);
  if (!deliverySurface?.pullRequest) return null;
  return deliverySurface;
}

function pickCanonicalCompletionResult(result: any) {
  if (!result || typeof result !== 'object') {
    return {};
  }

  const canonical: Record<string, unknown> = {};
  const canonicalKeys = [
    'assetPackSynthesisArtifacts',
    'writtenAssets',
    'deliveryMechanism',
    'shippables',
    'actions',
    'summary',
    'message',
    'semanticKind',
    'read',
    'writtenAssetType',
    'assetPack',
    'duration',
    'taskType',
    'processingStats',
    'repoSnapshot',
  ] as const;

  for (const key of canonicalKeys) {
    if (key in result) {
      canonical[key] = result[key];
    }
  }

  return canonical;
}

export const parseStreamChunk = (chunk: string): ParsedStreamData => {

  const parsedData: ParsedStreamData = {
    text: '',
    status: null,
    error: null,
    completion: null,
    statusMessages: [],
    runId: null
  };

  // Guard
  if (!chunk || typeof chunk !== 'string') {
    console.warn('[Client] Invalid chunk received:', chunk);
    return parsedData;
  }

  // Split by lines
  const lines = chunk
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('data: '))
    .map(line => line.substring(6));

  if (lines.length === 0) return parsedData;

  for (const line of lines) {
    try {
      // Attempt JSON parse
      const data = JSON.parse(line);
      if (!data) continue;

      // Extract runId if present at any level
      if (data.runId) {
        parsedData.runId = data.runId;
      }
      if (typeof data.guide === 'string') {
        parsedData.guide = data.guide;
      }
      
      switch (data.type) {
        // Handle status events (e.g., initialization, progress updates)
        case 'status': {
          // Populate status field for client-side handling
          parsedData.status = {
            step: data.step,
            progress: data.progress,
            message: data.message,
            detail: data.detail,
            executionState: data.executionState
          };
          // Record raw status message for potential UI display
          parsedData.statusMessages.push({
            message: data.message || '',
            detail: data.detail,
            timestamp: data.timestamp,
            correlationId: data.correlationId,
            metadata: data.metadata,
            step: data.step,
            progress: data.progress,
            executionState: data.executionState
          });
          break;
        }
        case 'generation': {
          // Generation log: show LLM invocation and context
          const ctx = data.executionState;
          const tag = formatExecutionTag(ctx);
          parsedData.text += `🤖 Generation: ${tag}${toSingleLine(data.message)}${data.detail ? ` (${toSingleLine(data.detail)})` : ''}\n`;
          parsedData.type = 'generation';
          parsedData.executionState = ctx;
          if (data.metadata) (parsedData as any).metadata = data.metadata;
          break;
        }
        case 'tool-use': {
          // Tool usage log: show tool name and context
          const ctx = data.executionState;
          const tag = formatExecutionTag(ctx);
          const toolName = data.metadata?.toolName || 'tool';
          parsedData.text += `🛠 Tool Use: ${tag}${toolName}${data.detail ? ` (${toSingleLine(data.detail)})` : ''}\n`;
          parsedData.type = 'tool-use';
          parsedData.executionState = ctx;
          if (data.metadata) (parsedData as any).metadata = data.metadata;
          break;
        }
        case 'thinking': {
          // Agent thinking log: show reasoning/thought and context
          const ctx = data.executionState;
          const tag = formatExecutionTag(ctx);
          parsedData.text += `💭 Thinking: ${tag}${toSingleLine(data.message)}${data.detail ? ` (${toSingleLine(data.detail)})` : ''}\n`;
          parsedData.type = 'thinking';
          parsedData.executionState = ctx;
          if (data.metadata) (parsedData as any).metadata = data.metadata;
          break;
        }
        case 'error': {
          const errorMsg = data.message || data.error || 'An unknown error occurred';
          parsedData.error = errorMsg;
          parsedData.text += `❌ Error: ${errorMsg}\n`;
          break;
        }
        case 'completion': {
          if (data.result) {
            const canonicalResult = pickCanonicalCompletionResult(data.result);
            const topLevelFileChanges = data.fileChanges || null;
            const explicitAssetPackSynthesisArtifacts = normalizeAssetPackSurface(data.result.assetPackSynthesisArtifacts);
            const explicitWrittenAssets = normalizeAssetPackSurface(data.result.writtenAssets);
            const explicitDeliveryMechanism = normalizeAssetPackSurface(data.result.deliveryMechanism);
            const explicitShippables = normalizeAssetPackSurface(data.result.shippables) || explicitDeliveryMechanism;
            const actionsFileChanges = data.result.actions?.files || null;
            const deliveryEvidenceSurface =
              (normalizeAssetPackEvidenceSurface(explicitDeliveryMechanism) ||
                normalizeAssetPackEvidenceSurface(explicitShippables)) as ReturnType<typeof normalizeAssetPackSurface>;

            const semanticFileChanges =
              explicitAssetPackSynthesisArtifacts?.fileChanges ||
              explicitWrittenAssets?.fileChanges ||
              topLevelFileChanges ||
              deliveryEvidenceSurface?.fileChanges ||
              actionsFileChanges ||
              null;

            const actionsSurface = normalizeAssetPackDeliverySurface({
              pullRequest: data.result.actions?.pullRequest || null,
            }, data.result.summary || null);

            const writtenAssets =
              explicitWrittenAssets ||
              explicitAssetPackSynthesisArtifacts ||
              (data.result.summary || semanticFileChanges
                  ? normalizeAssetPackEvidenceSurface(null, semanticFileChanges, data.result.summary || null)
                : null);

            const deliveryMechanism =
              normalizeAssetPackDeliverySurface(explicitDeliveryMechanism) ||
              normalizeAssetPackDeliverySurface(explicitShippables) ||
              actionsSurface;

            const shippables =
              normalizePullRequestShippableSurface(explicitShippables) ||
              normalizePullRequestShippableSurface(deliveryMechanism);

            parsedData.completion = {
              ...canonicalResult,
              display: data.result.summary || data.result.message || 'Read completed',
              shippables,
              assetPackSynthesisArtifacts: explicitAssetPackSynthesisArtifacts || writtenAssets,
              writtenAssets,
              deliveryMechanism,
              semanticKind: data.result.semanticKind || (explicitAssetPackSynthesisArtifacts || writtenAssets || shippables || deliveryMechanism ? 'asset-pack-written-asset' : undefined),
              read: data.result.read || null,
              writtenAssetType: data.result.writtenAssetType || null,
              assetPack: data.result.assetPack || null,
              duration: data.duration || data.result.duration,
              taskType: data.result.taskType,
              processingStats: pickCanonicalProcessingStats(data.result.processingStats),
              repoSnapshot: data.result.repoSnapshot,
              summary: data.result.summary,
            };
            if (typeof data.guide === 'string') {
              parsedData.guide = data.guide;
            }
          } else {
            if (typeof data.guide === 'string') {
              parsedData.guide = data.guide;
              parsedData.text += `✅ ${data.message || 'Guide completed'} (${data.guide})\n`;
            } else {
              parsedData.text += `✅ ${data.message}\n`;
            }
          }
          break;
        }
        case 'work-update': {
          parsedData.type = 'work-update';
          parsedData.update = data.update;
          parsedData.scope = data.scope;
          if (data.scope === 'iteration') {
            parsedData.text += `📝 Iteration Update: ${data.update?.prose || ''}\n`;
          } else {
            parsedData.text += `📝 Work Update: ${data.update?.prose || ''}\n`;
          }
          break;
        }

      // ---------------------------------------------------------
      // Ad-hoc pipeline events (Conversations quick tasks)
      // ---------------------------------------------------------
      case 'pipeline_event': {
        parsedData.type = 'pipeline_event';
        parsedData.event = data;
        break;
      }
      }
    } catch (error) {
      // Not every stream payload is JSON, but explicit SSE data frames that
      // start with an object and fail to parse are malformed protocol events.
      if (line.trimStart().startsWith('{')) {
        parsedData.error = error instanceof Error ? error.message : 'Malformed stream event';
      } else {
        parsedData.text += line;
      }
    }
  }

  parsedData.text = parsedData.text.trim();
  return parsedData;
};
