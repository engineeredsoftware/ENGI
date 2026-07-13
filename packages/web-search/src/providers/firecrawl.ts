/**
 * Firecrawl Search Provider
 * 
 * Integrates Firecrawl's web scraping and search capabilities into the
 * multi-provider search orchestration system.
 */

import { SearchProviderBase, SearchQuery, SearchResult } from '../multi-provider';
import { FirecrawlClient, FirecrawlSearchOptions, FirecrawlPageData } from '@bitcode/web-scrapers-firecrawl';
import { log } from '@bitcode/logger';

export class FirecrawlSearchProvider extends SearchProviderBase {
  readonly name = 'firecrawl' as const;
  readonly config = {
    name: 'firecrawl' as const,
    enabled: true,
    priority: 9, // High priority - excellent for content extraction
    rateLimit: {
      requestsPerMinute: 100,
      requestsPerDay: 10000
    },
    healthCheck: {
      interval: 300000, // 5 minutes
      timeout: 15000
    },
    specializations: {
      categories: ['general', 'documentation', 'code'] as const,
      technologies: [], // Universal - can handle any technology
      strengths: [
        'Deep content extraction',
        'Web search with content',
        'Site crawling',
        'Structured data extraction',
        'AI-powered content analysis',
        'Real-time scraping'
      ]
    }
  };

  private client: FirecrawlClient;

  constructor() {
    super();
    this.client = new FirecrawlClient();
  }

