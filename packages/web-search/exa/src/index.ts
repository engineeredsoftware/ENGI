/**
 * @bitcode/web-search-exa — Exa.ai search provider.
 * Wire API key via EXA_API_KEY. Orchestration: @bitcode/web-search (multi).
 */
import { log } from '@bitcode/logger';

export interface ExaSearchOptions {
  numResults?: number;
  type?: 'neural' | 'keyword' | 'auto';
  includeDomains?: string[];
  excludeDomains?: string[];
}

export interface ExaSearchResult {
  title: string;
  url: string;
  text?: string;
  score?: number;
}

export class ExaSearchClient {
  constructor(private readonly apiKey = process.env.EXA_API_KEY) {
    if (!this.apiKey) log('ExaSearchClient: EXA_API_KEY not set', 'warn');
  }

  async search(query: string, options: ExaSearchOptions = {}): Promise<ExaSearchResult[]> {
    if (!this.apiKey) throw new Error('EXA_API_KEY is required for Exa search');
    const res = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify({
        query,
        numResults: options.numResults ?? 10,
        type: options.type ?? 'auto',
        includeDomains: options.includeDomains,
        excludeDomains: options.excludeDomains,
        contents: { text: true },
      }),
    });
    if (!res.ok) throw new Error(`Exa search failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as { results?: Array<Record<string, any>> };
    return (data.results ?? []).map((r) => ({
      title: String(r.title ?? ''),
      url: String(r.url ?? ''),
      text: r.text ? String(r.text) : undefined,
      score: typeof r.score === 'number' ? r.score : undefined,
    }));
  }
}

export function getExaClient(): ExaSearchClient {
  return new ExaSearchClient();
}
