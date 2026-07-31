/**
 * Core: deposit vs read Implementation + Validation prompt product identity
 * (STAB-A1 / STAB-4).
 */
import { createDepositSynthesisPrompt } from '../../agents/implementation/asset-packs-synthesis-prompts';
import { createReadSynthesisPrompt } from '../../agents/implementation/asset-packs-synthesis-prompts-read';
import { createDepositCommercialNlPrompt } from '../../agents/implementation/asset-packs-commercial-nl-prompts';
import { createReadCommercialNlPrompt } from '../../agents/implementation/asset-packs-commercial-nl-prompts-read';
import { createDepositValidationPrompt } from '../../agents/validation/asset-packs-validation-prompts';
import { createReadValidationPrompt } from '../../agents/validation/asset-packs-validation-prompts-read';
import { projectDepositoryHitsForImplementation } from '../../agents/implementation/implementation-agent-asset-packs-patch-plan';

function promptText(prompt: { get: (k: string) => unknown }, key: string): string {
  const part = prompt.get(key);
  return typeof part === 'string' ? part : String(part ?? '');
}

describe('asset-packs product prompts (core)', () => {
  it('deposit patch-plan identity names deposit; read names Need and hits', () => {
    const deposit = createDepositSynthesisPrompt();
    const read = createReadSynthesisPrompt();
    const dId = promptText(deposit as any, 'agent:identity');
    const rId = promptText(read as any, 'agent:identity');
    const rReq = promptText(read as any, 'agent:requirements');
    expect(dId.toLowerCase()).toContain('deposit');
    expect(dId.toLowerCase()).toContain('obfuscation');
    expect(rId.toLowerCase()).toContain('need');
    expect(rId.toLowerCase()).toContain('read');
    expect(rId.toLowerCase()).not.toMatch(/obfuscation/);
    expect(rReq).toMatch(/depositoryHits/);
    expect(rReq).toMatch(/acceptanceCriteria|Need/i);
  });

  it('commercial-nl prompts split deposit vs Need-first read', () => {
    const d = promptText(createDepositCommercialNlPrompt() as any, 'agent:identity');
    const r = promptText(createReadCommercialNlPrompt() as any, 'agent:identity');
    expect(d.toLowerCase()).toContain('deposit');
    expect(r.toLowerCase()).toContain('need');
    expect(r.toLowerCase()).toContain('read');
  });

  it('validation prompts split deposit vs Need-first read (STAB-4)', () => {
    const d = promptText(createDepositValidationPrompt() as any, 'agent:identity');
    const r = promptText(createReadValidationPrompt() as any, 'agent:identity');
    const rReq = promptText(createReadValidationPrompt() as any, 'agent:requirements');
    expect(d.toLowerCase()).toContain('deposit');
    expect(r.toLowerCase()).toContain('read');
    expect(r.toLowerCase()).toContain('need');
    expect(r.toLowerCase()).not.toMatch(/obfuscation/);
    expect(rReq).toMatch(/needinesses|-\*fit|\*-fit|need/i);
    expect(rReq).toMatch(/depositoryHits|acceptanceCriteria/i);
  });

  it('projectDepositoryHitsForImplementation keeps source-safe hit fields', () => {
    const hits = projectDepositoryHitsForImplementation({
      hits: [
        {
          assetId: 'ap-1',
          title: 'Auth refresh pack',
          finalScore: 0.82,
          channel: 'hybrid',
          matchedTerms: ['session', 'refresh'],
        },
        { assetId: '', title: 'skip' },
        {
          asset_id: 'ap-2',
          title: 'Other',
          semanticScore: 0.4,
          channel: 'lexical',
        },
      ],
    });
    expect(hits).toHaveLength(2);
    expect(hits[0]).toMatchObject({
      assetId: 'ap-1',
      title: 'Auth refresh pack',
      finalScore: 0.82,
      channel: 'hybrid',
    });
    expect(hits[0].matchedTerms).toEqual(['session', 'refresh']);
    expect(hits[1].assetId).toBe('ap-2');
  });
});
