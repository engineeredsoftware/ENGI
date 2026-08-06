const STACK_HINT_ALIASES = {
  ts: 'typescript',
  tsx: 'typescript',
  typescript: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  javascript: 'javascript',
  py: 'python',
  python: 'python',
  rs: 'rust',
  rust: 'rust',
  yml: 'yaml',
  yaml: 'yaml',
  tf: 'terraform',
  terraform: 'terraform',
  hcl: 'hcl',
  k8s: 'kubernetes',
  kubernetes: 'kubernetes',
  helm: 'helm',
  'github-actions': 'github-actions',
  'github actions': 'github-actions',
  cargo: 'cargo',
  md: 'markdown',
  markdown: 'markdown',
  nodejs: 'node',
  node: 'node',
  'next.js': 'nextjs',
  nextjs: 'nextjs',
  reactjs: 'react',
  react: 'react',
};

const LANGUAGE_BY_HINT = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  rust: 'Rust',
  yaml: 'YAML',
  hcl: 'HCL',
};

const TECHNOLOGY_BY_HINT = {
  nextjs: 'NextJS',
  react: 'React',
  kubernetes: 'Kubernetes',
  helm: 'Helm',
  terraform: 'Terraform',
  'github-actions': 'GitHubActions',
  cargo: 'Cargo',
};

const BRAND_BY_TECHNOLOGY = {
  NextJS: 'Vercel',
  React: 'Meta',
  Kubernetes: 'CNCF',
  Helm: 'CNCF',
  Terraform: 'Hashicorp',
  GitHubActions: 'GitHub',
  Cargo: 'RustFoundation',
};

function canonicalizeHintToken(value) {
  const normalized = value.trim().toLowerCase().replace(/[\s_]+/g, '-');
  return STACK_HINT_ALIASES[normalized] || normalized || undefined;
}

function pushSignalHint(target, value) {
  if (!value) return;
  const normalized = canonicalizeHintToken(value);
  if (normalized) target.add(normalized);
}

function isHelmChartPath(lowerPath) {
  return lowerPath.includes('charts/') || lowerPath.includes('helm');
}

export function inferTechnologySignals(input = {}) {
  const hints = new Set();

  for (const value of input.stackHints || []) pushSignalHint(hints, value);
  for (const value of input.symbols || []) pushSignalHint(hints, value);

  for (const configKey of input.configKeys || []) {
    pushSignalHint(hints, configKey);
    const lowerKey = configKey.toLowerCase();
    if (lowerKey.startsWith('auth.')) hints.add('auth');
    if (lowerKey.includes('jwt') || lowerKey.includes('jwks')) hints.add('jwt');
    if (lowerKey.includes('terraform')) hints.add('terraform');
    if (lowerKey.includes('kubernetes')) hints.add('kubernetes');
  }

  for (const touchedPath of input.touchedPaths || []) {
    const lowerPath = touchedPath.toLowerCase();
    if (lowerPath.endsWith('.ts') || lowerPath.endsWith('.tsx')) hints.add('typescript');
    if (lowerPath.endsWith('.js') || lowerPath.endsWith('.jsx')) hints.add('javascript');
    if (lowerPath.endsWith('.py')) hints.add('python');
    if (lowerPath.endsWith('.rs')) hints.add('rust');
    if (lowerPath.endsWith('.tf')) {
      hints.add('terraform');
      hints.add('hcl');
    }
    if (lowerPath.endsWith('.yml') || lowerPath.endsWith('.yaml')) hints.add('yaml');
    if (lowerPath.endsWith('.md')) hints.add('markdown');
    if (lowerPath.includes('.github/workflows/')) {
      hints.add('github-actions');
      hints.add('yaml');
    }
    if (lowerPath.endsWith('cargo.toml') || lowerPath.endsWith('cargo.lock')) {
      hints.add('cargo');
      hints.add('rust');
    }
    if (isHelmChartPath(lowerPath)) {
      hints.add('helm');
      hints.add('kubernetes');
    }
    if (lowerPath.includes('k8s') || lowerPath.includes('kubernetes')) hints.add('kubernetes');
    if (
      lowerPath.endsWith('next.config.js') ||
      lowerPath.endsWith('next.config.mjs') ||
      lowerPath.endsWith('next.config.ts')
    ) {
      hints.add('nextjs');
      hints.add('typescript');
    }
  }

  const stackHints = [...hints];
  const languages = stackHints.map((hint) => LANGUAGE_BY_HINT[hint]).filter(Boolean);
  const technologies = stackHints.map((hint) => TECHNOLOGY_BY_HINT[hint]).filter(Boolean);
  const brands = technologies.map((technology) => BRAND_BY_TECHNOLOGY[technology]).filter(Boolean);

  return {
    stackHints,
    languages: [...new Set(languages)],
    technologies: [...new Set(technologies)],
    brands: [...new Set(brands)],
  };
}
