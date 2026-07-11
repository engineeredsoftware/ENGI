/**
 * @deprecated Compatibility shim for Terminal-era operational health names.
 * Import from `./operational-health` (or `@bitcode/btd/operational-health`) instead.
 *
 * V48 naming law: operational health is package domain vocabulary, not the
 * retired Terminal cockpit.
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
  OperationalHealthRead as TerminalOperationalHealthRead,
  BuildOperationalHealthReadInput as BuildTerminalOperationalHealthReadInput,
} from './operational-health';

export {
  buildOperationalHealthRead as buildTerminalOperationalHealthRead,
  aggregateOperationalTelemetrySeverity as aggregateTerminalOperationalTelemetrySeverity,
} from './operational-health';
