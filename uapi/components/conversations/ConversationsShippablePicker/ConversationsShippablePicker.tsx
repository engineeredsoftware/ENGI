'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Shippable {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface ShippablePickerProps {
  isOpen: boolean;
  onSelect: (shippable: Shippable) => void;
  onClose: () => void;
  searchTerm: string;
}

export default function ShippablePicker({ isOpen, onSelect, onClose, searchTerm }: ShippablePickerProps) {
  const [shippables, setShippables] = useState<Shippable[]>([]);

  // Fetch AssetPack executions that can expose Finish-delivered Shippables.
  useEffect(() => {
    if (!isOpen || shippables.length > 0) return;
    fetch('/api/executions?type=agentic-execution:asset-pack')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setShippables(data.map((d: any) => ({
            id: d.id,
            title: d.title || d.name || 'Untitled',
            description: d.description || '',
            status: d.status || 'completed',
          })));
        }
      })
      .catch(() => {});
  }, [isOpen, shippables.length]);

  const [filteredShippables, setFilteredShippables] = useState<Shippable[]>(shippables);

  // Filter Shippables based on search term.
  useEffect(() => {
    if (!searchTerm) {
      setFilteredShippables(shippables);
      return;
    }

    const filtered = shippables.filter(
      shippable =>
        shippable.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shippable.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredShippables(filtered);
  }, [searchTerm, shippables]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="picker-container"
      >
        <div className="picker-header">SHIPPABLES</div>

        {filteredShippables.length > 0 ? (
          filteredShippables.map(shippable => (
            <div
              key={shippable.id}
              className="picker-item"
              onClick={() => {
                onSelect(shippable);
                onClose();
              }}
            >
              <div className="picker-item-title">
                {shippable.title}
                <span
                  style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.7rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '4px',
                    backgroundColor:
                      shippable.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' :
                        shippable.status === 'in-progress' ? 'rgba(245, 158, 11, 0.1)' :
                          'rgba(107, 114, 128, 0.1)',
                    color:
                      shippable.status === 'completed' ? '#10b981' :
                        shippable.status === 'in-progress' ? '#f59e0b' :
                          '#6b7280',
                  }}
                >
                  {shippable.status === 'completed' ? 'Completed' :
                    shippable.status === 'in-progress' ? 'In Progress' :
                      'Pending'}
                </span>
              </div>
              <div className="picker-item-description">{shippable.description}</div>
            </div>
          ))
        ) : (
          <div className="picker-empty">
            No Shippables found matching "{searchTerm}"
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
