# Test Intelligence System - Bitcode's Unified Testing Architecture

## Overview

The Test Intelligence System unifies fixtures, mocks, dryrun, and Storybook through a reproducible build-time intelligence approach that mirrors Bitcode's core architecture. Like how "comments ARE prompts" in the main system, here "comments ARE test data" - enabling zero-overhead test intelligence at runtime.

## Core Abstractions

### TestPart<T>
The atomic unit of test data - a branded type that represents a single piece of test intelligence.

```typescript
export type TestPart<T = unknown> = T & { readonly __brand: 'TestPart' };
```

### TestComposition
Composed test parts that form complete test scenarios.

```typescript
export interface TestComposition<T = unknown> {
 parts: TestPart<any>[];
 compose(): T;
}
```

### TestScenario
Complete test scenarios with context, data, and behavior.

```typescript
export interface TestScenario {
 id: string;
 name: string;
 description: string;
 context: TestContext;
 data: TestComposition[];
 behavior: TestBehavior;
}
```

## Architecture Principles

### 1. Build-Time Intelligence
All test data is parsed and injected at build time through doc-test comments:

```typescript
/** @doc-test-fixture
 * @scenario enterprise-user-with-team
 * @btd-balance 50000
 * @team-size 10
 * @features ["asset-packs", "evidence_documents", "marketplace"]
 */
export const ENTERPRISE_USER_FIXTURE = createTestPart<User>({
 // User data...
});
```

### 2. Hierarchical Composition
Following Bitcode's pattern:
- TestParts → TestCompositions → TestScenarios → TestSuites
- Each level inherits and extends the previous

### 3. SDIVF Testing Phases
Tests organized by the same phases as Bitcode phased pipelines:
- **Setup**: Test environment preparation
- **Discovery**: Finding relevant test data
- **Implementation**: Executing test scenarios
- **Validation**: Verifying test results
- **Finish**: Cleanup, evidence capture, and delivery-mechanism reporting

### 4. Unified Data Generation
Single source of truth for all test data:

```typescript
export class UnifiedTestDataGenerator {
 generateForScenario(scenario: TestScenario): TestData
 generateForDryRun(config: DryRunConfig): TestData
 generateForStorybook(story: Story): TestData
 generateForFixture(fixture: FixtureConfig): TestData
}
```

## Doc-Test System

### @doc-test-fixture
Defines reusable test fixtures:
```typescript
/** @doc-test-fixture
 * @id user-with-btd-balance
 * @type User
 * @btd-balance 1000
 * @tier professional
 */
```

### @doc-test-scenario
Defines complete test scenarios:
```typescript
/** @doc-test-scenario
 * @id asset-pack-creation-flow
 * @phases ["setup", "discovery", "implementation"]
 * @agents ["ComprehendTaskAgent", "DivideByFileAgent"]
 * @expected-measured-btd 500
 */
```

### @doc-test-behavior
Defines expected behaviors:
```typescript
/** @doc-test-behavior
 * @when user-submits-asset-pack
 * @then pipeline-starts
 * @and btc-fee-hold-reserved
 * @timeout 30000
 */
```

## Integration Points

### 1. DryRun Integration
```typescript
export class DryRunAdapter {
 constructor(private generator: UnifiedTestDataGenerator) {}

 adaptForPipeline(pipeline: Pipeline): DryRunConfig {
 const scenario = this.generator.getScenarioForPipeline(pipeline);
 return {
 mockPlan: () => scenario.data.plan,
 mockGenerate: () => scenario.data.result,
 mockShould: scenario.behavior.assertions
 };
 }
}
```

### 2. Storybook Integration
```typescript
export const withTestIntelligence = (Story: StoryFn, context: StoryContext) => {
 const scenario = TestIntelligence.getScenarioForStory(context);
 const data = TestIntelligence.generate(scenario);

 return (
 <TestIntelligenceProvider data={data}>
 <Story {...context.args} />
 </TestIntelligenceProvider>
 );
};
```

### 3. Mock System Integration
```typescript
export class MockSystemAdapter {
 adaptToMockOrchestrator(scenario: TestScenario): MockScenarioConfig {
 return {
 name: scenario.name,
 scaling: this.deriveScaling(scenario),
 features: this.extractFeatures(scenario),
 data: this.generator.generateForScenario(scenario)
 };
 }
}
```

## Usage Examples

### Creating Test Fixtures
```typescript
/** @doc-test-fixture
 * @id pr-with-conflicts
 * @type PullRequest
 * @conflicts ["src/index.ts", "package.json"]
 * @files-changed 15
 */
export const PR_WITH_CONFLICTS = createTestPart<PullRequest>({
 id: 'pr-123',
 title: 'Feature: Add dark mode',
 state: 'open',
 conflicts: true,
 // ... auto-generated based on doc-test
});
```

### Composing Test Scenarios
```typescript
export const ASSET_PACK_FLOW_SCENARIO = createTestScenario({
 id: 'complete-asset-pack-flow',
 parts: [
 USER_WITH_BTD_BALANCE,
 REPOSITORY_WITH_LSP,
 ASSET_PACK_REQUEST,
 PR_WITH_CONFLICTS
 ],
 behavior: {
 phases: ['setup', 'discovery', 'implementation', 'validation'],
 expectedMeasuredBtd: 500,
 expectedDuration: 120000
 }
});
```

### Using in Tests
```typescript
describe('AssetPack Pipeline', () => {
 const scenario = TestIntelligence.getScenario('complete-asset-pack-flow');

 it('should handle PR with conflicts', async () => {
 const { data, behavior } = scenario;
 const result = await runPipeline(data);

 expect(result).toMatchBehavior(behavior);
 });
});
```

### Using in Storybook
```typescript
export default {
 title: 'Pipelines/AssetPack',
 decorators: [withTestIntelligence],
 parameters: {
 testScenario: 'complete-asset-pack-flow'
 }
};

export const WithConflicts = {
 args: {
 // Args auto-populated from test scenario
 }
};
```

## File Organization

```
/packages/test-intelligence/
 /src/
 /primitives/
 TestPart.ts
 TestComposition.ts
 TestScenario.ts
 /generators/
 UnifiedTestDataGenerator.ts
 ScenarioGenerator.ts
 /adapters/
 DryRunAdapter.ts
 StorybookAdapter.ts
 MockSystemAdapter.ts
 /doc-test/
 DocTestPlugin.ts
 DocTestParser.ts
 /scenarios/
 /generic/
 user-scenarios.ts
 repository-scenarios.ts
 /specific/
 asset-pack-scenarios.ts
```

## Benefits

1. **Zero Duplication**: Single source of test data
2. **Type Safety**: Full TypeScript support with branded types
3. **Build-Time Optimization**: No runtime overhead
4. **Discoverable**: All test data in one place
5. **Composable**: Mix and match test parts
6. **Scenario-Based**: Real-world test cases
7. **Self-Documenting**: Doc-test comments explain data
8. **Unified Interface**: Same API across all test types

This architecture brings the same level of excellence to testing that Bitcode brings to technical knowledge evidence.
