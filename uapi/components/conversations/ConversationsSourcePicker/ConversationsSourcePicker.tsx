'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Source {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory' | 'repository';
}

interface SourcePickerProps {
  isOpen: boolean;
  onSelect: (source: Source) => void;
  onClose: () => void;
  searchTerm: string;
}

export default function SourcePicker({ isOpen, onSelect, onClose, searchTerm }: SourcePickerProps) {
  const [sources, setSources] = useState<Source[]>([]);

  // Fetch available sources when picker opens.
  useEffect(() => {
    if (!isOpen) return;
    if (sources.length > 0) return;

    const abort = new AbortController();

    (async () => {
      try {
        const res = await fetch('/api/user-connections', { signal: abort.signal, credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSources(
            (data ?? []).map((s: any) => ({
              id: s.id,
              name: s.name,
              path: s.path,
              type: s.type,
            })) as Source[],
          );
        }
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          console.error('Failed to fetch sources', err);
        }
      }
    })();

    return () => abort.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const [filteredSources, setFilteredSources] = useState<Source[]>(sources);

  // Filter sources based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSources(sources);
      return;
    }

    const filtered = sources.filter(
      source =>
        source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.path.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredSources(filtered);
  }, [searchTerm, sources]);

  if (!isOpen) return null;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'file':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
        );
      case 'directory':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'repository':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
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
        className="picker-container"
      >
        <div className="picker-header">SOURCES</div>

        {filteredSources.length > 0 ? (
          filteredSources.map(source => (
            <div
              key={source.id}
              className="picker-item"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              onClick={() => {
                onSelect(source);
                onClose();
              }}
            >
              <div style={{
                color:
                  source.type === 'file' ? '#ec4899' :
                    source.type === 'directory' ? '#818cf8' :
                      '#10b981'
              }}>
                {getIconForType(source.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div className="picker-item-title">{source.name}</div>
                <div className="picker-item-description">{source.path}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="picker-empty">
            No sources found matching "{searchTerm}"
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

