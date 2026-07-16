import {
  ExecutionPipeline,
  inferExecutionPipelineLineage
} from '../ExecutionPipeline';
import { factoryExecutionPipeline } from '../pipeline-types';

describe('ExecutionPipeline lineage', () => {
  it('infers live lineage for ad hoc execution', () => {
    const lineage = inferExecutionPipelineLineage('ad_hoc');
    expect(lineage).toEqual({
      pipelineName: 'ad_hoc',
      family: 'ad_hoc',
      posture: 'live',
      admittedSurface: 'conversations',
    });
  });

  it('infers live lineage for AssetPack execution', () => {
    const lineage = inferExecutionPipelineLineage('asset-pack');
    expect(lineage).toEqual({
      pipelineName: 'asset-pack',
      family: 'asset_pack',
      posture: 'live',
      admittedSurface: 'bitcode_asset_pack',
    });
  });

  it('stores lineage on root and child pipeline executions', () => {
    const execution = factoryExecutionPipeline('asset-pack');
    const child = execution.child('phase-0');

    expect(execution.lineage.family).toBe('asset_pack');
    expect(execution.get('pipeline', 'posture')).toBe('live');
    expect(execution.get('execution', 'lineage')).toEqual(execution.lineage);

    expect(child.lineage).toEqual(execution.lineage);
    expect(child.get('pipeline', 'family')).toBe('asset_pack');
  });

  it('accepts explicit lineage overrides', () => {
    const execution = new ExecutionPipeline('custom-run', undefined, {
      pipelineName: 'bitcode-measure',
      family: 'custom',
      posture: 'live',
      admittedSurface: 'bitcode_terminal',
    });

    expect(execution.lineage.posture).toBe('live');
    expect(execution.get('pipeline', 'admittedSurface')).toBe('bitcode_terminal');
  });
});
