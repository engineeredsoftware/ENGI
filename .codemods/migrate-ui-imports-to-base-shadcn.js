/**
 * Codemod: migrate imports from `@/components/ui/<mod>` to `@/components/shadcn/<mod>`
 *
 * Temporary script — lives under repo-root `.codemods/` (see .codemods/README.md).
 *
 * Usage (dry run):
 *   npx jscodeshift -d -p -t .codemods/migrate-ui-imports-to-base-shadcn.js \
 *     'apps/uapi/app/**/*.tsx' 'apps/uapi/components/**/*.tsx'
 *
 * Apply changes:
 *   npx jscodeshift -t .codemods/migrate-ui-imports-to-base-shadcn.js \
 *     'apps/uapi/app/**/*.tsx' 'apps/uapi/components/**/*.tsx'
 */

export default function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const didChange = root.find(j.ImportDeclaration)
    .filter(path => {
      const v = path.value.source.value;
      return typeof v === 'string' && v.startsWith('@/components/ui/');
    })
    .forEach(path => {
      const oldSource = path.value.source.value;
      // Straight map: ui/<mod> -> base/shadcn/<mod>
      const mapped = oldSource.replace('@/components/ui/', '@/components/shadcn/');
      path.value.source = j.literal(mapped);
    })
    .size() > 0;

  return didChange ? root.toSource() : null;
}
