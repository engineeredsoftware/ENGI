/**
 * AssetPack Finish Phase - Deliver Agent (PTRR)
 *
 * Executes final pull-request delivery after written assets have already been
 * synthesized and validated.
 */
import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import {
  createBranchTool,
  createOrUpdateFileTool,
  createPullRequestTool,
} from '@bitcode/generic-tools-vcs';
import { emitToolUsage } from '@bitcode/pipelines-generics';
import {
  resolveDeliveryMechanismTemplateFromExecution,
  resolveWrittenAssetTypeFromExecution,
} from '../../semantic-resolution';

const FinishDeliveryOutputSchema = z.object({
  status: z.enum(['delivered','partial','blocked_readiness']).default('delivered'),
  writtenAssetType: z.string().optional(),
  deliveryMechanismTemplate: z.string().optional(),
  prUrl: z.string().optional(),
  branch: z.string().optional(),
  path: z.string().optional(),
  title: z.string().optional(),
  number: z.number().optional(),
  reason: z.string().optional(),
});

const systemPrompt = (() => {
  const p = new Prompt();
  p.set('agent:identity', 'You are the Finish Deliver agent. Deliver shippables as GitHub pull requests that wrap saved AssetPacks or AssetPackPartials.' as any);
  p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  return p;
})();

const stepPrompts = {
  plan: () => { const p = new Prompt(); p.set('step:purpose', 'Plan the exact Finish/Delivering actions and pull-request evidence required for the AssetPack.' as any); return p; },
  try: () => {
    const p = new Prompt();
    p.set('step:purpose', 'Execute Delivering actions through VCS tools after AssetPack synthesis artifacts are already saved.' as any);
    // Instruction for tool selection
    p.set('tools:policy', 'Use vcs_create_pull_request after the AssetPack is synthesized. Computer use is reserved for internal Read-measurement evidence and is not a Delivering tool.' as any);
    return p;
  },
  refine: () => { const p = new Prompt(); p.set('step:purpose', 'Adjust pull-request delivery actions if initial attempts failed, such as an existing branch.' as any); return p; },
  retry: () => { const p = new Prompt(); p.set('step:purpose', 'Retry pull-request delivery with auditable recovery steps.' as any); return p; }
};

export const AssetPackFinishDeliverAgent = factoryPTRRAgent<any, z.infer<typeof FinishDeliveryOutputSchema>>({
  name: 'finish:deliver-asset-pack-to-destination-agent',
  description: 'Deliver final AssetPack shippables through GitHub pull requests',
  outputSchema: FinishDeliveryOutputSchema as any,
  // Tools available to this agent
  tools: [
    'vcs_create_branch',
    'vcs_create_or_update_file',
    'vcs_create_pull_request',
  ],
  prompt: systemPrompt,
  stepPrompts,
});

export default async function deliverAssetPackToDestination(input: any, execution: any) {
  const dtype = resolveWrittenAssetTypeFromExecution(execution);
  const deliveryMechanismTemplate = resolveDeliveryMechanismTemplateFromExecution(execution);

  if (deliveryMechanismTemplate === 'pull-request') {
    return deliverPullRequest(input, execution, {
      writtenAssetType: dtype,
      deliveryMechanismTemplate,
    });
  }

  const result = await AssetPackFinishDeliverAgent(
    {
      writtenAssetType: dtype,
      deliveryMechanismTemplate,
      workspacePath: findExecutionValue(execution, 'repository', 'workspacePath'),
      owner: findExecutionValue(execution, 'repository', 'owner') || '',
      repo: findExecutionValue(execution, 'repository', 'name') || '',
      provider: findExecutionValue(execution, 'repository', 'provider') || 'github',
      connectionId: findExecutionValue(execution, 'repository', 'connectionId'),
      input,
    },
    execution
  );

  // Best-effort: infer URLs from usedTools (if any)
  try {
    const used = (result as any)?.usedTools as Array<any> | undefined;
    if (Array.isArray(used)) {
      for (const u of used) {
        if (u?.tool === 'vcs_create_pull_request' && u?.output?.url) {
          // Cross-phase artifact: postprocess reads the PR URL from another
          // sibling (cross-phase store-visibility law).
          storeCrossPhaseArtifact(execution, 'finish', 'pullRequestUrl', String(u.output.url));
          result.prUrl = String(u.output.url);
        }
      }
    }
  } catch {}

  return {
    status: result?.status || 'partial',
    writtenAssetType: dtype,
    deliveryMechanismTemplate,
    prUrl: (result as any)?.prUrl,
    reason: (result as any)?.reason,
  };
}

