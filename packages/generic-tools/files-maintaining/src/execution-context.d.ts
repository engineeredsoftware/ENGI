import type { Execution } from '@bitcode/execution-generics';
declare class ExecutionContextStore {
    private contexts;
    private currentKey;
    run<R>(execution: Execution, fn: () => R | Promise<R>): R | Promise<R>;
    getStore(): Execution | undefined;
}
export declare const executionContext: ExecutionContextStore;
export {};
