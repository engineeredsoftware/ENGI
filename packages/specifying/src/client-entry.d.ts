export type BitcodeDemonstrationShellSnapshot = Record<string, any>;

export type BitcodeDemonstrationShellControlSet = Record<
  string,
  ((...args: any[]) => unknown | Promise<unknown>) | undefined
>;

export function mountBitcodeDemonstrationShell(): Promise<(() => void) | undefined>;

export function readBitcodeDemonstrationShellSnapshot(): Promise<BitcodeDemonstrationShellSnapshot | null>;

export function readBitcodeDemonstrationShellControls(): Promise<BitcodeDemonstrationShellControlSet | null>;
