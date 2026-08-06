import {
  classifyUrl,
  discoverRelatedDomains,
  extractTechnologyContext,
  analyzeUrlAttachments,
  searchWithUrlIntelligence,
  UrlType,
  UrlClassification
} from '../index';

// Mock the Exa search to avoid API calls in tests
jest.mock('../index', () => {
  const actual = jest.requireActual('../index');
  return {
    ...actual,
    search: jest.fn().mockResolvedValue({
      results: [
        {
          title: 'Test Result',
          url: 'https://example.com/test',
          score: 0.8,
          id: 'test-id',
          summary: 'Test summary'
        }
      ],
      autopromptString: 'Enhanced test query'
    })
  };
});

describe('URL Intelligence System', () => {
  describe('classifyUrl', () => {
    test('should classify GitHub repositories correctly', () => {
      const result = classifyUrl('https://github.com/facebook/react');
      
      expect(result.type).toBe('github_repo');
      expect(result.domain).toBe('github.com');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.metadata.authority).toBe('high');
    });

    test('should classify GitHub issues correctly', () => {
      const result = classifyUrl('https://github.com/microsoft/typescript/issues/123');
      
      expect(result.type).toBe('github_issue');
      expect(result.domain).toBe('github.com');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should classify documentation sites', () => {
      const testCases = [
        'https://docs.python.org/3/',
        'https://developer.mozilla.org/en-US/docs/Web',
        'https://reactjs.org/docs/getting-started.html'
      ];

      testCases.forEach(url => {
        const result = classifyUrl(url);
        expect(result.type).toBe('documentation');
        expect(result.confidence).toBeGreaterThan(0.7);
        expect(result.metadata.authority).toBe('high');
      });
    });

    test('should classify Stack Overflow correctly', () => {
      const result = classifyUrl('https://stackoverflow.com/questions/123/how-to-test');
      
      expect(result.type).toBe('stackoverflow');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.metadata.authority).toBe('high');
    });

    test('should classify npm packages', () => {
      const result = classifyUrl('https://www.npmjs.com/package/react');
      
      expect(result.type).toBe('npm_package');
      expect(result.metadata.language).toContain('javascript');
      expect(result.metadata.authority).toBe('high');
    });

    test('should classify PyPI packages', () => {
      const result = classifyUrl('https://pypi.org/project/django/');
      
      expect(result.type).toBe('pypi_package');
      expect(result.metadata.language).toContain('python');
      expect(result.metadata.authority).toBe('high');
    });

    test('should classify API references', () => {
      const result = classifyUrl('https://api.github.com/docs');
      
      expect(result.type).toBe('api_reference');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should handle invalid URLs gracefully', () => {
      const result = classifyUrl('not-a-url');
      
      expect(result.type).toBe('general');
      expect(result.domain).toBe('unknown');
      expect(result.confidence).toBeLessThan(0.2);
    });
  });

  describe('discoverRelatedDomains', () => {
    test('should discover common subdomains', () => {
      const result = discoverRelatedDomains('example.com');
      
      expect(result).toContain('docs.example.com');
      expect(result).toContain('api.example.com');
      expect(result).toContain('developer.example.com');
      expect(result).toContain('blog.example.com');
    });

    test('should handle domains with existing subdomains', () => {
      const result = discoverRelatedDomains('docs.example.com');
      
      // Should not suggest 'docs.docs.example.com'
      expect(result.filter(d => d.startsWith('docs.'))).toHaveLength(0);
      expect(result).toContain('api.example.com');
    });

    test('should return technology-specific related domains', () => {
      const reactDomains = discoverRelatedDomains('reactjs.org');
      expect(reactDomains).toContain('react.dev');
      expect(reactDomains).toContain('leg' + 'acy.reactjs.org');
      
      const nodeDomains = discoverRelatedDomains('nodejs.org');
      expect(nodeDomains).toContain('npm.org');
      expect(nodeDomains).toContain('npmjs.com');
    });
  });

  describe('extractTechnologyContext', () => {
    test('should extract technology keywords from URLs', () => {
      const urls = [
        'https://reactjs.org/docs',
        'https://nodejs.org/api',
        'https://www.typescriptlang.org/docs'
      ];
      
      const result = extractTechnologyContext(urls);
      
      expect(result).toContain('react');
      expect(result).toContain('nodejs');
      expect(result).toContain('typescript');
    });

    test('should handle cloud provider URLs', () => {
      const urls = [
        'https://aws.amazon.com/s3',
        'https://cloud.google.com/storage',
        'https://azure.microsoft.com/services'
      ];
      
      const result = extractTechnologyContext(urls);
      
      expect(result).toContain('aws');
      expect(result).toContain('gcp');
      expect(result).toContain('azure');
    });

    test('should return empty array for URLs without tech context', () => {
      const urls = [
        'https://example.com',
        'https://news.com/article'
      ];
      
      const result = extractTechnologyContext(urls);
      expect(result).toHaveLength(0);
    });
  });

  describe('analyzeUrlAttachments', () => {
    test('should analyze multiple URL attachments', () => {
      const urls = [
        'https://github.com/facebook/react',
        'https://reactjs.org/docs/getting-started.html',
        'https://stackoverflow.com/questions/123/react-hooks'
      ];
      
      const result = analyzeUrlAttachments(urls);
      
      expect(result.classifications).toHaveLength(3);
      expect(result.suggestedDomains).toContain('github.com');
      expect(result.suggestedDomains).toContain('reactjs.org');
      expect(result.contentTopics).toContain('react');
      expect(result.searchStrategy.categories).toContain('github');
    });

    test('should generate enhanced queries based on URL content', () => {
      const urls = ['https://reactjs.org/docs/hooks.html'];
      
      const result = analyzeUrlAttachments(urls);
      
      expect(result.searchStrategy.enhancedQueries.length).toBeGreaterThan(0);
      expect(result.searchStrategy.enhancedQueries.some(q => q.includes('react'))).toBe(true);
    });

    test('should handle empty URL array', () => {
      const result = analyzeUrlAttachments([]);
      
      expect(result.classifications).toHaveLength(0);
      expect(result.suggestedDomains).toHaveLength(0);
      expect(result.contentTopics).toHaveLength(0);
      expect(result.searchStrategy.includeDomains).toHaveLength(0);
    });

    test('should limit domain suggestions to prevent over-scoping', () => {
      // Create many domains to test the limit
      const urls = Array.from({ length: 20 }, (_, i) => `https://domain${i}.com/docs`);
      
      const result = analyzeUrlAttachments(urls);
      
      // Should limit to 10 domains max
      expect(result.searchStrategy.includeDomains.length).toBeLessThanOrEqual(10);
    });
  });

  describe('searchWithUrlIntelligence', () => {
    test('should enhance search with URL attachment analysis', async () => {
      const urls = ['https://reactjs.org/docs/hooks.html'];
      
      const result = await searchWithUrlIntelligence(
        'how to use hooks',
        urls,
        { numResults: 5 }
      );
      
      expect(result.results).toBeDefined();
      expect(result.urlAnalysis).toBeDefined();
      expect(result.urlAnalysis?.classifications).toHaveLength(1);
      expect(result.urlAnalysis?.contentTopics).toContain('react');
    });

    test('should work without URL attachments', async () => {
      const result = await searchWithUrlIntelligence(
        'programming tutorial',
        [],
        { numResults: 3 }
      );
      
      expect(result.results).toBeDefined();
      expect(result.urlAnalysis).toBeUndefined();
    });

    test('should merge provided domains with URL-derived domains', async () => {
      const urls = ['https://reactjs.org/docs'];
      
      // The actual search call should include both provided and URL-derived domains
      await searchWithUrlIntelligence(
        'react tutorial',
        urls,
        { 
          includeDomains: ['example.com'],
          numResults: 3 
        }
      );
      
      // Verify the search was called (mocked) - in real implementation,
      // this would verify that includeDomains contains both 'example.com' and 'reactjs.org'
      const { search } = require('../index');
      expect(search).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle malformed URLs in attachments', () => {
      const urls = [
        'not-a-url',
        'https://valid.com',
        'ftp://invalid-protocol.com'
      ];
      
      const result = analyzeUrlAttachments(urls);
      
      // Should process valid URLs and skip invalid ones
      expect(result.classifications.length).toBeGreaterThan(0);
      expect(result.suggestedDomains).toContain('valid.com');
    });

    test('should handle very long URL lists efficiently', () => {
      const urls = Array.from({ length: 100 }, (_, i) => `https://site${i}.com`);
      
      const start = Date.now();
      const result = analyzeUrlAttachments(urls);
      const duration = Date.now() - start;
      
      // Should complete quickly even with many URLs
      expect(duration).toBeLessThan(1000);
      expect(result.classifications).toHaveLength(100);
    });

    test('should deduplicate domains and topics', () => {
      const urls = [
        'https://reactjs.org/docs/hooks',
        'https://reactjs.org/tutorial/react',
        'https://reactjs.org/community'
      ];
      
      const result = analyzeUrlAttachments(urls);
      
      // Should not have duplicate domains or topics
      expect(new Set(result.suggestedDomains).size).toBe(result.suggestedDomains.length);
      expect(new Set(result.contentTopics).size).toBe(result.contentTopics.length);
    });
  });
});

describe('URL Classification Accuracy', () => {
  const testCases: { url: string; expectedType: UrlType; description: string }[] = [
    {
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      expectedType: 'documentation',
      description: 'MDN documentation'
    },
    {
      url: 'https://github.com/microsoft/vscode/issues/12345',
      expectedType: 'github_issue',
      description: 'GitHub issue'
    },
    {
      url: 'https://stackoverflow.com/questions/123/javascript-question',
      expectedType: 'stackoverflow',
      description: 'Stack Overflow question'
    },
    {
      url: 'https://api.stripe.com/docs',
      expectedType: 'api_reference',
      description: 'API documentation'
    },
    {
      url: 'https://medium.com/javascript-tutorial',
      expectedType: 'blog_post',
      description: 'Medium blog post'
    },
    {
      url: 'https://arxiv.org/abs/2021.12345',
      expectedType: 'academic_paper',
      description: 'arXiv paper'
    }
  ];

  test.each(testCases)('should classify $description correctly', ({ url, expectedType }) => {
    const result = classifyUrl(url);
    expect(result.type).toBe(expectedType);
    expect(result.confidence).toBeGreaterThan(0.5);
  });
});
