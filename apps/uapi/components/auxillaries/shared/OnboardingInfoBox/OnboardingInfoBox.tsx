"use client";

import React from 'react';

interface OnboardingInfoBoxProps {
  step: number;
  title: string;
  description: string;
  note?: string;
  visible?: boolean;
}

export default function OnboardingInfoBox({ step, title, description, note, visible = true }: OnboardingInfoBoxProps) {
  if (!visible) return null;
  return (
    <div className="onboarding-info">
      <div className="info-header">
        <span className="info-step">Auxillary step {step}</span>
        <strong className="info-title">{title}</strong>
      </div>
      <p className="info-description">{description}</p>
      {note && <p className="info-note">{note}</p>}
    </div>
  );
}
