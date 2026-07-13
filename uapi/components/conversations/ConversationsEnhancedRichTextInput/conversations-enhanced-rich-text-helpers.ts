/**
 * Token display helpers for Conversations enhanced rich-text input.
 */
import type { ConversationsRichTextToken } from './conversations-enhanced-rich-text-input.types';

export function getTokenIcon(type: string): string {
  switch (type) {
    case 'evidence_document':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v-3a2 2 0 0 0-2-2h-4V7a2 2 0 0 0-2-2H6"></path><path d="M18 14v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4"></path><path d="M6 5l4 4-4 4"></path></svg>';
    case 'shippable':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path></svg>';
    case 'attachment':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>';
    case 'source':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
    case 'command':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>';
    case 'destination':
    case 'pipeline_run':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>';
    default:
      return '';
  }
}

export function getTokenTypeLabel(type: string): string {
  switch (type) {
    case 'evidence_document':
      return 'Evidence Document';
    case 'shippable':
      return 'Shippable';
    case 'attachment':
      return 'Attachment';
    case 'source':
      return 'Connect source';
    case 'command':
      return 'Command';
    case 'destination':
    case 'pipeline_run':
      return 'Output destination';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

export function adjustTokenSpacing(
  inputText: string,
  tokens: readonly ConversationsRichTextToken[],
): string {
  if (!tokens.length) return inputText;

  let adjustedText = inputText;

  tokens.forEach((token) => {
    const tokenText = token.text.trim();
    const escapedText = tokenText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const noSpaceBeforeRegex = new RegExp(`([^\\s])${escapedText}`, 'g');
    adjustedText = adjustedText.replace(noSpaceBeforeRegex, `$1 ${tokenText}`);

    const noSpaceAfterRegex = new RegExp(`${escapedText}([^\\s])`, 'g');
    adjustedText = adjustedText.replace(noSpaceAfterRegex, `${tokenText} $1`);
  });

  return adjustedText;
}

/** Extra display caption for a token chip. */
export function getTokenDisplayInfo(token: ConversationsRichTextToken): string {
  switch (token.type) {
    case 'evidence_document':
      return token.data?.description ? token.data.description.substring(0, 30) : '';
    case 'shippable':
      return token.data?.status ? token.data.status : '';
    case 'attachment':
      return token.data?.size ? token.data.size : '';
    case 'source':
      return token.data?.provider
        ? `${token.data.provider} • ${token.data.path}`
        : token.data?.path || '';
    case 'command':
      return token.data?.shortcut ? token.data.shortcut : '';
    case 'destination':
    case 'pipeline_run':
      if (!token.data?.pipelineType) return '';
      if (String(token.data.pipelineType).toLowerCase().includes('measure')) return 'read-measurement';
      if (
        String(token.data.pipelineType).toLowerCase().includes('asset-pack') ||
        String(token.data.pipelineType).toLowerCase().includes('shippable') ||
        String(token.data.pipelineType).toLowerCase().includes('artifact')
      ) {
        return 'branch-artifact';
      }
      return `${token.data.pipelineType}`;
    default:
      return '';
  }
}

/** Serialize tokens for the send path with attachment metadata. */
export function serializeTokensForSend(tokens: ConversationsRichTextToken[], text: string) {
  const validTokens = tokens.filter((token) => text.includes(token.text));

  return validTokens.map((token) => {
    if (token.type === 'source') {
      return {
        ...token,
        value: token.text.trim(),
        metadata: {
          attachment_id: token.data?.id || token.data?.repoId || token.data?.path || token.text.trim(),
          category: 'external',
          type: token.data?.type || 'github_repo',
          ...token.data,
        },
      };
    }

    if (token.type === 'attachment') {
      return {
        ...token,
        value: token.text.trim(),
        metadata: {
          attachment_id: token.data?.id || token.data?.path || token.text.trim(),
          category: token.data?.category || 'file',
          type: token.data?.type || 'attachment',
          ...token.data,
        },
      };
    }

    if (token.type === 'destination' || token.type === 'pipeline_run') {
      return {
        ...token,
        type: 'destination' as const,
        value: token.text.trim(),
        metadata: {
          attachment_id: token.data?.pipelineId || token.data?.id || token.text.trim(),
          category: token.data?.category || 'integration',
          type: token.data?.type || 'output_destination',
          ...token.data,
        },
      };
    }

    if (token.type === 'shippable') {
      return {
        ...token,
        type: 'shippable',
        value: token.text.trim(),
        metadata: {
          kind: 'shippable',
          asset_pack_reference: token.data?.id || null,
          ...token.data,
        },
      };
    }

    return {
      ...token,
      value: token.text.trim(),
      metadata: {
        ...token.data,
      },
    };
  });
}

/** Escape HTML and wrap tokens for the rich overlay. */
export function renderRichTextHtml(
  text: string,
  tokens: readonly ConversationsRichTextToken[],
): string {
  if (!text) return '';

  let result = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (tokens.length === 0) {
    return result;
  }

  const sortedTokens = [...tokens].sort((a, b) => {
    const posA = result.indexOf(a.text);
    const posB = result.indexOf(b.text);
    if (posA !== posB) return posA - posB;
    return b.text.length - a.text.length;
  });

  sortedTokens.forEach((token) => {
    const escapedText = token.text.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s)(${escapedText})(?=\\s|$)`, 'g');
    const iconHtml = getTokenIcon(token.type);
    const typeLabel = getTokenTypeLabel(token.type);

    result = result.replace(regex, (match, before, tokenText) => {
      const infoHtml = token.displayInfo
        ? `<span class="token-info">${token.displayInfo}</span>`
        : '';

      return `${before}<span class="token token-${token.type}" title="${typeLabel}: ${tokenText}${token.displayInfo ? ' - ' + token.displayInfo : ''}">${iconHtml}${tokenText}${infoHtml}</span>`;
    });
  });

  return result;
}

export function triggerCharForTokenType(type: string): string {
  switch (type) {
    case 'evidence_document':
      return '^';
    case 'shippable':
      return '@';
    case 'attachment':
      return '+';
    case 'source':
      return '#';
    case 'destination':
    case 'pipeline_run':
      return '!';
    case 'command':
      return ':';
    default:
      return '!';
  }
}
