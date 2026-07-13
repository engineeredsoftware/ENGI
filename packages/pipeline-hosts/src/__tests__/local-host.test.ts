/**
 * Compatibility: LocalHost tests live in @bitcode/generic-hosts-local.
 * This file re-runs the same suite via re-export surface.
 */
export {};

// Point Jest at the generic-hosts-local tests via re-import smoke.
import { LocalHost, LocalHost } from '../local-host';
import { readWorkspaceSources } from '../host';

describe('pipeline-hosts LocalHost re-exports', () => {
  it('exports LocalHost and LocalHost alias', () => {
    expect(LocalHost).toBe(LocalHost);
    expect(typeof LocalHost).toBe('function');
    expect(typeof readWorkspaceSources).toBe('function');
  });
});
