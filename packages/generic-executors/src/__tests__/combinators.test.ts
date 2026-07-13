import { sequential, parallel, identity } from '../index';
import { Execution } from '@bitcode/execution-generics/Execution';

describe('generic-executors combinators', () => {
  it('sequential pipes results through children', async () => {
    const add1 = async (n: number) => n + 1;
    const double = async (n: number) => n * 2;
    const run = sequential(add1, double);
    const execution = new Execution('test-seq');
    await expect(run(3, execution)).resolves.toBe(8);
    expect(execution.children.size).toBe(2);
  });

  it('parallel fans out and returns ordered results', async () => {
    const run = parallel(
      async (n: number) => n + 1,
      async (n: number) => n * 10,
    );
    const execution = new Execution('test-par');
    await expect(run(2, execution)).resolves.toEqual([3, 20]);
  });

  it('identity passes through', async () => {
    const execution = new Execution('test-id');
    await expect(identity<string>()('x', execution)).resolves.toBe('x');
  });
});
