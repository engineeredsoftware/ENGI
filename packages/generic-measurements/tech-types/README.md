# @bitcode/tech-types

Technology and stack type definitions for the Bitcode platform. This package provides the canonical technology vocabulary used to measure technical needs, normalize product/runtime reality, and keep dependent Bitcode packages and interfaces aligned on the same stack semantics.

## Core Exports

- **Technology Vocabulary**: `Brand`, `Technology`, `Language`, `TechType`, `VersionedTech`, and `composeTechType`
- **Unique Tech Identifiers**: `UniqueTechIdentifier`, `UniqueTech`, `getUniqueTechIdentifier`, `parseUniqueTechIdentifier`, and `getTechVersion`
- **Signal Normalization**: `inferTechnologySignals` for repo/file/config evidence that must become canonical Bitcode `technologyProfile` fields without ad hoc stack-string drift
- **Stack Definitions**: Complete technology stack classifications that productized Bitcode dependents can share without drift

## Technology Categories

```typescript
import {
  Brand,
  Technology,
  Language,
  TechType,
  composeTechType,
} from '@bitcode/tech-types';

// Technology identification
const frontendStack: TechType = composeTechType('Vercel', 'NextJS', 'TypeScript');
const deploymentStack: TechType = composeTechType('CNCF', 'Kubernetes', 'YAML');

// Vocabulary segments used by dependent classifiers
const provider: Brand = 'Vercel';
const framework: Technology = 'NextJS';
const language: Language = 'TypeScript';
```

## Unique Technology Identifiers

```typescript
import {
  UniqueTech,
  getTechVersion,
  getUniqueTechIdentifier,
  parseUniqueTechIdentifier,
} from '@bitcode/tech-types';

// Curated versioned technology identification
const tech: UniqueTech =
  getUniqueTechIdentifier('Vercel', 'NextJS', 'TypeScript', '13.4.0')!;

// Version management
const version = getTechVersion(tech); // '13.4.0'

// Parse the identifier back into read-measurement parts
const parsed = parseUniqueTechIdentifier(tech);
// {
//   umbrella: 'Vercel',
//   tech: 'NextJS',
//   language: 'TypeScript',
//   version: '13.4.0'
// }
```

## Read-Measurement Signal Normalization

`technologyProfile` is the canonical V26 envelope for normalized stack evidence. Package consumers and preserved-protocol read measurement should emit that name directly instead of inventing adjacent shapes.

```typescript
import { inferTechnologySignals } from '@bitcode/tech-types';

const technologyProfile = inferTechnologySignals({
  stackHints: ['typescript', 'github-actions'],
  touchedPaths: ['src/routes/auth.ts', '.github/workflows/ci.yml', 'infra/main.tf'],
  configKeys: ['auth.jwt.issuer'],
});

console.log(technologyProfile);
// {
//   stackHints: ['typescript', 'github-actions', 'yaml', 'terraform', 'hcl', 'auth', 'jwt'],
//   languages: ['TypeScript', 'YAML', 'HCL'],
//   technologies: ['GitHubActions', 'Terraform'],
//   brands: ['GitHub', 'Hashicorp']
// }
```

## Use Cases

- Read-measurement normalization for technical requests and market-facing demand
- Technology stack analysis and reporting
- Project dependency identification
- Framework compatibility checking
- Version tracking and Evidence Document planning
- Technology recommendation systems
- Shared classification for dependent Bitcode packages, APIs, and Terminal surfaces

## Architecture

Provides standardized technology taxonomy and signal normalization for consistent identification across the Bitcode platform. In V26, this package is part of the Bitcode read-measurement spine: the preserved protocol defines the measurement realities, while productized dependents use these types and helpers to classify stacks, requests, assets, and execution contexts without semantic drift.

Current dependent surfaces include the `tech-types-identifier` generic agent package and the AssetPack setup chain, both of which rely on this package to keep inferred stack labels aligned with the preserved protocol's measured-read semantics.
