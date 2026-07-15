/**
 * product-era export names for operational health.
 *
 * Prefer `./operational-health` (or `@bitcode/btd/operational-health`).
 * Operational health is package domain vocabulary, not a product cockpit name.
 */

export type {
  OperationalReadinessState as productOperationalReadinessState,
  OperationalHealthSeverity as productOperationalHealthSeverity,
  OperationalLaneRead as productOperationalLaneRead,
  OperationalSubsystemRead as productOperationalSubsystemRead,
  OperationalUpgradeRead as productOperationalUpgradeRead,
  OperationalProviderRead as productOperationalProviderRead,
  OperationalSettlementNetworkRead as productOperationalSettlementNetworkRead,
  OperationalMintingRead as productOperationalMintingRead,
  OperationalHealthRead as OperationalHealthRead,
  BuildOperationalHealthReadInput as BuildOperationalHealthReadInput,
} from './operational-health';

export {
  buildOperationalHealthRead as buildOperationalHealthRead,
  aggregateOperationalTelemetrySeverity as aggregateOperationalTelemetrySeverity,
} from './operational-health';
