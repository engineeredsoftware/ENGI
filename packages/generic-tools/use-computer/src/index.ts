/**
 * Internal computer-use primitive for V26 fifth-gate reform.
 *
 * V26 admits this retained shell primitive only behind registry configuration
 * for Read-measurement evidence. It is not a Bitcode Exchange or product state
 * owner, and broad computer-using agents are deferred beyond V26.
 */
import { attachDocCodeToolPrompt, factoryTool } from '@bitcode/tools-generics';
import { USE_COMPUTER_DOC_CODE_TOOL_PROMPT } from './prompts/UseComputerDocCodeToolPrompt';
import { spawn } from 'child_process';

export interface UseComputerInput {
  command: string | string[];
  cwd?: string;
  env?: Record<string, string>;
  stdin?: string;
  timeoutMs?: number;
}

export interface UseComputerOutput {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export const UseComputerInputSchema = {
  type: 'object',
  properties: {
    command: { type: ['string', 'array'], description: 'Command (string or argv list)' },
    cwd: { type: 'string', description: 'Working directory' },
    env: { type: 'object', description: 'Environment overrides' },
    stdin: { type: 'string', description: 'Data to write to stdin' },
    timeoutMs: { type: 'number', description: 'Timeout in milliseconds', default: 60_000 }
  },
  required: ['command']
} as const;

export const UseComputerOutputSchema = {
  type: 'object',
  properties: {
    exitCode: { type: ['number', 'null'] },
    stdout: { type: 'string' },
    stderr: { type: 'string' },
    durationMs: { type: 'number' }
  },
  required: ['exitCode', 'stdout', 'stderr', 'durationMs']
} as const;

/**
 * @doc-code-tool
 * @prompt USE_COMPUTER_DOC_CODE_TOOL_PROMPT
 * intent: "Run a bounded shell command only when internal Read-measurement registry policy admits computer use"
 */
async function runUseComputer(input: UseComputerInput): Promise<UseComputerOutput> {
    const started = Date.now();
    const argv: string[] = Array.isArray(input.command)
      ? input.command as string[]
      : ['/bin/sh', '-lc', String(input.command)];

    let cmd = argv[0];
    let args = argv.slice(1);
    if (argv.length === 1 && typeof argv[0] === 'string') {
      cmd = '/bin/sh';
      args = ['-lc', argv[0]];
    }

    return await new Promise<UseComputerOutput>((resolve) => {
      const child = spawn(cmd, args, {
        cwd: input.cwd || process.cwd(),
        env: { ...process.env, ...(input.env || {}) },
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';
      let finished = false;

      const onFinish = (exitCode: number | null) => {
        if (finished) return;
        finished = true;
        resolve({ exitCode, stdout, stderr, durationMs: Date.now() - started });
      };

      if (input.stdin) {
        try { child.stdin.write(input.stdin); } catch {}
        try { child.stdin.end(); } catch {}
      }

      child.stdout?.on('data', (d) => { stdout += String(d); });
      child.stderr?.on('data', (d) => { stderr += String(d); });
      child.on('error', () => onFinish(-1));
      child.on('close', (code) => onFinish(code));

      const to = setTimeout(() => {
        try { child.kill('SIGKILL'); } catch {}
        onFinish(null);
      }, input.timeoutMs ?? 60_000);

      child.on('close', () => { try { clearTimeout(to); } catch {} });
    });
}

export const useComputerTool = factoryTool(
  'useComputerTool',
  runUseComputer,
  {
    description: 'Internal Bitcode Read-measurement computer-use primitive; execute a bounded shell command and capture stdio.',
    parameters: UseComputerInputSchema,
    prompt: USE_COMPUTER_DOC_CODE_TOOL_PROMPT
  }
);

attachDocCodeToolPrompt(useComputerTool, USE_COMPUTER_DOC_CODE_TOOL_PROMPT);
