import {
  BRANDS,
  TECHNOLOGIES,
  PROGRAMMING_LANGUAGES,
  composeTechType,
} from '../tech';
import { inferTechnologySignals } from '../index';
import {
  getTechVersion,
  getUniqueTechIdentifier,
  parseUniqueTechIdentifier,
  type UniqueTech,
} from '../uniqueTech';

describe('@bitcode/tech-types', () => {
  it('exposes the core vocabulary used by read-measurement dependents', () => {
    expect(BRANDS).toContain('Vercel');
    expect(TECHNOLOGIES).toContain('NextJS');
    expect(PROGRAMMING_LANGUAGES).toContain('TypeScript');
    expect(composeTechType('Vercel', 'NextJS', 'TypeScript')).toBe('VercelNextJSTypeScript');
  });

  it('builds and parses curated unique technology identifiers', () => {
    const identifier: UniqueTech | undefined = getUniqueTechIdentifier(
      'Vercel',
      'NextJS',
      'TypeScript',
      '13.4.0'
    );

    expect(identifier).toBe('VercelNextJSTypeScript@13.4.0');
    expect(getTechVersion(identifier!)).toBe('13.4.0');
    expect(parseUniqueTechIdentifier(identifier!)).toEqual({
      umbrella: 'Vercel',
      tech: 'NextJS',
      language: 'TypeScript',
      version: '13.4.0',
    });
  });

  it('fails closed for tuples that are not in the curated catalogue', () => {
    expect(
      getUniqueTechIdentifier('Vercel', 'NextJS', 'TypeScript', '99.0.0')
    ).toBeUndefined();
  });

  it('normalizes repo and config signals into canonical Bitcode technology profile fields', () => {
    const profile = inferTechnologySignals({
      stackHints: ['typescript', 'auth', 'github-actions'],
      touchedPaths: [
        'src/routes/auth.ts',
        '.github/workflows/ci.yml',
        'infra/main.tf',
        'charts/api/values.yaml',
        'Cargo.toml',
      ],
      symbols: ['AuthValidator'],
      configKeys: ['auth.jwt.issuer'],
    });

    for (const hint of [
      'typescript',
      'github-actions',
      'terraform',
      'helm',
      'kubernetes',
      'cargo',
      'rust',
      'jwt',
      'auth',
    ]) {
      expect(profile.stackHints).toContain(hint);
    }

    for (const language of ['TypeScript', 'Rust', 'YAML', 'HCL']) {
      expect(profile.languages).toContain(language);
    }

    for (const technology of ['GitHubActions', 'Terraform', 'Helm', 'Kubernetes', 'Cargo']) {
      expect(profile.technologies).toContain(technology);
    }

    for (const brand of ['GitHub', 'Hashicorp', 'CNCF', 'RustFoundation']) {
      expect(profile.brands).toContain(brand);
    }
  });
});
