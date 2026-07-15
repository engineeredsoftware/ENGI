/**
 * Custom Jest resolver for hierarchy package names.
 * Maps @bitcode/* workspace packages (including nested hierarchy names like
 * @bitcode/generic-artifacts-aws-provider) and subpaths
 * (e.g. @bitcode/generic-llms-models/src/pricing) onto packages/* sources.
 */
const path = require('path');
const fs = require('fs');
const { buildPackageMap } = require('./jest.package-map.cjs');

const packagesRoot = path.join(__dirname, 'packages');
const packageMap = buildPackageMap(packagesRoot); // regex key -> absolute entry

/** @type {Record<string, string>} package name -> package directory */
const nameToDir = {};
for (const [key, entry] of Object.entries(packageMap)) {
  const name = key.slice(1, -1).replace(/\\(.)/g, '$1');
  let d = path.dirname(entry);
  while (d !== path.dirname(d)) {
    if (fs.existsSync(path.join(d, 'package.json'))) {
      nameToDir[name] = d;
      break;
    }
    d = path.dirname(d);
  }
}

function resolveBitcode(request) {
  if (!request.startsWith('@bitcode/')) return null;

  const exactKey = `^${request.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`;
  if (packageMap[exactKey] && fs.existsSync(packageMap[exactKey])) {
    return packageMap[exactKey];
  }

  const rest = request.slice('@bitcode/'.length);
  let bestShort = null;
  for (const name of Object.keys(nameToDir)) {
    const short = name.startsWith('@bitcode/') ? name.slice('@bitcode/'.length) : name;
    if (rest === short || rest.startsWith(short + '/')) {
      if (!bestShort || short.length > bestShort.length) bestShort = short;
    }
  }
  if (!bestShort) return null;

  const pkgName = `@bitcode/${bestShort}`;
  const pkgDir = nameToDir[pkgName];
  if (!pkgDir) return null;

  const sub = rest.slice(bestShort.length).replace(/^\//, '');
  if (!sub) {
    const exact = packageMap[`^${pkgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`];
    return exact && fs.existsSync(exact) ? exact : null;
  }

  const stripped = sub.replace(/^src\//, '');
  const candidates = [
    path.join(pkgDir, sub),
    path.join(pkgDir, `${sub}.ts`),
    path.join(pkgDir, `${sub}.tsx`),
    path.join(pkgDir, `${sub}.js`),
    path.join(pkgDir, sub, 'index.ts'),
    path.join(pkgDir, sub, 'index.js'),
    path.join(pkgDir, 'src', stripped),
    path.join(pkgDir, 'src', `${stripped}.ts`),
    path.join(pkgDir, 'src', `${stripped}.tsx`),
    path.join(pkgDir, 'src', `${stripped}.js`),
    path.join(pkgDir, 'src', stripped, 'index.ts'),
    path.join(pkgDir, 'src', stripped, 'index.js'),
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    } catch {
      /* ignore */
    }
  }
  return null;
}

module.exports = (request, options) => {
  const resolved = resolveBitcode(request);
  if (resolved) return resolved;
  return options.defaultResolver(request, options);
};
