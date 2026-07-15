/**
 * Hierarchy-aware @bitcode/* → packages/* entry map for Jest.
 * Nested packages (e.g. generic-artifacts-aws → generic-artifacts/aws-provider) resolve correctly.
 */
const path = require('path');
const fs = require('fs');

function buildPackageMap(packagesRoot) {
  const map = {};

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name.startsWith('.')) {
        continue;
      }
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
        continue;
      }
      if (ent.name !== 'package.json') continue;

      let pkg;
      try {
        pkg = JSON.parse(fs.readFileSync(full, 'utf8'));
      } catch {
        continue;
      }
      const name = pkg.name;
      if (!name || (!name.startsWith('@bitcode/') && name !== 'eslint-plugin-bitcode')) {
        continue;
      }

      let main = pkg.main || 'src/index.ts';
      if (pkg.exports && typeof pkg.exports === 'object') {
        const exp = pkg.exports['.'] ?? pkg.exports;
        if (typeof exp === 'string') {
          main = exp;
        } else if (exp && typeof exp === 'object') {
          main = exp.default || exp.import || exp.require || main;
        }
      }

      let entry = path.join(path.dirname(full), main);
      if (!fs.existsSync(entry) && entry.endsWith('.js')) {
        const ts = entry.replace(/\.js$/, '.ts');
        if (fs.existsSync(ts)) entry = ts;
      }
      if (!fs.existsSync(entry)) {
        const fallback = path.join(path.dirname(full), 'src', 'index.ts');
        if (fs.existsSync(fallback)) entry = fallback;
        else continue;
      }

      const key = `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`;
      map[key] = entry;
    }
  }

  walk(packagesRoot);
  return map;
}

module.exports = { buildPackageMap };
