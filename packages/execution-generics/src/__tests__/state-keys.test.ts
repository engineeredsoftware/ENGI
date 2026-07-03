/**
 * Pins for the keys-only execution-state projection used by the
 * PrepareConciseContext selection contract:
 * - walkExecutionStateKeys renders child segments -> namespaces -> key names
 *   and NEVER includes a stored value
 * - empty subtrees are omitted
 * - resolveExecutionStateKeyPath reads exactly one value back via the stable
 *   '<execution-path>#<namespace>:<key>' path (with or without the root
 *   segment), including namespaces that themselves contain ':'
 * - misses are fail-soft ({ found: false }), never throws
 */
import { Execution, createExecution } from '../Execution';
import {
  walkExecutionStateKeys,
  resolveExecutionStateKeyPath,
  formatExecutionStateKeyPath,
} from '../state-keys';

function buildTree(): Execution {
  const root = createExecution('pipeline-root');
  root.store('repository', 'owner', 'acme');
  root.store('repository', 'name', 'repo');
  root.store('pipeline', 'input', { definitionOfRead: 'SECRET-ROOT-VALUE' });

  const seq0 = root.child('seq-0');
  seq0.store('preprocess', 'inventory', ['a.ts', 'b.ts']);

  const seq1 = root.child('seq-1');
  const agent = seq1.child('agent:discovery');
  agent.store('discovery', 'comprehension', 'SECRET-AGENT-VALUE');
  agent.store('agent:discovery', 'start', { step: 'Plan' });

  // Empty subtree: no stores anywhere below.
  root.child('seq-2');

  return root;
}

describe('walkExecutionStateKeys', () => {
  it('renders namespaces as key arrays and children as nested trees', () => {
    const root = buildTree();
    const tree = walkExecutionStateKeys(root) as any;

    expect(tree.repository).toEqual(['owner', 'name']);
    expect(tree.pipeline).toEqual(['input']);
    expect(tree['seq-0']).toEqual({ preprocess: ['inventory'] });
    expect(tree['seq-1']['agent:discovery'].discovery).toEqual(['comprehension']);
    expect(tree['seq-1']['agent:discovery']['agent:discovery']).toEqual(['start']);
  });

  it('NEVER includes stored values in the rendered tree', () => {
    const root = buildTree();
    const rendered = JSON.stringify(walkExecutionStateKeys(root));

    expect(rendered).not.toContain('SECRET-ROOT-VALUE');
    expect(rendered).not.toContain('SECRET-AGENT-VALUE');
    expect(rendered).not.toContain('acme');
    expect(rendered).not.toContain('a.ts');
  });

  it('omits empty subtrees', () => {
    const root = buildTree();
    const tree = walkExecutionStateKeys(root) as any;
    expect(tree['seq-2']).toBeUndefined();
  });
});

describe('resolveExecutionStateKeyPath', () => {
  it('resolves root-namespace keys with and without the root segment', () => {
    const root = buildTree();

    expect(resolveExecutionStateKeyPath(root, 'pipeline-root#repository:owner')).toEqual({
      found: true,
      value: 'acme',
    });
    expect(resolveExecutionStateKeyPath(root, '#repository:owner')).toEqual({
      found: true,
      value: 'acme',
    });
  });

  it('resolves deep keys, including namespaces that contain a colon', () => {
    const root = buildTree();

    const deep = resolveExecutionStateKeyPath(
      root,
      'pipeline-root/seq-1/agent:discovery#discovery:comprehension'
    );
    expect(deep).toEqual({ found: true, value: 'SECRET-AGENT-VALUE' });

    const colonNamespace = resolveExecutionStateKeyPath(
      root,
      'pipeline-root/seq-1/agent:discovery#agent:discovery:start'
    );
    expect(colonNamespace.found).toBe(true);
    expect(colonNamespace.value).toEqual({ step: 'Plan' });
  });

  it('round-trips formatExecutionStateKeyPath', () => {
    const root = buildTree();
    const path = formatExecutionStateKeyPath(['pipeline-root', 'seq-0'], 'preprocess', 'inventory');
    expect(path).toBe('pipeline-root/seq-0#preprocess:inventory');
    expect(resolveExecutionStateKeyPath(root, path)).toEqual({
      found: true,
      value: ['a.ts', 'b.ts'],
    });
  });

  it('is fail-soft on every miss shape', () => {
    const root = buildTree();

    expect(resolveExecutionStateKeyPath(root, 'no-hash-at-all')).toEqual({ found: false });
    expect(resolveExecutionStateKeyPath(root, 'pipeline-root/absent-child#ns:key')).toEqual({
      found: false,
    });
    expect(resolveExecutionStateKeyPath(root, 'pipeline-root#absent-namespace:key')).toEqual({
      found: false,
    });
    expect(resolveExecutionStateKeyPath(root, 'pipeline-root#repository:absent-key')).toEqual({
      found: false,
    });
    expect(resolveExecutionStateKeyPath(root, undefined as any)).toEqual({ found: false });
  });
});
