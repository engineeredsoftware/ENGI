/**
 * DataPack material identity SSOT — buyer-visible compositions, inventories,
 * controlled tags, and companion scalar absolute volumes.
 *
 * Hierarchy: measurement-generics → this domain package → pipeline host measure
 * → depository index / hybrid search → Exchange UX.
 */

export type {
  DataPackMaterialIdentity,
  MaterialComposition,
  MaterialIdentityHonesty,
  MaterialIdentitySourceFile,
  MaterialInventory,
  MaterialInventoryItem,
  MaterialTagSet,
  MeasureMaterialIdentityInput,
} from './types';

export {
  API_STYLES,
  ARCHITECTURE_EVIDENCE,
  ARCHITECTURAL_PATTERNS,
  CAPABILITY_TAGS,
  CHANGE_INTENTS,
  CONCURRENCY_MODELS,
  DATA_ARCHITECTURES,
  DEPENDENCY_CLASSES,
  FRAMEWORK_FINGERPRINTS,
  LANGUAGE_BASENAME_MAP,
  LANGUAGE_EXT_MAP,
  MATERIAL_IDENTITY_SCALAR_KINDS,
  MATERIAL_IDENTITY_SCALAR_KIND_SPECS,
  PURPOSE_CLASSES,
  RUNTIME_EVIDENCE,
  RUNTIME_TARGETS,
  type ApiStyle,
  type ArchitecturalPattern,
  type CapabilityTag,
  type ChangeIntent,
  type ConcurrencyModel,
  type DataArchitecture,
  type DependencyClass,
  type FrameworkFingerprint,
  type MaterialIdentityScalarKind,
  type PurposeClass,
  type RuntimeTarget,
} from './vocabularies';

export {
  buildCorpusTokens,
  emptyMaterialIdentity,
  listMaterialIdentityScalarKinds,
  measureDataPackMaterialIdentity,
} from './extract';
