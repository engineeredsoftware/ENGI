/**
 * Load checked-in measure fixtures as path+content bodies for host tests.
 */
import * as fs from 'fs';
import * as path from 'path';

export type FixtureBody = { path: string; content: string };

const FIXTURE_ROOT = path.join(__dirname, 'measure-fixtures');

/** Recursively list files under a fixture directory (relative paths with /). */
export function listFixtureFiles(fixtureName: string): string[] {
  const root = path.join(FIXTURE_ROOT, fixtureName);
  const out: string[] = [];
  function walk(dir: string, rel: string) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name.startsWith('.')) continue;
      const abs = path.join(dir, ent.name);
      const r = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.isDirectory()) walk(abs, r);
      else out.push(r.replace(/\\/g, '/'));
    }
  }
  walk(root, '');
  return out.sort();
}

/** Load all file bodies for a named fixture under measure-fixtures/. */
export function loadMeasureFixture(fixtureName: string): FixtureBody[] {
  const root = path.join(FIXTURE_ROOT, fixtureName);
  return listFixtureFiles(fixtureName).map((rel) => ({
    path: rel,
    content: fs.readFileSync(path.join(root, rel), 'utf8'),
  }));
}
