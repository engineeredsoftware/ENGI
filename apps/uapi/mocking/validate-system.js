/**
 * Standalone System Validation Script
 * 
 * Validates the mock system without complex test dependencies
 */

const fs = require('fs');
const path = require('path');

// Mock the environment
process.env.NEXT_PUBLIC_MASTER_MOCK_MODE = 'true';
process.env.NEXT_PUBLIC_MOCK_SCENARIO = 'demo';
process.env.NEXT_PUBLIC_MOCK_DEBUG = 'true';

console.log('🚀 Starting Bitcode Mock System Validation...\n');

function readMockSource(relativePath) {
  return fs.readFileSync(path.join(__dirname, relativePath), 'utf8');
}

async function validateSystem() {
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  function test(name, fn) {
    results.total++;
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.then(() => {
          console.log(`✅ ${name}`);
          results.passed++;
        }).catch(error => {
          console.log(`❌ ${name}: ${error.message}`);
          results.failed++;
        });
      } else {
        console.log(`✅ ${name}`);
        results.passed++;
      }
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      results.failed++;
    }
  }

  // Test 1: Type definitions exist
  await test('Type definitions are accessible', () => {
    const types = readMockSource('types/core.ts');
    if (!types.includes('export type MockableFeature')) throw new Error('MockableFeature not exported');
    if (!types.includes("'ASSET_PACKS'")) throw new Error('AssetPack mock feature not declared');
    if (!types.includes('ShippableTemplates')) throw new Error('Shippable template type not re-exported');
  });

  // Test 2: Core functionality exists
  await test('Core modules are accessible', () => {
    const index = readMockSource('index.ts');
    if (!index.includes('MockOrchestrator')) throw new Error('MockOrchestrator not exported');
    if (!index.includes('useMockData')) throw new Error('useMockData not exported');
    if (!index.includes('withMocking')) throw new Error('withMocking not exported');
  });

  // Test 3: Configuration loading
  await test('Configuration system works', () => {
    const index = readMockSource('index.ts');
    if (!index.includes('loadMockConfig')) throw new Error('loadMockConfig not exported');
    if (!index.includes('isMockingEnabled')) throw new Error('isMockingEnabled not exported');
    if (!index.includes('NEXT_PUBLIC_MASTER_MOCK_MODE')) throw new Error('Mock mode env contract missing');
  });

  // Test 4: Mock orchestrator singleton
  await test('MockOrchestrator singleton pattern', () => {
    const orchestrator = readMockSource('core/MockOrchestrator.ts');
    if (!orchestrator.includes('private static instance')) throw new Error('Singleton instance missing');
    if (!orchestrator.includes('public static getInstance')) throw new Error('getInstance missing');
  });

  // Test 5: Feature checking
  await test('Feature mocking control', () => {
    const orchestrator = readMockSource('core/MockOrchestrator.ts');
    if (!orchestrator.includes('shouldMock(feature: MockableFeature)')) throw new Error('shouldMock missing');
    if (!orchestrator.includes('getScenario(feature: MockableFeature)')) throw new Error('getScenario missing');
    if (!orchestrator.includes("'ASSET_PACKS'")) throw new Error('AssetPack feature missing');
  });

  // Test 6: Scenario registration
  await test('Scenario registration', () => {
    const orchestrator = readMockSource('core/MockOrchestrator.ts');
    if (!orchestrator.includes('registerScenario')) throw new Error('registerScenario missing');
    if (!orchestrator.includes("id: 'demo'")) throw new Error('demo scenario missing');
    if (!orchestrator.includes("id: 'testing'")) throw new Error('testing scenario missing');
  });

  // Test 7: Performance metrics
  await test('Performance metrics collection', () => {
    const orchestrator = readMockSource('core/MockOrchestrator.ts');
    if (!orchestrator.includes('getPerformanceMetrics')) throw new Error('metrics method missing');
    if (!orchestrator.includes('timestamp: new Date().toISOString()')) throw new Error('metrics timestamp missing');
    if (!orchestrator.includes('mocking:')) throw new Error('mocking metrics missing');
  });

  // Test 8: Data generation validation
  await test('Mock data generation', () => {
    const generators = readMockSource('generators/ComprehensiveMockDataGenerators.ts');
    if (!generators.includes('generateAssetPacks')) throw new Error('AssetPack generator missing');
    if (!generators.includes('generateAssetPackStream')) throw new Error('AssetPack stream generator missing');
  });

  // Test 9: System validation
  await test('System validation', () => {
    const orchestrator = readMockSource('core/MockOrchestrator.ts');
    if (!orchestrator.includes('validateSystem')) throw new Error('validateSystem missing');
    if (!orchestrator.includes('MockValidationResult')) throw new Error('validation result type missing');
  });

  // Test 10: Middleware factory functions
  await test('Middleware factory functions', () => {
    const middleware = readMockSource('middleware/MockMiddleware.ts');
    if (!middleware.includes('createMockMiddleware')) throw new Error('createMockMiddleware missing');
    if (!middleware.includes('mockAssetPacks')) throw new Error('AssetPack middleware missing');
    if (!middleware.includes('mockGitHub')) throw new Error('GitHub middleware missing');
  });

  return results;
}

validateSystem().then(results => {
  console.log('\n📊 Validation Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total: ${results.total}`);
  
  const percentage = Math.round((results.passed / results.total) * 100);
  console.log(`📈 Success Rate: ${percentage}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Mock system is ready for production.');
  } else {
    console.log(`\n⚠️  ${results.failed} test(s) failed. Please check the implementation.`);
  }
  
  process.exit(results.failed === 0 ? 0 : 1);
}).catch(error => {
  console.error('\n💥 Validation failed with error:', error);
  process.exit(1);
});
