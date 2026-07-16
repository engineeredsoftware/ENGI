#!/usr/bin/env ts-node
/**
 * Minimal CLI to execute an AssetPack SDIVF pipeline outside the edge runtime.
 * Reads pipeline execution context from `executions`, streams output
 * via SupabaseStream, and records artifacts. Intended for containerized usage.
 */

import { supabaseAdmin } from '@bitcode/supabase';
import { SupabaseStream, flushAndExit } from '@bitcode/supabaseStream';
import {
  initializeProcessRoot,
  getProcessRootFields,
  serializeProcessRootFields,
} from '@bitcode/generic-executions';
import { runSynthesizeAssetPacksSDIVFPipeline } from '@bitcode/asset-packs-pipelines-domain';
import { factoryPipelineExecution } from '@bitcode/pipelines-generics';
import { log } from '@bitcode/logger';
import { saveArtifact } from '@bitcode/generic-artifacts-compose';

async function main() {
  const runId = process.argv[2] || process.env.RUN_ID;
  if (!runId) {
    console.error('Usage: run-long-runner.ts <run-id>');
    process.exit(1);
    return;
  }

  // Load execution context from canonical table
  const { data: runRow, error: fetchErr } = await supabaseAdmin
    .from('executions')
    .select('context, user_id')
    .eq('id', runId)
    .maybeSingle();

  if (fetchErr || !runRow?.context) {
    console.error('Failed to fetch pipeline execution context', fetchErr || runRow);
    process.exit(1);
  }

  const ctx = runRow.context as any;
  const stream = new SupabaseStream(runId);

  try {
    initializeProcessRoot({
      connectionId: ctx?.repoInstallationId || ctx?.connectionId || 0,
      repoName: ctx.repoName,
      repoOwner: ctx.repoOwner,
      repoBranch: ctx.repoBranch,
      repoCommit: ctx.repoCommit,
      task: ctx.task,
      attachments: ctx.attachments,
      dataStream: stream,
      userId: runRow.user_id,
    } as any);

    // Optional override: load pipeline from env module
    let pipelineResult: any;
    const pipelineModule = process.env.PIPELINE_MODULE;
    if (pipelineModule) {
      log('Loading custom pipeline module', 'info', { module: pipelineModule });
      const mod = await import(pipelineModule);
      if (typeof mod.runPipeline === 'function') pipelineResult = await mod.runPipeline();
      else if (typeof mod.default === 'function') pipelineResult = await mod.default();
      else throw new Error(`Provided PIPELINE_MODULE ${pipelineModule} has no export runPipeline()`);
    } else {
      const execution = factoryPipelineExecution('synthesize_asset_packs', undefined, {
        pipelineName: 'synthesize-asset-packs-sdivf',
        family: 'asset_pack',
        posture: 'live',
        admittedSurface: 'long_runner',
      });
      pipelineResult = await runSynthesizeAssetPacksSDIVFPipeline(ctx || {}, execution);
    }

    const result = pipelineResult;

    // Attempt to save the PR patch if settle Simple delivered a pull-request.
    try {
      const prUrl: string | undefined =
        (result as any)?.shippableUrl ||
        (result as any)?.shippable?.prUrl ||
        (result as any)?.deliveryMechanism?.prUrl ||
        (result as any)?.deliveryMechanism?.url ||
        (result as any)?.gitResults?.url;
      if (prUrl && prUrl.includes('/pull/')) {
        const prMatch = /https?:\/\/github\.com\/(.+?)\/(.+?)\/pull\/(\d+)/.exec(prUrl);
        if (prMatch) {
          const [, owner, repo, prNumber] = prMatch;
          const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
          const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');
          if (!GITHUB_APP_ID || !GITHUB_PRIVATE_KEY || !ctx.connectionId) throw new Error('Missing GitHub app credentials or connectionId');
          const jwtMod = await import('jsonwebtoken');
          const jwtToken = jwtMod.default.sign({ iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 600, iss: GITHUB_APP_ID }, GITHUB_PRIVATE_KEY, { algorithm: 'RS256' });
          const accessResp = await fetch(`https://api.github.com/app/installations/${ctx.connectionId}/access_tokens`, { method: 'POST', headers: { Authorization: `Bearer ${jwtToken}`, Accept: 'application/vnd.github+json', 'User-Agent': 'bitcode-long-runner' } });
          if (!accessResp.ok) throw new Error(`GH token fetch failed ${accessResp.status}`);
          const { token } = await accessResp.json() as any;
          const patchResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3.patch', 'User-Agent': 'bitcode-long-runner' } });
          if (patchResp.ok) {
            const patchText = await patchResp.text();
            const artifact = await saveArtifact(patchText, `pr-${prNumber}.patch`, 'text/x-diff');
            await supabaseAdmin.from('run_artifacts').insert({ run_id: runId, name: artifact.name, url: artifact.url, size: artifact.size });
            await stream.writeData({ type: 'artifact', name: artifact.name, url: artifact.url, size: artifact.size, runId, timestamp: new Date().toISOString() });
          }
        }
      }
    } catch (patchErr) {
      log('Failed to fetch/upload PR patch', 'error', { err: patchErr, runId });
    }

    // Serialize global context as artifact
    try {
      const gcSerialized = serializeProcessRootFields(getProcessRootFields());
      const artifact = await saveArtifact(JSON.stringify(gcSerialized, null, 2), 'context.json', 'application/json');
      await supabaseAdmin.from('run_artifacts').insert({ run_id: runId, name: artifact.name, url: artifact.url, size: artifact.size });
      await stream.writeData({ type: 'artifact', name: artifact.name, url: artifact.url, size: artifact.size, runId, timestamp: new Date().toISOString() });
    } catch (artErr) {
      log('Failed to upload artifact', 'error', { err: artErr, runId });
    }

    // Final completion chunk so UI knows we're done
    await stream.writeData({ type: 'completion', result, timestamp: new Date().toISOString(), runId });

    // Mark job row succeeded (if exists)
    try { await supabaseAdmin.from('run_jobs').update({ status: 'succeeded', finished_at: new Date() }).eq('run_id', runId); } catch {}
    log('Pipeline completed', 'info', { runId });
    await flushAndExit(stream, 0);
  } catch (err) {
    try { await supabaseAdmin.from('run_jobs').update({ status: 'errored', finished_at: new Date(), error: err instanceof Error ? err.message : String(err) }).eq('run_id', runId); } catch {}
    await stream.writeData({ type: 'error', message: err instanceof Error ? err.message : String(err), detail: err instanceof Error ? err.stack : undefined, runId, timestamp: new Date().toISOString() });
    await flushAndExit(stream, 1);
  }
}

main();
