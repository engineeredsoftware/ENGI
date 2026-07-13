# @bitcode/web-scrapers-firecrawl

> Path: `packages/web-scrapers/firecrawl`  
> BC alias: `@bitcode/firecrawl`

## Overview

Industrial-strength web scraping and crawling service integration providing comprehensive content extraction and AI-powered data processing capabilities. Delivers high-performance web data acquisition with intelligent content parsing, batch processing, and real-time monitoring for autonomous agent systems.

## Core Functionality

### Content Scraping
- **Single Page Extraction**: High-fidelity content extraction with multiple output formats (Markdown, HTML, Screenshot)
- **Intelligent Parsing**: AI-powered content structure recognition with main content isolation
- **Custom Tag Filtering**: Precise content selection through include/exclude tag specifications
- **Metadata Extraction**: Comprehensive page metadata including SEO data, social media tags, and technical metrics

### Website Crawling
- **Systematic Website Traversal**: Depth-controlled recursive crawling with intelligent link discovery
- **Domain Management**: Flexible domain filtering with subdomain inclusion/exclusion controls
- **Sitemap Integration**: Automatic sitemap parsing with manual override capabilities
- **Concurrent Processing**: High-performance parallel page processing with rate limiting

### Asynchronous Operations
- **Background Processing**: Non-blocking crawl operations with job status monitoring
- **Real-time Updates**: WebSocket-based progress tracking with incremental result delivery
- **Job Management**: Complete lifecycle control including cancellation and retry mechanisms
- **Batch Processing**: Efficient multi-URL processing with consolidated result delivery

### AI-Powered Extraction
- **Structured Data Extraction**: Schema-based data extraction with custom prompt support
- **Natural Language Processing**: Query-based content extraction using natural language prompts
- **Data Validation**: Automatic data quality assessment with confidence scoring
- **Custom Schemas**: Flexible output structure definition for downstream processing

### Web Search Integration
- **Search Engine Queries**: Direct web search with result scraping and content extraction
- **Geographic Targeting**: Location-based search results with regional customization
- **Time-based Filtering**: Temporal search constraints for recent content discovery
- **Language Localization**: Multi-language search support with automatic content detection

### Website Mapping
- **URL Discovery**: Comprehensive site structure analysis with link relationship mapping
- **Content Classification**: Automatic page categorization based on content analysis
- **Search Integration**: Site-specific search functionality with content indexing
- **Metadata Aggregation**: Site-wide metadata collection for content inventory management

## API Operations

```typescript
// Single Page Scraping
await client.scrapeUrl('https://example.com', {
  formats: ['markdown', 'html', 'screenshot'],
  onlyMainContent: true,
  timeout: 30000
})

// Website Crawling
await client.crawlUrl('https://example.com', {
  limit: 100,
  maxDepth: 3,
  allowSubdomains: true,
  scrapeOptions: { formats: ['markdown'] }
})

// Asynchronous Operations
const job = await client.asyncCrawlUrl('https://example.com', { limit: 1000 })
const status = await client.checkCrawlStatus(job.id)
await client.cancelCrawl(job.id)

// Real-time Crawling
const watcher = await client.crawlUrlAndWatch('https://example.com')
watcher.addEventListener('document', (event) => console.log(event.data))

// Batch Processing
await client.batchScrapeUrls([
  'https://example.com/page1',
  'https://example.com/page2'
], { formats: ['markdown'] })

// AI Extraction
await client.extract(['https://example.com'], {
  prompt: 'Extract contact information and business hours',
  schema: { name: 'string', phone: 'string', hours: 'string' }
})

// Web Search
await client.search('latest AI developments', {
  limit: 10,
  country: 'US',
  scrapeOptions: { formats: ['markdown'] }
})

// Website Mapping
await client.mapUrl('https://example.com', {
  includeSubdomains: true,
  limit: 1000
})
```

## Configuration

Requires Firecrawl API credentials with appropriate service tier access:
- API key with sufficient provider quota
- Rate limiting configuration based on subscription tier
- Custom extraction model access for AI-powered features
- WebSocket connection permissions for real-time operations

Environment variables:
```
FIRECRAWL_API_KEY=your-api-key
FIRECRAWL_BASE_URL=https://api.firecrawl.dev (optional)
```

## Performance Characteristics

- **Throughput**: Up to 100 concurrent requests with intelligent rate limiting
- **Global Infrastructure**: Multi-region processing with optimized proxy networks
- **Content Quality**: 95%+ accuracy for main content extraction
- **Processing Speed**: Sub-10 second average response time for standard pages
- **Reliability**: 99.9% uptime with automatic failover and retry mechanisms
- **Scalability**: Auto-scaling infrastructure supporting millions of pages per day

## Integration Notes

Optimized for AI agent workflows requiring large-scale web data acquisition. Supports both real-time content monitoring and batch data processing patterns. All operations include comprehensive error handling, detailed logging, and provider quota tracking for production deployment monitoring. Ideal for autonomous research systems, content aggregation platforms, and competitive intelligence applications.
