/**
 * Terminal-era export names for operational health.
 *
 * Prefer `./operational-health` (or `@bitcode/btd/operational-health`).
 * Operational health is package domain vocabulary, not a product cockpit name.
 */

export type {
  OperationalReadinessState as TerminalOperationalReadinessState,
  OperationalHealthSeverity as TerminalOperationalHealthSeverity,
  OperationalLaneRead as TerminalOperationalLaneRead,
  OperationalSubsystemRead as TerminalOperationalSubsystemRead,
  OperationalUpgradeRead as TerminalOperationalUpgradeRead,
  OperationalProviderRead as TerminalOperationalProviderRead,
  OperationalSettlementNetworkRead as TerminalOperationalSettlementNetworkRead,
  OperationalMintingRead as TerminalOperationalMintingRead,
  OperationalHealthRead as OperationalHealthRead,
  BuildOperationalHealthReadInput as BuildOperationalHealthReadInput,
} from './operational-health';

export {
  buildOperationalHealthRead as buildOperationalHealthRead,
  aggregateOperationalTelemetrySeverity as aggregateOperationalTelemetrySeverity,
} from './operational-health';
