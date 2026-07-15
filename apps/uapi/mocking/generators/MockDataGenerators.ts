/**
 * Mock Data Generators - enterprise-grade data generation for Bitcode
 * 
 * Provides intelligent, scenario-aware mock data generation with:
 * - Type-safe data structures
 * - Realistic data patterns
 * - Relationship consistency
 * - Performance optimization
 * - Extensible generator plugins
 * - Production-quality validation
 */

import type {
  MockableFeature,
  MockScenarioType,
  MockScenarioConfig,
  MockDataContainer,
  MockComplexity
} from '../types/core';

import type {
  CompletionData,
  PipelineExecution,
  EvidenceDocumentRun,
  Account,
  Repository,
  IssueOrPR,
  RepoFile,
  UrlEntry,
  ShippableHistoryItem
} from '@/types/api';

import type { ShippableTemplates } from '@/types/templates';
import type { IntegrationOption } from '@/types/integrations';
import type { Issue } from '@/types/issues';

/**
 * Generator context for consistent data generation
 */
interface GeneratorContext {
  readonly scenario: MockScenarioType;
  readonly complexity: MockComplexity;
  readonly userId: string;
  readonly orgId?: string;
  readonly realistic: boolean;
  readonly timestamp: string;
  readonly correlationId: string;
}

/**
 * Generator configuration for fine-tuning data generation
 */
interface GeneratorConfig {
  readonly minItems: number;
  readonly maxItems: number;
  readonly includeEdgeCases: boolean;
  readonly includeErrors: boolean;
  readonly relationshipDepth: number;
  readonly dataVariance: number; // 0-1, controls randomness
}

/**
 * Master mock data generator with intelligent scenario awareness
 */
export class MockDataGeneratorEngine {
  private readonly generators = new Map<MockableFeature, DataGenerator>();
  private readonly relationships = new Map<string, RelationshipSpec>();
  private readonly cache = new Map<string, any>();

  constructor() {
    this.initializeGenerators();
    this.initializeRelationships();
  }

  /**
   * Generate mock data for any feature with full type safety
   */
  public async generate<T>(
    feature: MockableFeature,
    context: GeneratorContext,
    config?: Partial<GeneratorConfig>
  ): Promise<MockDataContainer<T>> {
    const generator = this.generators.get(feature);
    if (!generator) {
      throw new Error(`No generator available for feature: ${feature}`);
    }

    const finalConfig = this.mergeConfig(config);
    const cacheKey = this.getCacheKey(feature, context, finalConfig);
    
    // Check cache for consistency
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const startTime = Date.now();
    const data = await generator.generate(context, finalConfig);
    const generationTime = Date.now() - startTime;

    const container = this.wrapData(data, feature, context, generationTime);
    this.cache.set(cacheKey, container);

    return container;
  }

  /**
   * Generate related data across multiple features maintaining consistency
   */
  public async generateRelated<T>(
    primaryFeature: MockableFeature,
    relatedFeatures: MockableFeature[],
    context: GeneratorContext,
    config?: Partial<GeneratorConfig>
  ): Promise<Record<string, MockDataContainer<any>>> {
    const results: Record<string, MockDataContainer<any>> = {};
    
    // Generate primary data first
    results[primaryFeature] = await this.generate(primaryFeature, context, config);
    
    // Generate related data with consistency
    for (const feature of relatedFeatures) {
      const relatedContext = this.createRelatedContext(context, primaryFeature, feature, results[primaryFeature]);
      results[feature] = await this.generate(feature, relatedContext, config);
    }

    return results;
  }

  /**
   * Validate generated data for consistency and correctness
   */
  public validateData<T>(
    feature: MockableFeature, 
    data: MockDataContainer<T>
  ): ValidationResult {
    const validator = this.getValidator(feature);
    return validator.validate(data);
  }

  // ============================================================================
  // Private Implementation
  // ============================================================================

