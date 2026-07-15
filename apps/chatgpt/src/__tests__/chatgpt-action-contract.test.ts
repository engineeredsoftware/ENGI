import {
  BTD_CHATGPT_APP_ACTION_CONTRACT_IDS,
  getBtdChatGptAppActionContract,
  renderBtdChatGptAppSourceSafeResponse,
} from '@bitcode/btd/chatgpt-app-action-contract';
import {
  buildBtdReadLicenseAssetPackRightsInterfaceRegistry,
} from '@bitcode/btd/read-license-assetpack-rights-contract';
import { getBitcodeTools } from '../tools';

describe('ChatGPT App Reading action contracts', () => {
  const tools = getBitcodeTools();

  const findTool = (name: string) => {
    const tool = tools.find((candidate) => candidate.name === name);
    if (!tool) throw new Error(`Missing ChatGPT App tool ${name}`);
    return tool;
  };

  it('registers every package-owned Reading action contract as a ChatGPT App tool', () => {
    for (const actionId of BTD_CHATGPT_APP_ACTION_CONTRACT_IDS) {
      const contract = getBtdChatGptAppActionContract(actionId);
      const tool = findTool(actionId);

      expect(tool.name).toBe(contract.actionId);
      expect(tool.description).toBe(contract.description);
      expect(tool.inputSchema).toEqual(contract.inputSchema);
      expect(tool.meta).toMatchObject({
        categories: ['reading', 'source-safe-action'],
        contractRoot: contract.contractRoot,
        flowObject: contract.flowObject,
        sourceSafeRendererId: contract.sourceSafeRendererId,
      });
    }
  });

  it('executes Read request action with source-safe response rendering and proof roots', async () => {
    const tool = findTool('bitcode_request_read');
    const result = await tool.execute({
      readerId: 'reader-1',
      repository: 'engineeredsoftware/ENGI',
      readRequest: 'Repair the staged Reading flow.',
      requestId: 'read-request-1',
    });

    expect(result).toMatchObject({
      result: {
        readRequestRoot: expect.stringMatching(/^chatgpt-readRequestRoot:[a-f0-9]{24}$/),
        readinessState: 'admitted-for-read-need-comprehension',
        nextAction: 'synthesize-read-need',
      },
      metadata: {
        actionContract: {
          actionId: 'bitcode_request_read',
          flowObject: 'read_request',
          inputSchemaId: 'bitcode.chatgpt.bitcode_request_read.input.v1',
        },
        sourceSafeResponse: {
          kind: 'btd.chatgpt_app_source_safe_response',
          status: 'accepted',
          sourceSafety: {
            sourceSafe: true,
            protectedSourceVisible: false,
            containsSecret: false,
            containsProtectedSource: false,
          },
          proofRootProjection: expect.objectContaining({
            actionId: 'bitcode_request_read',
            requestRoot: expect.stringMatching(/^chatgpt-action-request:[a-f0-9]{24}$/),
            sourceSafeRendererId: 'chatgpt.sourceSafeRenderer.bitcode_request_read',
          }),
        },
      },
    });
    const forbiddenSourcePattern = new RegExp(
      `raw source|private source|${['sk', 'proj'].join('-')}|${['sb', 'secret'].join('_')}__`,
      'i',
    );
    expect(JSON.stringify(result)).not.toMatch(forbiddenSourcePattern);
  });

  it('requires schema-valid arguments before executing package-owned actions', () => {
    const tool = findTool('bitcode_request_finding_fits');

    expect(tool.validator.safeParse({ depositoryScope: 'all-deposits' }).success).toBe(false);
    expect(
      tool.validator.safeParse({
        acceptedNeedRoot: 'accepted-need-root',
        depositoryScope: 'all-deposits',
        minimumFitConfidence: 0.76,
        candidateLimit: 8,
      }).success,
    ).toBe(true);
  });

  it('renders denied states with readable repair actions for ChatGPT App responses', () => {
    const response = renderBtdChatGptAppSourceSafeResponse({
      actionId: 'bitcode_deliver_asset_pack',
      status: 'denied',
      deniedStateCode: 'READ_LICENSE_REQUIRED',
      requestRoot: 'delivery-request-root',
      visibleFields: {
        deliveryState: 'blocked',
      },
    });

    expect(response.status).toBe('denied');
    expect(response.summary).toContain('paid read license');
    expect(response.repairActions).toEqual(['refresh-read-license-evidence-after-settlement']);
    expect(response.proofRootProjection).toMatchObject({
      actionId: 'bitcode_deliver_asset_pack',
      authPolicyId: 'interface.authorization.chatgpt-reading-action',
    });
  });

  it('keeps Gate 9 ChatGPT App delivery source-safe until readers settle before delivery', () => {
    const registry = buildBtdReadLicenseAssetPackRightsInterfaceRegistry();
    const readLicense = registry.readLicenseContracts.find(
      (contract) => contract.interfaceSurface === 'chatgpt_app',
    );
    const rights = registry.assetPackRightsContracts.find(
      (contract) => contract.interfaceSurface === 'chatgpt_app',
    );

    expect(readLicense).toMatchObject({
      interfaceSurface: 'chatgpt_app',
      decision: 'locked_source_denied',
      protectedSourceVisible: false,
    });
    expect(rights).toMatchObject({
      interfaceSurface: 'chatgpt_app',
      decision: 'rights_delivery_denied',
      protectedSourceVisible: false,
    });
    expect(rights?.denialCodes).toEqual(
      expect.arrayContaining(['SETTLEMENT_REQUIRED', 'RIGHTS_TRANSFER_REQUIRED']),
    );
    expect(JSON.stringify({ readLicense, rights })).not.toContain('diff --git');
  });
});