async function deliverPullRequest(
  input: any,
  execution: any,
  context: { writtenAssetType: string | undefined; deliveryMechanismTemplate: string | undefined }
) {
  const repository = resolveRepositoryContext(input, execution);
  const delivery = buildDeliveryContext(input, execution, repository);

  if (!repository.owner || !repository.repo || !repository.branch || !repository.commit) {
    return blockDelivery(execution, context, 'Pull-request delivery requires owner, repository, branch, and source commit.');
  }

  if (!delivery.userId && !delivery.connectionId && !hasEnvironmentDeliveryAuth(repository.provider)) {
    return blockDelivery(execution, context, 'Pull-request delivery requires a GitHub connectionId, pipeline userId, or explicit environment delivery authority.');
  }

  const common = {
    provider: repository.provider,
    owner: repository.owner,
    repo: repository.repo,
    ...(delivery.connectionId ? { connectionId: delivery.connectionId } : {}),
    ...(delivery.userId ? { userId: delivery.userId } : {}),
  };
  const content = buildAssetPackDeliveryContent(input, execution, repository, delivery);
  const contentRoot = sha256(content);
  const usedTools: Array<Record<string, unknown>> = [];

  try {
    const branchInput = {
      ...common,
      branch: delivery.sourceBranch,
      from: repository.commit,
    };
    const branch = await runDeliveryTool(
      execution,
      'vcs_create_branch',
      branchInput,
      () => createBranchTool.use(branchInput),
      usedTools,
    );

    const fileInput = {
      ...common,
      path: delivery.path,
      content,
      message: delivery.commitMessage,
      branch: delivery.sourceBranch,
    };
    const file = await runDeliveryTool(
      execution,
      'vcs_create_or_update_file',
      fileInput,
      () => createOrUpdateFileTool.use(fileInput),
      usedTools,
      { contentRoot, contentBytes: Buffer.byteLength(content, 'utf8') },
    );

    const pullRequestInput = {
      ...common,
      title: delivery.title,
      description: delivery.description,
      sourceBranch: delivery.sourceBranch,
      targetBranch: repository.branch,
      draft: true,
    };
    const pullRequest = await runDeliveryTool(
      execution,
      'vcs_create_pull_request',
      pullRequestInput,
      () => createPullRequestTool.use(pullRequestInput),
      usedTools,
    );

    const prUrl = String(pullRequest?.url || '');
    if (!prUrl) {
      return blockDelivery(execution, context, 'VCS pull-request creation completed without a URL.', usedTools);
    }

    const result = {
      status: 'delivered' as const,
      writtenAssetType: context.writtenAssetType,
      deliveryMechanismTemplate: context.deliveryMechanismTemplate,
      prUrl,
      branch: delivery.sourceBranch,
      path: delivery.path,
      title: String(pullRequest?.title || delivery.title),
      number: typeof pullRequest?.number === 'number' ? pullRequest.number : undefined,
      usedTools,
    };

    storeDeliveryResult(execution, {
      ...result,
      contentRoot,
      contentBytes: Buffer.byteLength(content, 'utf8'),
      branchResult: branch,
      fileResult: file,
      pullRequestResult: pullRequest,
    });
    return result;
  } catch (error) {
    return blockDelivery(
      execution,
      context,
      error instanceof Error ? error.message : String(error),
      usedTools,
    );
  }
}

