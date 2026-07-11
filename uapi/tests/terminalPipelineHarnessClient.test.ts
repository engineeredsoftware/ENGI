import {
  buildTerminalReadFitsFindingSynthesisHarnessStreamSnapshot,
  buildTerminalReadFitsFindingSynthesisHarnessRequest,
  drainTerminalReadFitsFindingSynthesisHarnessSseBuffer,
  summarizeTerminalReadFitsFindingSynthesisHarnessEvent,
} from '@/components/bitcode/pipeline/pipeline-harness-client';
import type { TerminalDepositReadWorkbench } from '@/app/terminal/terminal-deposit-read-workbench';
import type { TerminalRepositoryContextState } from '@/app/terminal/terminal-repository-context';

const workbench: TerminalDepositReadWorkbench = {
  canonLabel: 'V27',
  projectionPrincipal: 'buyer',
  branchMode: 'patch',
  scenarioLabel: 'Terminal Read/Fit QA for engineeredsoftware/ENGI',
  profileLabel: 'Read/Fit QA',
  sourceRevision: {
    repositoryFullName: 'engineeredsoftware/ENGI',
    branch: 'main',
    commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
  },
  deposit: {
    summary: 'Repository revision deposit.',
    metrics: [],
    rows: [],
    selectedEntries: [],
    artifactKinds: [],
  },
  read: {
    summary: 'Read the deposited repository revision for fit.',
    metrics: [],
    rows: [{ label: 'Repository', value: 'engineeredsoftware/ENGI' }],
    closureCriteria: [],
    targetKinds: [],
  },
  fit: {
    summary: 'Fit posture.',
    metrics: [],
    rows: [],
  },
};

const repositoryContext: TerminalRepositoryContextState = {
  provider: 'github',
  connectionStatus: {
    connected: true,
    valid: true,
    provider: 'github',
    username: 'engineeredsoftware',
  },
  inventorySource: 'stored_repository_inventory',
  repositories: [],
  selectedRepository: {
    id: '1094184056',
    name: 'ENGI',
    fullName: 'engineeredsoftware/ENGI',
    private: false,
    defaultBranch: 'main',
    url: 'https://github.com/engineeredsoftware/ENGI',
    cloneUrl: 'https://github.com/engineeredsoftware/ENGI.git',
    owner: { id: '84343342', username: 'engineeredsoftware', type: 'organization' },
  },
};

const acceptedReadNeed = {
  schema: 'bitcode.read.need',
  needId: 'need-terminal-test',
  reviewState: 'accepted',
  measurementRoot: 'sha256:need-measurement-root',
};

