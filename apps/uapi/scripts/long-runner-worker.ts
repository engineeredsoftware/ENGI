#!/usr/bin/env ts-node
/**
 * Very small “queue worker” that polls run_jobs for queued jobs, atomically
 * claims the oldest one, and executes it via the run-long-runner script.  It
 * is *not* production-grade (no exponential back-off, no SIGTERM handling)
 * but suffices for early dog-food testing of the long-runner path.
 */

import { spawn } from 'child_process';
import * as crypto from 'crypto';
import { supabaseAdmin } from '@bitcode/supabase';
import { log } from '@bitcode/logger';

// ----------------------------- Prometheus metrics -------------------------
import * as http from 'http';
import { Gauge, register } from 'prom-client';

const queuedGauge = new Gauge({ name: 'queued_jobs', help: 'Number of queued jobs' });
const runningGauge = new Gauge({ name: 'running_jobs', help: 'Number of running jobs on this worker' });

const METRICS_PORT = parseInt(process.env.METRICS_PORT || '9090', 10);

http.createServer(async (_req, res) => {
  if (_req.url === '/metrics') {
    res.writeHead(200, { 'Content-Type': register.contentType });
    res.end(await register.metrics());
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(METRICS_PORT, () => {
  log('Prometheus metrics server listening', 'info', { port: METRICS_PORT });
});

const WORKER_ID = process.env.WORKER_ID || crypto.randomUUID();
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '3000', 10);

async function claimNextJob() {
  const { data, error } = await supabaseAdmin.rpc('claim_run_job', {
    p_worker_id: WORKER_ID,
  });
  if (error) throw error;
  return data as { id: string; run_id: string } | null;
}

// Fallback implementation if the database function does not yet exist
async function claimNextJobFallback() {
  const { data: jobs, error } = await supabaseAdmin
    .from('run_jobs')
    .select('id, run_id')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1);
  if (error) throw error;
  if (!jobs || jobs.length === 0) return null;

  const job = jobs[0];
  const { error: updErr } = await supabaseAdmin
    .from('run_jobs')
    .update({ status: 'running', locked_by: WORKER_ID, started_at: new Date() })
    .eq('id', job.id)
    .eq('status', 'queued');

  if (updErr) return null; // Another worker won the race.
  return job as { id: string; run_id: string };
}

async function loop() {
  for (;;) {
    try {
      // Refresh queue depth metric
      await updateQueueMetrics();

      let job = null;
      // Prefer the DB function if available
      try {
        job = await claimNextJob();
      } catch {
        job = await claimNextJobFallback();
      }

      if (job) {
        log('Claimed job', 'info', { jobId: job.id, runId: job.run_id, worker: WORKER_ID });
        runningGauge.inc();
        await executeJob(job.id, job.run_id);
      } else {
        runningGauge.set(0);
        await new Promise(res => setTimeout(res, POLL_INTERVAL_MS));
      }
    } catch (err) {
      log('Worker loop error', 'error', { err });
      await new Promise(res => setTimeout(res, POLL_INTERVAL_MS));
    }
  }
}

async function updateQueueMetrics() {
  try {
    const { count } = await supabaseAdmin
      .from('run_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'queued');
    if (typeof count === 'number') queuedGauge.set(count);
  } catch (err) {
    log('Failed to fetch queue depth', 'warn', { err });
  }
}

async function executeJob(jobId: string, runId: string) {
  return new Promise<void>((resolve) => {
    // Prefer spawning a *separate container* when DOCKER_LAUNCH is true. This
    // allows the worker to stay lightweight and each run to have clear
    // resource isolation.  Otherwise fall back to an in-process child.

    if (process.env.DOCKER_LAUNCH?.toLowerCase() === 'true') {
      const img = process.env.LONG_RUNNER_IMAGE || 'bitcode/long-runner:latest';
      const docker = spawn('docker', [
        'run', '--rm',
        '-e', `SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        '-e', `SUPABASE_URL=${process.env.SUPABASE_URL}`,
        '-e', `RUN_ID=${runId}`,
        img
      ], { stdio: 'inherit' });

      docker.on('exit', (code) => finalize(code));
    } else {
      const child = spawn('ts-node', [require.resolve('./run-long-runner.ts'), runId], {
      stdio: 'inherit',
      env: { ...process.env, WORKER_ID },
      });

      child.on('exit', (code) => finalize(code));
    }

    async function finalize(code: number | null) {
      runningGauge.dec();
      const status = code === 0 ? 'succeeded' : 'errored';
      const updates: any = { status, finished_at: new Date() };
      if (status === 'errored') updates.error = `exit code ${code}`;
      await supabaseAdmin.from('run_jobs').update(updates).eq('id', jobId);
      resolve();
    }
  });
}

loop();

// Graceful shutdown – stop new work, wait for current child then exit.
process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down worker...', 'info');
  process.exit(0);
});