function hasEnvironmentDeliveryAuth(provider: string): boolean {
  if (process.env.BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK !== '1') return false;
  if (provider !== 'github') return false;
  return Boolean(process.env.GITHUB_TOKEN || process.env.GITHUB_PAT || process.env.GH_TOKEN);
}

function resolveRepositoryContext(input: any, execution: any) {
  const storedPipelineInput = findExecutionValue(execution, 'pipeline', 'input') || {};
  const sourceRevision =
    input?.sourceRevision ||
    storedPipelineInput?.sourceRevision ||
    findExecutionValue(execution, 'harness', 'sourceRevision') ||
    {};
  const repository =
    input?.repository ||
    storedPipelineInput?.repository ||
    {};
  const fullName =
    sourceRevision.repositoryFullName ||
    repository.repositoryFullName ||
    repository.fullName ||
    findExecutionValue(execution, 'source', 'fullName') ||
    [
      findExecutionValue(execution, 'repository', 'owner') || findExecutionValue(execution, 'source', 'owner'),
      findExecutionValue(execution, 'repository', 'name') || findExecutionValue(execution, 'source', 'name'),
    ].filter(Boolean).join('/');
  const [ownerFromFullName, repoFromFullName] =
    typeof fullName === 'string' && fullName.includes('/')
      ? fullName.split('/', 2)
      : ['', ''];

  return {
    provider:
      String(
        repository.provider ||
        sourceRevision.provider ||
        findExecutionValue(execution, 'repository', 'provider') ||
        findExecutionValue(execution, 'source', 'provider') ||
        'github',
      ) as 'github' | 'gitlab' | 'bitbucket',
    owner: String(repository.owner || ownerFromFullName || ''),
    repo: String(repository.name || repository.repo || repoFromFullName || ''),
    branch: String(
      sourceRevision.branch ||
      repository.branch ||
      findExecutionValue(execution, 'repository', 'branch') ||
      findExecutionValue(execution, 'source', 'branch') ||
      'main',
    ),
    commit: String(
      sourceRevision.commit ||
      repository.commit ||
      findExecutionValue(execution, 'repository', 'commit') ||
      findExecutionValue(execution, 'source', 'commit') ||
      '',
    ),
    fullName: String(fullName || ''),
  };
}

function buildDeliveryContext(input: any, execution: any, repository: ReturnType<typeof resolveRepositoryContext>) {
  const runId =
    findExecutionValue(execution, 'harness', 'runId') ||
    findExecutionValue(execution, 'pipeline', 'runId') ||
    findExecutionValue(execution, 'execution', 'id') ||
    execution?.id ||
    Date.now().toString(36);
  const safeRunId = slug(String(runId)).slice(0, 48) || Date.now().toString(36);
  const sourceBranch = `bitcode/asset-pack-${safeRunId}`;
  const path = `.bitcode/asset-packs/${safeRunId}.md`;
  const read = resolveRead(input, execution);
  const title = `Bitcode AssetPack delivery ${safeRunId.slice(0, 12)}`;

  return {
    runId: String(runId),
    sourceBranch,
    path,
    title,
    commitMessage: `Deliver Bitcode AssetPack ${safeRunId.slice(0, 12)}`,
    description: [
      'Bitcode synthesized this AssetPack from a source-bound Read/Fit pipeline run.',
      '',
      `- Read: ${read || 'not recorded'}`,
      `- Repository revision: ${repository.fullName}@${repository.branch}:${repository.commit.slice(0, 12)}`,
      `- Delivery path: ${path}`,
      '',
      'The product pipeline telemetry and ledger readback remain the authoritative audit trail for settlement.',
    ].join('\n'),
    userId:
      findExecutionValue(execution, 'pipeline', 'userId') ||
      findExecutionValue(execution, 'harness', 'userId') ||
      process.env.BITCODE_PIPELINE_USER_ID ||
      undefined,
    connectionId:
      findExecutionValue(execution, 'repository', 'connectionId') ||
      findExecutionValue(execution, 'source', 'connectionId') ||
      undefined,
  };
}