describe('terminal pipeline harness client', () => {
  it('builds an authenticated live fit harness request from deposited revision and admitted Read evidence', () => {
    const state = buildTerminalReadFitsFindingSynthesisHarnessRequest({
      workbench,
      repositoryContext,
      depositedSourceRevision: {
        repositoryFullName: 'engineeredsoftware/ENGI',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
        activityId: 'deposit-activity',
        depositAssetId: 'asset-repository-revision',
        hasWalletOrAttestationProof: true,
        hasAssetMeasurementEvidence: true,
        proofRoot: 'sha256:proof',
        measurementRoot: 'sha256:measurement',
        reconciliationReadbackRoot: 'sha256:readback',
      },
      readActivityId: 'read-admission-activity',
      acceptedReadNeed,
    });

    expect(state.ready).toBe(true);
    if (!state.ready) throw new Error('expected ready harness request');
    expect(state.request).toMatchObject({
      mode: 'asset_pack_pipeline',
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      sourceGitUrl: 'https://github.com/engineeredsoftware/ENGI.git',
      readId: 'read-admission-activity',
      acceptedReadNeed,
      requireAcceptedReadNeed: true,
      depositId: 'deposit-activity',
      depositAssetId: 'asset-repository-revision',
      depositHasWalletOrAttestationProof: true,
      depositHasAssetMeasurementEvidence: true,
      depositProofRoot: 'sha256:proof',
      depositMeasurementRoot: 'sha256:measurement',
      depositReconciliationReadbackRoot: 'sha256:readback',
    });
  });

  it('reports missing source-bound evidence before running the live harness', () => {
    const state = buildTerminalReadFitsFindingSynthesisHarnessRequest({
      workbench,
      repositoryContext,
      depositedSourceRevision: null,
      readActivityId: null,
      acceptedReadNeed: null,
    });

    expect(state.ready).toBe(false);
    expect(state.missing).toContain('deposit activity');
    expect(state.missing).toContain('admitted Read activity');
    expect(state.missing).toContain('accepted Read-Need');
  });

  it('requires accepted Read-Need review before live Finding Fits run', () => {
    const state = buildTerminalReadFitsFindingSynthesisHarnessRequest({
      workbench,
      repositoryContext,
      depositedSourceRevision: {
        repositoryFullName: 'engineeredsoftware/ENGI',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
        activityId: 'deposit-activity',
      },
      readActivityId: 'read-admission-activity',
      acceptedReadNeed: {
        schema: 'bitcode.read.need',
        needId: 'need-terminal-test',
        reviewState: 'needs_acceptance',
        measurementRoot: 'sha256:need-measurement-root',
      },
    });

    expect(state.ready).toBe(false);
    expect(state.missing).toContain('accepted Read-Need');
  });

  it('drains server-sent harness events while preserving partial buffers', () => {
    const events: Array<{ event: string; data: unknown }> = [];
    const tail = drainTerminalReadFitsFindingSynthesisHarnessSseBuffer(
      'event: harness-started\ndata: {"repositoryFullName":"engineeredsoftware/ENGI"}\n\nevent: harness-event\ndata: {',
      (event) => events.push(event),
    );

    expect(events).toEqual([
      {
        event: 'harness-started',
        data: { repositoryFullName: 'engineeredsoftware/ENGI' },
      },
    ]);
    expect(tail).toBe('event: harness-event\ndata: {');
  });

  it('summarizes completed harness evidence with fit, candidate, telemetry, and ledger posture', () => {
    const summary = summarizeTerminalReadFitsFindingSynthesisHarnessEvent({
      event: 'harness-completed',
      data: {
        outcome: 'completed',
        telemetryLineCount: 72,
        evidence: {
          resultState: 'blocked_readiness',
          fitResult: {
            resultState: 'worthy_fit',
            selectedCandidateAssetIds: ['asset-repository-revision'],
          },
          depositorySearch: {
            searchedAssetCount: 1,
          },
          ledgerSettlement: {
            status: 'settled',
            protectedSourceUnlock: {
              state: 'licensed_read',
              sourceAvailable: true,
            },
          },
          sourceSafePreview: {
            feeQuote: {
              sats: 500,
            },
            unlock: {
              state: 'licensed_read',
              sourceAvailable: true,
            },
          },
          assetPackPreviewBoundary: {
            quoteReceipt: {
              sats: 546,
              quoteRoot: 'sha256:asset-pack-preview-quote-root',
            },
            selectedFitProvenance: {
              selectedCandidateAssetIds: ['asset-repository-revision'],
              fitDepositAssetIds: ['deposit-asset-pack'],
            },
            settlementInstructions: {
              state: 'quote_ready_settlement_required',
            },
            deliveryPosture: {
              state: 'withheld_until_settlement',
            },
          },
          assetPackSettlementRightsDeliveryBoundary: {
            state: 'settlement_delivered',
            rightsTransferRoot: 'sha256:settlement-rights-root',
            paymentObservation: {
              expectedSats: 546,
              observedDebitSats: 546,
            },
            finalityReceipt: {
              finalityState: 'confirmed',
            },
            deliveryUnlock: {
              state: 'source_bearing_pull_request_ready',
            },
            reconciliationReport: {
              state: 'aligned',
            },
          },
          assetPackDisclosureReview: {
            access: {
              sourceVisibility: 'available_after_settlement',
            },
            sourceLeakage: {
              protectedSourceDetected: false,
              findingCount: 0,
            },
          },
        },
      },
    });

    expect(summary).toContain('outcome completed');
    expect(summary).toContain('fit worthy_fit');
    expect(summary).toContain('searched 1 assets');
    expect(summary).toContain('candidate asset-repository-revision');
    expect(summary).toContain('ledger settled');
    expect(summary).toContain('fee 546 sats');
    expect(summary).toContain('quote sha256:asset');
    expect(summary).toContain('settlement quote_ready_settlement_required');
    expect(summary).toContain('delivery withheld_until_settlement');
    expect(summary).toContain('settlement-boundary settlement_delivered');
    expect(summary).toContain('paid 546/546 sats');
    expect(summary).toContain('finality confirmed');
    expect(summary).toContain('rights sha256:settl');
    expect(summary).toContain('delivery-unlock source_bearing_pull_request_ready');
    expect(summary).toContain('reconciliation aligned');
    expect(summary).toContain('source licensed_read');
    expect(summary).toContain('disclosure available_after_settlement');
    expect(summary).toContain('leakage none');
    expect(summary).toContain('telemetry 72 lines');
  });

  it('summarizes command lifecycle harness events for operator debugging', () => {
    expect(
      summarizeTerminalReadFitsFindingSynthesisHarnessEvent({
        event: 'harness-event',
        data: { type: 'command-completed', label: 'asset-pack-pipeline-run', exitCode: 0 },
      }),
    ).toBe('Harness command completed: asset-pack-pipeline-run exit 0.');
  });

  it('summarizes route preflight blockers before sandbox creation', () => {
    expect(
      summarizeTerminalReadFitsFindingSynthesisHarnessEvent({
        event: 'harness-preflight',
        data: {
          realInferenceEnabled: false,
          fullProfileRequiresAsyncCompletion: true,
          openaiCredentialProvided: true,
          supabaseUrlProvided: true,
          supabaseServiceRoleProvided: false,
        },
      }),
    ).toBe('Harness preflight blocked: real inference flag missing, full profile requires async completion gate, Supabase admin key missing.');
  });

  it('summarizes staging lane mismatch before sandbox creation', () => {
    expect(
      summarizeTerminalReadFitsFindingSynthesisHarnessEvent({
        event: 'harness-preflight',
        data: {
          realInferenceEnabled: true,
          openaiCredentialProvided: true,
          supabaseUrlProvided: true,
          supabaseServiceRoleProvided: true,
          supabaseRestDbHostAligned: false,
          supabaseHost: 'production-mainnet.supabase.co',
          supabaseDbHost: 'db.staging-testnet.supabase.co',
        },
      }),
    ).toBe('Harness preflight blocked: Supabase REST/DB lane mismatch.');
  });

  it('does not present missing real inference as a local development blocker when strictness is disabled', () => {
    expect(
      summarizeTerminalReadFitsFindingSynthesisHarnessEvent({
        event: 'harness-preflight',
        data: {
          realInferenceRequired: false,
          realInferenceEnabled: false,
          openaiCredentialProvided: true,
          supabaseUrlProvided: true,
          supabaseServiceRoleProvided: true,
          supabaseHost: 'local.supabase.co',
        },
      }),
    ).toBe('Harness preflight passed with database streaming credentials present; local real-inference strictness off; db local.supabase.co.');
  });

  it('summarizes route preflight profile, budget, and database host when unblocked', () => {
    expect(
      summarizeTerminalReadFitsFindingSynthesisHarnessEvent({
        event: 'harness-preflight',
        data: {
          realInferenceEnabled: true,
          openaiCredentialProvided: true,
          supabaseUrlProvided: true,
          supabaseServiceRoleProvided: true,
          realInferenceProfile: 'bounded',
          runtimeBudgetMs: 600000,
          supabaseHost: 'staging.supabase.co',
        },
      }),
    ).toBe('Harness preflight passed with real inference and database streaming credentials present; profile bounded; budget 600000ms; db staging.supabase.co.');
  });

  it('summarizes live telemetry artifact events with phase, path, and inspected payload shape', () => {
    const summary = summarizeTerminalReadFitsFindingSynthesisHarnessEvent({
      event: 'harness-event',
      data: {
        type: 'telemetry-artifact-event',
        lineNumber: 8,
        telemetryEvent: {
          type: 'pipeline-stream-event',
          streamEventType: 'store',
          stage: 'asset-pack-synthesis',
          namespace: 'llm',
          key: 'parsedOutput',
          executionPath: ['asset_pack', 'synthesis', 'thinkings-generation'],
          runId: '2bdcd936-a686-4a10-92e2-9c64cbef4f0e',
          dataKeys: ['parsed'],
          readingPipelineTelemetry: {
            pipelineName: 'ReadFitsFindingSynthesis',
            level: 'parsed-output',
            phaseId: 'ReadFitsFindingSynthesis.implementation',
            agentId: 'ReadFitsFindingSynthesis.implementation.asset-pack',
            ptrrStepId: 'ReadFitsFindingSynthesis.implementation.asset-pack.try',
            ptrrStepName: 'try',
            thinkingsGenerationId:
              'ReadFitsFindingSynthesis.thinkings-generation.implementation.asset-pack.try.prepare-concise-context',
            promptTemplateId: 'ReadFitsFindingSynthesis.prompt.asset-pack-synthesis',
            outputSchema: 'AssetPackSynthesisOutput',
            returnType: 'AssetPackSynthesisOutput',
          },
          parsedOutputPresent: true,
          promptTemplatePresent: true,
          interpolatedPromptPresent: true,
          reasoningPresent: true,
          judgmentPresent: true,
          rawModelResponsePresent: true,
          parsedTypedOutputPresent: true,
          inspectable: {
            keys: ['resultState', 'assetPack'],
          },
        },
      },
    });

    expect(summary).toContain('Telemetry line 8');
    expect(summary).toContain('asset-pack-synthesis store');
    expect(summary).toContain('llm.parsedOutput');
    expect(summary).toContain('path asset_pack > synthesis > thinkings-generation');
    expect(summary).toContain('run 2bdcd936-a68...');
    expect(summary).toContain('pipeline ReadFitsFindingSynthesis');
    expect(summary).toContain('phase ReadFitsFindingSynthesis.implementation');
    expect(summary).toContain('PTRR implementation.asset-pack.try');
    expect(summary).toContain('ThinkingsGeneration implementation.asset-pack.try.prepare-concise-context');
    expect(summary).toContain('prompt prompt.asset-pack-synthesis');
    expect(summary).toContain('schema AssetPackSynthesisOutput');
    expect(summary).toContain('inspectable resultState, assetPack');
    expect(summary).toContain('prompt template present');
    expect(summary).toContain('interpolated prompt present');
    expect(summary).toContain('reasoning present');
    expect(summary).toContain('judgment present');
    expect(summary).toContain('raw response present');
    expect(summary).toContain('parsed output present');
    expect(summary).toContain('parsed typed output present');
  });

  it('accepts historical persisted events that carry the pre-rename thricified field names', () => {
    const summary = summarizeTerminalReadFitsFindingSynthesisHarnessEvent({
      event: 'harness-event',
      data: {
        type: 'telemetry-artifact-event',
        lineNumber: 9,
        telemetryEvent: {
          type: 'pipeline-stream-event',
          streamEventType: 'store',
          stage: 'asset-pack-synthesis',
          readingPipelineTelemetry: {
            pipelineName: 'ReadFitsFindingSynthesis',
            thricifiedGenerationId:
              'ReadFitsFindingSynthesis.thricified-generation.implementation.asset-pack.try.prepare-concise-context',
          },
        },
      },
    });

    expect(summary).toContain('ThinkingsGeneration implementation.asset-pack.try.prepare-concise-context');
  });

  it('summarizes live tool telemetry with tool name, result state, and input/output posture', () => {
    const summary = summarizeTerminalReadFitsFindingSynthesisHarnessEvent({
      event: 'harness-event',
      data: {
        type: 'telemetry-artifact-event',
        lineNumber: 12,
        telemetryEvent: {
          type: 'pipeline-stream-event',
          streamEventType: 'tool-use',
          stage: 'setup',
          namespace: 'tools',
          key: 'result',
          tool: 'bitcode.asset-pack.verification',
          toolOk: true,
          toolInputPresent: true,
          toolOutputPresent: true,
          toolErrorPresent: false,
          dataKeys: ['input', 'ok', 'output', 'tool'],
        },
      },
    });

    expect(summary).toContain('Telemetry line 12');
    expect(summary).toContain('setup tool-use');
    expect(summary).toContain('tools.result');
    expect(summary).toContain('tool bitcode.asset-pack.verification ok input/output');
  });

  it('adapts live harness events into the canonical execution stream panel payload', () => {
    const snapshot = buildTerminalReadFitsFindingSynthesisHarnessStreamSnapshot(
      [
        {
          event: 'harness-started',
          data: {
            repositoryFullName: 'engineeredsoftware/ENGI',
            runId: '2bdcd936-a686-4a10-92e2-9c64cbef4f0e',
          },
        },
        {
          event: 'harness-event',
          data: {
            type: 'telemetry-artifact-event',
            lineNumber: 9,
            telemetryEvent: {
              type: 'pipeline-stream-event',
              streamEventType: 'store',
              stage: 'asset-pack-synthesis',
              namespace: 'llm',
              key: 'parsedOutput',
              executionState: {
                phase: 'implementation',
                agent: 'asset-pack-synthesis-agent',
                step: 'structured_output',
              },
              readingPipelineTelemetry: {
                pipelineName: 'ReadFitsFindingSynthesis',
                phaseId: 'ReadFitsFindingSynthesis.implementation',
                agentId: 'ReadFitsFindingSynthesis.implementation.asset-pack',
                ptrrStepId: 'ReadFitsFindingSynthesis.implementation.asset-pack.try',
                ptrrStepName: 'try',
                thinkingsGenerationId:
                  'ReadFitsFindingSynthesis.thinkings-generation.implementation.asset-pack.try.prepare-concise-context',
                promptTemplateId: 'ReadFitsFindingSynthesis.prompt.asset-pack-synthesis',
                outputSchema: 'AssetPackSynthesisOutput',
                returnType: 'AssetPackSynthesisOutput',
              },
              inputMessageCount: 2,
              outputContentLength: 1200,
              promptTemplatePresent: true,
              interpolatedPromptPresent: true,
              rawModelResponsePresent: true,
              parsedOutputPresent: true,
              parsedTypedOutputPresent: true,
              inferenceAudit: {
                promptTemplate: { type: 'object', keys: ['templateId'] },
                interpolatedPrompt: { type: 'object', keys: ['messages'] },
                rawModelResponse: { type: 'string', length: 1200 },
                parsedTypedOutput: { type: 'object', keys: ['assetPack'] },
              },
            },
          },
        },
        {
          event: 'harness-event',
          data: {
            type: 'telemetry-artifact-event',
            lineNumber: 10,
            telemetryEvent: {
              type: 'pipeline-stream-event',
              streamEventType: 'tool-use',
              stage: 'setup',
              namespace: 'tools',
              key: 'result',
              tool: 'ReadFitsFindingSynthesis.tool.verification-evidence',
              readingPipelineTelemetry: {
                pipelineName: 'ReadFitsFindingSynthesis',
                phaseId: 'ReadFitsFindingSynthesis.validate',
                agentId: 'ReadFitsFindingSynthesis.validate.fit-quality',
                ptrrStepId: 'ReadFitsFindingSynthesis.validate.fit-quality.try',
                ptrrStepName: 'try',
                toolId: 'ReadFitsFindingSynthesis.tool.verification-evidence',
                outputSchema: 'AssetPackVerificationEvidenceResult',
                returnType: 'ReadyToFinishOutput',
              },
              executionState: {
                phase: 'setup',
                agent: 'bitcode-read-risk-admission',
                step: 'try',
              },
            },
          },
        },
        {
          event: 'harness-completed',
          data: { outcome: 'completed', telemetryLineCount: 11 },
        },
      ],
      'completed',
    );

    expect(snapshot.output).toContain('Harness started');
    expect(snapshot.output).toContain('run 2bdcd936-a68...');
    expect(snapshot.output).toContain('Telemetry line 9');
    expect(snapshot.output).toContain('Telemetry line 10');
    expect(snapshot.runId).toBe('2bdcd936-a686-4a10-92e2-9c64cbef4f0e');
    expect(snapshot.executionState.phase).toBe('Finish');
    expect(snapshot.isStreamingComplete).toBe(true);
    expect(snapshot.generationCount).toBe(1);

    const telemetryLine = snapshot.output
      .split('\n')
      .find((line) => line.includes('Telemetry line 9'));
    expect(telemetryLine).toBeTruthy();
    expect(snapshot.outputDetails[telemetryLine as string]).toMatchObject({
      type: 'generation',
      status: {
        progress: 'in-progress',
        executionState: {
          phase: 'Implementation',
          agent: 'asset-pack-synthesis-agent',
          step: 'try',
          pipeline: 'ReadFitsFindingSynthesis',
          phaseId: 'ReadFitsFindingSynthesis.implementation',
          agentId: 'ReadFitsFindingSynthesis.implementation.asset-pack',
          ptrrStepId: 'ReadFitsFindingSynthesis.implementation.asset-pack.try',
          ptrrStepName: 'try',
          promptTemplateId: 'ReadFitsFindingSynthesis.prompt.asset-pack-synthesis',
          outputSchema: 'AssetPackSynthesisOutput',
        },
      },
    });
    expect((snapshot.outputDetails[telemetryLine as string] as any).status.metadata.inferenceAudit).toMatchObject({
      promptTemplate: { type: 'object', keys: ['templateId'] },
      interpolatedPrompt: { type: 'object', keys: ['messages'] },
      rawModelResponse: { type: 'string', length: 1200 },
      parsedTypedOutput: { type: 'object', keys: ['assetPack'] },
    });
    const toolLine = snapshot.output
      .split('\n')
      .find((line) => line.includes('Telemetry line 10'));
    expect(snapshot.outputDetails[toolLine as string]).toMatchObject({
      type: 'tool-use',
      status: {
        executionState: {
          phase: 'Setup',
          agent: 'bitcode-read-risk-admission',
          step: 'try',
          tool: 'ReadFitsFindingSynthesis.tool.verification-evidence',
          pipeline: 'ReadFitsFindingSynthesis',
          phaseId: 'ReadFitsFindingSynthesis.validate',
          agentId: 'ReadFitsFindingSynthesis.validate.fit-quality',
          ptrrStepId: 'ReadFitsFindingSynthesis.validate.fit-quality.try',
          ptrrStepName: 'try',
          outputSchema: 'AssetPackVerificationEvidenceResult',
        },
      },
    });
  });
});
