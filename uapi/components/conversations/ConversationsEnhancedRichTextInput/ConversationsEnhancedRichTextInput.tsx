'use client';

/**
 * Enhanced rich-text conversation input with token pickers.
 * Token types and display helpers are co-located modules.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
// motion and AnimatePresence not needed here
// import { motion, AnimatePresence } from 'framer-motion';
import ShippablePicker from '@/components/conversations/pickers/ShippablePicker/ShippablePicker';
import AttachmentPicker from '@/components/conversations/pickers/AttachmentPicker/AttachmentPicker';
import VCSSourcePicker from '@/components/conversations/pickers/VcsSourcePicker/VcsSourcePicker';
import PipelineRunPicker from '@/components/conversations/pickers/PipelineRunPicker/PipelineRunPicker';
import '@/styles/conversations/rich-text-input.css';
import glassyInputStyles from '@/components/bitcode/inputs/GlassyInput/GlassyInput/glassy-input.module.css';

import type {
  ConversationsRichTextToken as Token,
  ConversationsEnhancedRichTextInputProps as RichTextInputProps,
} from './conversations-enhanced-rich-text-input.types';
import {
  getTokenIcon,
  getTokenTypeLabel,
  adjustTokenSpacing as adjustTokenSpacingHelper,
} from './conversations-enhanced-rich-text-helpers';

export default function RichTextInput({
  onSend,
  placeholder = "Type a Bitcode Terminal instruction... Use @ + # ! for asset packs, attachments, source connects, and output destinations",
  disabled = false,
  enablePickers = true,
  className = '',
  fullHeight = false,
  compact = false,
  currentConversationId,
}: RichTextInputProps) {
  const [text, setText] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Ref to the rich-text display overlay for fine-grained updates
  const displayRef = useRef<HTMLDivElement>(null);

  // Handle text input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const currentCursorPosition = e.target.selectionStart || 0;

    // Check if we read to adjust spacing around tokens
    const adjustedText = adjustTokenSpacing(newText);

    // Store the cursor position before any text adjustments
    const cursorBeforeAdjustment = currentCursorPosition;

    // Update the text state
    setText(adjustedText);

    // Calculate cursor position adjustment if text was modified
    const cursorAdjustment = adjustedText.length - newText.length;
    const adjustedCursorPosition = Math.min(
      cursorBeforeAdjustment + (cursorBeforeAdjustment === newText.length ? cursorAdjustment : 0),
      adjustedText.length
    );

    // Update cursor position state
    setCursorPosition(adjustedCursorPosition);

    // Ensure cursor position is set in the textarea
    if (textareaRef.current) {
      textareaRef.current.selectionStart = adjustedCursorPosition;
      textareaRef.current.selectionEnd = adjustedCursorPosition;
    }


    if (!enablePickers) return; // Skip picker logic entirely when disabled

    // Check for trigger characters
    const lastChar = newText.charAt(currentCursorPosition - 1);

    if (lastChar === '^' || lastChar === '@' || lastChar === '+' || lastChar === '#' || lastChar === '!') {
      // Get the text after the trigger character
      const afterTrigger = newText.substring(currentCursorPosition);
      // If there's a space or nothing after the trigger, open the picker
      if (afterTrigger === '' || afterTrigger.startsWith(' ')) {
        switch (lastChar) {
          case '^':
            setActivePicker('evidence_document');
            break;
          case '@':
            setActivePicker('shippable');
            break;
          case '+':
            setActivePicker('attachment');
            break;
          case '#':
            setActivePicker('source');
            break;
          case '!':
            setActivePicker('destination');
            break;
        }
        setSearchTerm('');
      }
    } else if (activePicker) {
      // If a picker is open, update the search term
      const triggerChar =
        activePicker === 'evidence_document' ? '^' :
          activePicker === 'shippable' ? '@' :
            activePicker === 'attachment' ? '+' :
              activePicker === 'source' ? '#' :
                activePicker === 'destination' ? '!' : '!';

      // Find the last occurrence of the trigger character before cursor
      const lastTriggerIndex = newText.substring(0, currentCursorPosition).lastIndexOf(triggerChar);

      if (lastTriggerIndex !== -1) {
        // Extract the search term between the trigger and cursor
        const extractedSearchTerm = newText.substring(lastTriggerIndex + 1, adjustedCursorPosition);
        setSearchTerm(extractedSearchTerm);

        // If user pressed space or enter after typing nothing, close the picker
        if (extractedSearchTerm === '' && (newText.charAt(adjustedCursorPosition) === ' ' || newText.charAt(adjustedCursorPosition - 1) === ' ')) {
          setActivePicker(null);
        }
      } else {
        // If trigger character is no longer in the text, close the picker
        setActivePicker(null);
      }
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!enablePickers) {
      // If pickers disabled, treat Enter as send (unless shift)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      return;
    }

    // Close picker on escape
    if (e.key === 'Escape' && activePicker) {
      e.preventDefault();
      setActivePicker(null);
      return;
    }

    // Send message on Enter (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
  };

  // Handle selection from pickers
  const handleSelectEvidenceDocument = (evidence_document: any) => {
    insertToken({
      id: `evidence_document-${Date.now()}`,
      type: 'evidence_document',
      text: evidence_document.title,
      data: evidence_document
    });
  };

  const handleSelectShippable = (shippable: any) => {
    insertToken({
      id: `shippable-${Date.now()}`,
      type: 'shippable',
      text: shippable.title,
      data: shippable
    });
  };

  const handleSelectAttachment = (attachment: any) => {
    insertToken({
      id: `attachment-${Date.now()}`,
      type: 'attachment',
      text: attachment.name,
      data: attachment
    });
  };

  const handleSelectSource = (source: any) => {
    insertToken({
      id: `source-${Date.now()}`,
      type: 'source',
      text: source.provider ? `${source.name} (${source.provider})` : source.name,
      data: source
    });
  };

  // Command handler removed - ':' trigger no longer used

  const handleSelectPipelineRun = (target: any) => {
    insertToken({
      id: `pipeline-run-${Date.now()}`,
      type: 'destination',
      text: `${target.conversationTitle}:${target.pipelineTitle}`,
      data: {
        conversationId: target.conversationId,
        pipelineId: target.pipelineId,
        conversationTitle: target.conversationTitle,
        pipelineTitle: target.pipelineTitle,
        pipelineType: target.pipelineType,
        type: target.type,
      }
    });
  };

  // Insert token at cursor position
  const insertToken = (token: Token) => {
    if (!textareaRef.current) return;

    const triggerChar =
      token.type === 'evidence_document' ? '^' :
        token.type === 'shippable' ? '@' :
          token.type === 'attachment' ? '+' :
            token.type === 'source' ? '#' :
              token.type === 'destination' ? '!' :
              token.type === 'command' ? ':' : '!';

    // Find the last occurrence of the trigger character before cursor
    const lastTriggerIndex = text.substring(0, cursorPosition).lastIndexOf(triggerChar);

    if (lastTriggerIndex !== -1) {
      // Replace the trigger and search term with the token
      const beforeTrigger = text.substring(0, lastTriggerIndex);
      const afterCursor = text.substring(cursorPosition);

      // Generate a unique ID for this token instance to avoid text replacement conflicts
      const tokenId = `${token.id}-${Date.now()}`;

      // Create a display text that includes the token's main text
      // We'll keep the actual text simple for the textarea value
      const displayText = token.text;

      // Create a modified token with a unique ID and enhanced data
      const tokenWithId = {
        ...token,
        id: tokenId,
        // Always add a space after the token text unless the next char is already a space
        text: !afterCursor.startsWith(' ') ? `${displayText} ` : displayText,
        // Store the original trigger character for reference
        triggerChar,
        // Store additional display information based on token type
        displayInfo: getTokenDisplayInfo(token)
      };

      // Add the token to the list
      setTokens(prevTokens => [...prevTokens, tokenWithId]);

      // Update the text
      const newText = `${beforeTrigger}${tokenWithId.text}${afterCursor}`;

      // Calculate the exact cursor position
      const newCursorPosition = lastTriggerIndex + tokenWithId.text.length;

      // First update the text state
      setText(newText);

      // Then immediately update the cursor position state
      setCursorPosition(newCursorPosition);

      // Use multiple timing mechanisms to ensure cursor position is set correctly
      // This helps address browser rendering inconsistencies

      // Immediate attempt
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursorPosition;
        textareaRef.current.selectionEnd = newCursorPosition;
        textareaRef.current.focus();
      }

      // Second attempt to set cursor position after render
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newCursorPosition;
          textareaRef.current.selectionEnd = newCursorPosition;
          textareaRef.current.focus();
        }
      });
    }

    // Close the picker
    setActivePicker(null);
  };

  // Helper function to get additional display information for tokens
  const getTokenDisplayInfo = (token: Token) => {
    switch (token.type) {
      case 'evidence_document':
        return token.data?.description ? token.data.description.substring(0, 30) : '';
      case 'shippable':
        return token.data?.status ? token.data.status : '';
      case 'attachment':
        return token.data?.size ? token.data.size : '';
      case 'source':
        return token.data?.provider ? `${token.data.provider} • ${token.data.path}` : token.data?.path || '';
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
  };

  // Handle send message
  const handleSend = () => {
    if (!text.trim()) return;

    // Clean up tokens before sending
    // This ensures we only send tokens that are actually in the text
    const validTokens = tokens.filter(token => text.includes(token.text));

    const serializedTokens = validTokens.map((token) => {
      if (token.type === 'source') {
        return {
          ...token,
          value: token.text.trim(),
          metadata: {
            attachment_id: token.data?.id || token.data?.repoId || token.data?.path || token.text.trim(),
            category: 'integration',
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

    onSend(text, serializedTokens as Token[]);
    setText('');
    setTokens([]);
    setActivePicker(null);
  };

  // Handle file upload
  const handleUpload = () => {
    // Simulate file upload
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf,.doc,.docx,.txt,.json,.js,.ts,.tsx,.jsx,.html,.css';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        handleSelectAttachment({
          id: `file-${Date.now()}`,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' :
            file.type.includes('pdf') || file.type.includes('doc') ? 'document' :
              'code',
          size: `${(file.size / 1024).toFixed(1)} KB`
        });
      }
    };
    fileInput.click();
  };

  // In RichTextInput component, memoize the renderRichText function
  const renderRichText = useCallback(() => {
    // Always return the text, even if there are no tokens
    // This ensures the overlay always shows something
    if (!text) return '';

    // Escape user input to prevent HTML injection
    let result = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // If no tokens, just return the plain text
    if (tokens.length === 0) {
      return result;
    }

    // Sort tokens by their position in the text (to avoid replacement conflicts)
    // Sort by length (longest first) to avoid replacing parts of longer tokens
    const sortedTokens = [...tokens].sort((a, b) => {
      // First sort by position
      const posA = result.indexOf(a.text);
      const posB = result.indexOf(b.text);

      if (posA !== posB) return posA - posB;

      // If positions are the same, sort by length (longest first)
      return b.text.length - a.text.length;
    });

    // Process each token
    sortedTokens.forEach(token => {
      // Escape special regex characters in the token text
      const escapedText = token.text.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Create a regex that matches the token text precisely
      // Using word boundaries to ensure we match whole tokens
      const regex = new RegExp(`(^|\\s)(${escapedText})(?=\\s|$)`, 'g');

      // Get the appropriate icon for the token type
      const iconHtml = getTokenIcon(token.type);

      // Get the label for the token type
      const typeLabel = getTokenTypeLabel(token.type);

      // Replace the token text with the styled version
      // Use a simpler token structure with fewer nested elements and whitespace
      result = result.replace(regex, (match, before, tokenText) => {
        // Include additional information if available
        const infoHtml = token.displayInfo ?
          `<span class="token-info">${token.displayInfo}</span>` : '';

        return `${before}<span class="token token-${token.type}" title="${typeLabel}: ${tokenText}${token.displayInfo ? ' - ' + token.displayInfo : ''}">${iconHtml}${tokenText}${infoHtml}</span>`;
      });
    });

    return result;
  }, [text, tokens, cursorPosition]);

  // Sync the rich text overlay whenever text or tokens change
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.innerHTML = renderRichText();
    }
  }, [text, tokens, renderRichText]);

  const adjustTokenSpacing = (inputText: string) => adjustTokenSpacingHelper(inputText, tokens);
  // Prevent default drop behavior; optional file handling
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      console.log('Dropped files:', files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      className={`rich-text-input-container ${glassyInputStyles.container} ${className}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Actual textarea for input */}
      <textarea
        ref={textareaRef}
        className="rich-text-input custom-scrollbar"
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyPress}
        onBlur={() => {
          // Ensure proper spacing when textarea loses focus
          setText(adjustTokenSpacing(text));
        }}
        placeholder={placeholder}
        disabled={disabled}
        spellCheck="false"
        style={{
          // Stretch to full height when requested
          ...(fullHeight ? { height: '100%' } : {}),
          // Make the control more compact if requested
          ...(compact ? { paddingTop: '0.25rem', paddingBottom: '0.25rem' } : {}),
          // Dynamically adjust line height to match the token height
          lineHeight: tokens.length > 0 ? '1.5' : 'inherit',
        }}
      />

      {/* Highlighted text overlay with fake cursor */}
      <div
        ref={displayRef}
        className={`rich-text-display${text ? ' show-cursor' : ''}`}
        style={compact ? { paddingTop: '0.25rem', paddingBottom: '0.25rem' } : undefined}
        dangerouslySetInnerHTML={{ __html: renderRichText() }}
        onClick={() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }}
      />

      {/* Token indicators */}
      <div className="token-indicators">
        {tokens.length > 0 && (
          <div className="token-count">
            {tokens.length} {tokens.length === 1 ? 'token' : 'tokens'}
          </div>
        )}
      </div>

      {/* Send button */}
      <button
        className="send-button"
        onClick={handleSend}
        disabled={!text.trim() || disabled}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>

      {/* Pickers */}
      {activePicker === 'evidence_document' && (
        <ShippablePicker
          isOpen={true}
          onSelect={handleSelectEvidenceDocument}
          onClose={() => setActivePicker(null)}
          searchTerm={searchTerm}
        />
      )}

      {activePicker === 'shippable' && (
        <ShippablePicker
          isOpen={true}
          onSelect={handleSelectShippable}
          onClose={() => setActivePicker(null)}
          searchTerm={searchTerm}
        />
      )}

      {activePicker === 'attachment' && (
        <AttachmentPicker
          isOpen={true}
          onSelect={handleSelectAttachment}
          onClose={() => setActivePicker(null)}
          searchTerm={searchTerm}
          onUpload={handleUpload}
        />
      )}

      {activePicker === 'source' && (
        <VCSSourcePicker
          isOpen={true}
          onSelect={handleSelectSource}
          onClose={() => setActivePicker(null)}
          searchTerm={searchTerm}
        />
      )}

      {/* Command picker removed - ':' trigger no longer used */}

      {activePicker === 'destination' && (
        <PipelineRunPicker
          isOpen={true}
          onSelect={handleSelectPipelineRun}
          onClose={() => setActivePicker(null)}
          searchTerm={searchTerm}
          currentConversationId={currentConversationId}
        />
      )}
    </div>
  );
}