function buildAssetPackDeliveryContent(
  input: any,
  execution: any,
  repository: ReturnType<typeof resolveRepositoryContext>,
  delivery: ReturnType<typeof buildDeliveryContext>,
) {
  const read = resolveRead(input, execution);
  const fitResult =
    input?.fitResult ||
    input?.fit ||
    findExecutionValue(execution, 'fit', 'result') ||
    findExecutionValue(execution, 'depository/search', 'result') ||
    {};
  const synthesis =
    input?.assetPackSynthesisArtifacts ||
    input?.writtenAssets ||
    findExecutionValue(execution, 'implementation', 'assetPackSynthesisArtifacts') ||
    findExecutionValue(execution, 'implementation', 'writtenAssets') ||
    {};
  const proofEvidence = normalizeStringArray(synthesis?.proofEvidence || fitResult?.proofEvidence);
  const reviewNotes = normalizeStringArray(synthesis?.reviewNotes);
  const candidateIds = normalizeStringArray(fitResult?.selectedCandidateAssetIds);
  const resultReasons = normalizeStringArray(fitResult?.resultReasons);

  return [
    '# Bitcode AssetPack',
    '',
    '## Read',
    read || 'No Read text was recorded.',
    '',
    '## Source Revision',
    `- Repository: ${repository.fullName || `${repository.owner}/${repository.repo}`}`,
    `- Branch: ${repository.branch}`,
    `- Commit: ${repository.commit}`,
    '',
    '## Fit',
    `- Result state: ${fitResult?.resultState || 'not recorded'}`,
    `- Selected candidates: ${candidateIds.length ? candidateIds.join(', ') : 'none recorded'}`,
    `- Query root: ${fitResult?.queryRoot || 'not recorded'}`,
    `- Ranking root: ${fitResult?.rankingRoot || 'not recorded'}`,
    `- Searched assets: ${typeof fitResult?.searchedAssetCount === 'number' ? fitResult.searchedAssetCount : 'not recorded'}`,
    '',
    ...(resultReasons.length ? ['### Fit Reasons', ...resultReasons.map((reason) => `- ${reason}`), ''] : []),
    '## Synthesized AssetPack',
    normalizeText(synthesis?.summary) || normalizeText(input?.summary) || 'AssetPack synthesis summary was not recorded.',
    '',
    ...(proofEvidence.length ? ['### Proof Evidence', ...proofEvidence.map((entry) => `- ${entry}`), ''] : []),
    ...(reviewNotes.length ? ['### Review Notes', ...reviewNotes.map((entry) => `- ${entry}`), ''] : []),
    '## Delivery',
    `- Pipeline run: ${delivery.runId}`,
    `- Branch: ${delivery.sourceBranch}`,
    `- Delivery path: ${delivery.path}`,
    '- Ledger settlement: performed by the product harness after this pull request is created and read back.',
    '',
  ].join('\n');
}

async function runDeliveryTool<T>(
  execution: any,
  toolName: string,
  input: Record<string, unknown>,
  run: () => Promise<T>,
  usedTools: Array<Record<string, unknown>>,
  additionalInputSummary: Record<string, unknown> = {},
): Promise<T> {
  const toolIndex = usedTools.length;
  const toolKey = `${toolName}:${toolIndex}`;
  const summarizedInput = summarizeToolInput(input, additionalInputSummary);
  try {
    const output = await run();
    const summarizedOutput = summarizeToolOutput(output);
    usedTools.push({ tool: toolName, input: summarizedInput, output: summarizedOutput });
    execution.store?.('tools', toolKey, {
      tool: toolName,
      ok: true,
      input: summarizedInput,
      output: summarizedOutput,
      phase: 'finish',
      agent: 'finish:asset-pack-delivery-agent',
      step: 'try',
      generation: 'tools_execution',
    });
    await emitToolUsage(execution, toolName, summarizedInput, summarizedOutput, null);
    return output;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    usedTools.push({ tool: toolName, input: summarizedInput, error: { message } });
    execution.store?.('tools', toolKey, {
      tool: toolName,
      ok: false,
      input: summarizedInput,
      error: { message },
      phase: 'finish',
      agent: 'finish:asset-pack-delivery-agent',
      step: 'try',
      generation: 'tools_execution',
    });
    await emitToolUsage(execution, toolName, summarizedInput, null, message);
    throw error;
  }
}

