type BitcodeJestCallback = (...args: any[]) => any;

interface BitcodeJestTableFunction {
  (name: string, fn: BitcodeJestCallback, timeout?: number): void;
  each(table: readonly any[] | readonly any[][]): (
    name: string,
    fn: BitcodeJestCallback,
    timeout?: number
  ) => void;
  only(name: string, fn: BitcodeJestCallback, timeout?: number): void;
  skip(name: string, fn?: BitcodeJestCallback, timeout?: number): void;
}

interface BitcodeJestMatchers {
  not: BitcodeJestMatchers;
  resolves: BitcodeJestMatchers;
  rejects: BitcodeJestMatchers;
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toContain(expected: unknown): void;
  toContainEqual(expected: unknown): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toBeNull(): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeGreaterThan(expected: number): void;
  toBeGreaterThanOrEqual(expected: number): void;
  toBeLessThan(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
  toHaveBeenCalled(): void;
  toHaveBeenCalledTimes(expected: number): void;
  toHaveBeenCalledWith(...expected: unknown[]): void;
  toHaveLength(expected: number): void;
  toHaveProperty(path: string, value?: unknown): void;
  toMatch(expected: RegExp | string): void;
  toMatchObject(expected: unknown): void;
  toThrow(expected?: unknown): void;
  [matcher: string]: any;
}

interface BitcodeExpect {
  (actual: unknown): BitcodeJestMatchers;
  any(expected: unknown): any;
  anything(): any;
  arrayContaining(expected: unknown[]): any;
  objectContaining(expected: Record<string, unknown>): any;
  stringContaining(expected: string): any;
  stringMatching(expected: RegExp | string): any;
}

declare const describe: BitcodeJestTableFunction;
declare const it: BitcodeJestTableFunction;
declare const test: BitcodeJestTableFunction;
declare const beforeEach: (fn: BitcodeJestCallback, timeout?: number) => void;
declare const afterEach: (fn: BitcodeJestCallback, timeout?: number) => void;
declare const beforeAll: (fn: BitcodeJestCallback, timeout?: number) => void;
declare const afterAll: (fn: BitcodeJestCallback, timeout?: number) => void;
declare const expect: BitcodeExpect;

declare namespace jest {
  type Mock<T extends BitcodeJestCallback = BitcodeJestCallback> = T & {
    mock: { calls: any[][]; results: any[] };
    mockClear(): Mock<T>;
    mockReset(): Mock<T>;
    mockRestore(): Mock<T>;
    mockImplementation(fn: T): Mock<T>;
    mockImplementationOnce(fn: T): Mock<T>;
    mockResolvedValue(value: unknown): Mock<T>;
    mockResolvedValueOnce(value: unknown): Mock<T>;
    mockRejectedValue(value: unknown): Mock<T>;
    mockRejectedValueOnce(value: unknown): Mock<T>;
    mockReturnValue(value: unknown): Mock<T>;
    mockReturnValueOnce(value: unknown): Mock<T>;
  };

  type MockedFunction<T extends BitcodeJestCallback> = Mock<T>;
  type Mocked<T> = { [K in keyof T]: T[K] extends BitcodeJestCallback ? Mock<T[K]> : T[K] };
}

declare const jest: {
  fn<T extends BitcodeJestCallback = BitcodeJestCallback>(implementation?: T): jest.Mock<T>;
  mock(moduleName: string, factory?: () => unknown, options?: unknown): void;
  unmock(moduleName: string): void;
  requireMock<T = any>(moduleName: string): T;
  requireActual<T = unknown>(moduleName: string): T;
  clearAllMocks(): void;
  clearAllTimers(): void;
  runOnlyPendingTimers(): void;
  resetAllMocks(): void;
  restoreAllMocks(): void;
  useFakeTimers(): void;
  useRealTimers(): void;
  spyOn<T extends object, K extends keyof T>(object: T, method: K): jest.Mock;
};
