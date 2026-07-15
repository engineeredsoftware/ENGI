/**
 * Test Intelligence Integration Examples
 * 
 * This file demonstrates how to integrate the Test Intelligence system
 * with existing Bitcode infrastructure for a unified testing experience.
 */

import {
  testIntelligence,
  generator,
  dryRunAdapter,
  mockAdapter,
  storybookAdapter,
  ENTERPRISE_ASSET_PACK_SCENARIO,
  MINIMAL_ASSET_PACK_SCENARIO,
  type TestScenario
} from '@bitcode/test-intelligence';

// =============================================================================
// EXAMPLE 1: DryRun Integration
// =============================================================================

/**
 * Configure dryrun for AssetPack pipeline testing
 */
export async function setupAssetPackDryRun() {
  // Create dryrun config from scenario
  const dryRunConfig = dryRunAdapter.adaptScenario(ENTERPRISE_ASSET_PACK_SCENARIO);
  
  // Use in pipeline
  const pipelineConfig = {
    pipeline: 'asset-pack',
    dryRun: true,
    dryRunConfig,
    // Other pipeline config...
  };
  
  console.log('DryRun configured for AssetPack pipeline');
  console.log('Mock plan:', await dryRunConfig.mockPlan());
  console.log('Mock generate:', await dryRunConfig.mockGenerate());
  
  return pipelineConfig;
}

/**
 * Create streaming dryrun for realistic testing
 */
export async function* streamingDryRunExample() {
  const streamingConfig = dryRunAdapter.createStreamingConfig(ENTERPRISE_ASSET_PACK_SCENARIO);
  
  // Stream events
  const generateFn = streamingConfig.mockGenerate as AsyncGeneratorFunction;
  for await (const event of generateFn()) {
    console.log('Streaming event:', event);
    yield event;
  }
}

// =============================================================================
// EXAMPLE 2: Mock System Integration
// =============================================================================

/**
 * Configure MockOrchestrator with Test Intelligence
 */
export async function setupMockOrchestrator() {
  // Register scenarios with mock features
  mockAdapter.registerScenarioForFeatures(ENTERPRISE_ASSET_PACK_SCENARIO, [
    'ASSET_PACKS',
    'GITHUB_REPOS',
    'USER_PROFILE',
    'BTD_HOLDINGS'
  ]);
  
  mockAdapter.registerScenarioForFeatures(MINIMAL_ASSET_PACK_SCENARIO, [
    'ASSET_PACKS'
  ]);
  
  // Get mock data for a feature
  const assetPacksMock = await mockAdapter.getMockData('ASSET_PACKS', 'enterprise');
  console.log('AssetPacks mock data:', assetPacksMock);
  
  // Stream mock data
  const stream = mockAdapter.streamMockData('ASSET_PACKS', {
    eventCount: 5,
    eventDelay: 200,
    scaling: 'enterprise'
  });
  
  for await (const event of stream) {
    console.log('Mock stream event:', event);
  }
  
  // Create orchestrator configuration
  const orchestratorConfig = mockAdapter.createOrchestratorConfig([
    ENTERPRISE_ASSET_PACK_SCENARIO,
    MINIMAL_ASSET_PACK_SCENARIO
  ]);
  
  return orchestratorConfig;
}

/**
 * Use mock middleware in API routes
 */
export function createMockMiddleware() {
  const middleware = mockAdapter.createMiddleware();
  
  return async (req: Request, res: Response, next: Function) => {
    const feature = req.query.feature as MockableFeature;
    
    // Before mock
    await middleware.beforeMock(feature, { req, res });
    
    // Your API logic here...
    const result = await yourApiHandler(req, res);
    
    // After mock
    await middleware.afterMock(feature, result, { req, res });
    
    next();
  };
}

// =============================================================================
// EXAMPLE 3: Storybook Integration
// =============================================================================

/**
 * Configure Storybook with Test Intelligence
 */
export function setupStorybook() {
  // Register scenarios for stories
  storybookAdapter.registerScenarios({
    'asset-packs-enterprise': ENTERPRISE_ASSET_PACK_SCENARIO,
    'asset-packs-minimal': MINIMAL_ASSET_PACK_SCENARIO
  });
  
  // Get decorator
  const decorator = storybookAdapter.globalDecorator();
  
  // Get parameters
  const parameters = storybookAdapter.getParameters();
  
  // Get toolbar config
  const toolbar = storybookAdapter.getToolbar();
  
  return {
    decorators: [decorator],
    parameters,
    toolbar
  };
}

/**
 * Create story variations from scenarios
 */
export function createAssetPackStories() {
  const baseStory = {
    title: 'Pipelines/AssetPack',
    component: AssetPackPipeline,
    parameters: {
      layout: 'fullscreen'
    }
  };
  
  // Generate variations
  const variations = storybookAdapter.createStoryVariations(baseStory, [
    ENTERPRISE_ASSET_PACK_SCENARIO,
    MINIMAL_ASSET_PACK_SCENARIO
  ]);
  
  return {
    default: baseStory,
    ...variations
  };
}

/**
 * Use Test Intelligence in a component
 */