  private initializeGenerators(): void {
    // GitHub-related generators
    this.generators.set('GITHUB_ACCOUNTS', new GitHubAccountGenerator());
    this.generators.set('GITHUB_REPOS', new GitHubRepositoryGenerator());
    this.generators.set('GITHUB_BRANCHES', new GitHubBranchGenerator());
    this.generators.set('GITHUB_COMMITS', new GitHubCommitGenerator());
    this.generators.set('GITHUB_ISSUES', new GitHubIssueGenerator());
    this.generators.set('GITHUB_FILES', new GitHubFileGenerator());

    // Pipeline generators
    this.generators.set('ASSET_PACKS', new AssetPackGenerator());
    this.generators.set('UPGRADES', new EvidenceDocumentGenerator());
    this.generators.set('COMPLETION_DATA', new CompletionDataGenerator());
    this.generators.set('PIPELINE_LOGS', new PipelineLogGenerator());

    // User data generators
    this.generators.set('USER_PROFILE', new UserProfileGenerator());
    this.generators.set('USER_BTD', new UserBtdHoldingsGenerator());
    this.generators.set('USER_NOTIFICATIONS', new UserNotificationGenerator());
    this.generators.set('USER_CONNECTIONS', new UserConnectionGenerator());

    // Template generators
    this.generators.set('TEMPLATES', new TemplateGenerator());
    this.generators.set('USER_TEMPLATES', new UserTemplateGenerator());

    // Integration generators
    this.generators.set('INTEGRATIONS_NOTION', new NotionIntegrationGenerator());
    this.generators.set('INTEGRATIONS_FIGMA', new FigmaIntegrationGenerator());
    this.generators.set('INTEGRATIONS_SLACK', new SlackIntegrationGenerator());

    // Business feature generators
    this.generators.set('MARKETPLACE', new MarketplaceGenerator());
    this.generators.set('CHAT_STREAM', new ChatStreamGenerator());
    this.generators.set('CONVERSATION_RESPONSES', new ConversationResponseGenerator());
  }

  private initializeRelationships(): void {
    // Define data relationships for consistency
    this.relationships.set('GITHUB_REPOS', {
      dependsOn: ['GITHUB_ACCOUNTS'],
      influences: ['GITHUB_BRANCHES', 'GITHUB_COMMITS', 'GITHUB_ISSUES', 'GITHUB_FILES']
    });

    this.relationships.set('ASSET_PACKS', {
      dependsOn: ['GITHUB_REPOS', 'USER_PROFILE'],
      influences: ['COMPLETION_DATA', 'PIPELINE_LOGS']
    });

    this.relationships.set('USER_BTD', {
      dependsOn: ['USER_PROFILE'],
      influences: ['ASSET_PACKS', 'UPGRADES']
    });
  }

  private mergeConfig(config?: Partial<GeneratorConfig>): GeneratorConfig {
    return {
      minItems: 1,
      maxItems: 10,
      includeEdgeCases: false,
      includeErrors: false,
      relationshipDepth: 2,
      dataVariance: 0.3,
      ...config
    };
  }

  private getCacheKey(
    feature: MockableFeature,
    context: GeneratorContext,
    config: GeneratorConfig
  ): string {
    return `${feature}:${context.scenario}:${context.complexity}:${JSON.stringify(config)}`;
  }

  private wrapData<T>(
    data: T,
    feature: MockableFeature,
    context: GeneratorContext,
    generationTimeMs: number
  ): MockDataContainer<T> {
    const dataStr = JSON.stringify(data);
    const sizeBytes = new Blob([dataStr]).size;

    return {
      data,
      metadata: {
        version: '1.0.0',
        generatedAt: context.timestamp,
        source: `MockDataGenerator:${feature}`,
        valid: true,
        metrics: {
          sizeBytes,
          recordCount: Array.isArray(data) ? data.length : 1,
          complexityScore: this.calculateComplexityScore(data)
        },
        scenarios: [context.scenario],
        performance: {
          generationTimeMs,
          memoryUsageKB: sizeBytes / 1024,
          serializationTimeMs: 0
        }
      }
    };
  }

  private calculateComplexityScore(data: any): number {
    if (typeof data !== 'object' || data === null) return 1;
    if (Array.isArray(data)) return Math.min(10, data.length);
    return Math.min(10, Object.keys(data).length);
  }

  private createRelatedContext(
    baseContext: GeneratorContext,
    primaryFeature: MockableFeature,
    relatedFeature: MockableFeature,
    primaryData: MockDataContainer<any>
  ): GeneratorContext {
    // Create context that maintains relationships
    return {
      ...baseContext,
      correlationId: `${baseContext.correlationId}:${relatedFeature}`
    };
  }

  private getValidator(feature: MockableFeature): DataValidator {
    return new GenericDataValidator(); // Could be feature-specific
  }
}

// ============================================================================
// Generator Interfaces and Base Classes
// ============================================================================

interface DataGenerator {
  generate(context: GeneratorContext, config: GeneratorConfig): Promise<any>;
}

