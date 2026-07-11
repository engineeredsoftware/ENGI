"use client";

import React from 'react';

interface ModelOption {
  id: string;
  name: string;
  description: string;
  performance: number;
  cost: number;
  specialization?: string;
  // Optional transparent pricing + limits metadata for display
  inputUSDPerMTok?: number;
  outputUSDPerMTok?: number;
  inputLimit?: number;
  outputLimit?: number;
}

interface GlobalModelSelectionProps {
  modelOptions: ModelOption[];
  onApplyGlobalModel: (modelId: string) => void;
}

export default function GlobalModelSelection({ 
  modelOptions, 
  onApplyGlobalModel
}: GlobalModelSelectionProps) {
  return (
    <div className="global-model-selection">
      <h3>Conversation Model Selection</h3>
      <p className="section-description">
        Scope model preferences to non-ledgerized conversation behavior only
      </p>
      
      <div className="global-model-options">
        {modelOptions.map(model => (
          <div
            key={model.id}
            className="global-model-option"
            onClick={() => onApplyGlobalModel(model.id)}
          >
            <h4 className="model-name">{model.name}</h4>
            {model.specialization && (
              <span className="model-specialization">{model.specialization}</span>
            )}
            <div className="model-metrics">
              <div className="metric">
                <span className="metric-label">Performance</span>
                <div className="metric-bar">
                  <div
                    className="metric-fill performance"
                    style={{ width: `${model.performance}%` }}
                  />
                </div>
              </div>
              <div className="metric">
                <span className="metric-label">Cost</span>
                <div className="metric-bar">
                  <div
                    className="metric-fill cost"
                    style={{ width: `${model.cost}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="model-description">{model.description}</p>

            {(model.inputUSDPerMTok !== undefined || model.outputUSDPerMTok !== undefined) && (
              <div className="model-pricing text-xs text-gray-300 mt-2">
                <span className="font-semibold">USD:</span>{' '}
                In ${model.inputUSDPerMTok?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '—'}/1M ·
                Out ${model.outputUSDPerMTok?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '—'}/1M
              </div>
            )}

            {(model.inputLimit !== undefined || model.outputLimit !== undefined) && (
              <div className="model-limits text-xs text-gray-300 mt-1">
                <span className="font-semibold">Limits:</span>{' '}
                In {model.inputLimit?.toLocaleString?.() ?? '—'} · Out {model.outputLimit?.toLocaleString?.() ?? '—'} tokens
              </div>
            )}
            
            <button 
              className="apply-model-button"
              onClick={(e) => {
                e.stopPropagation();
                onApplyGlobalModel(model.id);
              }}
            >
              Apply conversation default
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
