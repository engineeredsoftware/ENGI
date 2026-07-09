/**
 * BitcodePipelineHost — the primitive Host (V48 Gate 3).
 *
 * The synthesis pipeline runs WITHIN a HOST: a real box with git, a filesystem, and
 * command exec. A Host provisions the FULL repository working tree at a revision into
 * its filesystem and exposes that checkout; the pipeline (Setup → … → Validation)
 * speaks only to this primitive, so it is identical on every host. The HostKinds —
 * InlineHost and SandboxHost (provider Vercel | AWS) — differ only in WHERE the
 * pipeline runs and HOW the box is obtained; in every case the workspace is the
 * host's LOCAL checkout, read locally (never across a process/network boundary).
 *
 * Source-safety: the full checkout lives ON the host. Only source-safe derivations
 * (measurements, the source-safe patch/contents descriptors) leave it; raw source
 * never enters telemetry.
 */

export type BitcodeHostKind = 'inline' | 'sandbox';
export type BitcodeSandboxProvider = 'vercel' | 'aws';

/** The HOST CAPABILITIES the primitive is specified by (generic across HostKinds). */
export interface BitcodeHostCapabilities {
  hostKind: BitcodeHostKind;
  /** For a SandboxHost, which provider backs the box. */
  sandboxProvider?: BitcodeSandboxProvider;
  /** Can check out a repository working tree (TRUE for every host). */
  clone: boolean;
  /** Exposes a readable filesystem (listFiles/readFile; TRUE for every host). */
  filesystem: boolean;
  /** Can run commands in the workspace (TRUE for every host). */
  exec: boolean;
  /** The working tree does not survive the run. */
  ephemeralFilesystem: boolean;
  /** Where checkouts land. */
  defaultWorkingDirectory: string;
}

/** A repository to provision — the full working tree at `revision`. */
export interface BitcodeHostRepositorySource {
  repositoryFullName: string;
  /** Clone URL (e.g. https://github.com/owner/repo.git). */
  url: string;
  /** Branch, tag, or commit to check out. */
  revision: string;
  /** Optional clone credentials (token in password). Never logged. */
  username?: string;
  password?: string;
}

export interface HostCommandResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

/**
 * A function that runs a command. Injected into hosts so the clone + filesystem
 * mechanics are testable without a real git/network (the default is a real
 * child-process exec).
 */
export type HostExec = (
  cmd: string,
  args: string[],
  opts?: { cwd?: string; env?: Record<string, string> },
) => Promise<HostCommandResult>;

/** A provisioned checkout — the full working tree, exposed for reading. */
export interface BitcodeHostWorkspace {
  /** Absolute path to the checkout root on the host. */
  readonly workspacePath: string;
  /** The tracked source files (repo-relative paths). */
  listFiles(): Promise<string[]>;
  /** One file's verbatim content, or null if absent/unreadable. */
  readFile(relativePath: string): Promise<string | null>;
  /** Run a command in the workspace (danger-wall, build, etc.). */
  runCommand(cmd: string, args?: string[]): Promise<HostCommandResult>;
  /** Remove the checkout. */
  dispose(): Promise<void>;
}

/** The primitive Host harness. */
export interface BitcodePipelineHost {
  readonly capabilities: BitcodeHostCapabilities;
  /** Check out the FULL working tree at the revision and return the workspace. */
  provisionRepository(source: BitcodeHostRepositorySource): Promise<BitcodeHostWorkspace>;
}

/** A source file read from a Host workspace ({path, content}). */
export interface HostSourceFile {
  path: string;
  content: string;
}

/**
 * Read the workspace's source files into {path, content} pairs — the bridge from a
 * Host checkout to the static-analysis / inventory consumers. By default reads every
 * tracked file; pass `paths` to read a subset (e.g. an AssetPack's covered files).
 * `maxBytesPerFile` bounds a single pathological file; 0/undefined = unbounded.
 */
export async function readWorkspaceSources(
  workspace: BitcodeHostWorkspace,
  opts: { paths?: string[]; maxBytesPerFile?: number } = {},
): Promise<HostSourceFile[]> {
  const paths = opts.paths ?? (await workspace.listFiles());
  const cap = opts.maxBytesPerFile && opts.maxBytesPerFile > 0 ? opts.maxBytesPerFile : 0;
  const files: HostSourceFile[] = [];
  for (const path of paths) {
    const content = await workspace.readFile(path);
    if (content === null || content === undefined) continue;
    files.push({ path, content: cap && content.length > cap ? content.slice(0, cap) : content });
  }
  return files;
}
