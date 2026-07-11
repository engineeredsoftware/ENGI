import { useState } from 'react';
import type { UrlEntry } from '@/types/api';

interface UrlAttachmentsProps {
  attachedUrls: UrlEntry[];
  loadingUrls: Set<string>;
  onUrlAdd: (url: string) => void;
  onUrlRemove: (index: number) => void;
}

export const UrlAttachments = ({
  attachedUrls,
  loadingUrls,
  onUrlAdd,
  onUrlRemove
}: UrlAttachmentsProps) => {
  const [urlInput, setUrlInput] = useState('');

  const handleUrlKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && urlInput.trim()) {
      e.preventDefault();
      const urls = urlInput.split(',').map(u => u.trim()).filter(Boolean);
      urls.forEach(url => onUrlAdd(url));
      setUrlInput('');
    }
  };

  return (
    <div data-testid="url-attachments" className="relative w-48">
      <div className={`
        flex items-center justify-between
        px-2 py-[6px]
        bg-[#030816]/90 
        border border-emerald-500/10
       
        transition-all duration-200
        hover:border-emerald-500/30 
        hover:shadow-[0_0_12px_rgba(103,254,183,0.15)]
        hover:bg-emerald-500/5
        focus-within:border-emerald-500
        focus-within:shadow-[0_0_12px_rgba(103,254,183,0.15)]
        group
        min-h-[28px]
        ${attachedUrls.length > 0 ? 'border-emerald-500/30' : ''}
      `}>
        <svg
          className="w-3 h-3 ml-2 opacity-70 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <input
          data-testid="url-input"
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={handleUrlKeyDown}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            setUrlInput(pastedText);
            const event = {
              key: 'Enter',
              preventDefault: () => { }
            } as React.KeyboardEvent<HTMLInputElement>;
            handleUrlKeyDown(event);
          }}
          className="bg-transparent outline-none border-0 w-full
 ml-2 text-xs text-gray-100
 placeholder-gray-500"
          placeholder={attachedUrls.length ? `URLs (${attachedUrls.length})` : "Paste URL + Enter"}
        />
        {loadingUrls.size > 0 && (
          <svg className="w-3 h-3 mr-2 text-[#67feb7] animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
      </div>
    </div>
  );
};

