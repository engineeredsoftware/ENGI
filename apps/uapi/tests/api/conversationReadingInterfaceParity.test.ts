/**
 * @jest-environment node
 */

import {
  buildReadingInterfaceProductParity,
  type ReadingInterfaceProductParity,
} from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs/reading-interface-product-parity';

describe('Conversation Reading interface parity', () => {
  it('keeps Conversation as a source-safe product handoff for ReadingInterfaceProductParity', () => {
    const parity: ReadingInterfaceProductParity = buildReadingInterfaceProductParity();
    const conversation = parity.rows.find((row) => row.surface === 'conversation');

    expect(conversation).toMatchObject({
      surface: 'conversation',
      authorityMode: 'product-delegated-handoff',
      ownerPackage: 'apps/uapi/components/conversations',
      entrypoint: 'conversation.product-reading-handoff',
      sameAuthorityAsProduct: true,
      parallelAuthorityCreated: false,
      stageContract: {
        acceptedNeedRequired: true,
        sourceSafePreviewOnlyBeforeSettlement: true,
        settlementUnlockRequiredForSource: true,
        btdRightsRequiredForDelivery: true,
        sourceBearingDeliveryAllowedBeforeSettlement: false,
      },
      noBypassReadback: {
        acceptedNeedGate: 'denied_without_accepted_need',
        deliveryBoundary: 'source_bearing_delivery_locked_until_settlement_and_rights',
      },
    });
    expect(parity.noBypassReadback.allSurfacesUseProductAuthority).toBe(true);
    expect(parity.noBypassReadback.packageConsumersReadContractsOnly).toBe(true);
    expect(JSON.stringify(parity)).not.toContain('diff --git');
    expect(JSON.stringify(parity)).not.toContain(`${['sk', 'proj'].join('-')}-`);
  });
});
