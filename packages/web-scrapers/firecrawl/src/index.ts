/**
 * @bitcode/web-scrapers-firecrawl
 *
 * Firecrawl scrape/crawl/search client (packages/web-scrapers/firecrawl).
 * BC: @bitcode/firecrawl re-exports this package.
 */

import FirecrawlApp from '@mendable/firecrawl-js';
import { log } from '@bitcode/logger';

// ---------------------------------------------------------------------------
// Types and Interfaces
// ---------------------------------------------------------------------------

export interface FirecrawlConfig {
  apiKey?: string;
  baseUrl?: string;
}

export interface FirecrawlScrapeOptions {
  formats?: ('markdown' | 'html' | 'screenshot' | 'links')[];
  timeout?: number;
  waitFor?: number;
  headers?: Record<string, string>;
  includeTags?: string[];
  excludeTags?: string[];
  onlyMainContent?: boolean;
}

export interface FirecrawlCrawlOptions {
  limit?: number;
  allowedDomains?: string[];
  blockedDomains?: string[];
  allowSubdomains?: boolean;
  followSitemap?: boolean;
  ignoreSitemap?: boolean;
  maxDepth?: number;
  mode?: 'default' | 'fast';
  scrapeOptions?: FirecrawlScrapeOptions;
}

export interface FirecrawlSearchOptions {
  limit?: number;
  tbs?: string; // time-based search parameter
  filter?: string;
  lang?: string;
  country?: string;
  location?: string;
  scrapeOptions?: FirecrawlScrapeOptions;
}

export interface FirecrawlMapOptions {
  includeSubdomains?: boolean;
  search?: string;
  ignoreSitemap?: boolean;
  includeMetadata?: boolean;
  limit?: number;
}

export interface FirecrawlExtractOptions {
  prompt?: string;
  schema?: Record<string, any>;
  systemPrompt?: string;
  enableCaching?: boolean;
}

export interface FirecrawlBatchOptions {
  formats?: ('markdown' | 'html' | 'screenshot' | 'links')[];
  headers?: Record<string, string>;
  includeTags?: string[];
  excludeTags?: string[];
  timeout?: number;
}

export interface FirecrawlJobStatus {
  success: boolean;
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  total?: number;
  completed?: number;
  expiresAt?: string;
  data?: FirecrawlPageData[];
  partial_data?: FirecrawlPageData[];
  error?: string;
}

export interface FirecrawlPageData {
  markdown?: string;
  html?: string;
  rawHtml?: string;
  screenshot?: string;
  links?: string[];
  metadata: {
    title?: string;
    description?: string;
    language?: string;
    keywords?: string;
    robots?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogUrl?: string;
    ogImage?: string;
    ogAudio?: string;
    ogVideo?: string;
    dctermsCreated?: string;
    dctermsType?: string;
    dctermsLanguage?: string;
    dctermsSubject?: string;
    dctermsRights?: string;
    pageStatusCode?: number;
    pageError?: string;
    sourceURL?: string;
  };
  llm_extraction?: Record<string, any>;
}

export interface FirecrawlResponse<T = FirecrawlPageData> {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
}

export interface FirecrawlCrawlResponse {
  success: boolean;
  id?: string;
  url?: string;
  data?: FirecrawlPageData[];
  error?: string;
  total?: number;
}

export interface FirecrawlBatchResponse {
  success: boolean;
  id?: string;
  data?: FirecrawlPageData[];
  error?: string;
  total?: number;
}

export interface FirecrawlSearchResponse {
  success: boolean;
  data?: FirecrawlPageData[];
  error?: string;
  total?: number;
}

export interface FirecrawlMapResponse {
  success: boolean;
  data?: {
    urls: string[];
    metadata?: Record<string, any>;
  };
  error?: string;
}

// ---------------------------------------------------------------------------
// Firecrawl Client Class
// ---------------------------------------------------------------------------

export class FirecrawlClient {
  private app: FirecrawlApp;
  private config: FirecrawlConfig;

  constructor(config: FirecrawlConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.FIRECRAWL_API_KEY,
      ...config
    };

    if (!this.config.apiKey) {
      throw new Error('Firecrawl API key is required. Set FIRECRAWL_API_KEY environment variable or pass apiKey in config.');
    }

    this.app = new FirecrawlApp({ 
      apiKey: this.config.apiKey,
      ...(this.config.baseUrl && { baseUrl: this.config.baseUrl })
    });

