# Bitcode Models Package

Model primitives and configurations for the Bitcode intelligence system.

## Overview

This package provides:
- **Model Primitives**: Core model configuration and provider abstraction
- **Dynamic System Prompts**: Build-time generated prompt configurations
- **UI Integration**: Interface for model configuration UI

## Build-Time Prompt Configuration Generation

Instead of maintaining hardcoded lists of 450+ model call names, this package uses build-time analysis to generate prompt configurations by examining the actual `PipelineSystemPrompt` code.

### How It Works

1. **Static Analysis**: The build process analyzes `PipelineSystemPrompt` TypeScript code using the TypeScript compiler API
2. **Agent Discovery**: Automatically discovers agents from the codebase structure
3. **Configuration Generation**: Creates configurations based on real code patterns
4. **Type Safety**: Generates TypeScript interfaces for compile-time safety

### Usage

#### Generate Configurations

```bash
# Generate configurations manually
npm run generate-prompt-configs

# Automatically generate during build
npm run build  # runs prebuild hook
```

#### Use in UI Components

```typescript
import { useGeneratedModelConfigs } from '@bitcode/models';

// In your models-step.tsx or similar component
function ModelsConfiguration() {
  const { configs, stats, sources, isEmpty } = useGeneratedModelConfigs({
    pipeline: 'asset-pack',
    maxResults: 100
  });

  if (isEmpty) {
    return <div>No configurations found. Run build process to generate.</div>;
  }

  return (
    <div>
      <h3>Generated Configurations ({stats.total})</h3>
      {configs.map(config => (
        <div key={config.id}>
          {config.name} - {config.phase} - {config.agent}
        </div>
      ))}
    </div>
  );
}
```

#### Replace Hardcoded Lists

```typescript
// Before: Hardcoded array
const modelCallNames = [
  'SetupAgentComprehendTaskPlanPrepareReason',
  'SetupAgentComprehendTaskGenerateChunkSumStructuredOutput',
  // ... 450+ entries
];

// After: Build-time generated
import { getModelCallNames } from '@bitcode/models';
const modelCallNames = getModelCallNames();
```

### Configuration Sources

The system supports multiple ways to populate the configuration table:

1. **Generated**: Build-time analysis of PipelineSystemPrompt
2. **Template**: Common pipeline templates
3. **Custom**: Manually defined configurations
4. **Import**: Import from existing user preferences

### File Structure

```
packages/models/
├── src/
│   ├── build-time-prompt-analysis.ts    # Core analysis engine
│   ├── ui-integration.ts                # UI integration layer
│   ├── generated-prompt-configs.ts      # Generated configurations
│   └── generated-prompt-configs.json    # Raw generated data
├── scripts/
│   └── generate-prompt-configs.js       # Build script
└── README.md
```

### Benefits

1. **No Code Duplication**: Analyzes real code instead of maintaining parallel lists
2. **Build-Time Safety**: Catches configuration errors at build time
3. **Automatic Updates**: Configurations update when code changes
4. **Type Safety**: Full TypeScript support with generated interfaces
5. **Performance**: No runtime introspection overhead

### Integration Points

- **Pipeline System**: Analyzes `PipelineSystemPrompt` build methods
- **Agent Discovery**: Scans codebase for agent implementations
- **UI Components**: Provides React-friendly hooks and utilities
- **Build Process**: Integrates with existing build toolchain

### Development

```bash
# Install dependencies
npm install

# Generate configurations
npm run generate-prompt-configs

# Build package
npm run build
```

### Configuration Schema

Each generated configuration includes:

```typescript
interface StaticPromptConfig {
  id: string;
  pipeline: EngiPipeline;
  phase: EngiPhase;
  agent: string;
  step: EngiStep;
  failsafe: EngiFailsafeStep;
  generation: EngiGenerationStep;
  
  // Analysis results
  injectedSubsystems: string[];
  environmentSections: string[];
  buildMethodChain: string[];
  
  // Customization points
  customizationPoints: {
    subsystems: string[];
    environment: string[];
    responseFormat: boolean;
    taskPrompt: boolean;
  };
  
  // Model constraints
  modelConstraints?: {
    minContextWindow?: number;
    preferredProviders?: string[];
    requiresMultimodal?: boolean;
  };
}
```

### Migration Guide

To migrate from hardcoded lists to build-time generated configurations:

1. **Remove hardcoded arrays** from your UI components
2. **Import utilities** from this package
3. **Use generated configurations** via the provided hooks
4. **Add build script** to your package.json prebuild step
5. **Update CI/CD** to include generation step

This approach ensures your prompt configurations stay synchronized with your actual code while providing better type safety and developer experience.
