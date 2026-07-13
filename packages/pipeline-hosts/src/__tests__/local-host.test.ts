/**
 * Compatibility: LocalHost tests live in @bitcode/generic-hosts-local.
 * This file re-runs the same suite via re-export surface.
 */
export {};

// Point Jest at the generic-hosts-local tests via re-import smoke.
import { LocalHost, InlineHost } from '../local-host';
import { readWorkspaceSources } from '../host';

describe('pipeline-hosts LocalHost re-exports', () => {
  it('exports LocalHost and InlineHost alias', () => {
    expect(LocalHost).toBe(InlineHost);
    expect(typeof LocalHost).toBe('function');
    expect(typeof readWorkspaceSources).toBe('function');
  });
});