interface RelationshipSpec {
  dependsOn: MockableFeature[];
  influences: MockableFeature[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

abstract class BaseDataGenerator implements DataGenerator {
  abstract generate(context: GeneratorContext, config: GeneratorConfig): Promise<any>;

  protected getItemCount(context: GeneratorContext, config: GeneratorConfig): number {
    const complexityMultiplier = {
      'minimal': 0.5,
      'moderate': 1.0,
      'complex': 1.5,
      'enterprise': 2.0,
      'stress': 3.0
    };

    const multiplier = complexityMultiplier[context.complexity] || 1.0;
    const baseCount = Math.floor((config.minItems + config.maxItems) / 2);
    const variance = Math.floor(Math.random() * (config.maxItems - config.minItems + 1));
    
    return Math.max(config.minItems, Math.floor((baseCount + variance) * multiplier));
  }

  protected generateRealisticId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  protected generateRealisticTimestamp(offsetDays: number = 0): string {
    const date = new Date();
    date.setDate(date.getDate() - offsetDays);
    return date.toISOString();
  }

  protected pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  protected generateRealisticText(words: number): string {
    const sampleWords = [
      'implement', 'optimize', 'refactor', 'enhance', 'develop', 'design', 'create', 'build',
      'feature', 'component', 'system', 'service', 'application', 'interface', 'module',
      'performance', 'security', 'scalability', 'reliability', 'maintainability',
      'user', 'experience', 'workflow', 'process', 'automation', 'integration'
    ];

    const result = [];
    for (let i = 0; i < words; i++) {
      result.push(this.pickRandom(sampleWords));
    }
    return result.join(' ');
  }
}

// ============================================================================
// Specific Generators
// ============================================================================

class GitHubAccountGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<Account[]> {
    const count = this.getItemCount(context, config);
    const accounts: Account[] = [];

    for (let i = 0; i < count; i++) {
      accounts.push({
        id: Math.floor(Math.random() * 1000000),
        login: `account-${i + 1}`,
        type: this.pickRandom(['User', 'Organization'])
      });
    }

    return accounts;
  }
}

class GitHubRepositoryGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<Repository[]> {
    const count = this.getItemCount(context, config);
    const repositories: Repository[] = [];

    const repoNames = [
      'awesome-project', 'web-app', 'api-service', 'mobile-client', 'data-pipeline',
      'ml-models', 'infrastructure', 'documentation', 'testing-framework', 'ui-components'
    ];

    for (let i = 0; i < count; i++) {
      repositories.push({
        id: this.generateRealisticId(),
        name: this.pickRandom(repoNames) + (i > 0 ? `-${i}` : '')
      });
    }

    return repositories;
  }
}

class GitHubIssueGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<IssueOrPR[]> {
    const count = this.getItemCount(context, config);
    const issues: IssueOrPR[] = [];

    const issueTitles = [
      'Fix memory leak in user authentication',
      'Add dark mode support',
      'Implement real-time notifications',
      'Optimize database queries',
      'Update dependencies to latest versions',
      'Add unit tests for wallet settlement and BTD issuance',
      'Improve error handling in API endpoints',
      'Enhance mobile responsiveness',
      'Add support for multiple languages',
      'Implement caching layer'
    ];

    for (let i = 0; i < count; i++) {
      const isPR = Math.random() > 0.7; // 30% chance of being a PR
      issues.push({
        id: (i + 1).toString(),
        title: this.pickRandom(issueTitles),
        isPR,
        url: `https://github.com/mock/repo/${isPR ? 'pull' : 'issues'}/${i + 1}`
      });
    }

    return issues;
  }
}

class AssetPackGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<PipelineExecution[]> {
    const count = this.getItemCount(context, config);
    const runs: PipelineExecution[] = [];

    for (let i = 0; i < count; i++) {
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const items: ShippableHistoryItem[] = [];

      for (let j = 0; j < itemCount; j++) {
        items.push({
          id: this.generateRealisticId(),
          title: this.generateRealisticText(4),
          output: this.generateRealisticText(20),
          repository: 'mock-org/mock-repo',
          shippable_type: 'pr',
          shippable_id: (j + 1).toString(),
          shippable_status: this.pickRandom(['open', 'closed', 'merged']),
          attached_urls: [],
          selected_files: [],
          created_at: this.generateRealisticTimestamp(i),
          run_id: `run-${this.generateRealisticId()}`
        });
      }

      runs.push({
        id: `run-${this.generateRealisticId()}`,
        created_at: this.generateRealisticTimestamp(i),
        items,
        summary: this.generateRealisticText(15),
        processing_stats: {
          time: `${Math.floor(Math.random() * 300) + 60}s`,
          tokens: {
            input: Math.floor(Math.random() * 2000) + 500,
            output: Math.floor(Math.random() * 1000) + 200,
            total: 0
          },
          measuredBtd: Math.floor(Math.random() * 50) + 10
        },
        repo_snapshot: {
          org: 'mock-org',
          repo: 'mock-repo',
          branch: 'main',
          commit: Math.random().toString(36).substr(2, 8)
        }
      });
    }

