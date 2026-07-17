/**
 * Pure Depository search query planning.
 *
 * Shared by deposit relevants search and read Need-fit search. Prefer
 * human Need / demand language over path basenames so lexical+vector
 * channels target settled AssetPack semantics, not file names alone.
 */

const STOPWORDS = new Set(
  [
    'a',
    'an',
    'the',
    'and',
    'or',
    'but',
    'for',
    'with',
    'from',
    'into',
    'onto',
    'this',
    'that',
    'these',
    'those',
    'should',
    'would',
    'could',
    'must',
    'need',
    'needs',
    'want',
    'wants',
    'please',
    'using',
    'use',
    'via',
    'when',
    'where',
    'which',
    'what',
    'how',
    'our',
    'your',
    'their',
    'have',
    'has',
    'been',
    'will',
    'into',
    'about',
    'over',
    'under',
    'than',
    'then',
    'also',
    'just',
    'only',
    'more',
    'most',
    'such',
    'into',
  ].map((s) => s.toLowerCase()),
);

export type DepositorySearchProduct = 'read-need-fits' | 'deposit-relevants';

export type BuildDepositorySearchQueryPlanInput = {
  /** Explicit model or caller terms (preferred first). */
  queryTerms?: string[] | null;
  /** Free-text Need (read) or demand framing (deposit). */
  needText?: string | null;
  /** Alternate Need / expressed read string. */
  expressedRead?: string | null;
  repositoryFullName?: string | null;
  /** sourceCheckoutCatalog paths — secondary anchors only. */
  paths?: string[] | null;
  product?: DepositorySearchProduct;
  maxTerms?: number;
};

function asTerms(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .map((t) => (typeof t === 'string' ? t.trim() : ''))
        .filter((t) => t.length > 0),
    ),
  ];
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extract a single primary phrase from Need text (capped) for vector+lexical.
 * Keeping the phrase whole is critical for Reading — token-only plans lose intent.
 */
export function extractNeedPrimaryPhrase(
  needText: string | null | undefined,
  maxLen = 160,
): string | null {
  const raw = normalizeWhitespace(String(needText || ''));
  if (!raw) return null;
  if (raw.length <= maxLen) return raw;
  return `${raw.slice(0, maxLen).trimEnd()}…`;
}

/** Tokenize for secondary terms; drop stopwords and ultra-short noise. */
export function tokenizeSearchTerms(blob: string, max = 12): string[] {
  const parts = normalizeWhitespace(blob)
    .split(/[^\p{L}\p{N}_./+-]+/u)
    .map((t) => t.trim())
    .filter((t) => t.length > 3 && !STOPWORDS.has(t.toLowerCase()));
  return [...new Set(parts)].slice(0, max);
}

function pathBasenameTerms(paths: string[] | null | undefined, max: number): string[] {
  if (!Array.isArray(paths) || max <= 0) return [];
  const out: string[] = [];
  for (const p of paths.slice(0, 16)) {
    const base = String(p).split('/').filter(Boolean).pop();
    if (!base || base.startsWith('.')) continue;
    const stem = base.replace(/\.[^.]+$/, '');
    if (stem.length > 2 && !STOPWORDS.has(stem.toLowerCase())) out.push(stem);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Build ordered query terms for Depository search.
 * Order: explicit terms → Need phrase → Need tokens → repo slug → path stems
 * (path stems capped lower for read-need-fits so Need language dominates).
 */
export function buildDepositorySearchQueryPlan(
  input: BuildDepositorySearchQueryPlanInput,
): string[] {
  const maxTerms = Math.max(3, Math.min(24, Number(input.maxTerms) || 12));
  const product = input.product || 'deposit-relevants';
  const ordered: string[] = [];
  const seen = new Set<string>();

  const push = (term: string | null | undefined) => {
    const t = normalizeWhitespace(String(term || ''));
    if (!t || t.length < 2) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(t);
  };

  for (const t of asTerms(input.queryTerms)) push(t);

  const needBlob = normalizeWhitespace(
    [input.needText, input.expressedRead].filter(Boolean).join(' '),
  );
  const primary = extractNeedPrimaryPhrase(needBlob);
  if (primary) push(primary);
  for (const t of tokenizeSearchTerms(needBlob, 10)) push(t);

  const fullName = input.repositoryFullName?.trim();
  if (fullName) {
    push(fullName.split('/').pop() || fullName);
  }

  // Read Need-fits: at most 3 path stems. Deposit relevants: more structure OK.
  const pathBudget = product === 'read-need-fits' ? 3 : 8;
  for (const t of pathBasenameTerms(input.paths, pathBudget)) push(t);

  if (product === 'read-need-fits') {
    push('need-fit');
    push('source-safe-asset-pack');
  } else {
    push('source-safe-asset-pack');
  }

  return ordered.slice(0, maxTerms);
}