function blockDelivery(
  execution: any,
  context: { writtenAssetType: string | undefined; deliveryMechanismTemplate: string | undefined },
  reason: string,
  usedTools: Array<Record<string, unknown>> = [],
) {
  const result = {
    status: 'blocked_readiness' as const,
    writtenAssetType: context.writtenAssetType,
    deliveryMechanismTemplate: context.deliveryMechanismTemplate,
    prUrl: undefined,
    reason,
    usedTools,
  };
  storeDeliveryResult(execution, result);
  return result;
}

function storeDeliveryResult(execution: any, result: Record<string, unknown>) {
  try {
    execution.store?.('finish', 'deliveryReadiness', {
      status: result.status,
      reason: result.reason || null,
      prUrl: result.prUrl || null,
      branch: result.branch || null,
      path: result.path || null,
    });
    if (result.prUrl) execution.store?.('finish', 'pullRequestUrl', String(result.prUrl));
    if (result.number != null) execution.store?.('finish', 'pullRequestNumber', result.number);
    if (result.title) execution.store?.('finish', 'pullRequestTitle', String(result.title));
    if (result.branch) execution.store?.('finish', 'deliveryBranch', String(result.branch));
    if (result.path) execution.store?.('finish', 'deliveryPath', String(result.path));
    if (result.contentRoot) execution.store?.('finish', 'deliveryContentRoot', String(result.contentRoot));
  } catch {}
}

function resolveRead(input: any, execution: any): string {
  return normalizeText(
    input?.read ||
    input?.definitionOfRead ||
    findExecutionValue(execution, 'pipeline', 'expressedRead') ||
    findExecutionValue(execution, 'read', 'description') ||
    findExecutionValue(execution, 'read', 'request')?.prompt ||
    '',
  );
}

function findExecutionValue(execution: any, namespace: string, key: string): any {
  const localValue = execution?.get?.(namespace, key);
  if (localValue !== undefined) return localValue;
  const upwardValue = execution?.findUp?.(namespace, key);
  if (upwardValue !== undefined) return upwardValue;
  return findExecutionValueDown(execution?.getRoot?.() || execution, namespace, key);
}

function findExecutionValueDown(node: any, namespace: string, key: string): any {
  if (!node) return undefined;
  const value = node.get?.(namespace, key);
  if (value !== undefined) return value;
  for (const child of node.children?.values?.() || []) {
    const childValue = findExecutionValueDown(child, namespace, key);
    if (childValue !== undefined) return childValue;
  }
  return undefined;
}

function summarizeToolInput(input: Record<string, unknown>, additional: Record<string, unknown>) {
  const clone: Record<string, unknown> = { ...input, ...additional };
  if (typeof clone.content === 'string') {
    clone.contentRoot = sha256(clone.content);
    clone.contentBytes = Buffer.byteLength(clone.content, 'utf8');
    delete clone.content;
  }
  return clone;
}

function summarizeToolOutput(output: unknown): unknown {
  if (!output || typeof output !== 'object') return output;
  const record = output as Record<string, unknown>;
  return {
    ...record,
    content: typeof record.content === 'string'
      ? {
          root: sha256(record.content),
          bytes: Buffer.byteLength(record.content, 'utf8'),
        }
      : record.content,
  };
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => normalizeText(entry)).filter(Boolean);
}

function normalizeText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map((entry) => normalizeText(entry)).filter(Boolean).join('\n');
  return '';
}

function sha256(value: string): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._/-]+/g, '-')
    .replace(/[/_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
