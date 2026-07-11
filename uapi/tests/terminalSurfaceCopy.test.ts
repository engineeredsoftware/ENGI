import { TERMINAL_SURFACE_COPY } from '@/app/terminal/terminal-workspace-copy';
import {
  TERMINAL_INLINE_EXPLAINERS,
  TERMINAL_SURFACE_EXPLAINERS,
} from '@/components/bitcode/pipeline/models/workspace-explainers';

describe('TERMINAL_SURFACE_COPY', () => {
  it('keeps Bitcode Terminal detail copy centered on activity, asset packs, and proof reading', () => {
    expect(TERMINAL_SURFACE_COPY.frame.title).toContain('Overview');
    expect(TERMINAL_SURFACE_COPY.supply.title).toContain('Deposit');
    expect(TERMINAL_SURFACE_COPY.read.title).toContain('Read');
    expect(TERMINAL_SURFACE_COPY.closure.title).toContain('Proofs');
    expect(TERMINAL_SURFACE_COPY.detail.emptySelection).toContain('asset pack');
    expect(TERMINAL_SURFACE_COPY.detail.transactionSummaryFallback).toContain('selected Terminal result');
  });
});

describe('TERMINAL_SURFACE_EXPLAINERS', () => {
  it('uses Bitcode Terminal activity framing instead of workspace-map naming', () => {
    expect(TERMINAL_SURFACE_EXPLAINERS.activityMap.title).toBe('Bitcode Terminal activity map');
    expect(TERMINAL_SURFACE_EXPLAINERS.activityMap.summary).toContain('deposit, read, fit, verification');
  });

  it('keeps experience framing centered on the Bitcode Terminal and auxillaries', () => {
    expect(TERMINAL_SURFACE_EXPLAINERS.experienceMap.summary).toContain('Bitcode Terminal');
    expect(TERMINAL_SURFACE_EXPLAINERS.experienceMap.summary).toContain('Exchange owns');
    expect(TERMINAL_SURFACE_EXPLAINERS.experienceMap.detail).toContain('activity');
    expect(TERMINAL_SURFACE_EXPLAINERS.experienceMap.detail).toContain('Auxillaries');
    expect(TERMINAL_SURFACE_EXPLAINERS.experienceMap.detail).toContain('Bitcode Protocol');
    expect(TERMINAL_SURFACE_EXPLAINERS.depositReadChain.summary).toContain('read measurement');
    expect(TERMINAL_SURFACE_EXPLAINERS.boundaryRuntime.detail).toContain('asset packs');
    expect(TERMINAL_SURFACE_EXPLAINERS.boundaryRuntime.detail).toContain('ingress/input context');
  });

  it('keeps explainers grounded in current source and canon references', () => {
    expect(TERMINAL_SURFACE_EXPLAINERS.controls.references?.source).toContain(
      'uapi/app/terminal/TerminalCommandDeck.tsx',
    );
    expect(TERMINAL_SURFACE_EXPLAINERS.controls.references?.canon).toContain(
      'BITCODE_SPEC_V26.md § Terminal acceptance matrix',
    );
  });

  it('defines field-adjacent explainers for transactional and repository posture', () => {
    expect(TERMINAL_INLINE_EXPLAINERS.transactionReadiness.summary).toContain('shared operator contract');
    expect(TERMINAL_INLINE_EXPLAINERS.repositoryAnchor.detail).toContain('recent Terminal activity');
    expect(TERMINAL_INLINE_EXPLAINERS.depositSubmission.references?.canon).toContain(
      'BITCODE_SPEC_V26_PARITY_MATRIX.md § Terminal acceptance parity matrix',
    );
  });
});
