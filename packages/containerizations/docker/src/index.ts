/**
 * @bitcode/containerizations-docker
 *
 * Docker containerization primitives (containers, images, networks, volumes).
 * Hierarchy: packages/containerizations/docker
 * MCP: @bitcode/generic-tools-mcps-docker wraps these as Tools.
 */

// Containers
export async function dockerListContainersTool(params?: {}): Promise<any> {
  return { containers: [] };
}

export async function dockerCreateContainerTool(params: { image: string; name?: string; options?: any }): Promise<any> {
  return { containerId: 'new-container-id', ...params };
}

export async function dockerRunContainerTool(params: { image: string; name?: string; options?: any }): Promise<any> {
  return { containerId: 'running-container-id', ...params };
}

export async function dockerRecreateContainerTool(params: { containerId: string; options?: any }): Promise<any> {
  return { containerId: params.containerId };
}

export async function dockerStartContainerTool(params: { containerId: string }): Promise<any> {
  return { containerId: params.containerId, started: true };
}

export async function dockerFetchContainerLogsTool(params: { containerId: string; options?: any }): Promise<any> {
  return { containerId: params.containerId, logs: '' };
}

export async function dockerStopContainerTool(params: { containerId: string }): Promise<any> {
  return { containerId: params.containerId, stopped: true };
}

export async function dockerRemoveContainerTool(params: { containerId: string; force?: boolean }): Promise<any> {
  return { containerId: params.containerId, removed: true };
}

// Images
export async function dockerListImagesTool(params?: {}): Promise<any> {
  return { images: [] };
}

export async function dockerPullImageTool(params: { image: string; tag?: string }): Promise<any> {
  return { image: params.image, pulled: true };
}

export async function dockerPushImageTool(params: { image: string; tag?: string }): Promise<any> {
  return { image: params.image, pushed: true };
}

export async function dockerBuildImageTool(params: { contextPath: string; dockerfile?: string; tag: string }): Promise<any> {
  return { image: params.tag, built: true };
}

export async function dockerRemoveImageTool(params: { image: string; force?: boolean }): Promise<any> {
  return { image: params.image, removed: true };
}

// Networks
export async function dockerListNetworksTool(params?: {}): Promise<any> {
  return { networks: [] };
}

export async function dockerCreateNetworkTool(params: { name: string; options?: any }): Promise<any> {
  return { network: params.name };
}

export async function dockerRemoveNetworkTool(params: { name: string }): Promise<any> {
  return { network: params.name, removed: true };
}

// Volumes
export async function dockerListVolumesTool(params?: {}): Promise<any> {
  return { volumes: [] };
}

export async function dockerCreateVolumeTool(params: { name: string; options?: any }): Promise<any> {
  return { volume: params.name };
}

export async function dockerRemoveVolumeTool(params: { name: string; force?: boolean }): Promise<any> {
  return { volume: params.name, removed: true };
}

// -------------------------------------------------------
// Minimal wrapper around `docker run` originally implemented in
// `uapi/lib/dockerUtils.ts`.  The helper streams logs in real-time so the
// caller can forward them to UIs or log aggregation systems.
// -------------------------------------------------------

import { spawn } from 'child_process';

export interface RunDockerOptions {
  /** Additional CLI arguments placed after the image name. */
  args?: string[];
  /** Environment variables passed via `-e` flags. */
  env?: Record<string, string>;
  /** Remove container when it exits (`--rm`). Default: true */
  remove?: boolean;
  /** Allocate TTY / keep STDIN open (`-i`). Default: true */
  interactive?: boolean;
  /** Callback to receive incremental stdout/stderr. */
  onLog?: (line: string, stream: 'stdout' | 'stderr') => void;
}

/**
 * Execute a Docker image with the provided options.  Resolves once the
 * container exits returning the process exit code & signal.
 */
export function runDocker(
  image: string,
  opts: RunDockerOptions = {}
): Promise<{ code: number | null; signal: NodeJS.Signals | null }> {
  const {
    args = [],
    env = {},
    remove = true,
    interactive = true,
    onLog,
  } = opts;

  const cliArgs: string[] = ['run'];
  if (interactive) cliArgs.push('-i');
  if (remove) cliArgs.push('--rm');

  // Inject env variables.
  for (const [k, v] of Object.entries(env)) {
    cliArgs.push('-e', `${k}=${v}`);
  }

  cliArgs.push(image, ...args);

  return new Promise((resolve, reject) => {
    const child = spawn('docker', cliArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk) => onLog?.(chunk.toString(), 'stdout'));
    child.stderr.on('data', (chunk) => onLog?.(chunk.toString(), 'stderr'));

    child.on('error', (err) => reject(err));
    child.on('close', (code, signal) => resolve({ code, signal }));
  });
}