export function AssetPackComponent() {
  const { scenario, data, mode } = useTestIntelligence();

  return {
    title: 'AssetPack Pipeline',
    scenarioName: scenario.name,
    mode,
    serializedData: JSON.stringify(data, null, 2),
  };
}

// =============================================================================
// EXAMPLE 4: Unified Test Suite
// =============================================================================

/**
 * Create a unified test suite using Test Intelligence
 */
export function createUnifiedTestSuite() {
  describe('AssetPack Pipeline', () => {
    // Use scenario for test data
    const scenario = ENTERPRISE_ASSET_PACK_SCENARIO;
    const testData = generator.generateForScenario(scenario);
    
    beforeEach(() => {
      // Setup test environment with generated data
      setupTestEnvironment(testData.data);
    });
    
    it('should handle enterprise AssetPack with conflicts', async () => {
      // Run test with scenario data
      const result = await runAssetPackPipeline(testData.data.request);
      
      // Use scenario assertions
      for (const assertion of scenario.behavior.assertions || []) {
        expect(assertion.check(result)).toBe(true);
      }
    });
    
    it('should respect performance constraints', async () => {
      const start = Date.now();
      const result = await runAssetPackPipeline(testData.data.request);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(scenario.performance?.timeout || Infinity);
    });
  });
}

// =============================================================================
// EXAMPLE 5: Custom Scenario Registration
// =============================================================================

/**
 * Register custom scenarios
 */
export function registerCustomScenarios() {
  const customScenario: TestScenario = {
    id: 'custom-auth-scenario',
    name: 'Custom Authentication Scenario',
    description: 'Test authentication edge cases',
    context: {
      environment: 'test',
      user: {
        id: 'test-user',
        role: 'admin',
        btdBalance: 10000
      }
    },
    data: [
      createTestComposition({
        id: 'auth-data',
        name: 'Authentication Test Data',
        parts: [],
        compose: () => ({
          users: generateUsers(10),
          tokens: generateTokens(10),
          sessions: generateSessions(5)
        })
      })
    ],
    behavior: {
      phases: ['setup', 'validation'],
      expectedDuration: 5000,
      expectations: {
        success: true
      }
    },
    tags: ['auth', 'custom', 'edge-cases']
  };
  
  // Register with Test Intelligence
  testIntelligence.registerScenarios([customScenario]);
  
  // Register with specific adapters
  mockAdapter.registerScenarioForFeatures(customScenario, ['AUTH', 'USERS']);
  storybookAdapter.registerScenario('auth-custom', customScenario);
}

// =============================================================================
// EXAMPLE 6: Performance Testing
// =============================================================================

/**
 * Use Test Intelligence for performance testing
 */
export async function performanceTestExample() {
  const modes: Array<'minimal' | 'realistic' | 'comprehensive'> = [
    'minimal',
    'realistic', 
    'comprehensive'
  ];
  
  const results = [];
  
  for (const mode of modes) {
    const start = performance.now();
    const data = generator.generateForScenario(ENTERPRISE_ASSET_PACK_SCENARIO, mode);
    const duration = performance.now() - start;
    
    results.push({
      mode,
      generationTime: duration,
      dataSize: data.metadata.size,
      scenario: data.metadata.scenario
    });
  }
  
  console.table(results);
  
  // Assert performance constraints
  expect(results[0].generationTime).toBeLessThan(10); // Minimal should be fast
  expect(results[2].dataSize).toBeGreaterThan(results[0].dataSize); // Comprehensive should be larger
}

// =============================================================================
// EXAMPLE 7: Migration from Existing Systems
// =============================================================================

/**
 * Migrate from existing fixture files
 */
export async function migrateFromFixtures() {
  // Read existing fixture
  const existingFixture = await import('./old-fixtures/user.fixture.json');
  
  // Create TestPart from fixture
  const userPart = createTestPart(existingFixture.default);
  
  // Create composition
  const composition = createTestComposition({
    id: 'migrated-user-data',
    name: 'Migrated User Data',
    parts: [userPart],
    compose: () => existingFixture.default
  });
  
  // Create scenario
  const scenario = new TestScenarioBuilder()
    .id('migrated-user-scenario')
    .name('Migrated User Scenario')
    .description('Scenario created from existing fixtures')
    .context({ environment: 'test' })
    .addData(composition)
    .behavior({ expectations: { success: true } })
    .build();
  
  // Register scenario
  testIntelligence.registerScenarios([scenario]);
}

// =============================================================================
// HELPER FUNCTIONS (for examples)
// =============================================================================

function setupTestEnvironment(data: any) {
  // Mock implementation
}

async function runAssetPackPipeline(request: any) {
  // Mock implementation
  return { success: true };
}

function generateUsers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i}`,
    email: `user${i}@example.com`
  }));
}

function generateTokens(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `token-${i}`,
    value: `jwt-${i}`
  }));
}

function generateSessions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `session-${i}`,
    userId: `user-${i}`
  }));
}

async function yourApiHandler(req: any, res: any) {
  return { success: true };
}

// Mock component for example
function AssetPackPipeline(props: any) {
  return null;
}

// Type imports for examples
type MockableFeature = import('@bitcode/test-intelligence').MockableFeature;
type Request = any;
type Response = any;
type AsyncGeneratorFunction = () => AsyncGenerator<any>;
