import {
  buildBtdProtocolProofHook,
  buildBtdProtocolTelemetryEnvelope,
  buildBtdProtocolTelemetryRecord,
  type BtdProtocolProofHookFamily,
  type BtdProtocolTelemetryEvent,
  type BtdProtocolTelemetryInput,
  type BtdProtocolTelemetrySubjectKind,
} from '../src/telemetry';

const issuedAt = '2026-05-21T00:00:00.000Z';

const subjects: Array<{
  event: BtdProtocolTelemetryEvent;
  subjectKind: BtdProtocolTelemetrySubjectKind;
  proofFamily: BtdProtocolProofHookFamily;
  subjectId: string;
  root: string;
}> = [
  {
    event: 'btd.receipt.emitted',
    subjectKind: 'btd_receipt',
    proofFamily: 'btd_receipt',
    subjectId: 'receipt-telemetry-1',
    root: 'receipt-root-1',
  },
  {
    event: 'btd.btc_fee_state.emitted',
    subjectKind: 'btc_fee_state',
    proofFamily: 'btc_fee_state',
    subjectId: 'btc-fee-telemetry-1',
    root: 'btc-fee-root-1',
  },
  {
    event: 'btd.ledger_projection.emitted',
    subjectKind: 'ledger_projection',
    proofFamily: 'ledger_projection',
    subjectId: 'ledger-projection-telemetry-1',
    root: 'ledger-projection-root-1',
  },
  {
    event: 'btd.source_to_shares_proof.emitted',
    subjectKind: 'source_to_shares_proof',
    proofFamily: 'source_to_shares',
    subjectId: 'source-to-shares-telemetry-1',
    root: 'source-to-shares-root-1',
  },
  {
    event: 'btd.bridge_readiness_posture.emitted',
    subjectKind: 'bridge_readiness_posture',
    proofFamily: 'bridge_readiness',
    subjectId: 'bridge-readiness-telemetry-1',
    root: 'bridge-readiness-root-1',
  },
];

function telemetryInput(
  subject: (typeof subjects)[number],
): BtdProtocolTelemetryInput {
  return {
    event: subject.event,
    subjectKind: subject.subjectKind,
    subjectId: subject.subjectId,
    root: subject.root,
    receiptRoot: `${subject.root}-receipt`,
    proofRoot: `${subject.root}-proof`,
    ledgerAnchorId:
      subject.subjectKind === 'ledger_projection' ? 'ledger-anchor-telemetry-1' : undefined,
    artifactPath: `.proofs/${subject.subjectKind}.json`,
    metadata: {
      sourceSafe: true,
      subjectKind: subject.subjectKind,
    },
    issuedAt,
  };
}

describe('Protocol telemetry and proof hooks', () => {
  it('emits source-safe telemetry and proof hooks for receipts, fees, projections, shares, and bridges', () => {
    const telemetry = subjects.map((subject) =>
      buildBtdProtocolTelemetryRecord(telemetryInput(subject)),
    );
    const envelope = buildBtdProtocolTelemetryEnvelope({
      telemetry: subjects.map(telemetryInput),
      proofHooks: subjects.map((subject, index) => ({
        proofFamily: subject.proofFamily,
        subjectKind: subject.subjectKind,
        subjectId: subject.subjectId,
        evidenceRoot: subject.root,
        telemetryRoot: telemetry[index].telemetryRoot,
        theoremIds: ['source-safe', 'typed-output'],
        replayStepIds: ['emit-telemetry', 'bind-proof-hook'],
        witnessArtifactPaths: [`.proofs/${subject.subjectKind}-proof.json`],
        generatedArtifactPath: `.proofs/generated/${subject.subjectKind}-proof.json`,
        issuedAt,
      })),
      issuedAt,
    });

    expect(envelope.kind).toBe('btd.protocol_telemetry_envelope');
    expect(envelope.telemetry).toHaveLength(5);
    expect(envelope.proofHooks).toHaveLength(5);
    expect(envelope.compatibleWith).toEqual(['V32', 'V35']);
    expect(envelope.sourceSafety).toEqual({
      sourceSafe: true,
      protectedSourceVisible: false,
      containsProtectedSource: false,
      containsSecret: false,
    });
    expect(envelope.proofHooks.map((hook) => hook.proofFamily)).toEqual([
      'btd_receipt',
      'btc_fee_state',
      'ledger_projection',
      'source_to_shares',
      'bridge_readiness',
    ]);
  });

  it('fails closed if an event and subject kind do not match', () => {
    expect(() =>
      buildBtdProtocolTelemetryRecord({
        event: 'btd.btc_fee_state.emitted',
        subjectKind: 'btd_receipt',
        subjectId: 'receipt-mismatch',
        root: 'receipt-root',
      }),
    ).toThrow(/event does not match subject kind/);
  });

  it('fails closed on secret-looking or protected-source telemetry metadata', () => {
    expect(() =>
      buildBtdProtocolTelemetryRecord({
        event: 'btd.receipt.emitted',
        subjectKind: 'btd_receipt',
        subjectId: 'receipt-secret',
        root: 'receipt-root',
        metadata: {
          secret: `sb_${'secret'}__not-allowed`,
        },
      }),
    ).toThrow(/metadata key is not source-safe/);

    expect(() =>
      buildBtdProtocolTelemetryRecord({
        event: 'btd.receipt.emitted',
        subjectKind: 'btd_receipt',
        subjectId: 'receipt-source',
        root: 'receipt-root',
        metadata: {
          summary: 'private source text must not be logged',
        },
      }),
    ).toThrow(/must not contain secrets or protected source/);
  });

  it('requires proof hooks to reference envelope telemetry roots', () => {
    expect(() =>
      buildBtdProtocolTelemetryEnvelope({
        telemetry: [telemetryInput(subjects[0])],
        proofHooks: [
          {
            proofFamily: 'btd_receipt',
            subjectKind: 'btd_receipt',
            subjectId: 'receipt-telemetry-1',
            evidenceRoot: 'receipt-root-1',
            telemetryRoot: 'missing-telemetry-root',
            theoremIds: ['source-safe'],
            replayStepIds: ['emit-telemetry'],
            witnessArtifactPaths: ['.proofs/_shared/receipt-proof.json'],
          },
        ],
      }),
    ).toThrow(/telemetryRoot not present/);
  });

  it('requires proof hooks to carry replayable theorem and witness facts', () => {
    expect(() =>
      buildBtdProtocolProofHook({
        proofFamily: 'btd_receipt',
        subjectKind: 'btd_receipt',
        subjectId: 'receipt-hook',
        evidenceRoot: 'receipt-root',
        telemetryRoot: 'telemetry-root',
        theoremIds: [],
        replayStepIds: ['emit-telemetry'],
        witnessArtifactPaths: ['.proofs/_shared/receipt-proof.json'],
      }),
    ).toThrow(/theoremId/);
  });
});
