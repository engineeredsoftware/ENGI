/**
 * Sandbox host composition surface for @bitcode/pipeline-hosts.
 * Source of truth: @bitcode/host-generics (+ Vercel surface where re-exported).
 */
export {
  SandboxHost,
  VercelSandboxHost,
  AwsSandboxHost,
  type VercelSandboxHostOptions,
  type AwsSandboxHostOptions,
} from '@bitcode/host-generics';
