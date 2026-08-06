/**
 * Pure helpers for Conversations overlay (throttle, labels, token rendering).
 */

export function throttle<T extends (...args: any[]) => void>(fn: T, wait = 60): T {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  // @ts-ignore
  return function throttled(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn.apply(this, args);
      }, wait - (now - last));
    }
  } as T;
}


export function getEntranceInitial(
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
) {
  const OFFSET = 64;
  const initial: Record<string, number> = {
    opacity: 0,
    scale: 0.6,
    rotate: -45,
  };

  if (position.includes('right')) initial.x = OFFSET;
  if (position.includes('left')) initial.x = -OFFSET;
  if (position.includes('bottom')) initial.y = OFFSET;
  if (position.includes('top')) initial.y = -OFFSET;

  return initial;
}


export function formatConversationExecutionLabel(value?: string) {
  const normalized = String(value || '').trim().toLowerCase();

  if (!normalized) return 'agentic execution';
  if (normalized.includes('measure')) return 'read-measurement execution';
  if (normalized.includes('asset-pack') || normalized.includes('settle') || normalized.includes('artifact')) {
    return 'AssetPack execution';
  }

  return normalized.replace('agentic-execution:', '').replace(/^pipeline:/, '') || 'agentic execution';
}


export function renderTokenInMessageHelper(content: string, tokens?: any[]): string {
  if (!tokens || tokens.length === 0) return content;
  
  let result = content;
  
  // Process execution tokens
  tokens.forEach(token => {
    const pipelineMatch = token.text?.match(/\[\[(settle_delivery|asset_pack|evidence_document):([^\]]+)\]\]/);
    if (!pipelineMatch) return;
    
    const [fullMatch, kind, title] = pipelineMatch;
    const regex = new RegExp(`(^|\\s)${fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    
    const isAssetPack = kind === 'settle_delivery' || kind === 'asset_pack';
    const kindLabel = isAssetPack ? 'Data pack' : 'Evidence Document';
    const status = token.metadata?.status || '';
    const sourceLine = token.metadata?.source ? 
      `<svg class="inline w-3 h-3 mr-1" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>${token.metadata.source}` 
      : '';
    
    const sourceChanged = token.metadata?.sourceChanged;
    
    const replacement = 
      ` <div class="inline-block align-middle mx-1 border border-gray-600 rounded-md bg-gray-800/50 overflow-hidden">` +
      `   <div class="px-2 pt-1 flex items-center gap-1.5 border-b border-gray-700">` +
      `     <span class="inline-block w-2 h-2 rounded-full ${isAssetPack ? 'bg-emerald-400' : 'bg-blue-400'}"></span>` +
      `     <span class="font-semibold text-gray-200">${title}</span>` +
      `   </div>` +
      `   <div class="px-2 text-gray-400 pb-1">${kindLabel}${status ? ' · ' + status : ''}</div>` +
      (sourceLine ? ` <div class="px-2 pb-2 text-[10px] text-gray-500 flex items-center gap-1">${sourceLine}${sourceChanged ? ' <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="10" height="10"><path fill="#fbbf24" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>' : ''}</div>` : '') +
      ` </div> `;
    
    result = result.replace(regex, (_match, before) => `${before}${replacement}`);
  });
  
  return result;
}

