import {
  buildConversationStreamEvent,
  buildConversationPipelineLogEvent,
} from '@bitcode/api/conversations';

import {
  buildConversationTerminalHandoffEnvelope,
} from '@/app/conversations/conversation-terminal-handoff';
import {
  assertTerminalEnterpriseReadingUxStateSourceSafe,
  buildTerminalEnterpriseReadingUxState,
} from '@/app/terminal/terminal-enterprise-reading-ux-state';
import {
  buildTerminalReadFitsFindingSynthesisHarnessStreamSnapshot,
} from '@/app/terminal/terminal-pipeline-harness-client';
import {
  readTerminalConversationHandoffContext,
  readTerminalTransactionDetailSection,
} from '@/app/terminal/terminal-transaction-query';

describe('Conversation and Terminal integration coverage', () => {
  it('carries a source-safe Conversation handoff into Terminal Reading state and rich logs', () => {
    const handoff = buildConversationTerminalHandoffEnvelope({
      conversationId: 'conversation-gate-6',
      transactionId: 'transaction-gate-6',
      workflow: 'finding_fits',
      repositoryAnchor: 'engineeredsoftware/ENGI',
      sourceSafeSummary: 'Request Finding Fits for the accepted Read-Need.',
    });
    const terminalUrl = new URL(handoff.terminalRoute, 'https://www.bitcode.exchange');
    const terminalContext = readTerminalConversationHandoffContext(terminalUrl.searchParams);

    expect(handoff.metadata.disclosureClass).toBe('source_safe_conversation_terminal_handoff');
    expect(handoff.metadata.protectedSourceVisible).toBe(false);
    expect(handoff.metadata.unpaidAssetPackSourceVisible).toBe(false);
    expect(handoff.metadata.ledgerAuthorityClaimed).toBe(false);
    expect(handoff.metadata.terminalEnterpriseReadingStage).toBe('request-fit');
    expect(readTerminalTransactionDetailSection(terminalUrl.searchParams)).toBe('activity');
    expect(terminalContext).toMatchObject({
      present: true,
      conversationId: 'conversation-gate-6',
      workflow: 'finding_fits',
      policy: 'allowed',
      repositoryAnchor: 'engineeredsoftware/ENGI',
      readingStage: 'request-fit',
    });

    const readingState = buildTerminalEnterpriseReadingUxState({
      hasRepositorySource: true,
      hasReadMeasurement: true,
      hasSynthesizedNeed: true,
      hasAcceptedNeed: true,
      findingFitsRunning: true,
    });
    expect(readingState.activeStepId).toBe('request-fit');
    expect(assertTerminalEnterpriseReadingUxStateSourceSafe(readingState)).toEqual({
      admitted: true,
      reason: 'source_safe_enterprise_reading_ux_metadata',
    });

    const conversationEvent = buildConversationStreamEvent({
      eventKind: 'tool_call',
      legacySseType: 'pipeline_event',
      runId: 'run-gate-6',
      conversationId: 'conversation-gate-6',
      sequence: 4,
      collapsedStatus: 'Conversation prepared Terminal Finding Fits handoff',
      metadata: {
        terminalRoute: handoff.terminalRoute,
        readingStage: terminalContext.readingStage,
        rawPrompt: 'must not serialize',
        sourceContent: 'must not serialize',
      },
    });
    const pipelineLogEvent = buildConversationPipelineLogEvent(conversationEvent);

    expect(pipelineLogEvent.status.executionState).toMatchObject({
      pipeline: 'ConversationStream',
      phase: 'tooling',
      agent: 'ConversationStreamEvent',
      step: 'try',
      tool: 'conversation-stream-router',
      outputSchema: 'ConversationStreamEvent:tool_call',
    });
    expect(pipelineLogEvent.status.metadata.redactionPosture).toMatchObject({
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawModelResponseVisible: false,
      globalLedgerAuthorityClaimed: false,
    });
    expect(JSON.stringify(pipelineLogEvent.status.metadata.expandedMetadata)).not.toContain('must not serialize');

    const harnessSnapshot = buildTerminalReadFitsFindingSynthesisHarnessStreamSnapshot(
      [
        {
          event: 'harness-event',
          data: {
            type: 'telemetry-artifact-event',
            lineNumber: 1,
            telemetryEvent: {
              runId: 'run-gate-6',
              namespace: 'conversation.terminal_handoff',
              stage: 'request-fit',
              streamEventType: 'tool_call',
              executionState: pipelineLogEvent.status.executionState,
              readingPipelineTelemetry: {
                pipelineName: 'ReadFitsFindingSynthesis',
                phaseId: 'discovery',
                ptrrStepId: 'try',
                thinkingsGenerationId: 'conversation-terminal-handoff-tool-call',
                outputSchema: 'ConversationStreamEvent:tool_call',
              },
              dataKeys: ['eventId', 'proofRoots', 'readingStage'],
            },
          },
        },
      ],
      'running',
    );

    expect(harnessSnapshot.output).toContain('pipeline ReadFitsFindingSynthesis');
    expect(harnessSnapshot.output).toContain('PTRR try');
    expect(harnessSnapshot.outputDetails[harnessSnapshot.output]).toBeDefined();
    expect(harnessSnapshot.executionState).toMatchObject({
      pipeline: 'ReadFitsFindingSynthesis',
      phase: 'Setup',
      agent: 'ConversationStreamEvent',
    });
    expect(JSON.stringify(harnessSnapshot)).not.toContain('must not serialize');
  });
});
