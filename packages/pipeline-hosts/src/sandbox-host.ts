/**
 * SandboxHost — the sandboxed HostKind of the primitive Host (V48 Gate 3). The
 * sibling of InlineHost: same `BitcodePipelineHost` contract, but the pipeline runs
 * inside a provisioned, isolated BOX (a real machine with git + filesystem + exec).
 * Within the box the checkout is local exactly as for InlineHost — there is no
 * cross-boundary, per-file source read; the pipeline executes IN the box on its
 * local checkout.
 *
 * SandboxHost is a base for providers:
 *   - VercelSandboxHost (provider 'vercel', IMPLEMENTED) — provisions via the Vercel
 *     Sandbox SDK git source into the box working directory.
 *   - AwsSandboxHost (provider 'aws', STUBBED) — the provider seam for an AWS-backed
 *     box; not yet implemented.
 *
 * The `BitcodeHostWorkspace` returned here is the box's filesystem access primitive
 * (listFiles / readFile / runCommand). When the pipeline runs in the box it reads
 * locally; the session-backed accessors serve harness/external interaction.
 *
 * (Distinct from `VercelSandboxPipelineHost`, which runs a full harness PLAN of
 * commands + artifacts. This is the source/filesystem Host primitive.)
 */

import type {
  BitcodeHostCapabilities,
  BitcodeHostRepositorySource,
  BitcodeHostWorkspace,
  BitcodePipelineHost,
  BitcodeSandboxProvider,
  HostCommandResult,
} from './host';
import type {
  SandboxCommandResult,
  SandboxCreateOptions,
  SandboxFactory,
  SandboxSession,
  VercelSandboxRuntime,
} from './types';

const DEFAULT_WORKING_DIRECTORY = '/vercel/sandbox';

async function readStream(result: SandboxCommandResult, stream: 'stdout' | 'stderr'): Promise<string> {
  const reader = result[stream];
  if (typeof reader === 'function') return reader.call(result);
  if (typeof result.output === 'function') return result.output(stream);
  return '';
}

function joinPosix(base: string, relative: string): string {
  return `${base.replace(/\/+$/, '')}/${relative.replace(/^\/+/, '')}`;
}

/** The SandboxHost base — the 'sandbox' HostKind, parameterized by provider. */
export abstract class SandboxHost implements BitcodePipelineHost {
  abstract readonly sandboxProvider: BitcodeSandboxProvider;
  protected readonly workingDirectory: string;

  constructor(workingDirectory: string = DEFAULT_WORKING_DIRECTORY) {
    this.workingDirectory = workingDirectory;
  }

  get capabilities(): BitcodeHostCapabilities {
    return {
      hostKind: 'sandbox',
      sandboxProvider: this.sandboxProvider,
      clone: true,
      filesystem: true,
      exec: true,
      ephemeralFilesystem: true,
      defaultWorkingDirectory: this.workingDirectory,
    };
  }

  abstract provisionRepository(source: BitcodeHostRepositorySource): Promise<BitcodeHostWorkspace>;
}

class SandboxWorkspace implements BitcodeHostWorkspace {
  constructor(
    private readonly session: SandboxSession,
    readonly workspacePath: string,
  ) {}

  async listFiles(): Promise<string[]> {
    const result = await this.session.runCommand({ cmd: 'git', args: ['ls-files'], cwd: this.workspacePath });
    if (result.exitCode !== 0) return [];
    const out = await readStream(result, 'stdout');
    return out
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  async readFile(relativePath: string): Promise<string | null> {
    if (relativePath.split('/').some((segment) => segment === '..')) return null;
    const buffer = await this.session.readFileToBuffer({ path: joinPosix(this.workspacePath, relativePath) });
    return buffer ? buffer.toString('utf8') : null;
  }

  async runCommand(cmd: string, args: string[] = []): Promise<HostCommandResult> {
    const result = await this.session.runCommand({ cmd, args, cwd: this.workspacePath });
    return {
      exitCode: result.exitCode,
      stdout: await readStream(result, 'stdout'),
      stderr: await readStream(result, 'stderr'),
    };
  }

  async dispose(): Promise<void> {
    if (this.session.stop) {
      try {
        await this.session.stop({ blocking: true });
      } catch {
        // Best-effort; the box is reclaimed regardless.
      }
    }
  }
}

export interface VercelSandboxHostOptions {
  sandboxFactory: SandboxFactory;
  workingDirectory?: string;
  runtime?: VercelSandboxRuntime;
  createOptions?: Partial<SandboxCreateOptions>;
}

/** VercelSandboxHost — the Vercel provider of SandboxHost (implemented). */
export class VercelSandboxHost extends SandboxHost {
  readonly sandboxProvider = 'vercel' as const;
  private readonly sandboxFactory: SandboxFactory;
  private readonly runtime?: VercelSandboxRuntime;
  private readonly createOptions?: Partial<SandboxCreateOptions>;

  constructor(options: VercelSandboxHostOptions) {
    super(options.workingDirectory);
    this.sandboxFactory = options.sandboxFactory;
    this.runtime = options.runtime;
    this.createOptions = options.createOptions;
  }

  async provisionRepository(source: BitcodeHostRepositorySource): Promise<BitcodeHostWorkspace> {
    const session = await this.sandboxFactory.create({
      ...this.createOptions,
      runtime: this.runtime ?? this.createOptions?.runtime,
      source: {
        type: 'git',
        url: source.url,
        revision: source.revision,
        username: source.username,
        password: source.password,
      },
    });
    return new SandboxWorkspace(session, this.workingDirectory);
  }
}

export interface AwsSandboxHostOptions {
  workingDirectory?: string;
}

/** AwsSandboxHost — the AWS provider seam of SandboxHost (stubbed). */
export class AwsSandboxHost extends SandboxHost {
  readonly sandboxProvider = 'aws' as const;

  constructor(options: AwsSandboxHostOptions = {}) {
    super(options.workingDirectory ?? '/bitcode/sandbox');
  }

  async provisionRepository(): Promise<BitcodeHostWorkspace> {
    throw new Error(
      'AwsSandboxHost is not yet implemented — the AWS sandbox provider is the stubbed provider seam.',
    );
  }
}