    log('Firecrawl client initialized', 'info', {
      hasApiKey: !!this.config.apiKey,
      baseUrl: this.config.baseUrl
    });
  }

  // ---------------------------------------------------------------------------
  // Single Page Scraping
  // ---------------------------------------------------------------------------

  async scrapeUrl(url: string, options: FirecrawlScrapeOptions = {}): Promise<FirecrawlResponse> {
    const startTime = Date.now();
    
    try {
      log('Starting Firecrawl scrape', 'info', {
        url,
        formats: options.formats || ['markdown'],
        timeout: options.timeout
      });

      const result = await this.app.scrapeUrl(url, {
        formats: options.formats || ['markdown'],
        ...(options.timeout && { timeout: options.timeout }),
        ...(options.waitFor && { waitFor: options.waitFor }),
        ...(options.headers && { headers: options.headers }),
        ...(options.includeTags && { includeTags: options.includeTags }),
        ...(options.excludeTags && { excludeTags: options.excludeTags }),
        ...(options.onlyMainContent && { onlyMainContent: options.onlyMainContent })
      });

      const duration = Date.now() - startTime;
      
      log('Firecrawl scrape completed', 'info', {
        url,
        success: result.success,
        duration,
        hasMarkdown: !!result.data?.markdown,
        markdownLength: result.data?.markdown?.length || 0
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      log('Firecrawl scrape failed', 'error', {
        url,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Website Crawling
  // ---------------------------------------------------------------------------

  async crawlUrl(url: string, options: FirecrawlCrawlOptions = {}): Promise<FirecrawlCrawlResponse> {
    const startTime = Date.now();
    
    try {
      log('Starting Firecrawl crawl', 'info', {
        url,
        limit: options.limit || 50,
        maxDepth: options.maxDepth,
        mode: options.mode || 'default'
      });

      const result = await this.app.crawlUrl(url, {
        limit: options.limit || 50,
        ...(options.allowedDomains && { allowedDomains: options.allowedDomains }),
        ...(options.blockedDomains && { blockedDomains: options.blockedDomains }),
        ...(options.allowSubdomains !== undefined && { allowSubdomains: options.allowSubdomains }),
        ...(options.followSitemap !== undefined && { followSitemap: options.followSitemap }),
        ...(options.ignoreSitemap !== undefined && { ignoreSitemap: options.ignoreSitemap }),
        ...(options.maxDepth && { maxDepth: options.maxDepth }),
        ...(options.mode && { mode: options.mode }),
        ...(options.scrapeOptions && { scrapeOptions: options.scrapeOptions })
      });

      const duration = Date.now() - startTime;
      
      log('Firecrawl crawl completed', 'info', {
        url,
        success: result.success,
        duration,
        totalPages: result.total || 0,
        pagesReturned: result.data?.length || 0
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      log('Firecrawl crawl failed', 'error', {
        url,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Asynchronous Crawling
  // ---------------------------------------------------------------------------

  async asyncCrawlUrl(url: string, options: FirecrawlCrawlOptions = {}): Promise<{ success: boolean; id: string; error?: string }> {
    try {
      log('Starting async Firecrawl crawl', 'info', {
        url,
        limit: options.limit || 50
      });

      const result = await this.app.asyncCrawlUrl(url, {
        limit: options.limit || 50,
        ...(options.allowedDomains && { allowedDomains: options.allowedDomains }),
        ...(options.blockedDomains && { blockedDomains: options.blockedDomains }),
        ...(options.allowSubdomains !== undefined && { allowSubdomains: options.allowSubdomains }),
        ...(options.followSitemap !== undefined && { followSitemap: options.followSitemap }),
        ...(options.ignoreSitemap !== undefined && { ignoreSitemap: options.ignoreSitemap }),
        ...(options.maxDepth && { maxDepth: options.maxDepth }),
        ...(options.mode && { mode: options.mode }),
        ...(options.scrapeOptions && { scrapeOptions: options.scrapeOptions })
      });

      log('Async Firecrawl crawl initiated', 'info', {
        url,
        success: result.success,
        jobId: result.id
      });

      return result;
    } catch (error) {
      log('Async Firecrawl crawl failed to start', 'error', {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  async checkCrawlStatus(jobId: string): Promise<FirecrawlJobStatus> {
    try {
      const result = await this.app.checkCrawlStatus(jobId);
      
      log('Crawl status checked', 'debug', {
        jobId,
        status: result.status,
        completed: result.completed,
        total: result.total
      });

      return result;
    } catch (error) {
      log('Failed to check crawl status', 'error', {
        jobId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  async cancelCrawl(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.app.cancelCrawl(jobId);
      
      log('Crawl cancelled', 'info', {
        jobId,
        success: result.success
      });

      return result;
    } catch (error) {
      log('Failed to cancel crawl', 'error', {
        jobId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Real-time Crawling with WebSockets
  // ---------------------------------------------------------------------------

  async crawlUrlAndWatch(
    url: string, 
    options: FirecrawlCrawlOptions = {}
  ): Promise<EventTarget> {
    try {
      log('Starting real-time Firecrawl crawl', 'info', {
        url,
        limit: options.limit || 50
      });

      const watcher = await this.app.crawlUrlAndWatch(url, {
        limit: options.limit || 50,
        ...(options.allowedDomains && { allowedDomains: options.allowedDomains }),
        ...(options.blockedDomains && { blockedDomains: options.blockedDomains }),
        ...(options.allowSubdomains !== undefined && { allowSubdomains: options.allowSubdomains }),
        ...(options.followSitemap !== undefined && { followSitemap: options.followSitemap }),
        ...(options.ignoreSitemap !== undefined && { ignoreSitemap: options.ignoreSitemap }),
        ...(options.maxDepth && { maxDepth: options.maxDepth }),
        ...(options.mode && { mode: options.mode }),
        ...(options.scrapeOptions && { scrapeOptions: options.scrapeOptions })
      });

      log('Real-time crawl watcher created', 'info', { url });

      return watcher;
    } catch (error) {
      log('Failed to start real-time crawl', 'error', {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Batch Scraping
  // ---------------------------------------------------------------------------

  async batchScrapeUrls(urls: string[], options: FirecrawlBatchOptions = {}): Promise<FirecrawlBatchResponse> {
    const startTime = Date.now();
    
    try {
      log('Starting Firecrawl batch scrape', 'info', {
        urlCount: urls.length,
        formats: options.formats || ['markdown']
      });

      const result = await this.app.batchScrapeUrls(urls, {
        formats: options.formats || ['markdown'],
        ...(options.headers && { headers: options.headers }),
        ...(options.includeTags && { includeTags: options.includeTags }),
        ...(options.excludeTags && { excludeTags: options.excludeTags }),
        ...(options.timeout && { timeout: options.timeout })
      });

      const duration = Date.now() - startTime;
      
      log('Firecrawl batch scrape completed', 'info', {
        urlCount: urls.length,
        success: result.success,
        duration,
        pagesReturned: result.data?.length || 0
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      log('Firecrawl batch scrape failed', 'error', {
        urlCount: urls.length,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  async asyncBatchScrapeUrls(urls: string[], options: FirecrawlBatchOptions = {}): Promise<{ success: boolean; id: string; error?: string }> {
    try {
      log('Starting async Firecrawl batch scrape', 'info', {
        urlCount: urls.length,
        formats: options.formats || ['markdown']
      });

      const result = await this.app.asyncBatchScrapeUrls(urls, {
        formats: options.formats || ['markdown'],
        ...(options.headers && { headers: options.headers }),
        ...(options.includeTags && { includeTags: options.includeTags }),
        ...(options.excludeTags && { excludeTags: options.excludeTags }),
        ...(options.timeout && { timeout: options.timeout })
      });

      log('Async Firecrawl batch scrape initiated', 'info', {
        urlCount: urls.length,
        success: result.success,
        jobId: result.id
      });

      return result;
    } catch (error) {
      log('Async Firecrawl batch scrape failed to start', 'error', {
        urlCount: urls.length,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  async checkBatchScrapeStatus(jobId: string): Promise<FirecrawlJobStatus> {
    try {
      const result = await this.app.checkBatchScrapeStatus(jobId);
      
      log('Batch scrape status checked', 'debug', {
        jobId,
        status: result.status,
        completed: result.completed,
        total: result.total
      });

      return result;
    } catch (error) {
      log('Failed to check batch scrape status', 'error', {
        jobId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Website Mapping
  // ---------------------------------------------------------------------------

  async mapUrl(url: string, options: FirecrawlMapOptions = {}): Promise<FirecrawlMapResponse> {
    const startTime = Date.now();
    
    try {
      log('Starting Firecrawl site mapping', 'info', {
        url,
        includeSubdomains: options.includeSubdomains,
        limit: options.limit
      });

      const result = await this.app.mapUrl(url, {
        ...(options.includeSubdomains !== undefined && { includeSubdomains: options.includeSubdomains }),
        ...(options.search && { search: options.search }),
        ...(options.ignoreSitemap !== undefined && { ignoreSitemap: options.ignoreSitemap }),
        ...(options.includeMetadata !== undefined && { includeMetadata: options.includeMetadata }),
        ...(options.limit && { limit: options.limit })
      });

      const duration = Date.now() - startTime;
      
      log('Firecrawl site mapping completed', 'info', {
        url,
        success: result.success,
        duration,
        urlsFound: result.data?.urls?.length || 0
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      log('Firecrawl site mapping failed', 'error', {
        url,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Web Search
  // ---------------------------------------------------------------------------

  async search(query: string, options: FirecrawlSearchOptions = {}): Promise<FirecrawlSearchResponse> {
    const startTime = Date.now();
    
    try {
      log('Starting Firecrawl web search', 'info', {
        query,
        limit: options.limit || 5,
        lang: options.lang,
        country: options.country
      });

      const result = await this.app.search(query, {
        limit: options.limit || 5,
        ...(options.tbs && { tbs: options.tbs }),
        ...(options.filter && { filter: options.filter }),
        ...(options.lang && { lang: options.lang }),
        ...(options.country && { country: options.country }),
        ...(options.location && { location: options.location }),
        ...(options.scrapeOptions && { scrapeOptions: options.scrapeOptions })
      });

      const duration = Date.now() - startTime;
      
      log('Firecrawl web search completed', 'info', {
        query,
        success: result.success,
        duration,
        resultsFound: result.data?.length || 0
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      log('Firecrawl web search failed', 'error', {
        query,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // AI-Powered Data Extraction
  // ---------------------------------------------------------------------------

  async extract(
    urls: string | string[], 
    options: FirecrawlExtractOptions
  ): Promise<FirecrawlResponse<Record<string, any>>> {
    const startTime = Date.now();
    const urlArray = Array.isArray(urls) ? urls : [urls];
    
    try {
      log('Starting Firecrawl AI extraction', 'info', {
        urlCount: urlArray.length,
        hasPrompt: !!options.prompt,
        hasSchema: !!options.schema
      });

      const result = await this.app.extract(urls, {
        ...(options.prompt && { prompt: options.prompt }),
        ...(options.schema && { schema: options.schema }),
        ...(options.systemPrompt && { systemPrompt: options.systemPrompt }),
        ...(options.enableCaching !== undefined && { enableCaching: options.enableCaching })
      });

      const duration = Date.now() - startTime;
      
      log('Firecrawl AI extraction completed', 'info', {
        urlCount: urlArray.length,
        success: result.success,
        duration,
        hasData: !!result.data
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      log('Firecrawl AI extraction failed', 'error', {
        urlCount: urlArray.length,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Utility Methods
  // ---------------------------------------------------------------------------

  async healthCheck(): Promise<boolean> {
    try {
      // Test with a simple scrape of a reliable site
      const result = await this.scrapeUrl('https://firecrawl.dev', {
        formats: ['markdown'],
        timeout: 10000
      });
      
      const isHealthy = result.success && !!result.data;
      
      log('Firecrawl health check completed', 'info', {
        isHealthy,
        hasApiKey: !!this.config.apiKey
      });
      
      return isHealthy;
    } catch (error) {
      log('Firecrawl health check failed', 'error', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return false;
    }
  }

  getConfig(): FirecrawlConfig {
    return { ...this.config, apiKey: this.config.apiKey ? '[REDACTED]' : undefined };
  }
}

// ---------------------------------------------------------------------------
// Convenience Functions
// ---------------------------------------------------------------------------

let defaultClient: FirecrawlClient | null = null;

export function getFirecrawlClient(config?: FirecrawlConfig): FirecrawlClient {
  if (!defaultClient) {
    defaultClient = new FirecrawlClient(config);
  }
  return defaultClient;
}

export async function scrapeUrl(url: string, options?: FirecrawlScrapeOptions): Promise<FirecrawlResponse> {
  const client = getFirecrawlClient();
  return client.scrapeUrl(url, options);
}

export async function crawlUrl(url: string, options?: FirecrawlCrawlOptions): Promise<FirecrawlCrawlResponse> {
  const client = getFirecrawlClient();
  return client.crawlUrl(url, options);
}

export async function searchWeb(query: string, options?: FirecrawlSearchOptions): Promise<FirecrawlSearchResponse> {
  const client = getFirecrawlClient();
  return client.search(query, options);
}

export async function mapWebsite(url: string, options?: FirecrawlMapOptions): Promise<FirecrawlMapResponse> {
  const client = getFirecrawlClient();
  return client.mapUrl(url, options);
}

export async function extractData(
  urls: string | string[], 
  options: FirecrawlExtractOptions
): Promise<FirecrawlResponse<Record<string, any>>> {
  const client = getFirecrawlClient();
  return client.extract(urls, options);
}

export async function batchScrapeUrls(urls: string[], options?: FirecrawlBatchOptions): Promise<FirecrawlBatchResponse> {
  const client = getFirecrawlClient();
  return client.batchScrapeUrls(urls, options);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default FirecrawlClient;
export * from '@mendable/firecrawl-js';