    return runs;
  }
}

class CompletionDataGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<CompletionData> {
    const hasFileChanges = Math.random() > 0.3;
    const hasPR = Math.random() > 0.5;
    const writtenAssets = {
      summary: this.generateRealisticText(25),
      fileChanges: hasFileChanges ? {
        edited: Math.floor(Math.random() * 10) + 1,
        created: Math.floor(Math.random() * 5),
        deleted: Math.floor(Math.random() * 3),
        paths: ['src/main.ts', 'README.md', 'package.json'].slice(0, Math.floor(Math.random() * 3) + 1)
      } : null
    };
    const shippables = {
      pullRequest: hasPR ? {
        url: 'https://github.com/mock/repo/pull/123',
        number: 123,
        title: this.generateRealisticText(8),
        type: 'pr' as const
      } : null,
      fileChanges: writtenAssets.fileChanges,
      summary: writtenAssets.summary,
    };

    return {
      summary: writtenAssets.summary || this.generateRealisticText(25),
      display: 'Mock Asset Pack',
      shippables,
      assetPackSynthesisArtifacts: {
        ...shippables,
        proofEvidence: ['mock AssetPack evidence captured for reread'],
        reviewNotes: ['mock Read-satisfaction artifacts synthesized'],
      },
      writtenAssets,
      deliveryMechanism: shippables,
      semanticKind: 'asset-pack-written-asset',
      read: this.generateRealisticText(10),
      writtenAssetType: this.pickRandom(['code-change', 'code-change-review', 'design-document']),
      assetPack: {
        read: this.generateRealisticText(10),
        writtenAssetType: this.pickRandom(['code-change', 'code-change-review', 'design-document']),
        deliveryTarget: this.pickRandom(['pr', 'comment', 'issue']),
      },
      duration: Math.floor(Math.random() * 300000) + 60000, // 1-5 minutes
      taskType: this.pickRandom(['feature', 'bugfix', 'refactor', 'documentation']),
      processingStats: {
        time: `${Math.floor(Math.random() * 300) + 60}s`,
        tokens: {
          input: Math.floor(Math.random() * 3000) + 1000,
          output: Math.floor(Math.random() * 1500) + 500,
          total: 0
        },
        measuredBtd: Math.floor(Math.random() * 100) + 25
      },
      repoSnapshot: {
        org: 'mock-org',
        repo: 'mock-repo',
        branch: this.pickRandom(['main', 'develop', 'feature/new-ui']),
        commit: Math.random().toString(36).substr(2, 8)
      }
    };
  }
}

class UserProfileGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<any> {
    const usernames = ['developer123', 'codemaster', 'techguru', 'buildermind', 'innovator'];
    const companies = ['TechCorp', 'InnovateLabs', 'BuildWorks', 'CodeCraft', 'DevSolutions'];

