/**
 * Era-pin for proofs superseded by the V48 legacy terminal browser-proof eradication.
 *
 * V48 Gate 3 eradicated the legacy `/terminal` cockpit browser proof — the
 * `terminal-ux-browser-proof.ts` contract, its jest test, and the
 * `commercial-mvp.terminal-ux.spec.ts` Playwright spec — and repointed the
 * active browser-proof contracts at the current product surfaces (`/deposits`,
 * `/reads`). The V39/V40 canonical proofs that read those terminal-ux files as
 * evidence therefore attest a superseded era.
 *
 * Meta law (`BITCODE_SPECIFYING.md` §4.3 / §13.1): **old version checks never
 * change**; frozen historical proofs attest **canon at that time** and are NOT
 * re-pointed. Era-pin: a superseded proof imports `test` from here instead of
 * `node:test`, and every test is skipped WITH A REASON once the terminal-ux
 * browser proof is gone. On a tree that still holds those files, `SUPERSEDED`
 * is false and the proofs run unchanged.
 */

import nodeTest from 'node:test';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * True once the legacy terminal-ux browser proof has been eradicated.
 * Detect via the deleted Terminal path (current product browser proofs live
 * under deposits/reads and must not un-pin historical V39/V40 Terminal proofs).
 */
export const SUPERSEDED = !existsSync(
  path.join(REPO_ROOT, 'uapi/app/terminal/terminal-ux-browser-proof.ts'),
);

const SKIP_REASON =
  'era-pinned: superseded by V48 Gate 3 legacy terminal browser-proof eradication (repointed to /deposits, /reads)';

function eraPinnedTest(name, options, fn) {
  if (!SUPERSEDED) return nodeTest(name, options, fn);
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }
  return nodeTest(name, { ...(options || {}), skip: SKIP_REASON }, fn || (() => {}));
}

export default eraPinnedTest;
export { eraPinnedTest as test };
