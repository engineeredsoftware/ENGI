'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/** AssetPack pipeline run selectable for settle delivery context. */
interface SettleDeliveryRunOption {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface DeliveryTemplatePickerProps {
  isOpen: boolean;
  onSelect: (run: SettleDeliveryRunOption) => void;
  onClose: () => void;
  searchTerm: string;
}

export default function DeliveryTemplatePicker({ isOpen, onSelect, onClose, searchTerm }: DeliveryTemplatePickerProps) {
  const [runs, setRuns] = useState<SettleDeliveryRunOption[]>([]);

  // Fetch AssetPack executions that can expose settle delivery surfaces.
  useEffect(() => {
    if (!isOpen || runs.length > 0) return;
    fetch('/api/executions?type=agentic-execution:asset-pack')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setRuns(data.map((d: any) => ({
            id: d.id,
            title: d.title || d.name || 'Untitled',
            description: d.description || '',
            status: d.status || 'completed',
          })));
        }
      })
      .catch(() => {});
  }, [isOpen, runs.length]);

  const [filteredRuns, setFilteredRuns] = useState<SettleDeliveryRunOption[]>(runs);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredRuns(runs);
      return;
    }

    const filtered = runs.filter(
      (run) =>
        run.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredRuns(filtered);
  }, [searchTerm, runs]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="picker-container"
      >
        <div className="picker-header">SETTLE DELIVERY</div>

        {filteredRuns.length > 0 ? (
          filteredRuns.map((run) => (
            <div
              key={run.id}
              className="picker-item"
              onClick={() => {
                onSelect(run);
                onClose();
              }}
            >
              <div className="picker-item-title">
                {run.title}
                <span
                  style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.7rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '4px',
                    backgroundColor:
                      run.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' :
                        run.status === 'in-progress' ? 'rgba(245, 158, 11, 0.1)' :
                          'rgba(107, 114, 128, 0.1)',
                    color:
                      run.status === 'completed' ? '#10b981' :
                        run.status === 'in-progress' ? '#f59e0b' :
                          '#6b7280',
                  }}
                >
                  {run.status === 'completed' ? 'Completed' :
                    run.status === 'in-progress' ? 'In Progress' :
                      'Pending'}
                </span>
              </div>
              <div className="picker-item-description">{run.description}</div>
            </div>
          ))
        ) : (
          <div className="picker-empty">
            No settle delivery runs matching &quot;{searchTerm}&quot;
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
