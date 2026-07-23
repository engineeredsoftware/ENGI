/**
 * Shared measure-agent test fixtures (not a third test class).
 */
import type { MeasurementSpec } from '../../index';

export const QUANTITY_AND_QUALITY_SPECS: MeasurementSpec[] = [
  {
    measurementKind: 'function-count',
    label: 'Functions',
    unit: 'functions',
    guidance: 'How many distinct functions the patch encodes.',
    hasMagnitude: true,
  },
  {
    measurementKind: 'correctness-estimate',
    label: 'Correctness',
    unit: 'estimate',
    guidance: 'Fidelity / coherence of synthesized knowledge.',
  },
];

export const NEEDINESS_LIKE_SPECS: MeasurementSpec[] = [
  {
    measurementKind: 'language-fit',
    label: 'Language fit',
    unit: 'estimate',
    guidance: 'How well stack matches a Need (category test only).',
  },
];
