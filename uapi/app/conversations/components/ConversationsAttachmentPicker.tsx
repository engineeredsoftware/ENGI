'use client';

import React, { useState, useEffect } from 'react';
import menuStyles from '@/components/bitcode/menus/glassy-menu.module.css';
import { motion, AnimatePresence } from 'framer-motion';

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'code' | 'other';
  size: string;
}

interface AttachmentPickerProps {
  isOpen: boolean;
  onSelect: (attachment: Attachment) => void;
  onClose: () => void;
  searchTerm: string;
  onUpload: () => void;
}

export default function AttachmentPicker({ isOpen, onSelect, onClose, searchTerm, onUpload }: AttachmentPickerProps) {
  // Attachments fetched from backend. UI no longer seeds demo data.
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Load attachments when picker opens the first time.
  useEffect(() => {
    if (!isOpen) return;
    // Already loaded – skip.
    if (attachments.length > 0) return;

    const abort = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/attachments', { signal: abort.signal, credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setAttachments(
            (data ?? []).map((a: any) => ({
              id: a.id,
              name: a.name,
              type: a.type,
              size: a.size,
            })) as Attachment[],
          );
        }
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          console.error('Failed to fetch attachments', err);
        }
      }
    })();

    return () => abort.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const [filteredAttachments, setFilteredAttachments] = useState<Attachment[]>(attachments);

  // Filter attachments based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAttachments(attachments);
      return;
    }

    const filtered = attachments.filter(
      attachment => attachment.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredAttachments(filtered);
  }, [searchTerm, attachments]);

  if (!isOpen) return null;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'image':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        );
      case 'document':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case 'code':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`picker-container ${menuStyles.pickerSurface}`}
      >
        <div className="picker-header">ATTACHMENTS</div>

        <div
          className="picker-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#67feb7',
            gap: '0.5rem'
          }}
          onClick={onUpload}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Upload New Attachment</span>
        </div>

        {filteredAttachments.length > 0 ? (
          filteredAttachments.map(attachment => (
            <div
              key={attachment.id}
              className="picker-item"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              onClick={() => {
                onSelect(attachment);
                onClose();
              }}
            >
              <div style={{
                color:
                  attachment.type === 'image' ? '#fb923c' :
                    attachment.type === 'document' ? '#818cf8' :
                      attachment.type === 'code' ? '#ec4899' : '#6b7280'
              }}>
                {getIconForType(attachment.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div className="picker-item-title">{attachment.name}</div>
                <div className="picker-item-description">{attachment.size}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="picker-empty">
            No attachments found matching "{searchTerm}"
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