  async search(query: SearchQuery, options?: {
    searchType?: 'search' | 'crawl' | 'scrape';
    limit?: number;
    country?: string;
    lang?: string;
    tbs?: string;
    crawlLimit?: number;
    maxDepth?: number;
    urlAttachments?: string[];
  }): Promise<SearchResult[]> {
    const {
      searchType = 'search',
      limit = 10,
      country,
      lang,
      tbs,
      crawlLimit = 50,
      maxDepth = 2,
      urlAttachments = []
    } = options || {};

    try {
      log('Firecrawl search initiated', 'info', {
        query: query.text,
        searchType,
        limit,
        category: query.category,
        urgency: query.urgency
      });

      let results: SearchResult[] = [];

      switch (searchType) {
        case 'search':
          results = await this.performWebSearch(query, { limit, country, lang, tbs });
          break;
        
        case 'crawl':
          results = await this.performWebCrawl(query, { crawlLimit, maxDepth, urlAttachments });
          break;
        
        case 'scrape':
          results = await this.performWebScrape(query, { urlAttachments });
          break;
        
        default:
          // Default to search, fallback to crawl if URL attachments provided
          if (urlAttachments.length > 0) {
            results = await this.performWebCrawl(query, { crawlLimit, maxDepth, urlAttachments });
          } else {
            results = await this.performWebSearch(query, { limit, country, lang, tbs });
          }
      }

      log('Firecrawl search completed', 'info', {
        query: query.text,
        searchType,
        resultsCount: results.length,
        avgScore: results.length > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0
      });

      return results;

    } catch (error) {
      log('Firecrawl search failed', 'error', {
        provider: this.name,
        query: query.text,
        searchType,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  private async performWebSearch(
    query: SearchQuery, 
    options: { limit: number; country?: string; lang?: string; tbs?: string }
  ): Promise<SearchResult[]> {
    const searchOptions: FirecrawlSearchOptions = {
      limit: options.limit,
      scrapeOptions: {
        formats: ['markdown', 'links'],
        onlyMainContent: true
      }
    };

    // Add language/country if specified
    if (options.country) searchOptions.country = options.country;
    if (options.lang) searchOptions.lang = options.lang;
    if (options.tbs) searchOptions.tbs = options.tbs;

    // Customize search for urgency
    if (query.urgency === 'high') {
      searchOptions.tbs = 'qdr:m'; // Recent results for urgent queries
    }

    const response = await this.client.search(query.text, searchOptions);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Firecrawl search failed');
    }

    return response.data.map((page, index) => this.mapPageToSearchResult(page, index, 'search'));
  }

  private async performWebCrawl(
    query: SearchQuery,
    options: { crawlLimit: number; maxDepth: number; urlAttachments: string[] }
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // If we have URL attachments, crawl from those starting points
    if (options.urlAttachments.length > 0) {
      for (const url of options.urlAttachments.slice(0, 3)) { // Limit to 3 URLs to avoid excessive crawling
        try {
          const crawlResponse = await this.client.crawlUrl(url, {
            limit: Math.ceil(options.crawlLimit / options.urlAttachments.length),
            maxDepth: options.maxDepth,
            scrapeOptions: {
              formats: ['markdown', 'links'],
              onlyMainContent: true
            }
          });

          if (crawlResponse.success && crawlResponse.data) {
            const crawlResults = crawlResponse.data.map((page, index) => 
              this.mapPageToSearchResult(page, index, 'crawl', url)
            );
            results.push(...crawlResults);
          }
        } catch (error) {
          log('Firecrawl crawl failed for URL', 'warn', {
            url,
            error: error instanceof Error ? error.message : String(error)
          });
          // Continue with other URLs
        }
      }
    } else {
      // No URL attachments - perform a search first to find starting points
      const searchResults = await this.performWebSearch(query, { limit: 3 });
      
      // Then crawl from the top search results
      for (const result of searchResults.slice(0, 2)) {
        try {
          const crawlResponse = await this.client.crawlUrl(result.url, {
            limit: Math.ceil(options.crawlLimit / 2),
            maxDepth: 1, // Shallow crawl from search results
            scrapeOptions: {
              formats: ['markdown', 'links'],
              onlyMainContent: true
            }
          });

          if (crawlResponse.success && crawlResponse.data) {
            const crawlResults = crawlResponse.data.map((page, index) => 
              this.mapPageToSearchResult(page, index, 'crawl', result.url)
            );
            results.push(...crawlResults);
          }
        } catch (error) {
          log('Firecrawl crawl failed for search result', 'warn', {
            url: result.url,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }

    return results;
  }

  private async performWebScrape(
    query: SearchQuery,
    options: { urlAttachments: string[] }
  ): Promise<SearchResult[]> {
    if (options.urlAttachments.length === 0) {
      throw new Error('URL attachments required for scrape operation');
    }

    const results: SearchResult[] = [];

    // Use batch scraping for efficiency
    try {
      const batchResponse = await this.client.batchScrapeUrls(options.urlAttachments, {
        formats: ['markdown', 'links'],
        timeout: 30000
      });

      if (batchResponse.success && batchResponse.data) {
        const scrapeResults = batchResponse.data.map((page, index) => 
          this.mapPageToSearchResult(page, index, 'scrape')
        );
        results.push(...scrapeResults);
      }
    } catch (error) {
      // Fallback to individual scraping if batch fails
      log('Batch scraping failed, falling back to individual scrapes', 'warn', {
        error: error instanceof Error ? error.message : String(error)
      });

      for (const [index, url] of options.urlAttachments.entries()) {
        try {
          const scrapeResponse = await this.client.scrapeUrl(url, {
            formats: ['markdown', 'links'],
            onlyMainContent: true
          });

          if (scrapeResponse.success && scrapeResponse.data) {
            const result = this.mapPageToSearchResult(scrapeResponse.data, index, 'scrape');
            results.push(result);
          }
        } catch (error) {
          log('Individual scrape failed', 'warn', {
            url,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }

    return results;
  }

  private mapPageToSearchResult(
    page: FirecrawlPageData, 
    index: number, 
    searchType: 'search' | 'crawl' | 'scrape',
    sourceUrl?: string
  ): SearchResult {
    // Calculate relevance score based on content quality and metadata
    let score = 0.7; // Base score

    // Boost score based on content length and quality
    const markdownLength = page.markdown?.length || 0;
    if (markdownLength > 5000) score += 0.1;
    else if (markdownLength > 1000) score += 0.05;

    // Boost for high-authority domains
    const url = page.metadata.sourceURL || sourceUrl || '';
    if (this.isHighAuthorityDomain(url)) score += 0.15;

    // Boost for recent content
    if (page.metadata.dctermsCreated) {
      const created = new Date(page.metadata.dctermsCreated);
      const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) score += 0.05;
    }

    // Boost for good metadata
    if (page.metadata.title && page.metadata.description) score += 0.05;

    // Position penalty (later results get slightly lower scores)
    score -= index * 0.01;

    // Ensure score is within bounds
    score = Math.max(0.1, Math.min(1.0, score));

    // Determine result type
    let resultType: SearchResult['metadata']['type'] = 'general';
    if (url.includes('docs.') || url.includes('/docs/')) resultType = 'documentation';
    else if (url.includes('github.com')) resultType = 'code';
    else if (url.includes('stackoverflow.com')) resultType = 'qa';
    else if (url.includes('arxiv.org') || url.includes('scholar.google')) resultType = 'academic';

    return {
      id: `firecrawl-${searchType}-${Date.now()}-${index}`,
      title: page.metadata.title || page.metadata.ogTitle || 'Untitled',
      url: url,
      snippet: this.generateSnippet(page),
      score,
      provider: 'firecrawl',
      metadata: {
        type: resultType,
        authority: this.determineAuthority(url),
        publishedDate: page.metadata.dctermsCreated,
        language: page.metadata.dctermsLanguage || page.metadata.language,
        tags: this.extractTags(page)
      }
    };
  }

  private generateSnippet(page: FirecrawlPageData): string {
    // Priority order: description, first part of markdown, title
    if (page.metadata.description) {
      return page.metadata.description.slice(0, 300);
    }
    
    if (page.metadata.ogDescription) {
      return page.metadata.ogDescription.slice(0, 300);
    }
    
    if (page.markdown) {
      // Extract first meaningful paragraph from markdown
      const lines = page.markdown.split('\n').filter(line => 
        line.trim().length > 50 && 
        !line.startsWith('#') && 
        !line.startsWith('*') &&
        !line.startsWith('-')
      );
      
      if (lines.length > 0) {
        return lines[0].slice(0, 300);
      }
    }
    
    return page.metadata.title || 'No description available';
  }

  private isHighAuthorityDomain(url: string): boolean {
    const highAuthorityDomains = [
      'github.com',
      'stackoverflow.com',
      'developer.mozilla.org',
      'docs.microsoft.com',
      'aws.amazon.com',
      'cloud.google.com',
      'reactjs.org',
      'vuejs.org',
      'angular.io',
      'nodejs.org',
      'python.org',
      'typescript.org'
    ];
    
    return highAuthorityDomains.some(domain => url.includes(domain));
  }

  private determineAuthority(url: string): SearchResult['metadata']['authority'] {
    if (this.isHighAuthorityDomain(url)) return 'high';
    
    // Medium authority patterns
    if (url.includes('docs.') || 
        url.includes('/docs/') || 
        url.includes('api.') ||
        url.includes('developer.')) {
      return 'medium';
    }
    
    return 'low';
  }

  private extractTags(page: FirecrawlPageData): string[] {
    const tags: string[] = [];
    
    // Extract from keywords
    if (page.metadata.keywords) {
      const keywords = page.metadata.keywords.split(',').map(k => k.trim());
      tags.push(...keywords.slice(0, 5)); // Limit to 5 keywords
    }
    
    // Extract from URL path
    const url = page.metadata.sourceURL || '';
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => 
        part.length > 2 && 
        !part.includes('.') &&
        part !== 'docs' &&
        part !== 'api'
      );
      tags.push(...pathParts.slice(0, 3)); // Limit to 3 path parts
    } catch (error) {
      // Invalid URL, skip path extraction
    }
    
    return [...new Set(tags)].slice(0, 8); // Deduplicate and limit
  }

  async healthCheck(): Promise<boolean> {
    try {
      const isHealthy = await this.client.healthCheck();
      
      log('Firecrawl health check completed', 'info', {
        provider: this.name,
        isHealthy
      });
      
      return isHealthy;
    } catch (error) {
      log('Firecrawl health check failed', 'error', {
        provider: this.name,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}