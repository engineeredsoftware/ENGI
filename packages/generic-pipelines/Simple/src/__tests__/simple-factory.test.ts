import { factorySimplePipeline } from '../index';

describe('factorySimplePipeline', () => {
  it('runs stages in order and returns the last stage output', async () => {
    const seen: string[] = [];
    const pipeline = factorySimplePipeline('simple-order', {
      stages: [
        {
          id: 'a',
          run: async (input: number) => {
            seen.push('a');
            return input + 1;
          },
        },
        {
          id: 'b',
          run: async (input: number) => {
            seen.push('b');
            return input * 10;
          },
        },
      ],
    });

    const children = new Map();
    const execution: any = {
      id: 'root',
      children,
      parent: null,
      store: jest.fn(),
      get: jest.fn(),
      child(id: string) {
        if (!children.has(id)) {
          const c = {
            id,
            children: new Map(),
            parent: execution,
            store: jest.fn(),
            get: jest.fn(),
            child(this: any, cid: string) {
              return this;
            },
          };
          children.set(id, c);
        }
        return children.get(id);
      },
    };

    const out = await pipeline(3, execution);
    expect(seen).toEqual(['a', 'b']);
    expect(out).toBe(40);
  });

  it('requires at least one stage', () => {
    expect(() =>
      factorySimplePipeline('empty', { stages: [] }),
    ).toThrow(/at least one stage/);
  });
});
