/**
 * @bitcode/measurement-generics
 *
 * Measurement primitive package.
 * Agent implementer: packages/generic-agents/agent-measure/
 * Category bases: packages/generic-measurements/{absolutes,needinesses}/
 * Product: packages/generic-asset-packs/{synthesis,settle}/
 */

export type {
  MeasurementKindCategory,
  MeasurementSpec,
  MeasurementReading,
  MeasurementOutput,
  AssetPackMeasurements,
} from './types';

export {
  MeasurementReadingSchema,
  MeasurementOutputSchema,
  AssetPackMeasurementsSchema,
  emptyAssetPackMeasurements,
} from './types';
