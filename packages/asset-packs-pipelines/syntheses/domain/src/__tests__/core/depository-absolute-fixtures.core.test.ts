/**
 * Core: absolute fixtures for depository search index / embed.
 */
import {
  absoluteFixturesCorpusText,
  extractAbsoluteFixturesFromMeasurements,
} from '../../depository-absolute-fixtures';

describe('depository-absolute-fixtures (core)', () => {
  it('extracts measured fixtures and skips pure expanded-fill zeros', () => {
    const fixtures = extractAbsoluteFixturesFromMeasurements({
      absolutes: [
        {
          measurementKind: 'function-count',
          label: 'Functions',
          descriptor: 'Auth middleware handlers',
          volume: 0.8,
          status: 'measured',
        },
        {
          measurementKind: 'noise',
          volume: 0,
          status: 'expanded-fill',
        },
      ],
    });
    expect(fixtures).toHaveLength(1);
    expect(fixtures[0].measurementKind).toBe('function-count');
    expect(absoluteFixturesCorpusText(fixtures)).toMatch(/Functions:/);
  });

  it('accepts flat absolute arrays', () => {
    const fixtures = extractAbsoluteFixturesFromMeasurements([
      { kind: 'lang-span', volume: 0.3, label: 'Language span' },
    ]);
    expect(fixtures).toHaveLength(1);
    expect(fixtures[0].measurementKind).toBe('lang-span');
  });
});
