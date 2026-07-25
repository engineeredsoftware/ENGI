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
  AbsoluteReadingStatus,
  DataPackMeasureReport,
} from './types';

export {
  MeasurementReadingSchema,
  MeasurementOutputSchema,
  AssetPackMeasurementsSchema,
  DataPackMeasureReportSchema,
  emptyAssetPackMeasurements,
} from './types';
