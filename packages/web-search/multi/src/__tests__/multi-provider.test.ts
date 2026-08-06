import {
  QueryAnalyzer,
  ProviderRouter,
  ResultFusionEngine,
  SearchQuery,
  SearchResult,
  SearchProvider
} from '../multi-provider';
import { GitHubSearchProvider } from '../providers/github';
import { StackOverflowSearchProvider } from '../providers/stackoverflow';
import { SemanticScholarSearchProvider } from '../providers/semantic-scholar';
import {
  MultiProviderSearchOrchestrator,
  multiProviderSearch,
  getProviderHealth,
  getProviderStatistics
} from '../orchestrator';

// Mock external APIs
jest.mock('@bitcode/logger');
jest.mock('../index');

// Mock environment variables
process.env.GITHUB_API_KEY = 'test-github-key';
process.env.STACKEXCHANGE_API_KEY = 'test-stack-key';
process.env.SEMANTIC_SCHOLAR_API_KEY = 'test-scholar-key';

// Mock fetch globally
global.fetch = jest.fn();

describe('Multi-Provider Search System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('QueryAnalyzer', () => {
    let analyzer: QueryAnalyzer;

    beforeEach(() => {
      analyzer = new QueryAnalyzer();
    });

    test('should analyze code queries correctly', () => {
      const query = analyzer.analyzeQuery(
        'how to implement React authentication',
        ['https://reactjs.org/docs/hooks.html']
      );

      expect(query.category).toBe('code');
      expect(query.technologies).toContain('react');
      expect(query.urgency).toBe('medium');
      expect(query.domains).toContain('reactjs.org');
    });

    test('should analyze documentation queries correctly', () => {
      const query = analyzer.analyzeQuery(
        'API documentation for Express.js',
        ['https://expressjs.com/en/api.html']
      );

      expect(query.category).toBe('documentation');
      expect(query.technologies).toContain('express');
    });

    test('should analyze QA queries correctly', () => {
      const query = analyzer.analyzeQuery(
        'how to fix React hook error',
        []
      );

      expect(query.category).toBe('qa');
      expect(query.technologies).toContain('react');
    });

    test('should analyze academic queries correctly', () => {
      const query = analyzer.analyzeQuery(
        'machine learning algorithm research paper',
        []
      );

      expect(query.category).toBe('academic');
      expect(query.technologies).toContain('machine learning');
    });

    test('should detect urgency correctly', () => {
      const urgentQuery = analyzer.analyzeQuery('urgent React bug fix needed');
      expect(urgentQuery.urgency).toBe('high');

      const researchQuery = analyzer.analyzeQuery('research best practices for Vue.js');
      expect(researchQuery.urgency).toBe('low');
    });

    test('should extract multiple technologies', () => {
      const query = analyzer.analyzeQuery(
        'Node.js Express PostgreSQL authentication',
        ['https://nodejs.org/docs', 'https://www.postgresql.org/docs']
      );

      expect(query.technologies).toEqual(
        expect.arrayContaining(['nodejs', 'postgresql'])
      );
    });
  });

  describe('ProviderRouter', () => {
    let router: ProviderRouter;
    let mockGitHubProvider: GitHubSearchProvider;
    let mockStackOverflowProvider: StackOverflowSearchProvider;

    beforeEach(() => {
      router = new ProviderRouter();
      mockGitHubProvider = new GitHubSearchProvider();
      mockStackOverflowProvider = new StackOverflowSearchProvider();
      
      // Mock provider stats to be healthy
      jest.spyOn(mockGitHubProvider, 'getStats').mockReturnValue({
        provider: 'github',
        isHealthy: true,
        lastHealthCheck: new Date(),
        requestsThisMinute: 0,
        requestsToday: 0,
        averageResponseTime: 500,
        successRate: 0.95,
        qualityScore: 0.9
      });
      
      jest.spyOn(mockStackOverflowProvider, 'getStats').mockReturnValue({
        provider: 'stackoverflow',
        isHealthy: true,
        lastHealthCheck: new Date(),
        requestsThisMinute: 0,
        requestsToday: 0,
        averageResponseTime: 300,
        successRate: 0.98,
        qualityScore: 0.85
      });

      router.registerProvider(mockGitHubProvider);
      router.registerProvider(mockStackOverflowProvider);
    });

    test('should route code queries to GitHub', async () => {
      const query: SearchQuery = {
        text: 'React component implementation',
        category: 'code',
        technologies: ['react'],
        urgency: 'medium'
      };

      const providers = await router.routeQuery(query);
      expect(providers).toContain('github');
    });

    test('should route QA queries to Stack Overflow', async () => {
      const query: SearchQuery = {
        text: 'how to fix JavaScript error',
        category: 'qa',
        technologies: ['javascript'],
        urgency: 'high'
      };

      const providers = await router.routeQuery(query);
      expect(providers).toContain('stackoverflow');
    });

    test('should prioritize healthy providers', async () => {
      // Make GitHub unhealthy
      jest.spyOn(mockGitHubProvider, 'getStats').mockReturnValue({
        provider: 'github',
        isHealthy: false,
        lastHealthCheck: new Date(),
        requestsThisMinute: 0,
        requestsToday: 0,
        averageResponseTime: 5000,
        successRate: 0.1,
        qualityScore: 0.2
      });

      const query: SearchQuery = {
        text: 'code example',
        category: 'code',
        technologies: ['javascript'],
        urgency: 'medium'
      };

      const providers = await router.routeQuery(query);
      expect(providers).not.toContain('github');
      expect(providers).toContain('stackoverflow');
    });
  });

  describe('ResultFusionEngine', () => {
    let fusionEngine: ResultFusionEngine;

    beforeEach(() => {
      fusionEngine = new ResultFusionEngine();
    });

    test('should remove duplicate results', () => {
      const providerResults = [
        {
          provider: 'github' as SearchProvider,
          results: [
            {
              id: 'github-1',
              title: 'React Authentication Tutorial',
              url: 'https://github.com/example/react-auth',
              snippet: 'Tutorial content',
              score: 0.9,
              provider: 'github' as SearchProvider,
              metadata: { type: 'github_repo' as const, authority: 'high' as const }
            }
          ]
        },
        {
          provider: 'stackoverflow' as SearchProvider,
          results: [
            {
              id: 'so-1',
              title: 'React Authentication Tutorial', // Same title
              url: 'https://github.com/example/react-auth', // Same URL
              snippet: 'Similar content',
              score: 0.8,
              provider: 'stackoverflow' as SearchProvider,
              metadata: { type: 'stackoverflow' as const, authority: 'medium' as const }
            },
            {
              id: 'so-2',
              title: 'Different React Tutorial',
              url: 'https://stackoverflow.com/questions/12345',
              snippet: 'Different content',
              score: 0.7,
              provider: 'stackoverflow' as SearchProvider,
              metadata: { type: 'stackoverflow' as const, authority: 'medium' as const }
            }
          ]
        }
      ];

      const query: SearchQuery = {
        text: 'React authentication',
        category: 'code',
        technologies: ['react'],
        urgency: 'medium'
      };

      const result = fusionEngine.fuseResults(providerResults, query);

      expect(result.results).toHaveLength(2); // Duplicate removed
      expect(result.fusionMetrics.duplicatesRemoved).toBe(1);
      expect(result.results[0].score).toBeGreaterThanOrEqual(result.results[1].score);
    });

    test('should optimize for diversity', () => {
      const sameSourceResults = Array.from({ length: 10 }, (_, i) => ({
        id: `result-${i}`,
        title: `Result ${i}`,
        url: `https://same-domain.com/page${i}`,
        snippet: `Content ${i}`,
        score: 0.8,
        provider: 'github' as SearchProvider,
        metadata: { type: 'github_repo' as const, authority: 'medium' as const }
      }));

      const providerResults = [
        {
          provider: 'github' as SearchProvider,
          results: sameSourceResults
        }
      ];

      const query: SearchQuery = {
        text: 'test query',
        category: 'general',
        technologies: [],
        urgency: 'medium'
      };

      const result = fusionEngine.fuseResults(providerResults, query);

      // Should limit results from same domain when many are available
      expect(result.results.length).toBeLessThan(10);
      expect(result.fusionMetrics.diversityScore).toBeGreaterThan(0);
    });

    test('should generate relevant follow-up queries', () => {
      const providerResults = [
        {
          provider: 'github' as SearchProvider,
          results: [
            {
              id: 'result-1',
              title: 'React Hooks Authentication Best Practices',
              url: 'https://example.com/react-hooks-auth',
              snippet: 'Using hooks for authentication state management',
              score: 0.9,
              provider: 'github' as SearchProvider,
              metadata: { type: 'github_repo' as const, authority: 'high' as const }
            }
          ]
        }
      ];

      const query: SearchQuery = {
        text: 'React authentication',
        category: 'code',
        technologies: ['react'],
        urgency: 'medium'
      };

      const result = fusionEngine.fuseResults(providerResults, query);

      expect(result.recommendedFollowUp).toEqual(
        expect.arrayContaining([
          expect.stringContaining('react')
        ])
      );
      expect(result.recommendedFollowUp.length).toBeGreaterThan(0);
    });
  });

  describe('GitHubSearchProvider', () => {
    let provider: GitHubSearchProvider;

    beforeEach(() => {
      provider = new GitHubSearchProvider();
      
      // Mock successful API responses
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          total_count: 1,
          incomplete_results: false,
          items: [
            {
              id: 12345,
              name: 'react-auth',
              full_name: 'example/react-auth',
              description: 'React authentication library',
              html_url: 'https://github.com/example/react-auth',
              stargazers_count: 1500,
              forks_count: 200,
              language: 'JavaScript',
              topics: ['react', 'authentication', 'jwt'],
              updated_at: '2024-01-01T00:00:00Z',
              owner: {
                login: 'example',
                type: 'User'
              },
              license: {
                name: 'MIT'
              }
            }
          ]
        })
      });
    });

    test('should search repositories successfully', async () => {
      const query: SearchQuery = {
        text: 'React authentication',
        category: 'code',
        technologies: ['react'],
        urgency: 'medium'
      };

      const results = await provider.search(query, {
        searchType: 'repositories',
        maxResults: 10
      });

      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('react-auth');
      expect(results[0].provider).toBe('github');
      expect(results[0].metadata.stars).toBe(1500);
    });

    test('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: () => Promise.resolve('Rate limit exceeded')
      });

      const query: SearchQuery = {
        text: 'test query',
        category: 'code',
        technologies: [],
        urgency: 'medium'
      };

      await expect(provider.search(query)).rejects.toThrow('GitHub API request failed');
    });

    test('should perform health check', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          rate: {
            remaining: 50,
            reset: Date.now() + 3600000
          }
        })
      });

      const isHealthy = await provider.healthCheck();
      expect(isHealthy).toBe(true);
    });
  });

  describe('StackOverflowSearchProvider', () => {
    let provider: StackOverflowSearchProvider;

    beforeEach(() => {
      provider = new StackOverflowSearchProvider();
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          total: 1,
          items: [
            {
              question_id: 12345,
              title: 'How to implement React authentication?',
              body: 'I read help with React authentication...',
              link: 'https://stackoverflow.com/questions/12345',
              score: 25,
              view_count: 1500,
              answer_count: 3,
              tags: ['reactjs', 'authentication', 'javascript'],
              owner: {
                display_name: 'developer123',
                reputation: 5000,
                user_type: 'registered'
              },
              creation_date: 1640995200, // 2022-01-01
              last_activity_date: 1641081600,
              is_answered: true,
              accepted_answer_id: 12346
            }
          ],
          quota_remaining: 300,
          quota_max: 300
        })
      });
    });

    test('should search questions successfully', async () => {
      const query: SearchQuery = {
        text: 'React authentication',
        category: 'qa',
        technologies: ['react'],
        urgency: 'medium'
      };

      const results = await provider.search(query, {
        searchType: 'questions',
        maxResults: 10
      });

      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('React authentication');
      expect(results[0].provider).toBe('stackoverflow');
      expect(results[0].metadata.tags).toContain('reactjs');
    });

    test('should handle Stack Exchange API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          error_id: 400,
          error_name: 'bad_parameter',
          error_message: 'Invalid parameter'
        })
      });

      const query: SearchQuery = {
        text: 'test query',
        category: 'qa',
        technologies: [],
        urgency: 'medium'
      };

      await expect(provider.search(query)).rejects.toThrow('Stack Exchange API error');
    });
  });

  describe('SemanticScholarSearchProvider', () => {
    let provider: SemanticScholarSearchProvider;

    beforeEach(() => {
      provider = new SemanticScholarSearchProvider();
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          total: 1,
          offset: 0,
          data: [
            {
              paperId: 'abc123',
              title: 'Deep Learning for Computer Vision: A Survey',
              abstract: 'This paper provides a comprehensive survey...',
              url: 'https://www.semanticscholar.org/paper/abc123',
              venue: 'IEEE Transactions on Pattern Analysis',
              year: 2023,
              citationCount: 150,
              influentialCitationCount: 25,
              authors: [
                { name: 'Jane Smith' },
                { name: 'John Doe' }
              ],
              fieldsOfStudy: ['Computer Science'],
              publicationDate: '2023-06-01',
              openAccessPdf: {
                url: 'https://example.com/paper.pdf',
                status: 'GREEN'
              },
              tldr: {
                model: 'tldr@v2.0',
                text: 'A comprehensive survey of deep learning in computer vision.'
              }
            }
          ]
        })
      });
    });

    test('should search papers successfully', async () => {
      const query: SearchQuery = {
        text: 'deep learning computer vision',
        category: 'academic',
        technologies: ['computer vision', 'deep learning'],
        urgency: 'low'
      };

      const results = await provider.search(query, {
        maxResults: 10
      });

      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('Deep Learning');
      expect(results[0].provider).toBe('semantic_scholar');
      expect(results[0].metadata.citations).toBe(150);
    });

    test('should handle missing paper URLs', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          total: 1,
          data: [
            {
              paperId: 'def456',
              title: 'Test Paper',
              citationCount: 5,
              influentialCitationCount: 1,
              authors: [{ name: 'Test Author' }],
              year: 2023
            }
          ]
        })
      });

      const query: SearchQuery = {
        text: 'test research',
        category: 'academic',
        technologies: [],
        urgency: 'low'
      };

      const results = await provider.search(query);
      
      expect(results[0].url).toContain('semanticscholar.org/paper/def456');
    });
  });

  describe('MultiProviderSearchOrchestrator', () => {
    let orchestrator: MultiProviderSearchOrchestrator;

    beforeEach(() => {
      orchestrator = new MultiProviderSearchOrchestrator();
      
      // Mock all provider searches
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('github.com')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              total_count: 1,
              items: [{
                id: 1,
                full_name: 'test/repo',
                description: 'Test repository',
                html_url: 'https://github.com/test/repo',
                stargazers_count: 100,
                language: 'JavaScript'
              }]
            })
          });
        }
        
        if (url.includes('stackexchange.com')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [{
                question_id: 1,
                title: 'Test Question',
                link: 'https://stackoverflow.com/q/1',
                score: 10,
                tags: ['javascript']
              }],
              quota_remaining: 100
            })
          });
        }
        
        if (url.includes('semanticscholar.org')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: [{
                paperId: '1',
                title: 'Test Paper',
                citationCount: 50,
                authors: [{ name: 'Test Author' }]
              }]
            })
          });
        }
        
        return Promise.reject(new Error('Unknown URL'));
      });
    });

    afterEach(async () => {
      await orchestrator.destroy();
    });

    test('should orchestrate multi-provider search', async () => {
      const result = await orchestrator.orchestrateSearch(
        'React authentication tutorial',
        [],
        {
          maxResults: 10,
          category: 'code'
        }
      );

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.providerUsage.length).toBeGreaterThan(0);
      expect(result.fusionMetrics).toBeDefined();
      expect(result.recommendedFollowUp.length).toBeGreaterThan(0);
    });

    test('should respect provider forcing', async () => {
      const result = await orchestrator.orchestrateSearch(
        'test query',
        [],
        {
          maxResults: 5,
          forceProviders: ['github', 'stackoverflow']
        }
      );

      const usedProviders = result.providerUsage.map(p => p.provider);
      expect(usedProviders).toEqual(expect.arrayContaining(['github', 'stackoverflow']));
    });

    test('should get provider health status', async () => {
      const healthStatus = await orchestrator.getProviderHealthStatus();
      
      expect(healthStatus).toHaveProperty('github');
      expect(healthStatus).toHaveProperty('stackoverflow');
      expect(healthStatus).toHaveProperty('semantic_scholar');
      expect(healthStatus).toHaveProperty('exa');
    });
  });

  describe('Integration Functions', () => {
    beforeEach(() => {
      // Mock Exa search
      const mockExaSearch = require('../index');
      mockExaSearch.search = jest.fn().mockResolvedValue({
        results: [{
          id: 'exa-1',
          title: 'Exa Result',
          url: 'https://example.com/exa',
          score: 0.9
        }]
      });
      
      // Mock other providers
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          items: [],
          data: [],
          quota_remaining: 100
        })
      });
    });

    test('multiProviderSearch should work end-to-end', async () => {
      const result = await multiProviderSearch(
        'React hooks tutorial',
        ['https://reactjs.org/docs/hooks.html'],
        {
          maxResults: 10,
          category: 'documentation'
        }
      );

      expect(result.results).toBeDefined();
      expect(result.providerUsage).toBeDefined();
      expect(result.fusionMetrics).toBeDefined();
    });

    test('getProviderHealth should return health status', async () => {
      const health = await getProviderHealth();
      
      expect(typeof health).toBe('object');
      expect(health).toHaveProperty('exa');
      expect(health).toHaveProperty('github');
    });

    test('getProviderStatistics should return stats', () => {
      const stats = getProviderStatistics();
      
      expect(typeof stats).toBe('object');
      expect(stats).toHaveProperty('exa');
      expect(stats).toHaveProperty('github');
    });
  });
});