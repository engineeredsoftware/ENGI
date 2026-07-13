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
