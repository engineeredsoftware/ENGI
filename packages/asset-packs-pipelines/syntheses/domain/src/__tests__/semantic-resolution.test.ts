// @ts-nocheck
import { Execution } from '@bitcode/execution-generics';
import {
  resolveDeliveryMechanismTemplate,
  resolveDeliveryMechanismTemplateFromExecution,
  resolveExpressedRead,
  resolveExpressedReadFromExecution,
  resolveReadComprehensionFromExecution,
  resolveWrittenAssetType,
  resolveWrittenAssetTypeFromExecution,
} from '../semantic-resolution';

describe('AssetPack semantic resolution', () => {
  it('resolves request labels to the canonical AssetPack kind', () => {
    expect(
      resolveWrittenAssetType({
        writtenAssetType: 'design-document-review',
      })
    ).toBe('read-satisfaction-asset-pack');
  });

  it('keeps written-asset labels out of delivery-mechanism selection', () => {
    expect(resolveDeliveryMechanismTemplate({ writtenAssetType: 'code-change' })).toBe('pull-request');
    expect(resolveDeliveryMechanismTemplate({ writtenAssetType: 'design-document-review' })).toBe('pull-request');
    expect(resolveDeliveryMechanismTemplate({ deliveryMechanismTemplate: 'pull-request' })).toBe('pull-request');
  });

  it('rejects old non-PR delivery labels instead of retaining them', () => {
    expect(() => resolveDeliveryMechanismTemplate({ deliveryMechanismTemplate: 'code-change-review' })).toThrow(
      /pull-request delivery only/
    );
    expect(() => resolveDeliveryMechanismTemplate({ deliveryTarget: 'branch-deployment' })).toThrow(
      /pull-request delivery only/
    );
    expect(() => resolveDeliveryMechanismTemplate({ deliveryMechanism: { type: 'design-document-review' } })).toThrow(
      /pull-request delivery only/
    );
  });

  it('reads delivery-mechanism templates from execution without changing written-asset kind', () => {
    const exec = new Execution('pipeline:asset-pack');
    exec.store('pipeline', 'writtenAssetType', ['read-satisfaction-asset-pack']);
    exec.store('pipeline', 'deliveryMechanismTemplate', 'pull-request');

    expect(resolveWrittenAssetTypeFromExecution(exec)).toBe('read-satisfaction-asset-pack');
    expect(resolveDeliveryMechanismTemplateFromExecution(exec)).toBe('pull-request');
  });

  it('does not resolve delivery mechanisms from written-asset request mirrors', () => {
    const exec = new Execution('pipeline:asset-pack');
    exec.store('pipeline', 'writtenAssetRequest', 'design-review-request');
    exec.store('setup', 'writtenAssetRequest', 'code-review-request');

    expect(resolveDeliveryMechanismTemplateFromExecution(exec)).toBe('pull-request');
  });

  it('prefers semantic read over Definition of Read mirror fields', () => {
    expect(
      resolveExpressedRead({
        read: 'Read a review-ready asset pack',
        definitionOfRead: 'Definition of Read mirror',
      })
    ).toBe('Read a review-ready asset pack');
  });

  it('reads semantic read and read comprehension from execution mirrors first', () => {
    const exec = new Execution('pipeline:asset-pack');
    exec.store('pipeline', 'expressedRead', 'Pipeline read fallback');
    exec.store('read', 'description', 'Read a repository-bound written asset');
    exec.store('setup/read-comprehension', 'comprehension', { intent: 'read-model' });
    exec.store('setup/read', 'comprehension', { intent: 'semantic-read' });

    expect(resolveExpressedReadFromExecution(exec)).toBe('Read a repository-bound written asset');
    expect(resolveReadComprehensionFromExecution(exec)).toEqual({ intent: 'semantic-read' });
  });
});
