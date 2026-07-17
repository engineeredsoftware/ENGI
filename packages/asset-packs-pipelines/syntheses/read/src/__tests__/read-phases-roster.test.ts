/**
 * Read SDIVF roster mirrors deposit shape (one key per agent, Need not Obfuscations).
 */

import { readPhases } from '../phases/read-phases';

describe('readPhases roster', () => {
  it('exports setup/discovery/implementation/validation/finish', () => {
    expect(typeof readPhases.setup).toBe('function');
    expect(typeof readPhases.discovery).toBe('function');
    expect(typeof readPhases.implementation).toBe('function');
    expect(typeof readPhases.validation).toBe('function');
    expect(typeof readPhases.finish).toBe('function');
  });
});