    return {
      id: context.userId,
      username: this.pickRandom(usernames),
      display_name: `${this.pickRandom(['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan'])} ${this.pickRandom(['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson'])}`,
      bio: this.generateRealisticText(12),
      company_name: this.pickRandom(companies),
      avatar_url: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 100000)}?v=4`,
      email: `user@${this.pickRandom(companies).toLowerCase()}.com`,
      is_verified: Math.random() > 0.3,
      team_members: this.generateTeamMembers(context, config)
    };
  }

  private generateTeamMembers(context: GeneratorContext, config: GeneratorConfig): any[] {
    if (context.complexity === 'minimal') return [];
    
    const memberCount = Math.floor(Math.random() * 5);
    const members = [];
    
    for (let i = 0; i < memberCount; i++) {
      members.push({
        id: this.generateRealisticId(),
        username: `member${i + 1}`,
        display_name: `Team Member ${i + 1}`,
        role: this.pickRandom(['admin', 'developer', 'reviewer', 'ops'])
      });
    }
    
    return members;
  }
}

class TemplateGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<ShippableTemplates> {
    const generateTemplateList = (category: string, count: number) => {
      const templates = [];
      for (let i = 0; i < count; i++) {
        templates.push({
          id: `${category}-template-${i + 1}`,
          name: `${category} Template ${i + 1}`,
          text: this.generateRealisticText(15)
        });
      }
      return templates;
    };

    return {
      pullRequests: generateTemplateList('PR', this.getItemCount(context, config)),
    };
  }
}

class ChatStreamGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<any> {
    const messageCount = this.getItemCount(context, config);
    const messages = [];

    const sampleMessages = [
      "How can I help you with your development tasks today?",
      "I can assist with creating pull requests, reviewing code, and generating documentation.",
      "Would you like me to analyze your repository and suggest improvements?",
      "I've identified several optimization opportunities in your codebase.",
      "Let me help you implement that feature step by step."
    ];

    for (let i = 0; i < messageCount; i++) {
      messages.push({
        id: this.generateRealisticId(),
        role: i % 2 === 0 ? 'assistant' : 'user',
        content: this.pickRandom(sampleMessages),
        timestamp: this.generateRealisticTimestamp(messageCount - i)
      });
    }

    return {
      messages,
      conversationId: this.generateRealisticId(),
      status: 'active'
    };
  }
}

// ============================================================================
// Additional Generators (simplified for brevity)
// ============================================================================

class GitHubBranchGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<string[]> {
    const branches = ['main', 'develop'];
    const featureBranches = ['feature/auth', 'feature/ui-update', 'feature/api-v2', 'bugfix/memory-leak'];
    
    if (context.complexity !== 'minimal') {
      branches.push(...featureBranches.slice(0, this.getItemCount(context, config)));
    }
    
    return branches;
  }
}

class GitHubCommitGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<any[]> {
    const count = this.getItemCount(context, config);
    const commits = [];

    for (let i = 0; i < count; i++) {
      commits.push({
        sha: Math.random().toString(36).substr(2, 8),
        commit: {
          message: this.generateRealisticText(6),
          author: {
            name: 'Mock Author',
            date: this.generateRealisticTimestamp(i)
          }
        }
      });
    }

    return commits;
  }
}

class GitHubFileGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<RepoFile[]> {
    const files: RepoFile[] = [
      { path: 'README.md', type: 'file', sha: 'abc123' },
      { path: 'package.json', type: 'file', sha: 'def456' },
      { path: 'src', type: 'dir', sha: 'ghi789' },
      { path: 'src/index.ts', type: 'file', sha: 'jkl012' },
      { path: 'src/components', type: 'dir', sha: 'mno345' }
    ];

    return files.slice(0, this.getItemCount(context, config));
  }
}

class UserBtdHoldingsGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<any> {
    const complexity = context.complexity;
    const baseBtdHoldings = {
      'minimal': 100,
      'moderate': 500,
      'complex': 1000,
      'enterprise': 5000,
      'stress': 10000
    };

    return {
      btdBalance: baseBtdHoldings[complexity] || 500,
      measured_this_month: Math.floor(Math.random() * 200),
      lastAcquisition: this.generateRealisticTimestamp(30)
    };
  }
}

// Placeholder generators for remaining features
class EvidenceDocumentGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<EvidenceDocumentRun[]> {
    return []; // Implementation similar to AssetPackGenerator
  }
}

class PipelineLogGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<any[]> {
    return []; // Implementation for pipeline logs
  }
}

class UserNotificationGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<any[]> {
    return []; // Implementation for notifications
  }
}

class UserConnectionGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<any> {
    return {}; // Implementation for user connections
  }
}

class UserTemplateGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<any> {
    return {}; // Implementation for user templates
  }
}

class NotionIntegrationGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<IntegrationOption[]> {
    return []; // Implementation for Notion integration
  }
}

class FigmaIntegrationGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<IntegrationOption[]> {
    return []; // Implementation for Figma integration
  }
}

class SlackIntegrationGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<IntegrationOption[]> {
    return []; // Implementation for Slack integration
  }
}

class MarketplaceGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<any[]> {
    return []; // Implementation for marketplace data
  }
}

class ConversationResponseGenerator extends BaseDataGenerator {
  async generate(context: GeneratorContext, config: GeneratorConfig): Promise<any> {
    return { message: this.generateRealisticText(20) };
  }
}

// ============================================================================
// Validation
// ============================================================================

class GenericDataValidator {
  validate<T>(data: MockDataContainer<T>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.data) {
      errors.push('Data cannot be null or undefined');
    }

    if (!data.metadata) {
      errors.push('Metadata is required');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Export the main generator engine
export const mockDataGenerator = new MockDataGeneratorEngine();
